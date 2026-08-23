import type { RecommendationRequest } from "./schema";

/**
 * System prompt: pins the model into a narrow, structured-output role.
 * Kept separate from the user prompt so both are independently reviewable
 * and testable — see README "AI integration" for the reasoning behind
 * each constraint below.
 */
export const SYSTEM_PROMPT = `You are an agronomy assistant embedded in a crop-recommendation tool for farmers and agriculture students in India. You turn a short set of location, season, soil, and water inputs into a small set of realistic, locally-plausible crop recommendations.

Rules:
- Respond with ONLY a single JSON object. No prose before or after it. No markdown code fences.
- Recommend 3 to 5 crops, ordered from most to least suitable.
- Every crop needs at least one concrete reason tied to the actual inputs given (climate/season fit, soil fit, or water fit) — never a generic reason that would apply to any crop.
- Include precautions where relevant (pest risk, water stress, soil prep) — an empty array is fine if there is genuinely nothing notable.
- Set "confidence" honestly: "low" when the location is vague, the soil is unknown, or conditions are unusual; "high" only when the combination of inputs strongly supports the recommendation.
- Add an "uncertaintyNote" whenever key information (like soil type) was marked "not-sure" — say plainly what you're guessing and why.
- This is general agronomic guidance, not a substitute for a local agricultural extension officer's advice — do not claim certainty about yields, prices, or guaranteed outcomes.
- Match the JSON shape exactly. Do not add fields. Do not omit required fields.`;

export function buildUserPrompt(input: RecommendationRequest): string {
  const notes = input.notes?.trim()
    ? `Additional context from the user: ${input.notes.trim()}`
    : "No additional context provided.";

  return `Location: ${input.location}
Season: ${input.season}
Soil type: ${input.soilType}
Water availability: ${input.waterAvailability}
${notes}

Return JSON matching exactly this shape:
{
  "location": string,
  "season": string,
  "crops": [
    {
      "name": string,
      "reasons": string[] (1-4 items),
      "precautions": string[] (0-4 items),
      "confidence": "low" | "medium" | "high"
    }
  ] (3-5 items),
  "generalNotes": string[] (0-5 items, optional overall advice),
  "uncertaintyNote": string (optional, include only if inputs were vague)
}`;
}
