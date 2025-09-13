// app/api/buyers/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  BuyerCreateSchema,
  BuyerUpdateSchema,
} from "@/lib/validators/buyer";
import { ratelimit } from "@/lib/ratelimit";

// ✅ CREATE buyer → POST /api/buyers
export async function POST(req: Request) {
  try {
    // ⏳ Rate limit check
    const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Too many requests, slow down." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = BuyerCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const buyer = await prisma.buyer.create({
      data: {
        ...parsed.data,
        ownerId: "demo-user",
      },
    });

    // log initial creation into history
    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: "demo-user",
        diff: parsed.data,
      },
    });

    return NextResponse.json({ success: true, buyer });
  } catch (error: any) {
    console.error("POST /api/buyers error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

// ✅ LIST buyers → GET /api/buyers
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const city = searchParams.get("city") || "";
    const propertyType = searchParams.get("propertyType") || "";
    const status = searchParams.get("status") || "";
    const timeline = searchParams.get("timeline") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Build where clause dynamically
    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search} },
        { phone: { contains: search } },
      ];
    }

    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (status) where.status = status;
    if (timeline) where.timeline = timeline;

    const [buyers, total] = await Promise.all([
      prisma.buyer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.buyer.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      buyers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/buyers error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

// ✅ UPDATE buyer → PATCH /api/buyers?id=<id>
export async function PATCH(req: Request) {
  try {
    // ⏳ Rate limit check
    const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Too many requests, slow down." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Buyer ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = BuyerUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.buyer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Buyer not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.buyer.update({
      where: { id },
      data: parsed.data,
    });

    // log diffs in history
    await prisma.buyerHistory.create({
      data: {
        buyerId: updated.id,
        changedBy: "demo-user",
        diff: parsed.data,
      },
    });

    return NextResponse.json({ success: true, buyer: updated });
  } catch (error: any) {
    console.error("PATCH /api/buyers error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

// ✅ DELETE buyer → DELETE /api/buyers?id=<id>
export async function DELETE(req: Request) {
  try {
    // ⏳ Rate limit check
    const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Too many requests, slow down." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Buyer ID is required" },
        { status: 400 }
      );
    }

    // delete history first
    await prisma.buyerHistory.deleteMany({ where: { buyerId: id } });

    // delete notes too
    await prisma.buyerNote.deleteMany({ where: { buyerId: id } });

    // delete buyer
    const deleted = await prisma.buyer.delete({ where: { id } });

    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    console.error("DELETE /api/buyers error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
