import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/buyers/cities → returns unique cities
export async function GET() {
  try {
    const cities = await prisma.buyer.findMany({
      select: { city: true },
      distinct: ["city"],
      orderBy: { city: "asc" },
    });
    return NextResponse.json({ success: true, cities: cities.map(c => c.city).filter(Boolean) });
  } catch (error: any) {
    console.error("GET /api/buyers/cities error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
