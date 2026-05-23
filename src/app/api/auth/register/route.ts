import { NextResponse } from "next/server";
import { createUser, findUserByEmail, setSessionCookie, toSessionUser } from "@/lib/server/auth";
import { isValidEmail, validatePassword } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  if (findUserByEmail(email)) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  try {
    const user = await createUser({ name, email, password });
    if (!user) {
      return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
    }

    const sessionUser = toSessionUser(user);
    await setSessionCookie(sessionUser);
    return NextResponse.json({ user: sessionUser });
  } catch {
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
