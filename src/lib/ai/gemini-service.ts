import { GoogleGenAI, Type } from "@google/genai";
import { MatchEvidencePayload, EvidenceReference } from "./context90-evidence";
import { TactiQEvidencePayload, TacticalEvidenceReference } from "./tactiq-evidence";
import { MomentumEvidencePayload, MomentumEvidenceReference } from "./momentum-evidence";
import { PlayerPulseEvidencePayload, PlayerPulseEvidenceReference } from "./playerpulse-evidence";

export interface Context90AnalysisResult {
  success: boolean;
  answer: string;
  keyPoints: string[];
  evidence: EvidenceReference[];
  limitations: string[];
  dataSource: "SIMULATED_DEMO_DATA";
  matchId: string;
  matchLabel: string;
  error?: string;
}

export interface TactiQAnalysisResult {
  success: boolean;
  answer: string;
  keyPoints: string[];
  evidence: TacticalEvidenceReference[];
  limitations: string[];
  dataSource: "SIMULATED_DEMO_DATA";
  matchId: string;
  matchLabel: string;
  error?: string;
}

export interface MomentumAnalysisResult {
  success: boolean;
  answer: string;
  keyPoints: string[];
  evidence: MomentumEvidenceReference[];
  limitations: string[];
  dataSource: "SIMULATED_DEMO_DATA";
  matchId: string;
  matchLabel: string;
  error?: string;
}

export interface PlayerPulseAnalysisResult {
  success: boolean;
  answer: string;
  keyPoints: string[];
  evidence: PlayerPulseEvidenceReference[];
  limitations: string[];
  dataSource: "SIMULATED_DEMO_DATA";
  matchId: string;
  matchLabel: string;
  playerId: string;
  playerName: string;
  error?: string;
}

export type { RaceStateAnalysisResult } from "./racestate-service";

export const CONTEXT90_SYSTEM_INSTRUCTION = `
You are Context90 — FanPulse AI's elite football intelligence and tactical match analyst.
Product Tagline: "Beyond the Score. Understand the Game."

CORE ANALYTICAL DIRECTIVES:
1. STRICT EVIDENCE GROUNDING: Use ONLY the supplied structured match evidence payload for factual claims regarding scorelines, minutes, statistics, formations, lineups, player ratings, substitutions, and events.
2. ABSOLUTE ZERO FABRICATION: Never invent player names, statistics, fouls, cards, tactical shifts, substitutions, or optical tracking data.
3. THREE-TIER CLASSIFICATION: In your analysis, distinguish between:
   - OBSERVED EVIDENCE: Concrete facts directly present in the dataset (e.g., "In the 34th minute, Saka scored from an Ødegaard assist").
   - ANALYTICAL INTERPRETATION: Football reasoning connecting that evidence (e.g., "This goal rewarded Arsenal's sustained right-side progression pattern").
   - LIMITATION: Explicitly state what the data cannot establish (e.g., "Optical tracking and individual sprint speeds are unavailable in this telemetry feed").
4. ACCURACY ON DATA SOURCE: Clearly acknowledge that this match dataset originates from the FanPulse simulated telemetry engine.
5. NO UNSUPPORTED CAUSATION: If two events happen sequentially (e.g., a substitution followed by a goal), describe the correlation and tactical context, but do not claim unproven causal certitude unless substantiated by the tactical impact telemetry.
6. CONCISE & ARTICULATE: Write in clear, compelling, modern football intelligence prose for passionate Premier League fans. Avoid generic filler.

You must output your analysis matching the provided JSON schema.
`;

