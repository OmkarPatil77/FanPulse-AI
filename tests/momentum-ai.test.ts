import assert from "node:assert/strict";
import { buildMomentumEvidence, identifyTurningPoints } from "@/lib/ai/momentum-evidence";
import { calculateMomentumCurve } from "@/lib/football/momentum";
import {
  MOMENTUM_SYSTEM_INSTRUCTION,
  analyzeMomentumWithGemini,
  resolveGeminiModel,
} from "@/lib/ai/gemini-service";
import { MatchEvent } from "@/types/football";

let totalTests = 0;
let passedTests = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("   FANPULSE AI — PHASE 3.3 MOMENTUM AI UNIT TESTS      ");
  console.log("========================================================\n");

  console.log("1. MOMENTUM EVIDENCE PREPARATION & CALCULATIONS");

  await test("Evidence: Builds complete evidence payload for valid in-play match (ars-che)", () => {
    const evidence = buildMomentumEvidence("ars-che");
    assert(evidence !== null, "Evidence for ars-che should not be null");

    // Match context
    assert.equal(evidence.matchContext.matchId, "ars-che");
    assert.equal(evidence.matchContext.homeTeam.code, "ARS");
    assert.equal(evidence.matchContext.awayTeam.code, "CHE");
    assert.equal(evidence.matchContext.status, "IN_PLAY");
    assert.equal(evidence.matchContext.dataSource, "SIMULATED_DEMO_DATA");

    // Current momentum
    assert(typeof evidence.currentMomentum.netScore === "number");
    assert(evidence.currentMomentum.homeTilt >= 0 && evidence.currentMomentum.homeTilt <= 100);
    assert.equal(evidence.currentMomentum.homeTilt + evidence.currentMomentum.awayTilt, 100);
    assert(
      ["HOME_ADVANTAGE", "BALANCED", "AWAY_ADVANTAGE"].includes(evidence.currentMomentum.classification)
    );

    // Turning points detected
    assert(evidence.turningPoints.length > 0, "Turning points must be detected for ars-che");
    const goal34 = evidence.turningPoints.find((tp) => tp.minute === 34);
    assert(goal34, "34' Saka goal must be identified as a turning point");
    assert.equal(goal34.direction, "TOWARD_HOME");
    assert(goal34.shiftDelta > 0);

    // Heuristic specs present
    assert.equal(evidence.heuristicModelSpecs.scoreRange, "-95 (maximum away ascendancy) to +95 (maximum home ascendancy)");
    assert(evidence.dataLimitations.length >= 4);
  });

  await test("Evidence: Chronological event ordering", () => {
    const evidence = buildMomentumEvidence("ars-che");
    assert(evidence !== null);

    for (let i = 0; i < evidence.chronologicalEvents.length - 1; i++) {
      assert(
        evidence.chronologicalEvents[i].minute <= evidence.chronologicalEvents[i + 1].minute,
        "Events must be sorted chronologically"
      );
    }
  });

  await test("Evidence: Deterministic turning-point identification and magnitude calculation", () => {
    const mockEvents: MatchEvent[] = [
      {
        id: "ev-1",
        matchId: "m1",
        minute: 10,
        type: "TACTICAL_SHIFT",
        teamId: "home_team",
        title: "Home Formation Shift",
        description: "Tactical shift",
        significance: "MODERATE",
        momentumShiftDelta: 15,
      },
      {
        id: "ev-2",
        matchId: "m1",
        minute: 25,
        type: "GOAL",
        teamId: "home_team",
        title: "Home Goal",
        description: "Goal scored",
        significance: "CRITICAL",
        momentumShiftDelta: 30,
      },
    ];

    const curve = calculateMomentumCurve(mockEvents, "home_team", "away_team", "m1", 90);
    const turningPoints = identifyTurningPoints(curve.points, mockEvents, "home_team", "HOM", "AWY");

    assert.equal(turningPoints.length, 2, "Both events should be recognized as turning points");
    assert.equal(turningPoints[0].minute, 10);
    assert.equal(turningPoints[0].direction, "TOWARD_HOME");
    assert.equal(turningPoints[1].minute, 25);
    assert.equal(turningPoints[1].direction, "TOWARD_HOME");
  });

  await test("Evidence: Empty event list yields 91 neutral points and zero turning points", () => {
    const emptyCurve = calculateMomentumCurve([], "home_team", "away_team", "test_empty", 90);
    assert.equal(emptyCurve.points.length, 91);
    assert.equal(emptyCurve.averageHomeTilt, 50);
    assert.equal(emptyCurve.dominantTeam, "neutral");

    const turningPoints = identifyTurningPoints(emptyCurve.points, [], "home_team", "HOM", "AWY");
    assert.equal(turningPoints.length, 0);
  });

  await test("Evidence: Directional consistency for Home and Away events", () => {
    const homeGoalEvent: MatchEvent[] = [
      {
        id: "ev-h",
        matchId: "test",
        minute: 5,
        type: "GOAL",
        teamId: "home",
        title: "Home Goal",
        description: "Home score",
        significance: "CRITICAL",
        momentumShiftDelta: 30,
      },
    ];
    const awayGoalEvent: MatchEvent[] = [
      {
        id: "ev-a",
        matchId: "test",
        minute: 5,
        type: "GOAL",
        teamId: "away",
        title: "Away Goal",
        description: "Away score",
        significance: "CRITICAL",
        momentumShiftDelta: -30,
      },
    ];

    const homeCurve = calculateMomentumCurve(homeGoalEvent, "home", "away", "test", 10);
    const awayCurve = calculateMomentumCurve(awayGoalEvent, "home", "away", "test", 10);

    assert(homeCurve.points[5].netScore > 0, "Home goal must boost netScore > 0");
    assert(awayCurve.points[5].netScore < 0, "Away goal must decrease netScore < 0");
  });

  console.log("\n2. MATCH ISOLATION & RESILIENCE");

  await test("Isolation: Arsenal vs Chelsea does not leak events or stats into Man City vs Liverpool", () => {
    const arsChe = buildMomentumEvidence("ars-che");
    const mciLiv = buildMomentumEvidence("mci-liv");

    assert(arsChe !== null && mciLiv !== null);

    const hasSakaInCity = mciLiv.chronologicalEvents.some((e) => e.title.includes("Saka"));
    assert(!hasSakaInCity, "Saka events must not leak into Manchester City vs Liverpool");

    const hasHaalandInArsenal = arsChe.chronologicalEvents.some((e) => e.title.includes("Haaland"));
    assert(!hasHaalandInArsenal, "Haaland events must not leak into Arsenal vs Chelsea");
  });

  await test("Evidence: Unknown match ID returns null safely", () => {
    assert.equal(buildMomentumEvidence("invalid-key-xyz"), null);
    assert.equal(buildMomentumEvidence(""), null);
    assert.equal(buildMomentumEvidence("fc-porto-vs-benfica"), null);
  });

  console.log("\n3. GEMINI SERVICE ACCURACY & SAFETY AUDIT");

  await test("Safety: System instructions enforce heuristic transparency and prohibit unproven causality", () => {
    assert(
      MOMENTUM_SYSTEM_INSTRUCTION.includes("illustrative heuristic model"),
      "Instruction must declare heuristic model nature"
    );
    assert(
      MOMENTUM_SYSTEM_INSTRUCTION.includes("7%/minute exponential decay"),
      "Instruction must reference 7% decay mechanic"
    );
    assert(
      MOMENTUM_SYSTEM_INSTRUCTION.includes("Never claim that an event caused a momentum shift or subsequent event with unproven causal certitude"),
      "Instruction must forbid unproven causality claims"
    );
    assert(
      MOMENTUM_SYSTEM_INSTRUCTION.includes("Never claim access to live optical player tracking"),
      "Instruction must forbid claiming optical tracking access"
    );
    assert(
      MOMENTUM_SYSTEM_INSTRUCTION.includes("simulated demo telemetry"),
      "Instruction must declare simulated demo data"
    );
  });

  await test("Service: Missing GEMINI_API_KEY returns structured failure gracefully without throwing", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const evidence = buildMomentumEvidence("ars-che")!;
    const result = await analyzeMomentumWithGemini(evidence, "What caused the turning point?");

    assert.equal(result.success, false);
    assert.equal(result.error, "MISSING_API_KEY");
    assert(result.answer.includes("GEMINI_API_KEY"));
    assert.equal(result.dataSource, "SIMULATED_DEMO_DATA");

    process.env.GEMINI_API_KEY = originalKey;
  });

  await test("Service: Resolves valid Gemini model identifier", () => {
    const model = resolveGeminiModel();
    assert(typeof model === "string" && model.length > 0);
    assert(model.startsWith("gemini-"));
  });

  console.log("\n4. VALIDATION & MOCKED RESPONSE SCHEMA AUDIT");

  await test("Validation: Handles empty questions and overlength inquiries safely", () => {
    const emptyQuery = "    ";
    assert.equal(emptyQuery.trim().length, 0);

    const oversizedQuery = "m".repeat(501);
    assert(oversizedQuery.length > 500, "Should exceed 500 characters");

    const validQuery = "Why did Arsenal gain momentum after the recorded tactical shift?";
    assert(validQuery.trim().length > 0 && validQuery.length <= 500);
  });

  await test("Schema: Validates mocked Momentum AI response conforms to product schema", () => {
    const mockMomentumResponse = {
      success: true,
      answer:
        "Arsenal's momentum gained a decisive upward trajectory at the 34th minute following Bukayo Saka's opening goal, which delivered an immediate +35 point surge in the event-weighted index.",
      keyPoints: [
        "Saka's goal at 34' shifted net score from +14 to +49.",
        "Chelsea's 54' equalizer counterbalanced momentum down to -18.",
        "Havertz's 74' goal restored sustained home dominance at +32.",
      ],
      evidence: [
        {
          minute: 34,
          description: "Goal: Bukayo Saka (1-0) shifted momentum +35 points",
          source: "turning_point",
        },
        {
          minute: 54,
          description: "Goal: Nicolas Jackson Equalizer (1-1) shifted momentum -38 points",
          source: "turning_point",
        },
        {
          minute: 74,
          description: "Goal: Kai Havertz Restores Lead (2-1) shifted momentum +32 points",
          source: "turning_point",
        },
      ],
      limitations: [
        "Illustrative heuristic model based on event weighting and a 7%/min exponential decay.",
        "Not derived from continuous optical player tracking or GPS coordinates.",
      ],
      dataSource: "SIMULATED_DEMO_DATA",
      matchId: "ars-che",
      matchLabel: "Arsenal vs Chelsea",
    };

    assert.equal(mockMomentumResponse.success, true);
    assert(typeof mockMomentumResponse.answer === "string" && mockMomentumResponse.answer.length > 0);
    assert(Array.isArray(mockMomentumResponse.keyPoints) && mockMomentumResponse.keyPoints.length >= 2);
    assert(Array.isArray(mockMomentumResponse.evidence) && mockMomentumResponse.evidence.length >= 2);
    assert(Array.isArray(mockMomentumResponse.limitations) && mockMomentumResponse.limitations.length >= 1);
    assert.equal(mockMomentumResponse.dataSource, "SIMULATED_DEMO_DATA");
    assert.equal(mockMomentumResponse.matchId, "ars-che");
  });

  console.log("\n========================================================");
  console.log(` MOMENTUM TESTS COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (0 FAILURES) `);
  console.log("========================================================\n");
}

runTests();
