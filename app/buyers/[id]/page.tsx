// app/buyers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Buyer = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  propertyType: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string;
  status: string;
  updatedAt: string;
  history?: {
    id: string;
    changedAt: string;
    changedBy: string;
    diff: Record<string, { old: any; new: any }>;
  }[];
  buyerNotes?: {
    id: string;
    content: string;
    createdAt: string;
    createdBy: string;
  }[];
};

export default function BuyerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form + edit state
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<Buyer>>({});

  // Notes form
  const [noteContent, setNoteContent] = useState("");

  // Fetch buyer with history + notes
  async function fetchBuyer() {
    try {
      const res = await fetch(`/api/buyers/${id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setBuyer(data.buyer);
        setForm(data.buyer);
      } else {
        setError(data.error || "Failed to load buyer");
      }
    } catch (err) {
      setError("Error fetching buyer");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) fetchBuyer();
  }, [id]);

  // Add new note
  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      const res = await fetch(`/api/buyers/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent, createdBy: "Admin" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBuyer((prev) =>
          prev
            ? { ...prev, buyerNotes: [data.note, ...(prev.buyerNotes || [])] }
            : prev
        );
        setNoteContent("");
      } else {
        alert(data.error || "Failed to add note");
      }
    } catch (err) {
      alert("Error adding note");
    }
  }

  // Delete note
  async function handleDeleteNote(noteId: string) {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const res = await fetch(`/api/buyers/${id}/notes/${noteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBuyer((prev) =>
          prev
            ? {
                ...prev,
                buyerNotes: prev.buyerNotes?.filter((n) => n.id !== noteId),
              }
            : prev
        );
      } else {
        alert(data.error || "Failed to delete note");
      }
    } catch (err) {
      alert("Error deleting note");
    }
  }

  // Update buyer with concurrency handling
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!buyer) return;

    try {
      const res = await fetch(`/api/buyers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          updatedAt: buyer.updatedAt, // pass current version
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBuyer((prev) => (prev ? { ...prev, ...data.buyer } : data.buyer));
        setIsEditing(false);
      } else if (res.status === 409) {
        alert(
          "This record was updated by someone else. Refreshing latest data..."
        );
        await fetchBuyer(); // reload latest
        setIsEditing(false);
      } else {
        alert(data.error || "Failed to update buyer");
      }
    } catch (err) {
      alert("Error updating buyer");
    }
  }

  // Delete buyer
  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this buyer?")) return;
    try {
      const res = await fetch(`/api/buyers/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Buyer deleted");
        router.push("/buyers");
      } else {
        alert("Failed to delete buyer");
      }
    } catch (err) {
      alert("Error deleting buyer");
    }
  }

  if (loading) return <p className="p-6 text-white">Loading buyer...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!buyer) return <p className="p-6 text-white">Buyer not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-black min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">{buyer.fullName}</h1>
        <div className="space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {/* ...edit form and details remain unchanged... */}

      {/* Notes */}
      <h2 className="text-xl font-semibold mb-4 text-white">Notes</h2>
      <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
        <input
          type="text"
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Add a note..."
          className="border p-2 w-full rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </form>
      <div className="space-y-3">
        {buyer.buyerNotes && buyer.buyerNotes.length > 0 ? (
          buyer.buyerNotes.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-lg p-3 shadow text-gray-900 flex justify-between items-center"
            >
              <div>
                <p>{n.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {n.createdBy} — {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDeleteNote(n.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-300">No notes yet.</p>
        )}
      </div>
    </div>
  );
}
