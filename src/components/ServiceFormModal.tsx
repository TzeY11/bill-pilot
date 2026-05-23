"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Search, Upload, X } from "lucide-react";
import { iconPresets } from "@/lib/service-icons";
import {
  billingCycles,
  categories,
  currencies,
  getCurrencyLabel,
  paymentMethods,
  serviceStatuses,
  type ServiceDraft,
  type ServiceItem,
} from "@/types/billing";
import { ServiceIcon } from "./ServiceIcon";

const emptyDraft: ServiceDraft = {
  name: "",
  icon: { type: "preset", key: "subscription" },
  category: "Subscription",
  price: 0,
  currency: "USD",
  billingCycle: "Monthly",
  nextRenewalDate: new Date().toISOString().slice(0, 10),
  paymentMethod: "Credit Card",
  status: "Active",
  notes: "",
  link: "",
  renewalReminder: true,
};

type ServiceFormModalProps = {
  service?: ServiceItem | null;
  onClose: () => void;
  onSubmit: (draft: ServiceDraft) => void;
};

export function ServiceFormModal({
  service,
  onClose,
  onSubmit,
}: ServiceFormModalProps) {
  const [draft, setDraft] = useState<ServiceDraft>(emptyDraft);
  const [error, setError] = useState("");
  const [iconQuery, setIconQuery] = useState("");
  const [priceInput, setPriceInput] = useState("");

  const matchingIcons = useMemo(() => {
    const query = iconQuery.trim().toLowerCase();
    if (!query) return [];

    return iconPresets
      .filter((preset) =>
        [
          preset.key,
          preset.label,
          preset.shortLabel,
          preset.category ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 12);
  }, [iconQuery]);

  useEffect(() => {
    const nextDraft = service ?? emptyDraft;
    setDraft(nextDraft);
    setPriceInput(service ? String(nextDraft.price) : "");
    setError("");
    setIconQuery("");
  }, [service]);

  const update = <K extends keyof ServiceDraft>(key: K, value: ServiceDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setError("Service name is required.");
      return;
    }
    const normalizedPrice = Number(priceInput.trim());
    if (!priceInput.trim() || normalizedPrice < 0 || Number.isNaN(normalizedPrice)) {
      setError("Price must be zero or greater.");
      return;
    }
    if (!draft.nextRenewalDate) {
      setError("Next renewal date is required.");
      return;
    }

    onSubmit({
      ...draft,
      price: normalizedPrice,
      name: draft.name.trim(),
      link: draft.link.trim(),
    });
    onClose();
  };

  const handleIconUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Icon upload must be an image file.");
      return;
    }
    if (file.size > 256 * 1024) {
      setError("Icon image must be smaller than 256 KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        update("icon", {
          type: "upload",
          dataUrl: reader.result,
          fileName: file.name,
        });
        setError("");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-3 py-4 backdrop-blur-sm sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-soft dark:bg-slate-950"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-5 py-4 dark:bg-slate-950">
          <div>
            <h2 className="text-lg font-semibold">
              {service ? "Edit Service" : "Add Service"}
            </h2>
            <p className="text-sm text-slate-500">Track cost, renewal, and cancellation signals.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
            aria-label="Close"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          <section className="sm:col-span-2">
            <span className="form-label">Icon</span>
            <div className="rounded-lg border border-line p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <ServiceIcon icon={draft.icon} name={draft.name || "Service"} size="lg" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {draft.icon.type === "upload"
                        ? draft.icon.fileName ?? "Custom icon"
                        : "Preset icon"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Pick a common service icon or upload your own square image.
                    </p>
                  </div>
                </div>
                <label className="btn-secondary cursor-pointer">
                  <Upload size={17} />
                  Upload Icon
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => handleIconUpload(event.target.files?.[0])}
                  />
                </label>
              </div>

              <label className="relative mt-4 block">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  className="form-input pl-10"
                  value={iconQuery}
                  onChange={(event) => setIconQuery(event.target.value)}
                  placeholder="Search icons, e.g. OpenAI, Cloudflare, Apple"
                />
              </label>

              <div className="mt-3">
                {!iconQuery.trim() ? (
                  <p className="rounded-lg border border-dashed border-line px-4 py-3 text-sm text-slate-500">
                    Search by brand, category, or service name to pick a preset icon.
                  </p>
                ) : matchingIcons.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-line px-4 py-3 text-sm text-slate-500">
                    No preset icons found. Upload a custom image instead.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {matchingIcons.map((preset) => {
                      const selected =
                        draft.icon.type === "preset" && draft.icon.key === preset.key;
                      return (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() => {
                            update("icon", { type: "preset", key: preset.key });
                            setIconQuery(preset.label);
                          }}
                          className={
                            selected
                              ? "flex items-center gap-3 rounded-lg border border-brand bg-blue-50 p-3 text-left ring-2 ring-blue-100 dark:bg-blue-950/50 dark:ring-blue-900"
                              : "flex items-center gap-3 rounded-lg border border-line p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900"
                          }
                          aria-label={`Use ${preset.label} icon`}
                          title={preset.label}
                        >
                          <ServiceIcon
                            icon={{ type: "preset", key: preset.key }}
                            name={preset.label}
                            size="sm"
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-800">
                              {preset.label}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {preset.category ?? "General"}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          <label className="sm:col-span-2">
            <span className="form-label">Name</span>
            <input
              className="form-input"
              value={draft.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="DMIT VPS"
            />
          </label>

          <label>
            <span className="form-label">Category</span>
            <select
              className="form-input"
              value={draft.category}
              onChange={(event) =>
                update("category", event.target.value as ServiceDraft["category"])
              }
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="form-label">Status</span>
            <select
              className="form-input"
              value={draft.status}
              onChange={(event) =>
                update("status", event.target.value as ServiceDraft["status"])
              }
            >
              {serviceStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="form-label">Price</span>
            <input
              className="form-input"
              type="text"
              inputMode="decimal"
              value={priceInput}
              onChange={(event) => {
                const value = event.target.value;
                if (/^\d*\.?\d*$/.test(value)) {
                  setPriceInput(value);
                }
              }}
              placeholder="Enter amount"
            />
          </label>

          <label>
            <span className="form-label">Currency</span>
            <select
              className="form-input"
              value={draft.currency}
              onChange={(event) =>
                update("currency", event.target.value as ServiceDraft["currency"])
              }
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {getCurrencyLabel(currency)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="form-label">Billing Cycle</span>
            <select
              className="form-input"
              value={draft.billingCycle}
              onChange={(event) =>
                update(
                  "billingCycle",
                  event.target.value as ServiceDraft["billingCycle"],
                )
              }
            >
              {billingCycles.map((cycle) => (
                <option key={cycle}>{cycle}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="form-label">Next Renewal Date</span>
            <input
              className="form-input"
              type="date"
              value={draft.nextRenewalDate}
              onChange={(event) => update("nextRenewalDate", event.target.value)}
            />
          </label>

          <label>
            <span className="form-label">Payment Method</span>
            <select
              className="form-input"
              value={draft.paymentMethod}
              onChange={(event) =>
                update(
                  "paymentMethod",
                  event.target.value as ServiceDraft["paymentMethod"],
                )
              }
            >
              {paymentMethods.map((method) => (
                <option key={method}>{method}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="form-label">Admin Link</span>
            <input
              className="form-input"
              value={draft.link}
              onChange={(event) => update("link", event.target.value)}
              placeholder="https://"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="form-label">Notes</span>
            <textarea
              className="form-input min-h-24 resize-y"
              value={draft.notes}
              onChange={(event) => update("notes", event.target.value)}
              placeholder="Cancellation context, plan name, renewal notes..."
            />
          </label>

          <label className="flex items-center gap-3 rounded-lg border border-line px-4 py-3 text-sm font-medium text-slate-700 sm:col-span-2">
            <input
              type="checkbox"
              checked={draft.renewalReminder}
              onChange={(event) => update("renewalReminder", event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
            />
            Renewal reminder enabled
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-danger sm:col-span-2 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-line bg-white px-5 py-4 dark:bg-slate-950">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save Service
          </button>
        </div>
      </form>
    </div>
  );
}
