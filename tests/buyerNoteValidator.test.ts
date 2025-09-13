import { BuyerNoteSchema } from "@/lib/validators/buyer";

describe("BuyerNoteSchema", () => {
  it("accepts valid note input", () => {
    const input = { content: "This is a valid note", createdBy: "Admin" };
    const result = BuyerNoteSchema.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("This is a valid note");
      expect(result.data.createdBy).toBe("Admin");
    }
  });

  it("fails when content is empty", () => {
    const input = { content: "", createdBy: "Admin" };
    const result = BuyerNoteSchema.safeParse(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Note cannot be empty");
    }
  });

  it("defaults createdBy to system if missing", () => {
    const input = { content: "Note without createdBy" };
    const result = BuyerNoteSchema.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.createdBy).toBe("system");
    }
  });

  it("fails when note exceeds 1000 characters", () => {
    const input = { content: "a".repeat(1001), createdBy: "Admin" };
    const result = BuyerNoteSchema.safeParse(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Note must be ≤ 1000 characters"
      );
    }
  });
});
