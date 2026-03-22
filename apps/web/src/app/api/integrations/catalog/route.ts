import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/integrations-store";

export async function GET() {
  return NextResponse.json(getCatalog());
}
