import { sampleServices } from "@/data/sample-services";
import { inferServiceIcon } from "@/lib/service-icons";
import type { ServiceItem } from "@/types/billing";

const storageKey = "bill-pilot-services";

export const loadServices = (): ServiceItem[] => {
  if (typeof window === "undefined") return sampleServices;

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    window.localStorage.setItem(storageKey, JSON.stringify(sampleServices));
    return sampleServices;
  }

  try {
    const parsed = JSON.parse(raw) as ServiceItem[];
    const normalized = parsed.map((service) => {
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
    window.localStorage.setItem(storageKey, JSON.stringify(normalized));
    return normalized;
  } catch {
    window.localStorage.setItem(storageKey, JSON.stringify(sampleServices));
    return sampleServices;
  }
};

export const saveServices = (services: ServiceItem[]) => {
  window.localStorage.setItem(storageKey, JSON.stringify(services));
};
