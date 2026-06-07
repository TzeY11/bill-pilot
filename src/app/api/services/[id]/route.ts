import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { deleteService, updateService } from "@/lib/server/services";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as { service?: unknown };

  try {
    const service = updateService(
      user.id,
      id,
      body && typeof body === "object" && "service" in body
        ? (body.service as object)
        : (body as object),
    );
    if (!service) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update service.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!deleteService(user.id, id)) {
    return NextResponse.json({ error: "Service not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
