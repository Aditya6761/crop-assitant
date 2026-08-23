import { describe, it, expect } from "vitest";
import { parseModelResponse, RecommendationRequestSchema } from "@/lib/schema";

const validPayload = {
  location: "Nashik",
  season: "rabi",
  crops: [
    {
      name: "Chickpea",
      reasons: ["Suited to loamy soil in rabi season."],
      precautions: [],
      confidence: "high",
    },
  ],
  generalNotes: [],
};

describe("parseModelResponse", () => {
  it("parses a well-formed JSON response", () => {
    const result = parseModelResponse(JSON.stringify(validPayload));
    expect(result.crops[0].name).toBe("Chickpea");
  });

  it("strips markdown code fences before parsing", () => {
    const fenced = "```json\n" + JSON.stringify(validPayload) + "\n```";
    const result = parseModelResponse(fenced);
    expect(result.location).toBe("Nashik");
  });

  it("throws MODEL_RESPONSE_NOT_JSON on unparsable text", () => {
    expect(() => parseModelResponse("not json at all")).toThrow(
      "MODEL_RESPONSE_NOT_JSON"
    );
  });

  it("throws MODEL_RESPONSE_SCHEMA_MISMATCH when a required field is missing", () => {
    const broken = { ...validPayload, crops: [] };
    expect(() => parseModelResponse(JSON.stringify(broken))).toThrow(
      "MODEL_RESPONSE_SCHEMA_MISMATCH"
    );
  });

  it("throws MODEL_RESPONSE_SCHEMA_MISMATCH when confidence is not one of the allowed values", () => {
    const broken = {
      ...validPayload,
      crops: [{ ...validPayload.crops[0], confidence: "certain" }],
    };
    expect(() => parseModelResponse(JSON.stringify(broken))).toThrow(
      "MODEL_RESPONSE_SCHEMA_MISMATCH"
    );
  });
});

describe("RecommendationRequestSchema", () => {
  it("rejects a location that is too short", () => {
    const result = RecommendationRequestSchema.safeParse({
      location: "N",
      season: "rabi",
      soilType: "loamy",
      waterAvailability: "medium",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a fully valid request", () => {
    const result = RecommendationRequestSchema.safeParse({
      location: "Nashik",
      season: "rabi",
      soilType: "loamy",
      waterAvailability: "medium",
    });
    expect(result.success).toBe(true);
  });
});
