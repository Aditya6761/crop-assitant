import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  RecommendationRequestSchema,
  parseModelResponse,
} from "@/lib/schema";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompt";

export const runtime = "nodejs";

// A conservative cap so one bad request can't spiral into a runaway bill.
const MAX_OUTPUT_TOKENS = 1024;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "Request body must be JSON." },
      { status: 400 }
    );
  }

  const parsedInput = RecommendationRequestSchema.safeParse(body);
  if (!parsedInput.success) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "Some fields are missing or invalid.",
        fieldErrors: parsedInput.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set in the environment.");
    return NextResponse.json(
      {
        error: "SERVER_MISCONFIGURED",
        message: "The recommendation service is temporarily unavailable.",
      },
      { status: 500 }
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: MAX_OUTPUT_TOKENS,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(parsedInput.data) },
      ],
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      throw new Error("MODEL_RESPONSE_EMPTY");
    }

    const recommendation = parseModelResponse(text);
    return NextResponse.json({ data: recommendation }, { status: 200 });
  } catch (err) {
    const reason =
      err instanceof Error ? err.message : "UNKNOWN_MODEL_ERROR";

    if (reason === "MODEL_RESPONSE_NOT_JSON" || reason === "MODEL_RESPONSE_SCHEMA_MISMATCH") {
      return NextResponse.json(
        {
          error: "MODEL_RESPONSE_INVALID",
          message:
            "The recommendation came back in an unexpected format. Please retry.",
        },
        { status: 502 }
      );
    }

    console.error("OpenAI API call failed:", reason);
    return NextResponse.json(
      {
        error: "MODEL_REQUEST_FAILED",
        message: "Could not reach the recommendation service. Please retry.",
      },
      { status: 502 }
    );
  }
}