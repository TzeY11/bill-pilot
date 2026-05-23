import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName } from "@/lib/auth-constants";

const protectedPaths = ["/", "/services", "/account"];
const authPaths = ["/login", "/register"];

const getAuthSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return null;
  return secret;
};

const base64UrlToBytes = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
};

const bytesToBase64Url = (bytes: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const verifyHs256Jwt = async (token: string, secret: string) => {
  const [encodedHeader, encodedPayload, signature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const expectedSignature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
  );

  if (bytesToBase64Url(expectedSignature) !== signature) return false;

  const payload = JSON.parse(
    new TextDecoder().decode(base64UrlToBytes(encodedPayload)),
  ) as { exp?: number };

  return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
};

const hasValidSession = async (request: NextRequest) => {
  const token = request.cookies.get(sessionCookieName)?.value;
  const secret = getAuthSecret();
  if (!token || !secret) return false;

  try {
    return await verifyHs256Jwt(token, secret);
  } catch {
    return false;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isAuthPath = authPaths.includes(pathname);
  const signedIn = await hasValidSession(request);

  if (isProtected && !signedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && signedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/services/:path*", "/account", "/login", "/register"],
};
