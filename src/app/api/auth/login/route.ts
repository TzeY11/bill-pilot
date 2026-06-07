import { NextResponse } from "next/server";
import {
  normalizeEmail,
  findUserByEmail,
  setSessionCookie,
  toSessionUser,
  verifyPassword,
} from "@/lib/server/auth";
import {
  clearRateLimit,
  consumeRateLimit,
  getClientIp,
} from "@/lib/server/rate-limit";
import { isValidEmail } from "@/lib/validation";

export const runtime = "nodejs";

const loginLimit = 10;
const loginWindowSeconds = 5 * 60;

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  const normalizedEmail = normalizeEmail(email);
  const rateLimitIdentifier = `${getClientIp(request)}:${normalizedEmail || "unknown"}`;
  const rateLimit = consumeRateLimit({
    action: "login",
    identifier: rateLimitIdentifier,
    limit: loginLimit,
    windowSeconds: loginWindowSeconds,
  });

  if (rateLimit.limited) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  if (!isValidEmail(email) || !password) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const user = findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const sessionUser = toSessionUser(user);
  await setSessionCookie(sessionUser);
  clearRateLimit("login", rateLimitIdentifier);
  return NextResponse.json({ user: sessionUser });
}
