import "server-only";

import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

export type DbUser = {
  id: string;
  name: string | null;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
};

export type DbService = {
  id: string;
  user_id: string;
  name: string;
  icon_json: string;
  category: string;
  price: number;
  currency: string;
  billing_cycle: string;
  next_renewal_date: string;
  payment_method: string;
  status: string;
  notes: string;
  link: string;
  renewal_reminder: number;
  created_at: string;
  updated_at: string;
};

export type DbServiceSeedState = {
  user_id: string;
  initialized_at: string;
};

declare global {
  var billPilotDb: DatabaseSync | undefined;
}

const getDatabasePath = () => {
  const configured = process.env.DATABASE_FILE ?? "data/bill-pilot.db";
  return resolve(process.cwd(), configured);
};

const createDatabase = () => {
  const databasePath = getDatabasePath();
  mkdirSync(dirname(databasePath), { recursive: true });

  const db = new DatabaseSync(databasePath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

    CREATE TABLE IF NOT EXISTS services (
      id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      icon_json TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL,
      billing_cycle TEXT NOT NULL,
      next_renewal_date TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT NOT NULL,
      link TEXT NOT NULL,
      renewal_reminder INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS services_user_idx ON services(user_id);
    CREATE INDEX IF NOT EXISTS services_user_renewal_idx
      ON services(user_id, next_renewal_date);

    CREATE TABLE IF NOT EXISTS service_seed_state (
      user_id TEXT PRIMARY KEY,
      initialized_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  return db;
};

export const db = globalThis.billPilotDb ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  globalThis.billPilotDb = db;
}
