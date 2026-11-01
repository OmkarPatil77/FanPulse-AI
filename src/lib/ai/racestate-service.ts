import { GoogleGenAI, Type } from "@google/genai";
import { RaceStateEvidencePayload, RaceStateEvidenceReference } from "./racestate-evidence";
import { resolveGeminiModel } from "./gemini-service";

export interface RaceStateAnalysisResult {
  success: boolean;
  answer: string;
  keyPoints: string[];
  evidence: RaceStateEvidenceReference[];
  limitations: string[];
  dataSource: "SIMULATED_DEMO_DATA";
  matchId: string;
  matchLabel: string;
  error?: string;
}

export const RACESTATE_SYSTEM_INSTRUCTION = `
You are the RaceState League Table & Scenario Analyst for FanPulse AI — elite Premier League football intelligence.
Product Tagline: "Beyond the Score. Understand the Game."

CORE ANALYTICAL DIRECTIVES:
1. STRICT STANDINGS & SCENARIO GROUNDING: Ground all league table analysis, title race implications, European qualification spots, and relegation battles strictly on the supplied RaceState evidence payload (baseline standings, deterministic scenario outcomes, zone boundaries, point buffers, and tie-breakers).
2. NO INVENTED PROBABILITIES OR PREDICTIONS:
   - Never invent win percentages, title odds, European qualification probabilities, or relegation odds. There is no probability model in this system.
   - Fixed scenario scorelines (Home Win 2-1, Draw 1-1, Away Win 0-1) are deterministic simulation inputs used to project table displacement, NOT predictive forecasts. Never describe them as predictions.
3. SINGLE-MATCH PERSPECTIVE:
   - Emphasize that a single matchweek fixture alters mathematical point buffers and immediate table positioning, but does NOT mathematically guarantee or eliminate any club from final season finishing positions.
4. RIGOROUS DATA DISTINCTIONS:
   - Clearly distinguish between:
     * FACT: directly calculated from baseline standings (points, GD, current position, buffer).
     * SCENARIO: hypothetical displacements resulting from a specific match outcome (Home Win, Draw, Away Win).
     * INTERPRETATION: football analysis of how the scenario affects race dynamics.
5. DATA TRANSPARENCY & LIMITATIONS:
   - Explicitly disclose that the dataset is a simulated demo dataset for Premier League analytics.
   - Mention the official Premier League tie-breaking hierarchy: 1. Points, 2. Goal Difference, 3. Goals For, 4. Team Name.
6. PROFESSIONAL & OBJECTIVE PROSE:
   - Deliver clear, concise, authoritative football analysis. Always output structured JSON strictly conforming to the response schema.
`;

export const RACESTATE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer: {
      type: Type.STRING,
      description: "In-depth, objective league scenario analysis directly addressing the fan's question with football intelligence.",
    },
    keyPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2 to 4 concise bullet points summarizing verified table impacts, displacement shifts, or race stakes.",
    },
    evidence: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          position: { type: Type.INTEGER, description: "League table position if applicable." },
          teamCode: { type: Type.STRING, description: "3-letter team code (e.g. ARS, CHE, MCI)." },
          teamName: { type: Type.STRING, description: "Full club name if applicable." },
          description: { type: Type.STRING, description: "Concrete verified standings metric, point delta, or scenario displacement citation." },
          source: {
            type: Type.STRING,
            description: "Evidence source category: baseline_standings, scenario_outcome, zone_boundary, tie_breaker, or mathematical_buffer.",
          },
        },
        required: ["description", "source"],
      },
      description: "Direct empirical citations from the supplied RaceState evidence payload.",
    },
    limitations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Explicit disclosures of simulation boundaries, absence of odds/probabilities, or sample limits.",
    },
  },
  required: ["answer", "keyPoints", "evidence", "limitations"],
};

/**
 * Executes server-side grounded league standings and scenario analysis for RaceState via Google Gen AI SDK.
 */
