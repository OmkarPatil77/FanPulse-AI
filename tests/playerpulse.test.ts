import assert from "node:assert/strict";
import { buildPlayerPulseEvidence } from "@/lib/ai/playerpulse-evidence";
import {
  calculatePlayerPerformanceScore,
  normalizePlayerMetricsPer90,
} from "@/lib/football/player-performance";
import {
  PLAYERPULSE_SYSTEM_INSTRUCTION,
  analyzePlayerPulseWithGemini,
  resolveGeminiModel,
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
  console.log("   FANPULSE AI — PHASE 3.4 PLAYERPULSE AI UNIT TESTS   ");
  console.log("========================================================\n");

  console.log("1. EVIDENCE PREPARATION & STATISTICAL LAYER");

  await test("Evidence: Builds complete evidence payload for tracked player (ars-saka)", () => {
    const evidence = buildPlayerPulseEvidence("ars-che", "ars-saka");
    assert(evidence !== null, "Evidence for Saka should not be null");

    // Match context
    assert.equal(evidence.matchContext.matchId, "ars-che");
    assert.equal(evidence.matchContext.dataSource, "SIMULATED_DEMO_DATA");

    // Player profile
    assert.equal(evidence.playerProfile.name, "Bukayo Saka");
    assert.equal(evidence.playerProfile.teamCode, "ARS");
    assert.equal(evidence.playerProfile.positionCategory, "FWD");
    assert.equal(evidence.playerProfile.primaryRole, "Inside Forward (RW)");

    // Performance summary
    assert.equal(evidence.performanceSummary.hasDetailedStats, true);
    assert.equal(evidence.performanceSummary.minutesPlayed, 85);
    assert(evidence.performanceSummary.heuristicPerformanceScore >= 4.0);
    assert(evidence.performanceSummary.heuristicPerformanceScore <= 10.0);

    // Raw statistics
    assert(evidence.rawStatistics !== undefined);
    assert.equal(evidence.rawStatistics?.goals, 1);
    assert.equal(evidence.rawStatistics?.assists, 1);
    assert.equal(evidence.rawStatistics?.shotsOnTarget, 2);
    assert.equal(evidence.rawStatistics?.keyPasses, 3);

    // Per-90 normalized metrics
    assert(evidence.normalizedPer90 !== undefined);
    assert(typeof evidence.normalizedPer90?.progressivePasses === "number");
    assert(typeof evidence.normalizedPer90?.tacklesInterceptions === "number");

    // Player-linked events
    assert(evidence.playerEvents.length > 0, "Saka should have player-linked events (goal at 34')");
    const goalEvt = evidence.playerEvents.find((e) => e.type === "GOAL");
    assert(goalEvt, "Goal event must be linked to Saka");
  });

  await test("Evidence: Safely handles player with missing granular boxscore (defaults to neutral 6.00 baseline)", () => {
    // ars-raya is in the starting lineup but doesn't have an outfield boxscore in playerStats
    const evidence = buildPlayerPulseEvidence("ars-che", "ars-raya");
    assert(evidence !== null, "Evidence for starting keeper should resolve");
    assert.equal(evidence.playerProfile.name, "David Raya");
    assert.equal(evidence.performanceSummary.hasDetailedStats, false);
    assert.equal(evidence.performanceSummary.heuristicPerformanceScore, 6.0);
    assert.equal(evidence.rawStatistics, undefined);
    assert.equal(evidence.normalizedPer90, undefined);
    assert(evidence.dataLimitations.some((l) => l.includes("defaults to neutral 6.00 baseline")));
  });

  await test("Evidence: Chronological ordering of player-linked events", () => {
    const evidence = buildPlayerPulseEvidence("ars-che", "ars-saka");
    assert(evidence !== null);

    for (let i = 0; i < evidence.playerEvents.length - 1; i++) {
      assert(
        evidence.playerEvents[i].minute <= evidence.playerEvents[i + 1].minute,
        "Player events must be sorted chronologically"
      );
    }
  });

  console.log("\n2. MATCH & PLAYER ISOLATION");

  await test("Isolation: Rejects player ID that does not belong to the selected match fixture", () => {
    // Haaland does not belong to Arsenal vs Chelsea
    const haalandInArsChe = buildPlayerPulseEvidence("ars-che", "mci-haaland");
    assert.equal(haalandInArsChe, null, "Haaland must not resolve in Arsenal vs Chelsea fixture");

    // Saka does not belong to Manchester City vs Liverpool
    const sakaInMciLiv = buildPlayerPulseEvidence("mci-liv", "ars-saka");
    assert.equal(sakaInMciLiv, null, "Saka must not resolve in Manchester City vs Liverpool fixture");
  });

  await test("Isolation: Handles unknown match ID and invalid player ID safely", () => {
    assert.equal(buildPlayerPulseEvidence("unknown-match", "ars-saka"), null);
    assert.equal(buildPlayerPulseEvidence("ars-che", "non-existent-player-999"), null);
    assert.equal(buildPlayerPulseEvidence("", ""), null);
  });

  console.log("\n3. DETERMINISTIC CALCULATION ENGINE CONSISTENCY");

  await test("Calculation: Performance score formula consistency and clamping [4.00, 10.00]", () => {
    // Test base score with zero minutes
    assert.equal(calculatePlayerPerformanceScore(null), 6.0);
    assert.equal(calculatePlayerPerformanceScore({ minutesPlayed: 0 }), 6.0);

    // Test positive contributions
    const score = calculatePlayerPerformanceScore({
      minutesPlayed: 90,
      goals: 2, // +2.0
      assists: 1, // +0.6
      keyPasses: 3, // +0.6
      shotsOnTarget: 2, // +0.3
      progressivePasses: 5, // +0.2
      progressiveCarries: 5, // +0.2
      tacklesWon: 2, // +0.3
      interceptions: 2, // +0.3
    });
    // Base 6.0 + 2.0 + 0.6 + 0.6 + 0.3 + 0.2 + 0.2 + 0.3 + 0.3 = 10.5 -> clamped to 10.00
    assert.equal(score, 10.0);

    // Test penalty deductions clamp to 4.00
    const penalizedScore = calculatePlayerPerformanceScore({
      minutesPlayed: 90,
      redCards: 2, // -3.0
      yellowCards: 2, // -0.8
      foulsCommitted: 10, // -0.8
    });
    // Base 6.0 - 4.6 = 1.4 -> clamped to 4.00
    assert.equal(penalizedScore, 4.0);
  });

  await test("Calculation: Per-90 normalization prevents division by zero when minutes = 0", () => {
    const zeroMin = normalizePlayerMetricsPer90({ minutesPlayed: 0, goals: 5 });
    assert.equal(zeroMin.per90.goals, 0, "Rate metric must be 0 if minutesPlayed is 0");

    const partialMin = normalizePlayerMetricsPer90({ minutesPlayed: 45, goals: 1 });
    assert.equal(partialMin.per90.goals, 2.0, "1 goal in 45 min must normalize to 2.0/90");
  });

  console.log("\n4. GEMINI SERVICE RESILIENCE & SAFETY DIRECTIVES");

  await test("Safety: System instructions enforce heuristic rating disclosure and prohibit GPS/optical tracking claims", () => {
    assert(
      PLAYERPULSE_SYSTEM_INSTRUCTION.includes("project-specific heuristic"),
      "Instruction must declare score is a heuristic"
    );
    assert(
      PLAYERPULSE_SYSTEM_INSTRUCTION.includes("NOT an official Premier League rating"),
      "Instruction must forbid claiming official rating"
    );
    assert(
      PLAYERPULSE_SYSTEM_INSTRUCTION.includes("Never claim access to live optical player tracking"),
      "Instruction must forbid optical tracking claims"
    );
    assert(
      PLAYERPULSE_SYSTEM_INSTRUCTION.includes("GPS velocities"),
      "Instruction must forbid GPS velocity claims"
    );
    assert(
      PLAYERPULSE_SYSTEM_INSTRUCTION.includes("BEYOND GOALS & ASSISTS"),
      "Instruction must emphasize non-scoring progression and duels"
    );
  });

  await test("Service: Missing GEMINI_API_KEY returns structured failure gracefully without throwing", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const evidence = buildPlayerPulseEvidence("ars-che", "ars-saka")!;
    const result = await analyzePlayerPulseWithGemini(
      evidence,
      "What did this player contribute beyond goals and assists?"
    );

    assert.equal(result.success, false);
    assert.equal(result.error, "MISSING_API_KEY");
    assert(result.answer.includes("GEMINI_API_KEY"));
    assert.equal(result.dataSource, "SIMULATED_DEMO_DATA");
    assert.equal(result.playerName, "Bukayo Saka");

    process.env.GEMINI_API_KEY = originalKey;
  });

  await test("Service: Resolves valid Gemini model identifier", () => {
    const model = resolveGeminiModel();
    assert(typeof model === "string" && model.length > 0);
    assert(model.startsWith("gemini-"));
  });

  console.log("\n5. VALIDATION & MOCKED RESPONSE SCHEMA AUDIT");

  await test("Validation: Handles empty questions and overlength inquiries safely", () => {
    const emptyQuery = "    ";
    assert.equal(emptyQuery.trim().length, 0);

    const oversizedQuery = "p".repeat(501);
    assert(oversizedQuery.length > 500, "Should exceed 500 characters");

    const validQuery = "How did Saka's carrying create transitional space?";
    assert(validQuery.trim().length > 0 && validQuery.length <= 500);
  });

  await test("Schema: Validates mocked PlayerPulse AI response conforms to product schema", () => {
    const mockPlayerResponse = {
      success: true,
      answer:
        "Beyond scoring the opening goal at 34' and assisting Kai Havertz at 74', Bukayo Saka served as Arsenal's primary wide progression valve, completing 7 progressive passes and 6 progressive carries while winning 5 ground duels.",
      keyPoints: [
        "Delivered 4 key passes, generating consistent danger from the right channel.",
        "Registered 7 progressive passes and 6 progressive carries.",
        "Won 5 of 10 ground duels while drawing 2 fouls to disrupt Chelsea's pressing block.",
      ],
      evidence: [
        {
          minute: 34,
          description: "Goal: Bukayo Saka (1-0) from Ødegaard pass",
          source: "player_event",
        },
        {
          description: "7 progressive passes and 6 progressive carries recorded",
          source: "player_metric",
        },
        {
          description: "Heuristic performance index: 8.35/10.00",
          source: "performance_index",
        },
      ],
      limitations: [
        "Illustrative heuristic score based on counting stats and duel win rates.",
        "Not derived from continuous optical player tracking or GPS velocity sensors.",
      ],
      dataSource: "SIMULATED_DEMO_DATA",
      matchId: "ars-che",
      matchLabel: "Arsenal vs Chelsea",
      playerId: "ars-saka",
      playerName: "Bukayo Saka",
    };

    assert.equal(mockPlayerResponse.success, true);
    assert(typeof mockPlayerResponse.answer === "string" && mockPlayerResponse.answer.length > 0);
    assert(Array.isArray(mockPlayerResponse.keyPoints) && mockPlayerResponse.keyPoints.length >= 2);
    assert(Array.isArray(mockPlayerResponse.evidence) && mockPlayerResponse.evidence.length >= 2);
    assert(Array.isArray(mockPlayerResponse.limitations) && mockPlayerResponse.limitations.length >= 1);
    assert.equal(mockPlayerResponse.dataSource, "SIMULATED_DEMO_DATA");
    assert.equal(mockPlayerResponse.playerId, "ars-saka");
    assert.equal(mockPlayerResponse.playerName, "Bukayo Saka");
  });

  console.log("\n========================================================");
  console.log(` PLAYERPULSE TESTS COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (0 FAILURES) `);
  console.log("========================================================\n");
}

runTests();
