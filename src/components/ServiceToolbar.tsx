"use client";

import { ArrowDownAZ, ArrowUpAZ, Search } from "lucide-react";
import {
  categories,
  serviceStatuses,
  type ServiceFilters,
} from "@/types/billing";

export function ServiceToolbar({
  filters,
  onChange,
}: {
  filters: ServiceFilters;
  onChange: (filters: ServiceFilters) => void;
}) {
  return (
    <section className="rounded-lg border border-line bg-panel p-4 shadow-soft">
      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <label className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            className="form-input pl-10"
            value={filters.query}
            onChange={(event) =>
              onChange({ ...filters, query: event.target.value })
            }
            placeholder="Search services"
          />
        </label>

        <select
          className="form-input"
          value={filters.category}
          onChange={(event) =>
            onChange({
              ...filters,
              category: event.target.value as ServiceFilters["category"],
            })
          }
        >
          <option>All</option>
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>

        <select
          className="form-input"
          value={filters.status}
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target.value as ServiceFilters["status"],
            })
          }
        >
          <option>All</option>
          {serviceStatuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>

        <select
          className="form-input"
          value={filters.sortKey}
          onChange={(event) =>
            onChange({
              ...filters,
              sortKey: event.target.value as ServiceFilters["sortKey"],
            })
          }
        >
          <option value="renewalDate">Renewal date</option>
          <option value="price">Price</option>
        </select>

        <button
          type="button"
          className="icon-button"
          aria-label="Toggle sort direction"
          title="Toggle sort direction"
          onClick={() =>
            onChange({
              ...filters,
              sortDirection: filters.sortDirection === "asc" ? "desc" : "asc",
            })
          }
        >
          {filters.sortDirection === "asc" ? (
            <ArrowDownAZ size={19} />
          ) : (
            <ArrowUpAZ size={19} />
          )}
        </button>
      </div>
    </section>
  );
}
