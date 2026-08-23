import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fails safely and loudly in server logs; never leaks the missing-key
    // detail to the client beyond a generic message.
    console.error("ANTHROPIC_API_KEY is not set in the environment.");
    return NextResponse.json(
      {
        error: "SERVER_MISCONFIGURED",
        message: "The recommendation service is temporarily unavailable.",
      },
      { status: 500 }
    );
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildUserPrompt(parsedInput.data) },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("MODEL_RESPONSE_EMPTY");
    }

    const recommendation = parseModelResponse(textBlock.text);
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

    console.error("Anthropic API call failed:", reason);
    return NextResponse.json(
      {
        error: "MODEL_REQUEST_FAILED",
        message: "Could not reach the recommendation service. Please retry.",
      },
      { status: 502 }
    );
  }
}
