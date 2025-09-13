// lib/validators/buyerNote.ts
import { z } from "zod";

export const BuyerNoteSchema = z.object({
  content: z
    .string()
    .min(1, "Note cannot be empty")
    .max(1000, "Note must be ≤ 1000 characters"),
  createdBy: z.string().default("system"),
});

export type BuyerNoteInput = z.infer<typeof BuyerNoteSchema>;
