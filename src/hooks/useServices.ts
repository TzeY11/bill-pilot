"use client";

import { useEffect, useMemo, useState } from "react";
import { sampleServices } from "@/data/sample-services";
import { clearLegacyServices, loadLegacyServices } from "@/lib/storage";
import type { ServiceDraft, ServiceItem } from "@/types/billing";

type ServicesResponse = {
  services: ServiceItem[];
  initialized?: boolean;
  error?: string;
};

type ServiceResponse = {
  service: ServiceItem;
  error?: string;
};

const readError = async (response: Response, fallback: string) => {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? fallback;
  } catch {
    return fallback;
  }
};

const fetchServices = async () => {
  const response = await fetch("/api/services");
  if (!response.ok) {
    throw new Error(await readError(response, "Unable to load services."));
  }

  const body = (await response.json()) as ServicesResponse;
  return { services: body.services, initialized: Boolean(body.initialized) };
};

const importInitialServices = async (services: ServiceItem[]) => {
  const response = await fetch("/api/services/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ services }),
  });

  if (response.status === 409) {
    return fetchServices();
  }

  if (!response.ok) {
    throw new Error(await readError(response, "Unable to import services."));
  }

  const body = (await response.json()) as ServicesResponse;
  return { services: body.services, initialized: true };
};

export const useServices = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsReady(false);
      setError("");

      try {
        const loaded = await fetchServices();

        if (loaded.services.length > 0 || loaded.initialized) {
          if (active) setServices(loaded.services);
          return;
        }

        const legacyServices = loadLegacyServices();
        const initialServices =
          legacyServices.length > 0 ? legacyServices : sampleServices;
        const imported = await importInitialServices(initialServices);
        clearLegacyServices();
        if (active) setServices(imported.services);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load services.",
          );
          setServices([]);
        }
      } finally {
        if (active) setIsReady(true);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const actions = useMemo(
    () => ({
      addService: async (draft: ServiceDraft) => {
        setError("");
        try {
          const response = await fetch("/api/services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ service: draft }),
          });

          if (!response.ok) {
            setError(await readError(response, "Unable to add service."));
            return;
          }

          const body = (await response.json()) as ServiceResponse;
          setServices((current) => [body.service, ...current]);
        } catch {
          setError("Unable to add service.");
        }
      },
      updateService: async (id: string, draft: ServiceDraft) => {
        setError("");
        try {
          const response = await fetch(`/api/services/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ service: draft }),
          });

          if (!response.ok) {
            setError(await readError(response, "Unable to update service."));
            return;
          }

          const body = (await response.json()) as ServiceResponse;
          setServices((current) =>
            current.map((service) => (service.id === id ? body.service : service)),
          );
        } catch {
          setError("Unable to update service.");
        }
      },
      deleteService: async (id: string) => {
        setError("");
        try {
          const response = await fetch(`/api/services/${encodeURIComponent(id)}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            setError(await readError(response, "Unable to delete service."));
            return;
          }

          setServices((current) => current.filter((service) => service.id !== id));
        } catch {
          setError("Unable to delete service.");
        }
      },
    }),
    [],
  );

  return { services, isReady, error, ...actions };
};
