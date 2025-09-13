import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // ✅ Same filters as list API
    const city = searchParams.get("city");
    const propertyType = searchParams.get("propertyType");
    const status = searchParams.get("status");
    const timeline = searchParams.get("timeline");
    const search = searchParams.get("search");

    const where: any = {};
    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (status) where.status = status;
    if (timeline) where.timeline = timeline;

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const buyers = await prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    // ✅ CSV header
    const header = [
      "fullName",
      "email",
      "phone",
      "city",
      "propertyType",
      "bhk",
      "purpose",
      "budgetMin",
      "budgetMax",
      "timeline",
      "source",
      "status",
      "notes",
      "tags",
      "updatedAt",
    ];

    // ✅ CSV rows
    const rows = buyers.map((b) =>
      [
        b.fullName,
        b.email ?? "",
        b.phone,
        b.city,
        b.propertyType,
        b.bhk ?? "",
        b.purpose,
        b.budgetMin ?? "",
        b.budgetMax ?? "",
        b.timeline,
        b.source,
        b.status,
        b.notes?.replace(/\n/g, " ") ?? "",
        b.tags ?? "",
        b.updatedAt ? b.updatedAt.toISOString() : "",
      ].join(",")
    );

    const csvContent = [header.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=buyers-export.csv",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
