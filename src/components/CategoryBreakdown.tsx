import { formatMoney } from "@/lib/billing";
import type { Currency, ServiceCategory } from "@/types/billing";

type CategoryRow = [ServiceCategory, number | null];

export function CategoryBreakdown({
  data,
  currency,
}: {
  data: Record<ServiceCategory, number | null>;
  currency: Currency;
}) {
  const rows = Object.entries(data) as CategoryRow[];

  return (
    <section className="rounded-lg border border-line bg-panel p-5 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Monthly Spend by Category</h2>
          <p className="text-sm text-slate-500">
            Recurring spend converted to {currency}.
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {rows.map(([category, amount]) => (
          <div
            key={category}
            className="flex items-center justify-between rounded-lg border border-line px-4 py-3"
          >
            <span className="text-sm font-medium text-slate-700">{category}</span>
            <span className="text-sm font-semibold">
              {amount === null ? "Unavailable" : formatMoney(amount, currency)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
