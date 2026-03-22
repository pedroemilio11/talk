import { NextResponse } from "next/server";
import type { ModuleIntegrationSetting } from "@/lib/integrations-api";
import { getSettings, upsertSetting } from "@/lib/integrations-store";

export async function GET() {
  return NextResponse.json(getSettings());
}

export async function PUT(request: Request) {
  const payload = (await request.json()) as ModuleIntegrationSetting;
  return NextResponse.json(upsertSetting(payload));
}