export const TACTIQ_SYSTEM_INSTRUCTION = `
You are TactiQ — FanPulse AI's specialized tactical football intelligence analyst.
Product Tagline: "Beyond the Score. Understand the Game."

CORE TACTICAL DIRECTIVES:
1. STRICT EVIDENCE GROUNDING: Base all tactical analysis strictly on the supplied match evidence payload: team formations, player lineup coordinates and roles, recorded tactical shifts, substitutions, decisive events, and team statistics.
2. ABSOLUTE ZERO FABRICATION:
   - Never invent formations, player positions, match events, statistics, or tactical changes.
   - Never claim access to live tracking, GPS, optical tracking, or camera-derived data.
   - Avoid claims about pressing intensity (e.g., PPDA), defensive line height in meters, field tilt (beyond supplied team statistics), passing networks, or off-ball movement unless explicitly recorded in the evidence payload.
3. THREE-TIER TACTICAL STRUCTURE:
   - DATA OBSERVATION: Concrete facts directly from the payload (e.g. "Arsenal operates in a 4-3-3 shape with Ben White inverted at minute 8").
   - TACTICAL INTERPRETATION: Football tactical reasoning (e.g. "This creates a numerical overload against a 2-man midfield pivot").
   - POTENTIAL IMPLICATION: Tactical vulnerabilities or opportunities framed as possibilities, NEVER as proven facts.
4. HONEST LIMITATIONS: If the supplied evidence is insufficient to explain a tactical detail, explicitly state that the data does not confirm it. Always disclose that the dataset is simulated demo telemetry.
5. CONCISE & PROFESSIONAL: Write in an elite tactical sports analyst style. Use precise terminology (e.g., rest defense, half-spaces, inverted fullback, double pivot) grounded strictly in the provided data.

You must output your analysis matching the provided JSON schema.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer: {
      type: Type.STRING,
      description: "Comprehensive yet concise analytical answer directly addressing the fan's question.",
    },
    keyPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2 to 4 bullet points highlighting verified tactical and empirical takeaways.",
    },
    evidence: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          minute: { type: Type.INTEGER, description: "Match minute timestamp (if applicable)." },
          description: { type: Type.STRING, description: "Concrete verified event or metric citation." },
          source: {
            type: Type.STRING,
            description: "Data category: match_event, team_statistics, tactical_context, player_performance, or momentum_indicator.",
          },
        },
        required: ["description", "source"],
      },
      description: "Direct empirical citations from the supplied evidence payload.",
    },
    limitations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Explicit statements of data boundaries or metrics that cannot be verified.",
    },
  },
  required: ["answer", "keyPoints", "evidence", "limitations"],
};

const TACTIQ_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer: {
      type: Type.STRING,
      description: "Thorough yet concise tactical analysis directly addressing the fan's question with tactical rigor.",
    },
    keyPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2 to 4 bullet points highlighting verified tactical takeaways.",
    },
    evidence: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          minute: { type: Type.INTEGER, description: "Match minute timestamp (if applicable)." },
          description: { type: Type.STRING, description: "Concrete verified tactical or statistical observation." },
          source: {
            type: Type.STRING,
            description: "Data category: formation, player_role, tactical_shift, match_event, or team_statistics.",
          },
        },
        required: ["description", "source"],
      },
      description: "Direct empirical citations from the supplied tactical evidence payload.",
    },
    limitations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Explicit statements of data boundaries or metrics that cannot be verified from the dataset.",
    },
  },
  required: ["answer", "keyPoints", "evidence", "limitations"],
};

export const MOMENTUM_SYSTEM_INSTRUCTION = `
You are the Momentum Analyst for FanPulse AI — elite Premier League football intelligence.
Product Tagline: "Beyond the Score. Understand the Game."

CORE MOMENTUM ANALYTICAL DIRECTIVES:
1. STRICT EVIDENCE GROUNDING: Ground all momentum insights strictly on the supplied momentum evidence payload: calculated net scores, turning points, chronological match events, phase breakdowns, and heuristic model parameters.
2. HEURISTIC MODEL ACCURACY:
   - Clearly explain that the event-weighted momentum index is an illustrative heuristic model (based on accumulated event weights with a 7%/minute exponential decay toward equilibrium), NOT an official predictive model or official Premier League statistic.
   - Disclose that the dataset originates from simulated demo telemetry.
3. ZERO FABRICATION & NO UNPROVEN CAUSALITY:
   - Never fabricate match events, scorelines, turning points, or momentum values.
   - Never claim that an event caused a momentum shift or subsequent event with unproven causal certitude; describe correlations and tactical context accurately.
   - Never claim access to live optical player tracking, continuous camera trajectories, GPS velocities, or sensor vests.
