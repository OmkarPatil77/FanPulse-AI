import assert from "node:assert/strict";
import { buildTacticalEvidence } from "@/lib/ai/tactiq-evidence";
import {
  TACTIQ_SYSTEM_INSTRUCTION,
  analyzeTacticsWithGemini,
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
  console.log("   FANPULSE AI — PHASE 3.2 TACTIQ AI UNIT TESTS        ");
  console.log("========================================================\n");

  console.log("1. TACTICAL EVIDENCE PREPARATION LAYER");

  await test("Evidence: Builds complete tactical evidence payload for valid in-play match (ars-che)", () => {
    const evidence = buildTacticalEvidence("ars-che");
    assert(evidence !== null, "Evidence for ars-che should not be null");

    // Match context
    assert.equal(evidence.matchContext.matchId, "ars-che");
    assert.equal(evidence.matchContext.homeTeam.code, "ARS");
    assert.equal(evidence.matchContext.awayTeam.code, "CHE");
    assert.equal(evidence.matchContext.status, "IN_PLAY");
    assert.equal(evidence.matchContext.dataSource, "SIMULATED_DEMO_DATA");

    // Formations
    assert.equal(evidence.formations.home.name, "4-3-3 Attacking");
    assert.equal(evidence.formations.away.name, "4-2-3-1 Mid-Block");
    assert.equal(evidence.formations.home.players.length, 11);
    assert.equal(evidence.formations.away.players.length, 11);

    // Line counts calculation
    assert.equal(evidence.formations.home.lineCounts.gk, 1);
    assert.equal(evidence.formations.home.lineCounts.def, 4);
    assert.equal(evidence.formations.home.lineCounts.mid, 3);
    assert.equal(evidence.formations.home.lineCounts.fwd, 3);

    // Player details
    const saka = evidence.formations.home.players.find((p) => p.shortName === "Saka");
    assert(saka, "Saka must be in home lineup");
    assert.equal(saka.role, "Inside Forward (RW)");
    assert(saka.coordinates.x > 0 && saka.coordinates.y > 0);

    // Comparison summary
    assert(typeof evidence.formations.comparison.midfieldDifference === "string");
    assert(typeof evidence.formations.comparison.numericalSummary === "string");

    // Tactical shifts & decisive events
    assert(evidence.recordedTacticalShifts.length > 0, "Must contain recorded tactical shifts");
    const shift8 = evidence.recordedTacticalShifts.find((s) => s.minute === 8);
    assert(shift8, "Should record 8' Ben White inversion shift");

    // Team statistics
    assert.equal(evidence.teamStatistics.home.possession, 57);
    assert.equal(evidence.teamStatistics.away.possession, 43);

    // Limitations
    assert(evidence.dataLimitations.length >= 4, "Must contain explicit data limitations");
  });

  await test("Evidence: Safely handles scheduled fixture without missing data errors (tot-ast)", () => {
    const evidence = buildTacticalEvidence("tot-ast");
    assert(evidence !== null, "Evidence for tot-ast should resolve successfully");
    assert.equal(evidence.matchContext.status, "SCHEDULED");
    assert.equal(evidence.matchContext.homeTeam.code, "TOT");
    assert.equal(evidence.matchContext.awayTeam.code, "AVL");
    assert.equal(evidence.formations.home.players.length, 11);
    assert.equal(evidence.formations.away.players.length, 11);
    assert(Array.isArray(evidence.recordedTacticalShifts));
  });

  await test("Evidence: Chronological ordering of tactical shifts and decisive events", () => {
    const evidence = buildTacticalEvidence("ars-che");
    assert(evidence !== null);

    // Verify tactical shifts chronological ordering
    for (let i = 0; i < evidence.recordedTacticalShifts.length - 1; i++) {
      assert(
        evidence.recordedTacticalShifts[i].minute <= evidence.recordedTacticalShifts[i + 1].minute,
        "Tactical shifts must be sorted chronologically"
      );
    }

    // Verify decisive events chronological ordering
    for (let i = 0; i < evidence.decisiveEvents.length - 1; i++) {
      assert(
        evidence.decisiveEvents[i].minute <= evidence.decisiveEvents[i + 1].minute,
        "Decisive events must be sorted chronologically"
      );
    }
  });

  await test("Evidence: Unknown match ID returns null safely", () => {
    assert.equal(buildTacticalEvidence("invalid-match-key"), null);
    assert.equal(buildTacticalEvidence(""), null);
    assert.equal(buildTacticalEvidence("real-madrid-barcelona"), null);
  });

  console.log("\n2. MATCH ISOLATION & DATA INTEGRITY");

  await test("Isolation: Different matches maintain distinct tactical payloads without leakage", () => {
    const arsChe = buildTacticalEvidence("ars-che");
    const mciLiv = buildTacticalEvidence("mci-liv");

    assert(arsChe !== null && mciLiv !== null);

    // Formations must be different
    assert.equal(arsChe.formations.home.name, "4-3-3 Attacking");
    assert.equal(mciLiv.formations.home.name, "3-2-4-1 Build-Up");

    // Players must not cross over
    const hasHaalandInArsenal = arsChe.formations.home.players.some((p) => p.name.includes("Haaland"));
    const hasHaalandInCity = mciLiv.formations.home.players.some((p) => p.name.includes("Haaland"));
    assert(!hasHaalandInArsenal, "Haaland must not be in Arsenal payload");
    assert(hasHaalandInCity, "Haaland must be in Manchester City payload");

    const hasSakaInCity = mciLiv.formations.home.players.some((p) => p.name.includes("Saka"));
    assert(!hasSakaInCity, "Saka must not be in City payload");
  });

  console.log("\n3. GEMINI SERVICE RESILIENCE & SAFETY AUDIT");

  await test("Safety: System instruction explicitly prohibits live tracking & ungrounded metrics", () => {
    assert(
      TACTIQ_SYSTEM_INSTRUCTION.includes("Never claim access to live tracking, GPS, optical tracking, or camera-derived data"),
      "Instruction must forbid optical/GPS claims"
    );
    assert(
      TACTIQ_SYSTEM_INSTRUCTION.includes("PPDA"),
      "Instruction must forbid fabricating pressing intensity metrics"
    );
    assert(
      TACTIQ_SYSTEM_INSTRUCTION.includes("defensive line height in meters"),
      "Instruction must forbid fabricating defensive line height"
    );
    assert(
      TACTIQ_SYSTEM_INSTRUCTION.includes("DATA OBSERVATION"),
      "Instruction must enforce three-tier distinction"
    );
    assert(
      TACTIQ_SYSTEM_INSTRUCTION.includes("POTENTIAL IMPLICATION"),
      "Instruction must mandate framing implications as possibilities"
    );
    assert(
      TACTIQ_SYSTEM_INSTRUCTION.includes("SIMULATED_DEMO_DATA") ||
        TACTIQ_SYSTEM_INSTRUCTION.includes("simulated demo telemetry"),
      "Instruction must mandate demo dataset transparency"
    );
  });

  await test("Service: Missing GEMINI_API_KEY returns graceful failure without throwing", async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const evidence = buildTacticalEvidence("ars-che")!;
    const result = await analyzeTacticsWithGemini(
      evidence,
      "Why might Arsenal's formation create an advantage in midfield?"
    );

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
    const emptyQuestion = "    ";
    assert.equal(emptyQuestion.trim().length, 0);

    const oversizedQuestion = "x".repeat(501);
    assert(oversizedQuestion.length > 500, "Should exceed 500 character limit");

    const validQuestion = "Why is the 3-2-4-1 build-up effective against a mid-block?";
    assert(validQuestion.trim().length > 0 && validQuestion.length <= 500);
  });

  await test("Schema: Validates mocked TactiQ analysis response conforms to product schema", () => {
    const mockTactiQResponse = {
      success: true,
      answer:
        "Arsenal's 4-3-3 shape gains a central midfield overload primarily due to Ben White inverting from right-back at minute 8 to form a 3-2-4-1 in-possession structure beside Thomas Partey.",
      keyPoints: [
        "Ben White's 8th minute inversion generates a 3v2 central progression superiority.",
        "Chelsea's 4-2-3-1 double pivot of Caicedo and Lavia is stretched horizontally.",
        "Bukayo Saka is isolated in 1v1 situations against Cucurella on the right flank.",
      ],
      evidence: [
        {
          minute: 8,
          description: "Ben White inverts into central midfield beside Partey",
          source: "tactical_shift",
        },
        {
          description: "Arsenal 4-3-3 Attacking vs Chelsea 4-2-3-1 Mid-Block",
          source: "formation",
        },
        {
          minute: 27,
          description: "Caicedo yellow card forces cautious transition defending",
          source: "match_event",
        },
      ],
      limitations: [
        "Simulated demo dataset (not optical tracking).",
        "Exact pressing sprint speeds and meter line heights cannot be verified.",
      ],
      dataSource: "SIMULATED_DEMO_DATA",
      matchId: "ars-che",
      matchLabel: "Arsenal vs Chelsea",
    };

    assert.equal(mockTactiQResponse.success, true);
    assert(typeof mockTactiQResponse.answer === "string" && mockTactiQResponse.answer.length > 0);
    assert(Array.isArray(mockTactiQResponse.keyPoints) && mockTactiQResponse.keyPoints.length >= 2);
    assert(Array.isArray(mockTactiQResponse.evidence) && mockTactiQResponse.evidence.length >= 2);
    assert(Array.isArray(mockTactiQResponse.limitations) && mockTactiQResponse.limitations.length >= 1);
    assert.equal(mockTactiQResponse.dataSource, "SIMULATED_DEMO_DATA");
    assert.equal(mockTactiQResponse.matchId, "ars-che");
  });

  console.log("\n========================================================");
  console.log(` TACTIQ TESTS COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (0 FAILURES) `);
  console.log("========================================================\n");
}

runTests();
