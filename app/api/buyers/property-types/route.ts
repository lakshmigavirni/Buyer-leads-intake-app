import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/buyers/property-types → returns unique property types
export async function GET() {
  try {
    const propertyTypes = await prisma.buyer.findMany({
      select: { propertyType: true },
      distinct: ["propertyType"],
      orderBy: { propertyType: "asc" },
    });
    return NextResponse.json({ success: true, propertyTypes: propertyTypes.map(p => p.propertyType).filter(Boolean) });
  } catch (error: any) {
    console.error("GET /api/buyers/property-types error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
