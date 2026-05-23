import { currencies, type Currency } from "@/types/billing";

export type ExchangeRates = {
  base: "USD";
  date: string;
  fetchedAt: string;
  rates: Record<Currency, number>;
};

const cacheKey = "bill-pilot-exchange-rates";
const selectedCurrencyKey = "bill-pilot-display-currency";
const cacheTtlMs = 6 * 60 * 60 * 1000;
const supportedCurrencies = currencies;
const quoteCurrencies = supportedCurrencies
  .filter((currency) => currency !== "USD")
  .join(",");

const apiUrl =
  `https://api.frankfurter.dev/v2/rates?base=USD&quotes=${quoteCurrencies}`;

export const loadSelectedCurrency = (): Currency => {
  if (typeof window === "undefined") return "USD";
  const saved = window.localStorage.getItem(selectedCurrencyKey) as Currency | null;
  return supportedCurrencies.includes(saved as Currency) ? (saved as Currency) : "USD";
};

export const saveSelectedCurrency = (currency: Currency) => {
  window.localStorage.setItem(selectedCurrencyKey, currency);
};

export const loadCachedRates = (): ExchangeRates | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(cacheKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ExchangeRates;
    const hasValidRates = supportedCurrencies.every(
      (currency) => typeof parsed.rates?.[currency] === "number" && parsed.rates[currency] > 0,
    );
    if (!hasValidRates) {
      window.localStorage.removeItem(cacheKey);
      return null;
    }
    return parsed;
  } catch {
    window.localStorage.removeItem(cacheKey);
    return null;
  }
};

export const isRateCacheFresh = (rates: ExchangeRates) =>
  Date.now() - new Date(rates.fetchedAt).getTime() < cacheTtlMs;

export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Unable to fetch exchange rates.");
  }

  const payload = (await response.json()) as
    | Array<{
        date: string;
        base: string;
        quote: Currency;
        rate: number;
      }>
    | {
        base: string;
        date: string;
        rates: Partial<Record<Currency, number>>;
      };

  const date = Array.isArray(payload) ? payload[0]?.date : payload.date;
  const fetchedRates = Array.isArray(payload)
    ? payload.reduce<Partial<Record<Currency, number>>>((rates, item) => {
        rates[item.quote] = item.rate;
        return rates;
      }, {})
    : payload.rates;

  const rates: ExchangeRates = {
    base: "USD",
    date: date ?? new Date().toISOString().slice(0, 10),
    fetchedAt: new Date().toISOString(),
    rates: Object.fromEntries(
      supportedCurrencies.map((currency) => [
        currency,
        currency === "USD" ? 1 : fetchedRates[currency] ?? 0,
      ]),
    ) as Record<Currency, number>,
  };

  window.localStorage.setItem(cacheKey, JSON.stringify(rates));
  return rates;
};

export const convertCurrency = (
  amount: number,
  from: Currency,
  to: Currency,
  exchangeRates: ExchangeRates | null,
) => {
  if (from === to) return amount;
  if (!exchangeRates) return null;

  const fromRate = exchangeRates.rates[from];
  const toRate = exchangeRates.rates[to];
  if (!fromRate || !toRate) return null;

  const amountInUsd = amount / fromRate;
  return Number((amountInUsd * toRate).toFixed(2));
};
