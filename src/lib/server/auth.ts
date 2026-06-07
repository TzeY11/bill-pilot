import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { compare, hash } from "bcryptjs";
import { randomUUID } from "node:crypto";
import { db, type DbUser } from "./db";
import { sessionCookieName } from "@/lib/auth-constants";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
};

const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;

const getAuthSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const hashPassword = (password: string) => hash(password, 12);

export const verifyPassword = (password: string, passwordHash: string) =>
  compare(password, passwordHash);

export const createUser = async (
  {
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  },
  options?: { requireFirstUser?: boolean },
) => {
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = await hashPassword(password);
  const id = randomUUID();
  const timestamp = new Date().toISOString();

  db.exec("BEGIN IMMEDIATE");
  try {
    if (options?.requireFirstUser && countUsers() > 0) {
      db.exec("ROLLBACK");
      return null;
    }

    db.prepare(
      `INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(id, name.trim() || null, normalizedEmail, passwordHash, timestamp, timestamp);

    const user = findUserByEmail(normalizedEmail);
    db.exec("COMMIT");
    return user;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
};

export const countUsers = () =>
  (db.prepare("SELECT COUNT(*) AS count FROM users").get() as { count: number })
    .count;

export const isRegistrationExplicitlyOpen = () =>
  process.env.ALLOW_REGISTRATION?.toLowerCase() === "true";

export const isRegistrationOpen = () =>
  isRegistrationExplicitlyOpen() || countUsers() === 0;

export const findUserByEmail = (email: string) =>
  db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(normalizeEmail(email)) as DbUser | undefined;

export const findUserById = (id: string) =>
  db.prepare("SELECT * FROM users WHERE id = ?").get(id) as DbUser | undefined;

export const toSessionUser = (user: DbUser): SessionUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
});

export const createSessionToken = async (user: SessionUser) =>
  new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${sessionMaxAgeSeconds}s`)
    .sign(getAuthSecret());

export const setSessionCookie = async (user: SessionUser) => {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, await createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionMaxAgeSeconds,
    path: "/",
  });
};

export const clearSessionCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
};

export const getSessionUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    if (!payload.sub) return null;
    const user = findUserById(payload.sub);
    return user ? toSessionUser(user) : null;
  } catch {
    return null;
  }
};
