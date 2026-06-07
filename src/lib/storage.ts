import { inferServiceIcon } from "@/lib/service-icons";
import type { ServiceItem } from "@/types/billing";

const storageKey = "bill-pilot-services";

const normalizeServices = (services: ServiceItem[]) =>
  services.map((service) => {
    const inferredIcon = inferServiceIcon(service);
    const shouldRefreshIcon =
      !service.icon ||
      (service.name.toLowerCase().includes("icloud") &&
        service.icon.type === "preset" &&
        service.icon.key === "apple");

    return {
      ...service,
      icon: shouldRefreshIcon ? inferredIcon : service.icon,
    };
  });

export const loadLegacyServices = (): ServiceItem[] => {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ServiceItem[];
    if (!Array.isArray(parsed)) return [];
    return normalizeServices(parsed);
  } catch {
    return [];
  }
};

export const clearLegacyServices = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(storageKey);
  }
};
