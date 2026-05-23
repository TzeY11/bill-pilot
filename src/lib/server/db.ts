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
  `);

  return db;
};

export const db = globalThis.billPilotDb ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  globalThis.billPilotDb = db;
}
