import { z } from "zod";

/**
 * Schema for the user-submitted form. Kept intentionally small: the fewer
 * required fields, the lower the barrier for a farmer/student to actually
 * fill this in on a phone in a field.
 */
export const RecommendationRequestSchema = z.object({
  location: z
    .string()
    .trim()
    .min(2, "Enter a city, district, or region.")
    .max(100, "Keep the location under 100 characters."),
  season: z.enum(["kharif", "rabi", "zaid", "not-sure"], {
    errorMap: () => ({ message: "Choose a season." }),
  }),
  soilType: z.enum(
    ["loamy", "clay", "sandy", "black-cotton", "red", "alluvial", "not-sure"],
    { errorMap: () => ({ message: "Choose a soil type." }) }
  ),
  waterAvailability: z.enum(["low", "medium", "high"], {
    errorMap: () => ({ message: "Choose water availability." }),
  }),
  notes: z.string().trim().max(300).optional(),
});

export type RecommendationRequest = z.infer<typeof RecommendationRequestSchema>;

/**
 * Schema for the STRUCTURED response we require from the model. This is the
 * contract between the prompt and the UI — nothing renders unless it parses
 * against this shape, so a malformed or hallucinated response fails safely
 * instead of rendering garbage.
 */
export const CropSchema = z.object({
  name: z.string().min(1),
  reasons: z.array(z.string().min(1)).min(1).max(4),
  precautions: z.array(z.string().min(1)).max(4).default([]),
  confidence: z.enum(["low", "medium", "high"]),
});

export const RecommendationResponseSchema = z.object({
  location: z.string(),
  season: z.string(),
  crops: z.array(CropSchema).min(1).max(6),
  generalNotes: z.array(z.string()).max(5).default([]),
  uncertaintyNote: z.string().max(400).optional(),
});

export type Crop = z.infer<typeof CropSchema>;
export type RecommendationResponse = z.infer<typeof RecommendationResponseSchema>;

/**
 * Parses raw text from the model into a validated RecommendationResponse.
 * Throws on any structural mismatch — callers must catch and turn this into
 * a user-facing error state, never a silently-broken render.
 */
export function parseModelResponse(raw: string): RecommendationResponse {
  let json: unknown;
  try {
    // Models occasionally wrap JSON in markdown fences despite instructions.
    const cleaned = raw.trim().replace(/^```json\s*|^```\s*|```$/g, "");
    json = JSON.parse(cleaned);
  } catch {
    throw new Error("MODEL_RESPONSE_NOT_JSON");
  }

  const result = RecommendationResponseSchema.safeParse(json);
  if (!result.success) {
    throw new Error("MODEL_RESPONSE_SCHEMA_MISMATCH");
  }
  return result.data;
}
