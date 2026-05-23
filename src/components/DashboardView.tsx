"use client";

import Link from "next/link";
import { AlertTriangle, CalendarDays, CircleDollarSign, Plus, Wallet } from "lucide-react";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { MetricCard } from "@/components/MetricCard";
import { RenewalList } from "@/components/RenewalList";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { useServices } from "@/hooks/useServices";
import {
  formatMoney,
  getAttentionCount,
  getConvertedCategoryMonthlyTotals,
  getConvertedMonthlyTotal,
  getUpcomingServices,
} from "@/lib/billing";
import { currencies, getCurrencyLabel, type Currency } from "@/types/billing";

export function DashboardView() {
  const { services, isReady } = useServices();
  const { displayCurrency, setDisplayCurrency, exchangeRates, status } =
    useExchangeRates();

  const monthlyTotal = getConvertedMonthlyTotal(
    services,
    displayCurrency,
    exchangeRates,
  );
  const annualTotal =
    monthlyTotal === null ? null : Number((monthlyTotal * 12).toFixed(2));
  const categoryTotals = getConvertedCategoryMonthlyTotals(
    services,
    displayCurrency,
    exchangeRates,
  );
  const upcoming3 = getUpcomingServices(services, 3);
  const upcoming14 = getUpcomingServices(services, 14);
  const attentionCount = getAttentionCount(services);
  const rateDetail =
    status === "ready" && exchangeRates
      ? `Rates updated ${exchangeRates.date}`
      : status === "stale" && exchangeRates
        ? `Using cached rates from ${exchangeRates.date}`
        : status === "loading"
          ? "Loading exchange rates"
          : "Exchange rates unavailable";

  const formatConvertedMoney = (amount: number | null) =>
    amount === null ? "Unavailable" : formatMoney(amount, displayCurrency);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-brand">
            Personal billing dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Bill Pilot</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Track servers, domains, memberships, software, and subscriptions before they quietly renew.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <Link href="/services?add=1" className="btn-primary w-full sm:w-auto">
            <Plus size={18} />
            Add or Manage Services
          </Link>
          <label className="flex w-full flex-col gap-1 sm:w-56">
            <span className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Display Currency
            </span>
            <select
              className="form-input"
              value={displayCurrency}
              onChange={(event) =>
                setDisplayCurrency(event.target.value as Currency)
              }
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {getCurrencyLabel(currency)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {!isReady ? (
        <section className="rounded-lg border border-line bg-panel p-8 text-sm text-slate-500 shadow-soft">
          Loading local billing data...
        </section>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Estimated Monthly Spend"
              value={formatConvertedMoney(monthlyTotal)}
              detail={`Recurring items only · ${rateDetail}`}
              icon={Wallet}
            />
            <MetricCard
              title="Estimated Annual Spend"
              value={formatConvertedMoney(annualTotal)}
              detail={`Monthly average x 12 · ${displayCurrency}`}
              icon={CircleDollarSign}
            />
            <MetricCard
              title="Upcoming Renewals"
              value={String(upcoming14.length)}
              detail="Due in the next 14 days"
              icon={CalendarDays}
            />
            <MetricCard
              title="Needs Attention"
              value={String(attentionCount)}
              detail="Expired or paused services"
              icon={AlertTriangle}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <div className="space-y-6">
              <RenewalList title="Renewing in 3 Days" services={upcoming3} />
              <RenewalList title="Renewing in 14 Days" services={upcoming14} />
            </div>
            <CategoryBreakdown data={categoryTotals} currency={displayCurrency} />
          </div>
        </>
      )}
    </div>
  );
}
