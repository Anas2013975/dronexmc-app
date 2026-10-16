import { describe, it, expect } from "vitest";
import { validate, Question } from "./validate";
const q = (o: Partial<Question>): Question => ({ id: "a", type: "short", required: true, enabled: true, label_ar: "", label_en: "", ...o });
describe("validate", () => {
  it("requires required fields", () => expect(validate([q({})], {}, "en").a).toBeTruthy());
  it("skips disabled questions", () => expect(validate([q({ enabled: false })], {}, "en")).toEqual({}));
  it("rejects bad choice", () => expect(validate([q({ type: "single", options: [{ value: "x", ar: "", en: "" }] })], { a: "y" }, "en").a).toBeTruthy());
  it("rejects non-http url", () => expect(validate([q({ type: "url" })], { a: "javascript:alert(1)" }, "en").a).toBeTruthy());
  it("accepts optional empty", () => expect(validate([q({ required: false })], {}, "en")).toEqual({}));
});
