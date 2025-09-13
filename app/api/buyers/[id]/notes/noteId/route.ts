import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ DELETE /api/buyers/:id/notes/:noteId → delete a note
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const { id: buyerId, noteId } = params;

    if (!buyerId || !noteId) {
      return NextResponse.json(
        { success: false, error: "Missing buyerId or noteId" },
        { status: 400 }
      );
    }

    // Check note exists and belongs to buyer
    const note = await prisma.buyerNote.findUnique({
      where: { id: noteId },
    });

    if (!note || note.buyerId !== buyerId) {
      return NextResponse.json(
        { success: false, error: "Note not found for this buyer" },
        { status: 404 }
      );
    }

    await prisma.buyerNote.delete({ where: { id: noteId } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE /api/buyers/[id]/notes/[noteId] error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Failed to delete note" },
      { status: 500 }
    );
  }
}
