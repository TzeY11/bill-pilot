import { NextResponse } from "next/server";
import {
  createUser,
  findUserByEmail,
  isRegistrationExplicitlyOpen,
  isRegistrationOpen,
  normalizeEmail,
  setSessionCookie,
  toSessionUser,
} from "@/lib/server/auth";
import {
  clearRateLimit,
  consumeRateLimit,
  getClientIp,
} from "@/lib/server/rate-limit";
import { isValidEmail, validatePassword } from "@/lib/validation";

export const runtime = "nodejs";

const registerLimit = 5;
const registerWindowSeconds = 60 * 60;

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  const normalizedEmail = normalizeEmail(email);
  const rateLimitIdentifier = `${getClientIp(request)}:${normalizedEmail || "unknown"}`;
  const rateLimit = consumeRateLimit({
    action: "register",
    identifier: rateLimitIdentifier,
    limit: registerLimit,
    windowSeconds: registerWindowSeconds,
  });

  if (rateLimit.limited) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  if (!isRegistrationOpen()) {
    return NextResponse.json(
      {
        error:
          "Registration is closed. Set ALLOW_REGISTRATION=true to allow more accounts.",
      },
      { status: 403 },
    );
  }

  if (findUserByEmail(email)) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  try {
    const user = await createUser(
      { name, email, password },
      { requireFirstUser: !isRegistrationExplicitlyOpen() },
    );
    if (!user) {
      return NextResponse.json(
        {
          error:
            "Registration is closed. Set ALLOW_REGISTRATION=true to allow more accounts.",
        },
        { status: 403 },
      );
    }

    const sessionUser = toSessionUser(user);
    await setSessionCookie(sessionUser);
    clearRateLimit("register", rateLimitIdentifier);
    return NextResponse.json({ user: sessionUser });
  } catch {
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
