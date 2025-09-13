// app/api/buyers/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { BuyerUpdateSchema } from "@/lib/validators/buyer";

// ✅ GET /api/buyers/:id → fetch single buyer + history + notes
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id" },
        { status: 400 }
      );
    }

    const buyer = await prisma.buyer.findUnique({
      where: { id },
      include: {
        history: {
          orderBy: { changedAt: "desc" },
          take: 5,
        },
        buyerNotes: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!buyer) {
      return NextResponse.json(
        { success: false, error: "Buyer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, buyer });
  } catch (err: any) {
    console.error("GET /api/buyers/[id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

// ✅ PATCH /api/buyers/:id → update buyer (with concurrency + history log)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const parsed = BuyerUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { updatedAt, ...updateData } = parsed.data;

    const existing = await prisma.buyer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Buyer not found" },
        { status: 404 }
      );
    }

    // 🔒 Concurrency check
    if (
      updatedAt &&
      new Date(existing.updatedAt).toISOString() !== updatedAt
    ) {
      return NextResponse.json(
        { success: false, error: "Record changed, please refresh" },
        { status: 409 } // 👈 used by frontend
      );
    }

    // Build diff
    const diff: Record<string, { old: any; new: any }> = {};
    for (const key of Object.keys(updateData)) {
      const newVal = (updateData as any)[key];
      const oldVal = (existing as any)[key];
      if (newVal !== undefined && newVal !== oldVal) {
        diff[key] = { old: oldVal, new: newVal };
      }
    }

    // Update buyer
    const updated = await prisma.buyer.update({
      where: { id },
      data: updateData,
      include: {
        history: { orderBy: { changedAt: "desc" }, take: 5 },
        buyerNotes: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });

    // Log into BuyerHistory if changes exist
    if (Object.keys(diff).length > 0) {
      await prisma.buyerHistory.create({
        data: {
          buyerId: id,
          changedBy: "demo-user", // 🔜 replace with actual logged-in user
          diff,
        },
      });
    }

    return NextResponse.json({ success: true, buyer: updated, diff });
  } catch (error: any) {
    console.error("PATCH /api/buyers/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

// ✅ DELETE /api/buyers/:id → remove buyer + history + notes
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // cleanup related tables first
    await prisma.buyerHistory.deleteMany({ where: { buyerId: id } });
    await prisma.buyerNote.deleteMany({ where: { buyerId: id } });

    await prisma.buyer.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/buyers/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
