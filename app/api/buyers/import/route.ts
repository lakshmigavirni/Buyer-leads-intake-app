import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parse } from "csv-parse/sync";

// ✅ Define the expected CSV row shape
type BuyerCsvRow = {
  fullName: string;
  email?: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose: string;
  budgetMin?: string;
  budgetMax?: string;
  timeline: string;
  source: string;
  status?: string;
  notes?: string;
  tags?: string;
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const text = await file.text();

    // ✅ Parse CSV into typed rows
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as BuyerCsvRow[];

    let insertedCount = 0;

    for (const row of records) {
      await prisma.buyer.create({
        data: {
          fullName: row.fullName,
          email: row.email || null,
          phone: row.phone,
          city: row.city,
          propertyType: row.propertyType,
          bhk: row.bhk || null,
          purpose: row.purpose,
          budgetMin: row.budgetMin ? Number(row.budgetMin) : null,
          budgetMax: row.budgetMax ? Number(row.budgetMax) : null,
          timeline: row.timeline,
          source: row.source,
          status: row.status || "New",
          notes: row.notes || null,
          tags: row.tags || null,
          ownerId: "demo-user",
        },
      });
      insertedCount++;
    }

    return NextResponse.json({ success: true, inserted: insertedCount });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
