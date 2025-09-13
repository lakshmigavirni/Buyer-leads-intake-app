// lib/validators/buyer.ts
import { z } from "zod";

/**
 * Enums — must stay in sync with prisma/schema.prisma
 */
export const CityEnum = z.enum([
  "Chandigarh",
  "Mohali",
  "Zirakpur",
  "Panchkula",
  "Other",
]);

export const PropertyTypeEnum = z.enum([
  "Apartment",
  "Villa",
  "Plot",
  "Office",
  "Retail",
]);

export const BHKEnum = z.enum(["STUDIO", "ONE", "TWO", "THREE", "FOUR"]);

export const PurposeEnum = z.enum(["Buy", "Rent"]);

export const TimelineEnum = z.enum(["M0_3", "M3_6", "M6_PLUS", "EXPLORING"]);

export const SourceEnum = z.enum([
  "Website",
  "Referral",
  "Walk_in",
  "Call",
  "Other",
]);

export const StatusEnum = z.enum([
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
]);

/**
 * Create schema (used by POST)
 */
export const BuyerCreateSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 chars").max(80),
    email: z.string().email("Invalid email").optional(),
    phone: z.string().regex(/^\d{10,15}$/, "Phone must be 10-15 digits"),

    city: CityEnum,
    propertyType: PropertyTypeEnum,
    bhk: BHKEnum.optional(),

    purpose: PurposeEnum,
    budgetMin: z.number().int().nonnegative().optional(),
    budgetMax: z.number().int().nonnegative().optional(),
    timeline: TimelineEnum,
    source: SourceEnum,
    status: StatusEnum.default("New"),

    notes: z.string().max(1000).optional(),
    // tags are comma-separated in form, we normalize later
    tags: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // 🔹 bhk required if Apartment/Villa
    if (
      (data.propertyType === "Apartment" || data.propertyType === "Villa") &&
      !data.bhk
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "BHK is required for Apartment or Villa",
        path: ["bhk"],
      });
    }

    // 🔹 budgetMax >= budgetMin
    if (
      typeof data.budgetMin === "number" &&
      typeof data.budgetMax === "number" &&
      data.budgetMax < data.budgetMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "budgetMax must be ≥ budgetMin",
        path: ["budgetMax"],
      });
    }
  });

/**
 * Update schema (used by PATCH)
 * - All fields optional
 * - Must include updatedAt for concurrency check
 */
export const BuyerUpdateSchema = z
  .object({
    fullName: z.string().min(2).max(80).optional(),
    email: z.string().email("Invalid email").optional(),
    phone: z
      .string()
      .regex(/^\d{10,15}$/, "Phone must be 10-15 digits")
      .optional(),

    city: CityEnum.optional(),
    propertyType: PropertyTypeEnum.optional(),
    bhk: BHKEnum.optional(),

    purpose: PurposeEnum.optional(),
    budgetMin: z.number().int().nonnegative().optional(),
    budgetMax: z.number().int().nonnegative().optional(),
    timeline: TimelineEnum.optional(),
    source: SourceEnum.optional(),
    status: StatusEnum.optional(),

    notes: z.string().max(1000).optional(),
    tags: z.string().optional(),

    // 🔹 concurrency token
    updatedAt: z.string(),
  })
  .superRefine((data, ctx) => {
    if (
      typeof data.budgetMin === "number" &&
      typeof data.budgetMax === "number" &&
      data.budgetMax < data.budgetMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "budgetMax must be ≥ budgetMin",
        path: ["budgetMax"],
      });
    }
    if (
      (data.propertyType === "Apartment" || data.propertyType === "Villa") &&
      !data.bhk
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "BHK is required for Apartment or Villa",
        path: ["bhk"],
      });
    }
  });
  // 🔹 Note validator
export const BuyerNoteSchema = z.object({
  content: z
    .string()
    .min(1, "Note cannot be empty")
    .max(1000, "Note must be ≤ 1000 characters"),
  createdBy: z.string().default("system"),
});

export type BuyerNoteInput = z.infer<typeof BuyerNoteSchema>;


export type BuyerCreateInput = z.infer<typeof BuyerCreateSchema>;
export type BuyerUpdateInput = z.infer<typeof BuyerUpdateSchema>;
