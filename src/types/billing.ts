export const categories = [
  "VPS",
  "Domain",
  "Subscription",
  "Software",
  "Game",
  "Other",
] as const;

export const currencyOptions = [
  { code: "USD", name: "United States Dollar" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound Sterling" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "KRW", name: "South Korean Won" },
  { code: "TWD", name: "New Taiwan Dollar" },
  { code: "THB", name: "Thai Baht" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "INR", name: "Indian Rupee" },
  { code: "VND", name: "Vietnamese Dong" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "AED", name: "United Arab Emirates Dirham" },
] as const;

export type Currency = (typeof currencyOptions)[number]["code"];

export const currencies = currencyOptions.map((currency) => currency.code) as Currency[];

export const getCurrencyLabel = (code: Currency) => {
  const currency = currencyOptions.find((option) => option.code === code);
  return currency ? `${currency.name} (${currency.code})` : code;
};

export const billingCycles = [
  "Monthly",
  "Quarterly",
  "Yearly",
  "One-time",
] as const;

export const paymentMethods = [
  "App Store",
  "PayPal",
  "Credit Card",
  "Alipay",
  "WeChat Pay",
  "Crypto",
  "Other",
] as const;

export const serviceStatuses = [
  "Active",
  "Paused",
  "Cancelled",
  "Expired",
] as const;

export type ServiceCategory = (typeof categories)[number];
export type BillingCycle = (typeof billingCycles)[number];
export type PaymentMethod = (typeof paymentMethods)[number];
export type ServiceStatus = (typeof serviceStatuses)[number];
export type RenewalHealth = "Expired" | "Urgent" | "Soon" | "Normal";

export type ServiceIcon =
  | {
      type: "preset";
      key: string;
    }
  | {
      type: "upload";
      dataUrl: string;
      fileName?: string;
    };

export type ServiceItem = {
  id: string;
  name: string;
  icon: ServiceIcon;
  category: ServiceCategory;
  price: number;
  currency: Currency;
  billingCycle: BillingCycle;
  nextRenewalDate: string;
  paymentMethod: PaymentMethod;
  status: ServiceStatus;
  notes: string;
  link: string;
  renewalReminder: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ServiceDraft = Omit<ServiceItem, "id" | "createdAt" | "updatedAt">;

export type SortKey = "renewalDate" | "price";
export type SortDirection = "asc" | "desc";

export type ServiceFilters = {
  query: string;
  category: ServiceCategory | "All";
  status: ServiceStatus | "All";
  sortKey: SortKey;
  sortDirection: SortDirection;
};

export type CurrencyAmountMap = Partial<Record<Currency, number>>;
