"use client";

import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import {
  daysUntil,
  formatDate,
  formatMoney,
  getMonthlyAmount,
} from "@/lib/billing";
import type { ServiceItem } from "@/types/billing";
import { ServiceIcon } from "./ServiceIcon";
import { RenewalBadge, StatusBadge } from "./StatusBadge";

type ServiceTableProps = {
  services: ServiceItem[];
  onEdit: (service: ServiceItem) => void;
  onDelete: (service: ServiceItem) => void;
};

export function ServiceTable({ services, onEdit, onDelete }: ServiceTableProps) {
  if (services.length === 0) {
    return (
      <section className="rounded-lg border border-line bg-panel px-5 py-12 text-center shadow-soft">
        <h2 className="text-lg font-semibold">No services found</h2>
        <p className="mt-2 text-sm text-slate-500">Adjust filters or add a new service.</p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-panel shadow-soft">
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-line text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500 dark:bg-slate-900/70">
            <tr>
              <th className="px-5 py-3 font-semibold">Service</th>
              <th className="px-5 py-3 font-semibold">Cost</th>
              <th className="px-5 py-3 font-semibold">Renewal</th>
              <th className="px-5 py-3 font-semibold">Payment</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {services.map((service) => (
              <tr key={service.id} className="align-top">
                <td className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <ServiceIcon icon={service.icon} name={service.name} />
                    <div>
                      <div className="font-semibold">{service.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{service.category}</div>
                    </div>
                  </div>
                  {service.notes && (
                    <p className="mt-3 max-w-xs text-xs text-slate-500">{service.notes}</p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold">
                    {formatMoney(service.price, service.currency)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{service.billingCycle}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Monthly avg:{" "}
                    {formatMoney(
                      getMonthlyAmount(service.price, service.billingCycle),
                      service.currency,
                    )}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <RenewalBadge service={service} />
                    {service.renewalReminder && (
                      <span className="text-xs text-slate-500">Reminder</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm">{formatDate(service.nextRenewalDate)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {daysUntil(service.nextRenewalDate)} days
                  </p>
                </td>
                <td className="px-5 py-4 text-slate-600">{service.paymentMethod}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={service.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    {service.link && (
                      <a
                        href={service.link}
                        target="_blank"
                        rel="noreferrer"
                        className="icon-button"
                        aria-label="Open admin link"
                        title="Open admin link"
                      >
                        <ExternalLink size={17} />
                      </a>
                    )}
                    <button
                      className="icon-button"
                      onClick={() => onEdit(service)}
                      aria-label="Edit service"
                      title="Edit service"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      className="icon-button text-danger hover:bg-red-50"
                      onClick={() => onDelete(service)}
                      aria-label="Delete service"
                      title="Delete service"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-line lg:hidden">
        {services.map((service) => (
          <article key={service.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <ServiceIcon icon={service.icon} name={service.name} />
                <div>
                  <h2 className="font-semibold">{service.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{service.category}</p>
                </div>
              </div>
              <RenewalBadge service={service} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Cost</p>
                <p className="font-semibold">
                  {formatMoney(service.price, service.currency)}
                </p>
                <p className="text-xs text-slate-500">{service.billingCycle}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Renewal</p>
                <p className="font-semibold">{formatDate(service.nextRenewalDate)}</p>
                <p className="text-xs text-slate-500">
                  {daysUntil(service.nextRenewalDate)} days
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Payment</p>
                <p className="font-medium">{service.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <StatusBadge status={service.status} />
              </div>
            </div>
            {service.notes && <p className="mt-4 text-sm text-slate-500">{service.notes}</p>}
            <div className="mt-4 flex gap-2">
              {service.link && (
                <a
                  href={service.link}
                  target="_blank"
                  rel="noreferrer"
                  className="icon-button"
                  aria-label="Open admin link"
                  title="Open admin link"
                >
                  <ExternalLink size={17} />
                </a>
              )}
              <button
                className="icon-button"
                onClick={() => onEdit(service)}
                aria-label="Edit service"
                title="Edit service"
              >
                <Pencil size={17} />
              </button>
              <button
                className="icon-button text-danger hover:bg-red-50"
                onClick={() => onDelete(service)}
                aria-label="Delete service"
                title="Delete service"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
