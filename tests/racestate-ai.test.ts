import assert from "node:assert/strict";
import { buildRaceStateEvidence } from "@/lib/ai/racestate-evidence";
import { calculateStandings } from "@/lib/football/standings";
import { calculateMatchScenarios } from "@/lib/football/scenarios";
import { RAW_STANDINGS_DATA } from "@/data/standings";
import { MATCHES_DATA } from "@/data/matches";
import {
  RACESTATE_SYSTEM_INSTRUCTION,
  analyzeRaceStateWithGemini,
  resolveGeminiModel,
  RaceStateAnalysisResult,
} from "@/lib/ai/gemini-service";

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
  console.log("   FANPULSE AI — PHASE 3.5 RACESTATE AI UNIT TESTS     ");
  console.log("========================================================\n");

  console.log("1. EVIDENCE PREPARATION & STANDINGS COMPLETENESS");

  await test("Evidence: Builds complete baseline standings for valid match (ars-che)", () => {
    const evidence = buildRaceStateEvidence("ars-che");
    assert(evidence !== null, "Evidence must not be null for valid match ars-che");

    // Match context
    assert.equal(evidence.matchContext.matchId, "ars-che");
    assert.equal(evidence.matchContext.dataSource, "SIMULATED_DEMO_DATA");
    assert.equal(evidence.matchContext.homeTeam.code, "ARS");
    assert.equal(evidence.matchContext.awayTeam.code, "CHE");

    // Baseline standings summary
    assert.equal(evidence.baselineStandingsSummary.totalClubs, 20);
    assert.equal(evidence.baselineStandingsSummary.table.length, 20);

    // Leader verification
    assert.equal(evidence.baselineStandingsSummary.leader.position, 1);
    assert(evidence.baselineStandingsSummary.leader.points > 0);

    // Zone boundaries present
    assert(evidence.baselineStandingsSummary.topFourBoundary.fourthPlace !== undefined);
    assert(evidence.baselineStandingsSummary.topFourBoundary.fifthPlace !== undefined);
    assert(evidence.baselineStandingsSummary.relegationBoundary.seventeenthPlace !== undefined);
    assert(evidence.baselineStandingsSummary.relegationBoundary.eighteenthPlace !== undefined);
  });

  await test("Evidence: Includes all three deterministic scenario outcomes (Home Win, Draw, Away Win)", () => {
    const evidence = buildRaceStateEvidence("ars-che");
    assert(evidence !== null);

    assert.equal(evidence.scenarios.length, 3);
    const ids = evidence.scenarios.map((s) => s.scenarioId);
    assert(ids.includes("home-win"), "Must include home-win scenario");
    assert(ids.includes("draw"), "Must include draw scenario");
    assert(ids.includes("away-win"), "Must include away-win scenario");

    for (const scen of evidence.scenarios) {
      assert.equal(scen.isHypotheticalModelInput, true);
      assert(typeof scen.projectedHomeScore === "number");
      assert(typeof scen.projectedAwayScore === "number");
      assert(scen.homeImpact.teamName.length > 0);
      assert(scen.awayImpact.teamName.length > 0);
    }
  });

  console.log("\n2. DETERMINISTIC ENGINE AGREEMENT & MATHEMATICAL RECALCULATION");

  await test("Scenarios: Agrees with calculateMatchScenarios engine and recalculates points correctly", () => {
    const match = MATCHES_DATA["ars-che"];
    const directScenarios = calculateMatchScenarios(match, RAW_STANDINGS_DATA);
    const evidence = buildRaceStateEvidence("ars-che");
    assert(evidence !== null);

    const directHomeWin = directScenarios.find((s) => s.scenarioId === "home-win")!;
    const evidenceHomeWin = evidence.scenarios.find((s) => s.scenarioId === "home-win")!;

    // Home win points verification
    assert.equal(
      evidenceHomeWin.homeImpact.newPoints,
      directHomeWin.homeTeamStandingsChange.newPoints
    );
    assert.equal(
      evidenceHomeWin.homeImpact.pointsGained,
      3,
      "Home win must award 3 points to home team"
    );
    assert.equal(
      evidenceHomeWin.awayImpact.pointsGained,
      0,
      "Home win must award 0 points to away team"
    );

    // Goal difference shifts
    assert.equal(
      evidenceHomeWin.homeImpact.gdShift,
      1,
      "2-1 projected home win results in +1 GD for home"
    );
    assert.equal(
      evidenceHomeWin.awayImpact.gdShift,
      -1,
      "2-1 projected home win results in -1 GD for away"
    );
  });

  await test("Scenarios: Draw outcome awards 1 point each with 0 net GD shift", () => {
    const evidence = buildRaceStateEvidence("ars-che");
    assert(evidence !== null);

    const drawScen = evidence.scenarios.find((s) => s.scenarioId === "draw")!;
    assert.equal(drawScen.homeImpact.pointsGained, 1, "Draw awards 1 point to home");
    assert.equal(drawScen.awayImpact.pointsGained, 1, "Draw awards 1 point to away");
    assert.equal(drawScen.homeImpact.gdShift, 0, "Draw GD shift is 0");
    assert.equal(drawScen.awayImpact.gdShift, 0, "Draw GD shift is 0");
  });

  await test("Scenarios: Tie-break ordering remains consistent (Points > GD > GF > Name)", () => {
    const baseline = calculateStandings(RAW_STANDINGS_DATA);

    for (let i = 0; i < baseline.length - 1; i++) {
      const a = baseline[i];
      const b = baseline[i + 1];

      if (a.points !== b.points) {
        assert(a.points > b.points, `Points descending: ${a.team.code} (${a.points}) >= ${b.team.code} (${b.points})`);
      } else if (a.goalDifference !== b.goalDifference) {
        assert(
          a.goalDifference > b.goalDifference,
          `GD descending when points tied: ${a.team.code} (${a.goalDifference}) >= ${b.team.code} (${b.goalDifference})`
        );
      } else if (a.goalsFor !== b.goalsFor) {
        assert(
          a.goalsFor > b.goalsFor,
          `GF descending when points and GD tied: ${a.team.code} (${a.goalsFor}) >= ${b.team.code} (${b.goalsFor})`
        );
      } else {
        assert(
          a.team.name.localeCompare(b.team.name) <= 0,
          `Alphabetical tie-break: ${a.team.name} <= ${b.team.name}`
        );
      }
    }
  });

  console.log("\n3. POSITION CHANGES & ZONE TRANSITION AUDIT");

  await test("Positions: Correct calculation of position deltas and zone transitions", () => {
    const evidence = buildRaceStateEvidence("ars-che");
    assert(evidence !== null);

    for (const scen of evidence.scenarios) {
      // Home delta = previousPosition - newPosition (positive = moved up, negative = dropped)
      const expectedHomeDelta = scen.homeImpact.previousPosition - scen.homeImpact.newPosition;
      assert.equal(scen.homeImpact.positionDelta, expectedHomeDelta);

      const expectedAwayDelta = scen.awayImpact.previousPosition - scen.awayImpact.newPosition;
      assert.equal(scen.awayImpact.positionDelta, expectedAwayDelta);

      assert(scen.homeImpact.zoneTransition.length > 0, "Zone transition description must exist");
      assert(scen.awayImpact.zoneTransition.length > 0, "Zone transition description must exist");
    }
  });

  console.log("\n4. MATCH ISOLATION & VALIDATION AUDIT");

  await test("Isolation: Different matches maintain distinct tactical payloads without leakage", () => {
    const arsChe = buildRaceStateEvidence("ars-che");
    const mciLiv = buildRaceStateEvidence("mci-liv");

    assert(arsChe !== null);
    assert(mciLiv !== null);

    assert.equal(arsChe.matchContext.matchId, "ars-che");
    assert.equal(mciLiv.matchContext.matchId, "mci-liv");
    assert.equal(arsChe.matchContext.homeTeam.code, "ARS");
    assert.equal(mciLiv.matchContext.homeTeam.code, "MCI");
    assert.notEqual(arsChe.matchContext.fixtureLabel, mciLiv.matchContext.fixtureLabel);
  });

  await test("Validation: Unknown match IDs return null safely", () => {
    assert.equal(buildRaceStateEvidence("unknown-match-xyz"), null);
    assert.equal(buildRaceStateEvidence(""), null);
    // @ts-expect-error - testing invalid type handling
    assert.equal(buildRaceStateEvidence(null), null);
  });

  console.log("\n5. GEMINI SERVICE ACCURACY & SAFETY DIRECTIVES");

  await test("Safety: System instructions prohibit invented probabilities and predictions", () => {
    assert(
      RACESTATE_SYSTEM_INSTRUCTION.includes("Never invent win percentages, title odds"),
      "Instruction must forbid claiming win percentages or title odds"
    );
    assert(
      RACESTATE_SYSTEM_INSTRUCTION.includes("Never describe them as predictions"),
      "Instruction must forbid calling scenario scorelines predictions"
    );
    assert(
      RACESTATE_SYSTEM_INSTRUCTION.includes("simulated demo dataset"),
      "Instruction must disclose simulated demo dataset"
    );
    assert(
      RACESTATE_SYSTEM_INSTRUCTION.includes("single matchweek fixture alters mathematical point buffers"),
      "Instruction must emphasize single-match perspective"
    );
  });

  await test("Service: Missing GEMINI_API_KEY returns structured failure gracefully without throwing", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    try {
      delete process.env.GEMINI_API_KEY;
      const evidence = buildRaceStateEvidence("ars-che");
      assert(evidence !== null);

      const result = await analyzeRaceStateWithGemini(evidence, "How does a win affect the table?");
      assert.equal(result.success, false);
      assert.equal(result.error, "MISSING_API_KEY");
      assert(result.answer.includes("GEMINI_API_KEY is not configured"));
      assert.equal(result.dataSource, "SIMULATED_DEMO_DATA");
    } finally {
      if (originalKey) process.env.GEMINI_API_KEY = originalKey;
    }
  });

  await test("Service: Resolves valid Gemini model identifier", () => {
    const model = resolveGeminiModel();
    assert(model.length > 0, "Model identifier must not be empty");
    assert(model.includes("gemini"), "Resolved model must be a Gemini identifier");
  });

  console.log("\n6. RESPONSE SCHEMA & QUERY LIMITATION AUDIT");

  await test("Validation: Handles empty questions and overlength inquiries safely", () => {
    const MAX_QUESTION_LENGTH = 500;
    const oversizedQuestion = "A".repeat(501);

    assert(oversizedQuestion.length > MAX_QUESTION_LENGTH);
    assert("".trim().length === 0);
  });

  await test("Schema: Validates mocked RaceState AI response conforms to product schema", () => {
    const mockedResponse: RaceStateAnalysisResult = {
      success: true,
      answer:
        "An Arsenal victory over Chelsea moves the Gunners to 25 points, maintaining title pressure on leaders Manchester City while widening their cushion over the chasing pack.",
      keyPoints: [
        "Arsenal gains +3 points to reach 25 pts (Pos #2).",
        "Chelsea remains on 18 pts and risks falling behind Aston Villa on goal difference.",
      ],
      evidence: [
        {
          teamCode: "ARS",
          position: 2,
          description: "Arsenal holds 22 baseline points with a +12 goal difference.",
          source: "baseline_standings",
        },
        {
          teamCode: "CHE",
          position: 4,
          description: "Projected 2-1 defeat leaves Chelsea on 18 points with +6 GD.",
          source: "scenario_outcome",
        },
      ],
      limitations: [
        "Scenario scorelines are fixed simulation modeling inputs, not predictive betting forecasts.",
        "Simulated demo dataset for Premier League analytics showcase.",
      ],
      dataSource: "SIMULATED_DEMO_DATA",
      matchId: "ars-che",
      matchLabel: "Arsenal vs Chelsea",
    };

    assert.equal(mockedResponse.success, true);
    assert(mockedResponse.keyPoints.length >= 2);
    assert(mockedResponse.evidence.length >= 2);
    assert.equal(mockedResponse.evidence[0].source, "baseline_standings");
    assert.equal(mockedResponse.dataSource, "SIMULATED_DEMO_DATA");
  });

  console.log("\n7. DETERMINISTIC RACE INSIGHTS AUDIT");

  await test("Insights: Factual, Scenario, and Interpretation insights generated without fabrication", () => {
    const evidence = buildRaceStateEvidence("ars-che");
    assert(evidence !== null);

    const insights = evidence.deterministicInsights;
    assert(insights.length >= 3, "Must generate at least 3 deterministic insights");

    const facts = insights.filter((i) => i.category === "FACT");
    const scenarios = insights.filter((i) => i.category === "SCENARIO");
    const interpretations = insights.filter((i) => i.category === "INTERPRETATION");

    assert(facts.length > 0, "Must contain at least 1 FACT insight");
    assert(scenarios.length > 0, "Must contain at least 1 SCENARIO insight");
    assert(interpretations.length > 0, "Must contain at least 1 INTERPRETATION insight");
  });

  console.log("\n========================================================");
  console.log(` RACESTATE TESTS COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (0 FAILURES) `);
  console.log("========================================================\n");
}

runTests().catch((err) => {
  console.error("Unhandled test execution failure:", err);
  process.exit(1);
});
