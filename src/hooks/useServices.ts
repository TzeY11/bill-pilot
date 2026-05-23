"use client";

import { useEffect, useMemo, useState } from "react";
import { loadServices, saveServices } from "@/lib/storage";
import type { ServiceDraft, ServiceItem } from "@/types/billing";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `svc-${Date.now()}`;

export const useServices = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setServices(loadServices());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) saveServices(services);
  }, [isReady, services]);

  const actions = useMemo(
    () => ({
      addService: (draft: ServiceDraft) => {
        const timestamp = new Date().toISOString();
        setServices((current) => [
          {
            ...draft,
            id: createId(),
            createdAt: timestamp,
            updatedAt: timestamp,
          },
          ...current,
        ]);
      },
      updateService: (id: string, draft: ServiceDraft) => {
        const timestamp = new Date().toISOString();
        setServices((current) =>
          current.map((service) =>
            service.id === id
              ? { ...service, ...draft, updatedAt: timestamp }
              : service,
          ),
        );
      },
      deleteService: (id: string) => {
        setServices((current) => current.filter((service) => service.id !== id));
      },
    }),
    [],
  );

  return { services, isReady, ...actions };
};
