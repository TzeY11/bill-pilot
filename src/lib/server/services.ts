import "server-only";

import { randomUUID } from "node:crypto";
import { inferServiceIcon } from "@/lib/service-icons";
import { db, type DbService, type DbServiceSeedState } from "@/lib/server/db";
import {
  billingCycles,
  categories,
  currencies,
  paymentMethods,
  serviceStatuses,
  type BillingCycle,
  type Currency,
  type PaymentMethod,
  type ServiceCategory,
  type ServiceDraft,
  type ServiceIcon,
  type ServiceItem,
  type ServiceStatus,
} from "@/types/billing";

type ServiceInput = Partial<ServiceItem> & Partial<ServiceDraft>;

const fallbackIcon: ServiceIcon = { type: "preset", key: "subscription" };

const isStringIn = <T extends readonly string[]>(
  value: unknown,
  options: T,
): value is T[number] =>
  typeof value === "string" && options.includes(value as T[number]);

const parseIcon = (
  raw: unknown,
  service: Pick<ServiceItem, "name" | "category">,
): ServiceIcon => {
  const icon =
    typeof raw === "string"
      ? (() => {
          try {
            return JSON.parse(raw) as unknown;
          } catch {
            return null;
          }
        })()
      : raw;

  if (
    icon &&
    typeof icon === "object" &&
    "type" in icon &&
    icon.type === "preset" &&
    "key" in icon &&
    typeof icon.key === "string" &&
    icon.key.trim()
  ) {
    return { type: "preset", key: icon.key.trim() };
  }

  if (
    icon &&
    typeof icon === "object" &&
    "type" in icon &&
    icon.type === "upload" &&
    "dataUrl" in icon &&
    typeof icon.dataUrl === "string" &&
    icon.dataUrl.startsWith("data:image/")
  ) {
    const fileName =
      "fileName" in icon && typeof icon.fileName === "string"
        ? icon.fileName
        : undefined;
    return { type: "upload", dataUrl: icon.dataUrl, fileName };
  }

  return inferServiceIcon(service) ?? fallbackIcon;
};

const toNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return Number.NaN;
};

const isValidDateValue = (value: string) => {
  const timestamp = Date.parse(value);
  return value.trim().length > 0 && !Number.isNaN(timestamp);
};

const normalizeServiceInput = (
  input: ServiceInput,
  existing?: ServiceItem,
): ServiceDraft => {
  const name = typeof input.name === "string" ? input.name.trim() : existing?.name ?? "";
  if (!name) {
    throw new Error("Service name is required.");
  }

  const category = isStringIn(input.category, categories)
    ? (input.category as ServiceCategory)
    : existing?.category ?? "Subscription";
  const price = toNumber(input.price ?? existing?.price ?? 0);
  if (Number.isNaN(price) || price < 0) {
    throw new Error("Price must be zero or greater.");
  }

  const currency = isStringIn(input.currency, currencies)
    ? (input.currency as Currency)
    : existing?.currency ?? "USD";
  const billingCycle = isStringIn(input.billingCycle, billingCycles)
    ? (input.billingCycle as BillingCycle)
    : existing?.billingCycle ?? "Monthly";
  const nextRenewalDate =
    typeof input.nextRenewalDate === "string"
      ? input.nextRenewalDate.trim()
      : existing?.nextRenewalDate ?? "";
  if (!isValidDateValue(nextRenewalDate)) {
    throw new Error("Next renewal date is required.");
  }

  const paymentMethod = isStringIn(input.paymentMethod, paymentMethods)
    ? (input.paymentMethod as PaymentMethod)
    : existing?.paymentMethod ?? "Credit Card";
  const status = isStringIn(input.status, serviceStatuses)
    ? (input.status as ServiceStatus)
    : existing?.status ?? "Active";
  const notes =
    typeof input.notes === "string" ? input.notes.trim() : existing?.notes ?? "";
  const link = typeof input.link === "string" ? input.link.trim() : existing?.link ?? "";
  const renewalReminder =
    typeof input.renewalReminder === "boolean"
      ? input.renewalReminder
      : existing?.renewalReminder ?? true;

  return {
    name,
    icon: parseIcon(input.icon ?? existing?.icon, { name, category }),
    category,
    price,
    currency,
    billingCycle,
    nextRenewalDate,
    paymentMethod,
    status,
    notes,
    link,
    renewalReminder,
  };
};

