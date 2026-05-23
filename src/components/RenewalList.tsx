import { CalendarClock } from "lucide-react";
import { daysUntil, formatDate, formatMoney } from "@/lib/billing";
import type { ServiceItem } from "@/types/billing";
import { ServiceIcon } from "./ServiceIcon";
import { RenewalBadge } from "./StatusBadge";

export function RenewalList({
  title,
  services,
}: {
  title: string;
  services: ServiceItem[];
}) {
  return (
    <section className="rounded-lg border border-line bg-panel shadow-soft">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="text-base font-semibold">{title}</h2>
        <CalendarClock className="text-slate-400" size={19} />
      </div>
      <div className="divide-y divide-line">
        {services.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">No renewals in this window.</p>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <ServiceIcon icon={service.icon} name={service.name} size="sm" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{service.name}</p>
                    <RenewalBadge service={service} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(service.nextRenewalDate)} · in{" "}
                    {daysUntil(service.nextRenewalDate)} days
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {formatMoney(service.price, service.currency)} / {service.billingCycle}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