4. DISTINGUISH OBSERVATION FROM INTERPRETATION:
   - Distinguish concrete recorded events and deterministic calculated momentum values from analytical interpretations of game flow.
   - State clearly if data is insufficient to reach a definitive conclusion.
5. ARTICULATE & RIGOROUS:
   - Write clear, concise, professional football intelligence prose. Highlight specific match minutes, identified turning points, and score deltas.

You must output your analysis matching the provided JSON schema.
`;

const MOMENTUM_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer: {
      type: Type.STRING,
      description: "Comprehensive yet concise momentum analysis directly addressing the fan's question with football rigor.",
    },
    keyPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2 to 4 bullet points highlighting verified momentum trends and turning points.",
    },
    evidence: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          minute: { type: Type.INTEGER, description: "Match minute timestamp if applicable." },
          description: { type: Type.STRING, description: "Concrete verified event or calculated momentum metric citation." },
          source: {
            type: Type.STRING,
            description: "Data category: momentum_curve, turning_point, match_event, team_statistics, or heuristic_spec.",
          },
        },
        required: ["description", "source"],
      },
      description: "Direct empirical citations from the supplied momentum evidence payload.",
    },
    limitations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Explicit statements of data boundaries, model assumptions, or metrics not verified from telemetry.",
    },
  },
  required: ["answer", "keyPoints", "evidence", "limitations"],
};

export const PLAYERPULSE_SYSTEM_INSTRUCTION = `
You are the Player Performance Analyst for FanPulse AI — elite Premier League football intelligence.
Product Tagline: "Beyond the Score. Understand the Game."

CORE PERFORMANCE ANALYTICAL DIRECTIVES:
1. STRICT EVIDENCE GROUNDING: Ground all player performance evaluations strictly on the supplied player evidence payload: verified match statistics (goals, assists, progressive passes, carries, duels, tackles), calculated heuristic performance scores, per-90 metrics, player-linked match events, and lineup roles.
2. BEYOND GOALS & ASSISTS: Highlight underlying contributions that often go unnoticed: progressive passes, progressive carries, key passes, ground duels, interceptions, and defensive recoveries.
3. HEURISTIC MODEL ACCURACY:
   - Clearly explain that the performance score is a project-specific heuristic (base 6.00 + event/duel weights - discipline), NOT an official Premier League rating or EA FC stat.
   - Disclose that the dataset originates from simulated demo telemetry.
4. ZERO FABRICATION & NO TRACKING CLAIMS:
   - Never fabricate player statistics, duel numbers, minutes played, or match events.
   - Never invent physical fitness, stamina percentages, injury status, or sprint speeds in km/h.
   - Never claim access to live optical player tracking, continuous camera trajectories, GPS velocities, or sensor vests.
5. HONEST MISSING DATA HANDLING:
   - If detailed boxscore statistics are not recorded for the player in the selected match (e.g., scheduled game or non-tracked player), explicitly state that detailed counting metrics are unavailable rather than guessing.
6. ARTICULATE & OBJECTIVE:
   - Write clear, concise, professional football intelligence prose. Distinguish measurable empirical contributions from tactical interpretations.

