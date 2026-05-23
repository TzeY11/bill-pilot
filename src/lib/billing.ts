import type {
  BillingCycle,
  Currency,
  CurrencyAmountMap,
  RenewalHealth,
  ServiceCategory,
  ServiceFilters,
  ServiceItem,
} from "@/types/billing";
import { convertCurrency, type ExchangeRates } from "./exchange-rates";

const dayMs = 24 * 60 * 60 * 1000;

export const formatMoney = (amount: number, currency: Currency) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parseDate(value));

export const parseDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const daysUntil = (dateValue: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewal = parseDate(dateValue);
  renewal.setHours(0, 0, 0, 0);
  return Math.ceil((renewal.getTime() - today.getTime()) / dayMs);
};

export const getRenewalHealth = (service: ServiceItem): RenewalHealth => {
  if (service.status === "Expired") return "Expired";
  const days = daysUntil(service.nextRenewalDate);
  if (days < 0) return "Expired";
  if (days <= 3) return "Urgent";
  if (days <= 14) return "Soon";
  return "Normal";
};

export const getMonthlyAmount = (price: number, cycle: BillingCycle) => {
  if (cycle === "Monthly") return price;
  if (cycle === "Quarterly") return price / 3;
  if (cycle === "Yearly") return price / 12;
  return 0;
};

export const addAmount = (
  target: CurrencyAmountMap,
  currency: Currency,
  amount: number,
) => {
  target[currency] = Number(((target[currency] ?? 0) + amount).toFixed(2));
};

export const getMonthlyTotalsByCurrency = (services: ServiceItem[]) => {
  return services.reduce<CurrencyAmountMap>((totals, service) => {
    if (service.status === "Cancelled") return totals;
    addAmount(
      totals,
      service.currency,
      getMonthlyAmount(service.price, service.billingCycle),
    );
    return totals;
  }, {});
};

export const getAnnualTotalsByCurrency = (services: ServiceItem[]) => {
  const monthly = getMonthlyTotalsByCurrency(services);
  return Object.fromEntries(
    Object.entries(monthly).map(([currency, amount]) => [
      currency,
      Number((amount * 12).toFixed(2)),
    ]),
  ) as CurrencyAmountMap;
};

export const getCategoryMonthlyTotals = (services: ServiceItem[]) => {
  return services.reduce<
    Record<ServiceCategory, CurrencyAmountMap>
  >((totals, service) => {
    if (service.status === "Cancelled") return totals;
    const monthlyAmount = getMonthlyAmount(service.price, service.billingCycle);
    addAmount(totals[service.category], service.currency, monthlyAmount);
    return totals;
  }, {
    VPS: {},
    Domain: {},
    Subscription: {},
    Software: {},
    Game: {},
    Other: {},
  });
};

export const getConvertedMonthlyTotal = (
  services: ServiceItem[],
  displayCurrency: Currency,
  exchangeRates: ExchangeRates | null,
) => {
  return services.reduce<number | null>((total, service) => {
    if (total === null) return null;
    if (service.status === "Cancelled") return total;

    const converted = convertCurrency(
      getMonthlyAmount(service.price, service.billingCycle),
      service.currency,
      displayCurrency,
      exchangeRates,
    );

    if (converted === null) return null;
    return Number((total + converted).toFixed(2));
  }, 0);
};

export const getConvertedCategoryMonthlyTotals = (
  services: ServiceItem[],
  displayCurrency: Currency,
  exchangeRates: ExchangeRates | null,
) => {
  const initial: Record<ServiceCategory, number | null> = {
    VPS: 0,
    Domain: 0,
    Subscription: 0,
    Software: 0,
    Game: 0,
    Other: 0,
  };

  return services.reduce<Record<ServiceCategory, number | null>>((totals, service) => {
    if (service.status === "Cancelled" || totals[service.category] === null) {
      return totals;
    }

    const converted = convertCurrency(
      getMonthlyAmount(service.price, service.billingCycle),
      service.currency,
      displayCurrency,
      exchangeRates,
    );

    totals[service.category] =
      converted === null
        ? null
        : Number(((totals[service.category] ?? 0) + converted).toFixed(2));
    return totals;
  }, initial);
};

export const getUpcomingServices = (services: ServiceItem[], withinDays: number) =>
  services
    .filter((service) => {
      if (service.status === "Cancelled") return false;
      const days = daysUntil(service.nextRenewalDate);
      return days >= 0 && days <= withinDays;
    })
    .sort(
      (a, b) =>
        parseDate(a.nextRenewalDate).getTime() -
        parseDate(b.nextRenewalDate).getTime(),
    );

export const getAttentionCount = (services: ServiceItem[]) =>
  services.filter((service) => {
    const health = getRenewalHealth(service);
    return health === "Expired" || service.status === "Paused";
  }).length;

export const filterAndSortServices = (
  services: ServiceItem[],
  filters: ServiceFilters,
) => {
  const query = filters.query.trim().toLowerCase();

  return services
    .filter((service) => {
      const matchesQuery = !query || service.name.toLowerCase().includes(query);
      const matchesCategory =
        filters.category === "All" || service.category === filters.category;
      const matchesStatus =
        filters.status === "All" || service.status === filters.status;
      return matchesQuery && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      const direction = filters.sortDirection === "asc" ? 1 : -1;
      if (filters.sortKey === "price") {
        return (a.price - b.price) * direction;
      }
      return (
        (parseDate(a.nextRenewalDate).getTime() -
          parseDate(b.nextRenewalDate).getTime()) *
        direction
      );
    });
};

export const formatCurrencyMap = (amounts: CurrencyAmountMap) => {
  const entries = Object.entries(amounts) as [Currency, number][];
  if (entries.length === 0) return "0";
  return entries.map(([currency, amount]) => formatMoney(amount, currency)).join(" + ");
};
