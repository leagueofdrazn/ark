import { NextResponse } from "next/server";
import { loadAll } from "@/lib/data";

export const dynamic = "force-dynamic";

export function GET() {
  const data = loadAll();
  return NextResponse.json(data);
}
