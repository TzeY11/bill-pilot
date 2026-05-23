"use client";

import { useEffect, useState } from "react";
import {
  fetchExchangeRates,
  isRateCacheFresh,
  loadCachedRates,
  loadSelectedCurrency,
  saveSelectedCurrency,
  type ExchangeRates,
} from "@/lib/exchange-rates";
import type { Currency } from "@/types/billing";

export type ExchangeRateStatus = "loading" | "ready" | "stale" | "error";

export function useExchangeRates() {
  const [displayCurrency, setDisplayCurrencyState] = useState<Currency>("USD");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [status, setStatus] = useState<ExchangeRateStatus>("loading");

  useEffect(() => {
    setDisplayCurrencyState(loadSelectedCurrency());

    const cached = loadCachedRates();
    if (cached) {
      setExchangeRates(cached);
      setStatus(isRateCacheFresh(cached) ? "ready" : "stale");
      if (isRateCacheFresh(cached)) return;
    }

    fetchExchangeRates()
      .then((freshRates) => {
        setExchangeRates(freshRates);
        setStatus("ready");
      })
      .catch(() => {
        setStatus(cached ? "stale" : "error");
      });
  }, []);

  const setDisplayCurrency = (currency: Currency) => {
    setDisplayCurrencyState(currency);
    saveSelectedCurrency(currency);
  };

  return {
    displayCurrency,
    setDisplayCurrency,
    exchangeRates,
    status,
  };
}
