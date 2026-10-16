import { describe, it, expect } from "vitest";
import { questionsSchema } from "./question-schema";
const base = { id: "q1", type: "short", required: true, enabled: true, label_ar: "س", label_en: "Q" };
describe("questionsSchema", () => {
  it("accepts a simple question", () => expect(questionsSchema.safeParse([base]).success).toBe(true));
  it("requires 2+ options for choice types", () => expect(questionsSchema.safeParse([{ ...base, type: "single" }]).success).toBe(false));
  it("rejects duplicate ids", () => expect(questionsSchema.safeParse([base, base]).success).toBe(false));
});
