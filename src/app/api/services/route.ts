import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import {
  createService,
  hasInitializedServices,
  listServices,
  markServicesInitialized,
} from "@/lib/server/services";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const services = listServices(user.id);
  const initialized = hasInitializedServices(user.id);
  if (services.length > 0 && !initialized) {
    markServicesInitialized(user.id);
  }

  return NextResponse.json({
    services,
    initialized: initialized || services.length > 0,
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { service?: unknown };

  try {
    const service = createService(
      user.id,
      body && typeof body === "object" && "service" in body
        ? (body.service as object)
        : (body as object),
    );
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create service.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