const rowToService = (row: DbService): ServiceItem => {
  const category = isStringIn(row.category, categories)
    ? (row.category as ServiceCategory)
    : "Subscription";
  const name = row.name;

  return {
    id: row.id,
    name,
    icon: parseIcon(row.icon_json, { name, category }),
    category,
    price: Number(row.price),
    currency: isStringIn(row.currency, currencies)
      ? (row.currency as Currency)
      : "USD",
    billingCycle: isStringIn(row.billing_cycle, billingCycles)
      ? (row.billing_cycle as BillingCycle)
      : "Monthly",
    nextRenewalDate: row.next_renewal_date,
    paymentMethod: isStringIn(row.payment_method, paymentMethods)
      ? (row.payment_method as PaymentMethod)
      : "Credit Card",
    status: isStringIn(row.status, serviceStatuses)
      ? (row.status as ServiceStatus)
      : "Active",
    notes: row.notes,
    link: row.link,
    renewalReminder: Boolean(row.renewal_reminder),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const getServiceById = (userId: string, id: string) => {
  const row = db
    .prepare("SELECT * FROM services WHERE user_id = ? AND id = ?")
    .get(userId, id) as DbService | undefined;
  return row ? rowToService(row) : null;
};

const insertService = (
  userId: string,
  service: ServiceItem,
  conflictMode: "abort" | "replace" = "abort",
) => {
  const verb = conflictMode === "replace" ? "INSERT OR REPLACE" : "INSERT";
  db.prepare(
    `${verb} INTO services (
      id, user_id, name, icon_json, category, price, currency, billing_cycle,
      next_renewal_date, payment_method, status, notes, link, renewal_reminder,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    service.id,
    userId,
    service.name,
    JSON.stringify(service.icon),
    service.category,
    service.price,
    service.currency,
    service.billingCycle,
    service.nextRenewalDate,
    service.paymentMethod,
    service.status,
    service.notes,
    service.link,
    service.renewalReminder ? 1 : 0,
    service.createdAt,
    service.updatedAt,
  );
};

export const listServices = (userId: string) =>
  (
    db
      .prepare(
        `SELECT * FROM services
         WHERE user_id = ?
         ORDER BY next_renewal_date ASC, updated_at DESC`,
      )
      .all(userId) as DbService[]
  ).map(rowToService);

export const hasInitializedServices = (userId: string) =>
  Boolean(
    db
      .prepare("SELECT user_id FROM service_seed_state WHERE user_id = ?")
      .get(userId) as DbServiceSeedState | undefined,
  );

export const markServicesInitialized = (userId: string) => {
  db.prepare(
    `INSERT OR IGNORE INTO service_seed_state (user_id, initialized_at)
     VALUES (?, ?)`,
  ).run(userId, new Date().toISOString());
};

export const createService = (userId: string, input: ServiceInput) => {
  const timestamp = new Date().toISOString();
  const draft = normalizeServiceInput(input);
  const service: ServiceItem = {
    ...draft,
    id:
      typeof input.id === "string" && input.id.trim()
        ? input.id.trim()
        : randomUUID(),
    createdAt:
      typeof input.createdAt === "string" && input.createdAt.trim()
        ? input.createdAt
        : timestamp,
    updatedAt:
      typeof input.updatedAt === "string" && input.updatedAt.trim()
        ? input.updatedAt
        : timestamp,
  };

  insertService(userId, service);
  markServicesInitialized(userId);
  return service;
};

export const updateService = (
  userId: string,
  id: string,
  input: ServiceInput,
) => {
  const existing = getServiceById(userId, id);
  if (!existing) return null;

  const draft = normalizeServiceInput(input, existing);
  const updated: ServiceItem = {
    ...existing,
    ...draft,
    updatedAt: new Date().toISOString(),
  };

  db.prepare(
    `UPDATE services SET
      name = ?,
      icon_json = ?,
      category = ?,
      price = ?,
      currency = ?,
      billing_cycle = ?,
      next_renewal_date = ?,
      payment_method = ?,
      status = ?,
      notes = ?,
      link = ?,
      renewal_reminder = ?,
      updated_at = ?
     WHERE user_id = ? AND id = ?`,
  ).run(
    updated.name,
    JSON.stringify(updated.icon),
    updated.category,
    updated.price,
    updated.currency,
    updated.billingCycle,
    updated.nextRenewalDate,
    updated.paymentMethod,
    updated.status,
    updated.notes,
    updated.link,
    updated.renewalReminder ? 1 : 0,
    updated.updatedAt,
    userId,
    id,
  );

  return updated;
};

export const deleteService = (userId: string, id: string) =>
  db.prepare("DELETE FROM services WHERE user_id = ? AND id = ?").run(userId, id)
    .changes > 0;

export const importServices = (userId: string, inputs: ServiceInput[]) => {
  const imported: ServiceItem[] = [];

  db.exec("BEGIN");
  try {
    for (const input of inputs) {
      const service = createService(userId, input);
      imported.push(service);
    }
    markServicesInitialized(userId);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return imported;
};
