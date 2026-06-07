import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { importServices, listServices } from "@/lib/server/services";

export const runtime = "nodejs";

const maxImportCount = 100;

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { services?: unknown };
  if (!Array.isArray(body.services)) {
    return NextResponse.json({ error: "Services must be an array." }, { status: 400 });
  }

  if (body.services.length > maxImportCount) {
    return NextResponse.json(
      { error: `Import is limited to ${maxImportCount} services at a time.` },
      { status: 400 },
    );
  }

  if (listServices(user.id).length > 0) {
    return NextResponse.json(
      { error: "Services already exist for this account." },
      { status: 409 },
    );
  }

  try {
    const services = importServices(user.id, body.services as object[]);
    return NextResponse.json({ services }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to import services.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
