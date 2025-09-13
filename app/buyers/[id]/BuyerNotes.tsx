"use client";

import { useState, useEffect } from "react";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export default function BuyerNotes({ buyerId }: { buyerId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch notes on mount
  useEffect(() => {
    fetch(`/api/buyers/${buyerId}/notes`)
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => console.error("Error fetching notes:", err));
  }, [buyerId]);

  // Add a new note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/buyers/${buyerId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote, createdBy: "Admin" }),
      });

      const data = await res.json();
      setNotes((prev) => [...prev, data]); // append new note
      setNewNote(""); // clear input
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="text-lg font-semibold mb-2">Notes</h2>

      {/* Notes List */}
      <div className="space-y-2 mb-4">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-2 border rounded bg-white shadow-sm text-sm"
            >
              <p>{note.content}</p>
              <span className="text-xs text-gray-500">
                {new Date(note.createdAt).toLocaleString()} — {note.createdBy}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No notes yet.</p>
        )}
      </div>

      {/* Add Note Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Write a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={handleAddNote}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
}
