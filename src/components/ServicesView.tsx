"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { ServiceFormModal } from "@/components/ServiceFormModal";
import { ServiceTable } from "@/components/ServiceTable";
import { ServiceToolbar } from "@/components/ServiceToolbar";
import { useServices } from "@/hooks/useServices";
import { filterAndSortServices } from "@/lib/billing";
import type { ServiceDraft, ServiceFilters, ServiceItem } from "@/types/billing";

const defaultFilters: ServiceFilters = {
  query: "",
  category: "All",
  status: "All",
  sortKey: "renewalDate",
  sortDirection: "asc",
};

export function ServicesView() {
  const searchParams = useSearchParams();
  const { services, isReady, addService, updateService, deleteService } = useServices();
  const [filters, setFilters] = useState<ServiceFilters>(defaultFilters);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const visibleServices = useMemo(
    () => filterAndSortServices(services, filters),
    [filters, services],
  );

  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setEditingService(null);
      setFormOpen(true);
    }
  }, [searchParams]);

  const openNewForm = () => {
    setEditingService(null);
    setFormOpen(true);
  };

  const handleSubmit = (draft: ServiceDraft) => {
    if (editingService) {
      updateService(editingService.id, draft);
    } else {
      addService(draft);
    }
  };

  const handleDelete = (service: ServiceItem) => {
    const confirmed = window.confirm(`Delete "${service.name}"? This cannot be undone.`);
    if (confirmed) deleteService(service.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-brand">
            Service inventory
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Services</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Manage recurring costs, renewal dates, payment methods, and cancellation notes.
          </p>
        </div>
        <button onClick={openNewForm} className="btn-primary w-full sm:w-auto">
          <Plus size={18} />
          Add Service
        </button>
      </div>

      <ServiceToolbar filters={filters} onChange={setFilters} />

      {!isReady ? (
        <section className="rounded-lg border border-line bg-panel p-8 text-sm text-slate-500 shadow-soft">
          Loading local billing data...
        </section>
      ) : (
        <ServiceTable
          services={visibleServices}
          onEdit={(service) => {
            setEditingService(service);
            setFormOpen(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {formOpen && (
        <ServiceFormModal
          service={editingService}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
