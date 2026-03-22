import { NextResponse } from "next/server";
import { getModules } from "@/lib/integrations-store";

export async function GET() {
  return NextResponse.json(getModules());
}
