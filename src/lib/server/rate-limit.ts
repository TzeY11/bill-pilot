import "server-only";

import { createHash } from "node:crypto";
import { db, type DbAuthRateLimit } from "@/lib/server/db";

type RateLimitOptions = {
  action: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
};

type RateLimitResult = {
  limited: boolean;
  retryAfterSeconds: number;
};

const cleanupWindowSeconds = 60 * 60 * 24;

const hashIdentifier = (identifier: string) =>
  createHash("sha256").update(identifier).digest("hex");

export const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
};

export const consumeRateLimit = ({
  action,
  identifier,
  limit,
  windowSeconds,
}: RateLimitOptions): RateLimitResult => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const identifierHash = hashIdentifier(identifier);
  const key = `${action}:${identifierHash}`;
  const cleanupBefore = new Date(
    Date.now() - cleanupWindowSeconds * 1000,
  ).toISOString();

  db.prepare("DELETE FROM auth_rate_limits WHERE updated_at < ?").run(
    cleanupBefore,
  );

  const existing = db
    .prepare("SELECT * FROM auth_rate_limits WHERE key = ?")
    .get(key) as DbAuthRateLimit | undefined;

  if (!existing || nowSeconds - existing.window_start >= windowSeconds) {
    db.prepare(
      `INSERT OR REPLACE INTO auth_rate_limits (
        key, action, identifier_hash, window_start, attempts, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(key, action, identifierHash, nowSeconds, 1, new Date().toISOString());

    return { limited: false, retryAfterSeconds: 0 };
  }

  const retryAfterSeconds = Math.max(
    1,
    existing.window_start + windowSeconds - nowSeconds,
  );

  if (existing.attempts >= limit) {
    return { limited: true, retryAfterSeconds };
  }

  db.prepare(
    `UPDATE auth_rate_limits
     SET attempts = ?, updated_at = ?
     WHERE key = ?`,
  ).run(existing.attempts + 1, new Date().toISOString(), key);

  return { limited: false, retryAfterSeconds: 0 };
};

export const clearRateLimit = (action: string, identifier: string) => {
  const identifierHash = hashIdentifier(identifier);
  db.prepare("DELETE FROM auth_rate_limits WHERE key = ?").run(
    `${action}:${identifierHash}`,
  );
};
