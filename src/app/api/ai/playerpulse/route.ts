import { NextRequest, NextResponse } from "next/server";
import { buildPlayerPulseEvidence } from "@/lib/ai/playerpulse-evidence";
import { analyzePlayerPulseWithGemini } from "@/lib/ai/gemini-service";

// In-memory sliding window rate limiter (local to Node process)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP rate limit check
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous-client";
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many player analysis inquiries. Please wait a minute before submitting further requests.",
          dataSource: "SIMULATED_DEMO_DATA",
        },
        { status: 429 }
      );
    }

    // 2. Parse and validate JSON request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Malformed request payload. JSON body expected.",
          dataSource: "SIMULATED_DEMO_DATA",
        },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format.",
          dataSource: "SIMULATED_DEMO_DATA",
        },
        { status: 400 }
      );
    }

    const { matchId, playerId, question } = body as {
      matchId?: unknown;
      playerId?: unknown;
      question?: unknown;
    };

    // 3. Validate matchId
    if (!matchId || typeof matchId !== "string" || !matchId.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid 'matchId' string is required.",
          dataSource: "SIMULATED_DEMO_DATA",
        },
        { status: 400 }
      );
    }

    // 4. Validate playerId
    if (!playerId || typeof playerId !== "string" || !playerId.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid 'playerId' string is required.",
          dataSource: "SIMULATED_DEMO_DATA",
        },
        { status: 400 }
      );
    }

    // 5. Validate question
    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "A non-empty 'question' string is required.",
          dataSource: "SIMULATED_DEMO_DATA",
        },
        { status: 400 }
      );
    }

    const trimmedQuestion = question.trim();
    const MAX_QUESTION_LENGTH = 500;
    if (trimmedQuestion.length > MAX_QUESTION_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: `Question exceeds maximum allowable length of ${MAX_QUESTION_LENGTH} characters.`,
          dataSource: "SIMULATED_DEMO_DATA",
        },
        { status: 400 }
      );
    }

    // 6. Resolve match and construct player performance evidence
    const cleanMatchId = matchId.trim().toLowerCase();
    const cleanPlayerId = playerId.trim().toLowerCase();
    const evidence = buildPlayerPulseEvidence(cleanMatchId, cleanPlayerId);

    if (!evidence) {
      return NextResponse.json(
        {
          success: false,
          error: `Player '${playerId}' is not present or valid for match '${matchId}'. Please select an active participant.`,
          dataSource: "SIMULATED_DEMO_DATA",
        },
        { status: 404 }
      );
    }

    // 7. Execute Gemini AI Player Performance Analysis
    const analysisResult = await analyzePlayerPulseWithGemini(evidence, trimmedQuestion);

    // If API key is missing or upstream returned a structured failure
    if (!analysisResult.success) {
      const statusCode = analysisResult.error === "MISSING_API_KEY" ? 503 : 502;
      return NextResponse.json(analysisResult, { status: statusCode });
    }

    return NextResponse.json(analysisResult, { status: 200 });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[PlayerPulse API Error]:", err?.message || error);

    return NextResponse.json(
      {
        success: false,
        error: "An internal server error occurred while synthesizing player intelligence.",
        dataSource: "SIMULATED_DEMO_DATA",
      },
      { status: 500 }
    );
  }
}