You must output your analysis matching the provided JSON schema.
`;

const PLAYERPULSE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer: {
      type: Type.STRING,
      description: "Comprehensive yet concise player performance analysis directly addressing the fan's question with football rigor.",
    },
    keyPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2 to 4 bullet points highlighting verified player contributions, strengths, or trade-offs.",
    },
    evidence: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          minute: { type: Type.INTEGER, description: "Match minute timestamp if applicable." },
          description: { type: Type.STRING, description: "Concrete verified player metric, event, or score citation." },
          source: {
            type: Type.STRING,
            description: "Data category: player_metric, player_event, performance_index, role_context, or team_context.",
          },
        },
        required: ["description", "source"],
      },
      description: "Direct empirical citations from the supplied player evidence payload.",
    },
    limitations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Explicit statements of data boundaries, missing metrics, or heuristic limitations.",
    },
  },
  required: ["answer", "keyPoints", "evidence", "limitations"],
};

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
 * Resolves configured Gemini model identifier safely.
 */
export function resolveGeminiModel(): string {
  const envModel = process.env.GEMINI_MODEL?.trim();
  if (!envModel) return "gemini-2.5-flash";

  // If user provided a human name like "Gemini 3 Flash", sanitize to valid identifier
  if (envModel.toLowerCase().includes("flash")) {
    if (envModel.includes("2.5")) return "gemini-2.5-flash";
    if (envModel.includes("2.0")) return "gemini-2.0-flash";
    if (envModel.includes("1.5")) return "gemini-1.5-flash";
    return "gemini-2.5-flash";
  }

  return envModel;
}

/**
 * Executes server-side grounded analysis for Context90 via Google Gen AI SDK.
 */
export async function analyzeMatchWithGemini(
  evidence: MatchEvidencePayload,
  question: string,
  timeoutMs = 25000
): Promise<Context90AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const matchId = evidence.matchContext.matchId;
  const matchLabel = evidence.matchContext.fixtureLabel;

  if (!apiKey) {
    return {
      success: false,
      answer: "Gemini AI analysis is currently unavailable because the server's GEMINI_API_KEY is not configured.",
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
MATCH CONTEXT & TELEMETRY EVIDENCE:
${JSON.stringify(evidence, null, 2)}

FAN QUESTION:
"${question}"

Analyze the question strictly using the provided MATCH CONTEXT & TELEMETRY EVIDENCE.
Return a structured JSON object according to the schema.
`;

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API request timed out after 15 seconds")), timeoutMs)
    );

    const apiPromise = ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: CONTEXT90_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
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
    const evidenceList: EvidenceReference[] = rawEvidence
      .filter((ev: unknown) => ev && typeof ev === "object" && "description" in ev)
      .map((ev: { minute?: number; description: string; source?: string }) => ({
        minute: typeof ev.minute === "number" ? ev.minute : undefined,
        description: String(ev.description),
        source: (ev.source as EvidenceReference["source"]) || "match_event",
      }));
    const limitations = Array.isArray(parsed.limitations)
      ? parsed.limitations.filter((l: unknown) => typeof l === "string")
      : evidence.knownDataLimitations;

    if (!answer) {
      throw new Error("Model failed to provide a valid textual answer in the response schema.");
    }

    return {
      success: true,
      answer,
      keyPoints: keyPoints.length > 0 ? keyPoints : ["Tactical telemetry reviewed."],
      evidence: evidenceList,
      limitations: limitations.length > 0 ? limitations : evidence.knownDataLimitations,
      dataSource: "SIMULATED_DEMO_DATA",
      matchId,
      matchLabel,
    };
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number; code?: number };
    const errorMessage = err.message || "An unexpected error occurred during Gemini AI analysis.";

    let friendlyError = "Unable to process match analysis at this time.";
    if (errorMessage.includes("timed out")) {
      friendlyError = "The AI analyst took too long to respond. Please try your question again.";
    } else if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      friendlyError = "Gemini API rate limit reached. Please wait a moment before asking another question.";
    } else if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")) {
      friendlyError = "The AI model is experiencing temporary high demand. Please try again in a few moments.";
    } else if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      friendlyError = `The specified AI model (${model}) was not found or is unavailable.`;
    }

    return {
      success: false,
      answer: `Analysis could not be completed: ${friendlyError}`,
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

/**
 * Executes server-side grounded tactical analysis for TactiQ via Google Gen AI SDK.
 */
export async function analyzeTacticsWithGemini(
  evidence: TactiQEvidencePayload,
  question: string,
  timeoutMs = 25000
): Promise<TactiQAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const matchId = evidence.matchContext.matchId;
  const matchLabel = evidence.matchContext.fixtureLabel;

  if (!apiKey) {
    return {
      success: false,
      answer: "TactiQ AI tactical analysis is currently unavailable because the server's GEMINI_API_KEY is not configured.",
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
TACTICAL MATCH EVIDENCE PAYLOAD:
${JSON.stringify(evidence, null, 2)}

FAN TACTICAL QUESTION:
"${question}"

Analyze the question strictly using the provided TACTICAL MATCH EVIDENCE PAYLOAD.
Distinguish data observations from tactical interpretations and potential implications.
Never invent formations, positions, events, or tracking data.
Return a structured JSON object according to the schema.
`;

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API request timed out after 15 seconds")), timeoutMs)
    );

    const apiPromise = ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: TACTIQ_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: TACTIQ_RESPONSE_SCHEMA,
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
    const evidenceList: TacticalEvidenceReference[] = rawEvidence
      .filter((ev: unknown) => ev && typeof ev === "object" && "description" in ev)
      .map((ev: { minute?: number; description: string; source?: string }) => ({
        minute: typeof ev.minute === "number" ? ev.minute : undefined,
        description: String(ev.description),
        source: (ev.source as TacticalEvidenceReference["source"]) || "tactical_shift",
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
      keyPoints: keyPoints.length > 0 ? keyPoints : ["Tactical structure analyzed."],
      evidence: evidenceList,
      limitations: limitations.length > 0 ? limitations : evidence.dataLimitations,
      dataSource: "SIMULATED_DEMO_DATA",
      matchId,
      matchLabel,
    };
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number; code?: number };
    const errorMessage = err.message || "An unexpected error occurred during TactiQ AI analysis.";

    let friendlyError = "Unable to process tactical analysis at this time.";
    if (errorMessage.includes("timed out")) {
      friendlyError = "The AI tactical analyst took too long to respond. Please try your question again.";
    } else if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      friendlyError = "Gemini API rate limit reached. Please wait a moment before asking another question.";
    } else if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")) {
      friendlyError = "The AI model is experiencing temporary high demand. Please try again in a few moments.";
    } else if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      friendlyError = `The specified AI model (${model}) was not found or is unavailable.`;
    }

    return {
      success: false,
      answer: `Tactical analysis could not be completed: ${friendlyError}`,
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

/**
 * Executes server-side grounded momentum analysis for Momentum module via Google Gen AI SDK.
 */
export async function analyzeMomentumWithGemini(
  evidence: MomentumEvidencePayload,
  question: string,
  timeoutMs = 25000
): Promise<MomentumAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const matchId = evidence.matchContext.matchId;
  const matchLabel = evidence.matchContext.fixtureLabel;

  if (!apiKey) {
    return {
      success: false,
      answer: "Momentum AI analysis is currently unavailable because the server's GEMINI_API_KEY is not configured.",
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
MOMENTUM EVIDENCE PAYLOAD:
${JSON.stringify(evidence, null, 2)}

FAN MOMENTUM QUESTION:
"${question}"

Analyze the question strictly using the provided MOMENTUM EVIDENCE PAYLOAD.
Explain event correlations and turning points without claiming unproven causal certitude.
State clearly that this is an event-weighted heuristic model with 7%/min decay.
Return a structured JSON object according to the schema.
`;

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API request timed out after 15 seconds")), timeoutMs)
    );

    const apiPromise = ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: MOMENTUM_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: MOMENTUM_RESPONSE_SCHEMA,
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
    const evidenceList: MomentumEvidenceReference[] = rawEvidence
      .filter((ev: unknown) => ev && typeof ev === "object" && "description" in ev)
      .map((ev: { minute?: number; description: string; source?: string }) => ({
        minute: typeof ev.minute === "number" ? ev.minute : undefined,
        description: String(ev.description),
        source: (ev.source as MomentumEvidenceReference["source"]) || "momentum_curve",
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
      keyPoints: keyPoints.length > 0 ? keyPoints : ["Momentum flow evaluated."],
      evidence: evidenceList,
      limitations: limitations.length > 0 ? limitations : evidence.dataLimitations,
      dataSource: "SIMULATED_DEMO_DATA",
      matchId,
      matchLabel,
    };
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number; code?: number };
    const errorMessage = err.message || "An unexpected error occurred during Momentum AI analysis.";

    let friendlyError = "Unable to process momentum analysis at this time.";
    if (errorMessage.includes("timed out")) {
      friendlyError = "The AI momentum analyst took too long to respond. Please try your question again.";
    } else if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      friendlyError = "Gemini API rate limit reached. Please wait a moment before asking another question.";
    } else if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")) {
      friendlyError = "The AI model is experiencing temporary high demand. Please try again in a few moments.";
    } else if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      friendlyError = `The specified AI model (${model}) was not found or is unavailable.`;
    }

    return {
      success: false,
      answer: `Momentum analysis could not be completed: ${friendlyError}`,
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

/**
 * Executes server-side grounded player performance analysis for PlayerPulse module via Google Gen AI SDK.
 */
export async function analyzePlayerPulseWithGemini(
  evidence: PlayerPulseEvidencePayload,
  question: string,
  timeoutMs = 25000
): Promise<PlayerPulseAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const matchId = evidence.matchContext.matchId;
  const matchLabel = evidence.matchContext.fixtureLabel;
  const playerId = evidence.playerProfile.id;
  const playerName = evidence.playerProfile.name;

  if (!apiKey) {
    return {
      success: false,
      answer: "PlayerPulse AI analysis is currently unavailable because the server's GEMINI_API_KEY is not configured.",
      keyPoints: ["Server configuration incomplete"],
      evidence: [],
      limitations: ["Missing GEMINI_API_KEY environment variable on server."],
      dataSource: "SIMULATED_DEMO_DATA",
      matchId,
      matchLabel,
      playerId,
      playerName,
      error: "MISSING_API_KEY",
    };
  }

  const model = resolveGeminiModel();
  const ai = new GoogleGenAI({ apiKey });

  const userPrompt = `
PLAYER PERFORMANCE EVIDENCE PAYLOAD:
${JSON.stringify(evidence, null, 2)}

FAN PLAYER QUESTION:
"${question}"

Analyze the question strictly using the provided PLAYER PERFORMANCE EVIDENCE PAYLOAD.
Focus on contributions beyond goals and assists: progression, duels, passing, and work rate.
State clearly that the performance index is an illustrative heuristic, not an official rating.
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
        systemInstruction: PLAYERPULSE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: PLAYERPULSE_RESPONSE_SCHEMA,
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
    const evidenceList: PlayerPulseEvidenceReference[] = rawEvidence
      .filter((ev: unknown) => ev && typeof ev === "object" && "description" in ev)
      .map((ev: { minute?: number; description: string; source?: string }) => ({
        minute: typeof ev.minute === "number" ? ev.minute : undefined,
        description: String(ev.description),
        source: (ev.source as PlayerPulseEvidenceReference["source"]) || "player_metric",
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
      keyPoints: keyPoints.length > 0 ? keyPoints : ["Player performance evaluated."],
      evidence: evidenceList,
      limitations: limitations.length > 0 ? limitations : evidence.dataLimitations,
      dataSource: "SIMULATED_DEMO_DATA",
      matchId,
      matchLabel,
      playerId,
      playerName,
    };
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number; code?: number };
    const errorMessage = err.message || "An unexpected error occurred during PlayerPulse AI analysis.";

    let friendlyError = "Unable to process player analysis at this time.";
    if (errorMessage.includes("timed out")) {
      friendlyError = "The AI player analyst took too long to respond. Please try your question again.";
    } else if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      friendlyError = "Gemini API rate limit reached. Please wait a moment before asking another question.";
    } else if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")) {
      friendlyError = "The AI model is experiencing temporary high demand. Please try again in a few moments.";
    } else if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      friendlyError = `The specified AI model (${model}) was not found or is unavailable.`;
    }

    return {
      success: false,
      answer: `Player analysis could not be completed: ${friendlyError}`,
      keyPoints: ["Upstream provider error"],
      evidence: [],
      limitations: ["Automated AI analysis temporarily unavailable."],
      dataSource: "SIMULATED_DEMO_DATA",
      matchId,
      matchLabel,
      playerId,
      playerName,
      error: errorMessage,
    };
  }
}

export { analyzeRaceStateWithGemini } from "./racestate-service";