export async function analyzeRaceStateWithGemini(
  evidence: RaceStateEvidencePayload,
  question: string,
  timeoutMs = 25000
): Promise<RaceStateAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const matchId = evidence.matchContext.matchId;
  const matchLabel = evidence.matchContext.fixtureLabel;

  if (!apiKey) {
    return {
      success: false,
      answer: "RaceState AI analysis is currently unavailable because the server's GEMINI_API_KEY is not configured.",
      keyPoints: ["Server configuration incomplete"],
      evidence: [],
      limitations: ["Missing GEMINI_API_KEY environment variable on server."],
      dataSource: "SIMULATED_DEMO_DATA",
      matchId,
      matchLabel,
      error: "MISSING_API_KEY",
    };
  }

  const model = resolveGeminiModel();
  const ai = new GoogleGenAI({ apiKey });

  const userPrompt = `
RACESTATE EVIDENCE PAYLOAD:
${JSON.stringify(evidence, null, 2)}

FAN SCENARIO QUESTION:
"${question}"

Analyze the question strictly using the provided RACESTATE EVIDENCE PAYLOAD.
Distinguish clearly between FACT (current baseline standings), SCENARIO (hypothetical outcome displacement), and INTERPRETATION.
Explicitly note that scenario scorelines are fixed simulation inputs, not predictions, and no probability model is used.
Return a structured JSON object according to the schema.
`;

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API request timed out after 25 seconds")), timeoutMs)
    );

    const apiPromise = ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: RACESTATE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RACESTATE_RESPONSE_SCHEMA,
        temperature: 0.2,
      },
    });

    const response = await Promise.race([apiPromise, timeoutPromise]);
    const rawText = response.text;

    if (!rawText) {
      throw new Error("Empty response received from Gemini model.");
    }

    const parsed = JSON.parse(rawText);

    const answer = typeof parsed.answer === "string" ? parsed.answer.trim() : "";
    const keyPoints = Array.isArray(parsed.keyPoints)
      ? parsed.keyPoints.filter((k: unknown) => typeof k === "string")
      : [];
    const rawEvidence = Array.isArray(parsed.evidence) ? parsed.evidence : [];
    const evidenceList: RaceStateEvidenceReference[] = rawEvidence
      .filter((ev: unknown) => ev && typeof ev === "object" && "description" in ev)
      .map((ev: { position?: number; teamCode?: string; teamName?: string; description: string; source?: string }) => ({
        position: typeof ev.position === "number" ? ev.position : undefined,
        teamCode: typeof ev.teamCode === "string" ? ev.teamCode : undefined,
        teamName: typeof ev.teamName === "string" ? ev.teamName : undefined,
        description: String(ev.description),
        source: (ev.source as RaceStateEvidenceReference["source"]) || "baseline_standings",
      }));

    const limitations = Array.isArray(parsed.limitations)
      ? parsed.limitations.filter((l: unknown) => typeof l === "string")
      : evidence.dataLimitations;

    if (!answer) {
      throw new Error("Model failed to provide a valid textual answer in the response schema.");
    }

    return {
      success: true,
      answer,
      keyPoints: keyPoints.length > 0 ? keyPoints : ["League scenario evaluated."],
      evidence: evidenceList,
      limitations: limitations.length > 0 ? limitations : evidence.dataLimitations,
      dataSource: "SIMULATED_DEMO_DATA",
      matchId,
      matchLabel,
    };
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number; code?: number };
    const errorMessage = err.message || "An unexpected error occurred during RaceState AI analysis.";

    let friendlyError = "Unable to process league analysis at this time.";
    if (errorMessage.includes("timed out")) {
      friendlyError = "The AI league analyst took too long to respond. Please try your question again.";
    } else if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      friendlyError = "Gemini API rate limit reached. Please wait a moment before asking another question.";
    } else if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")) {
      friendlyError = "The AI model is experiencing temporary high demand. Please try again in a few moments.";
    } else if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      friendlyError = `The specified AI model (${model}) was not found or is unavailable.`;
    }

    return {
      success: false,
      answer: `League analysis could not be completed: ${friendlyError}`,
      keyPoints: ["Upstream provider error"],
      evidence: [],
      limitations: ["Automated AI analysis temporarily unavailable."],
      dataSource: "SIMULATED_DEMO_DATA",
      matchId,
      matchLabel,
      error: errorMessage,
    };
  }
}
