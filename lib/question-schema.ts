import { z } from "zod";
const opt = z.object({ value: z.string().regex(/^[\w-]{1,40}$/), ar: z.string().min(1).max(200), en: z.string().min(1).max(200) });
export const questionSchema = z.object({
  id: z.string().regex(/^[\w-]{1,40}$/),
  type: z.enum(["short", "long", "single", "multi", "select", "yesno", "url", "number", "heading", "consent"]),
  required: z.boolean(), enabled: z.boolean(),
  label_ar: z.string().min(1).max(600), label_en: z.string().min(1).max(600),
  help_ar: z.string().max(600).optional(), help_en: z.string().max(600).optional(),
  error_ar: z.string().max(300).optional(), error_en: z.string().max(300).optional(),
  options: z.array(opt).max(50).optional(), min: z.number().int().min(0).max(4000).optional(), max: z.number().int().min(1).max(4000).optional(),
}).refine((q) => !["single", "multi", "select"].includes(q.type) || (q.options?.length ?? 0) >= 2, { message: "OPTIONS_REQUIRED" })
  .refine((q) => new Set(q.options?.map((o) => o.value)).size === (q.options?.length ?? 0), { message: "DUPLICATE_OPTION" });
export const questionsSchema = z.array(questionSchema).max(100).refine((a) => new Set(a.map((q) => q.id)).size === a.length, { message: "DUPLICATE_ID" });
