import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ Create a new note for a buyer
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: buyerId } = params;
    if (!buyerId) {
      return NextResponse.json(
        { success: false, error: "Missing buyerId" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { content, createdBy } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Content is required" },
        { status: 400 }
      );
    }

    // Ensure buyer exists
    const buyer = await prisma.buyer.findUnique({ where: { id: buyerId } });
    if (!buyer) {
      return NextResponse.json(
        { success: false, error: "Buyer not found" },
        { status: 404 }
      );
    }

    const note = await prisma.buyerNote.create({
      data: {
        content,
        createdBy: createdBy || "system",
        buyerId,
      },
    });

    return NextResponse.json(
      { success: true, note },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/buyers/[id]/notes error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Failed to create note" },
      { status: 500 }
    );
  }
}

// ✅ Get latest notes for a buyer
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: buyerId } = params;
    if (!buyerId) {
      return NextResponse.json(
        { success: false, error: "Missing buyerId" },
        { status: 400 }
      );
    }

    const notes = await prisma.buyerNote.findMany({
      where: { buyerId },
      orderBy: { createdAt: "desc" },
      take: 5, // 👈 keep it consistent with buyer GET
    });

    return NextResponse.json(
      { success: true, notes },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/buyers/[id]/notes error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Failed to fetch notes" },
      { status: 500 }
    );
  }
}
