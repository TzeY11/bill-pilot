import { NextResponse } from "next/server";
import {
  findUserByEmail,
  setSessionCookie,
  toSessionUser,
  verifyPassword,
} from "@/lib/server/auth";
import { isValidEmail } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!isValidEmail(email) || !password) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const user = findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const sessionUser = toSessionUser(user);
  await setSessionCookie(sessionUser);
  return NextResponse.json({ user: sessionUser });
}
