import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/buyers/statuses → returns unique statuses
export async function GET() {
  try {
    const statuses = await prisma.buyer.findMany({
      select: { status: true },
      distinct: ["status"],
      orderBy: { status: "asc" },
    });
    return NextResponse.json({ success: true, statuses: statuses.map(s => s.status).filter(Boolean) });
  } catch (error: any) {
    console.error("GET /api/buyers/statuses error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
