import clsx from "clsx";
import { getRenewalHealth } from "@/lib/billing";
import type { RenewalHealth, ServiceItem, ServiceStatus } from "@/types/billing";

const healthClasses: Record<RenewalHealth, string> = {
  Expired: "bg-red-50 text-danger ring-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900",
  Urgent: "bg-red-50 text-danger ring-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900",
  Soon: "bg-amber-50 text-warning ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
  Normal: "bg-emerald-50 text-success ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
};

const statusClasses: Record<ServiceStatus, string> = {
  Active: "bg-emerald-50 text-success ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
  Paused: "bg-amber-50 text-warning ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
  Cancelled: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
  Expired: "bg-red-50 text-danger ring-red-100 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900",
};

export function RenewalBadge({ service }: { service: ServiceItem }) {
  const health = getRenewalHealth(service);
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        healthClasses[health],
      )}
    >
      {health}
    </span>
  );
}

export function StatusBadge({ status }: { status: ServiceStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        statusClasses[status],
      )}
    >
      {status}
    </span>
  );
}
