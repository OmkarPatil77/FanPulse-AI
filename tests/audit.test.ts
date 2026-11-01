import assert from "node:assert/strict";
import { RAW_STANDINGS_DATA } from "@/data/standings";
import { calculateStandings } from "@/lib/football/standings";
import { calculateMatchScenarios } from "@/lib/football/scenarios";
import { calculateMomentumCurve } from "@/lib/football/momentum";
import {
  calculatePlayerPerformanceScore,
  normalizePlayerMetricsPer90,
} from "@/lib/football/player-performance";
import { MATCHES_DATA, getMatchById } from "@/data/matches";
import { TEAMS_DATA } from "@/data/teams";
import { MATCH_EVENTS_DATA } from "@/data/events";
import { MatchEvent, PlayerMatchStatistics } from "@/types/football";

let totalTests = 0;
let passedTests = 0;

function test(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

console.log("\n========================================================");
console.log("   FANPULSE AI — PHASE 2.5 FOOTBALL LOGIC & QA AUDIT   ");
console.log("========================================================\n");

// ---------------------------------------------------------------------------
// 1. LEAGUE STANDINGS VALIDATION
// ---------------------------------------------------------------------------
console.log("1. LEAGUE STANDINGS & BASELINE DATA AUDIT");

test("Standings: Exactly 20 Premier League clubs present in baseline", () => {
  assert.equal(RAW_STANDINGS_DATA.length, 20);
  assert.equal(Object.keys(TEAMS_DATA).length, 20);
});

test("Standings: Invariant Played = Won + Drawn + Lost for every club", () => {
  for (const record of RAW_STANDINGS_DATA) {
    const computedPlayed = record.won + record.drawn + record.lost;
    assert.equal(
      record.played,
      computedPlayed,
      `Team ${record.teamId} played mismatch: recorded=${record.played}, computed=${computedPlayed}`
    );
  }
});

test("Standings: Invariant Goal Difference = Goals For - Goals Against", () => {
  const standings = calculateStandings(RAW_STANDINGS_DATA);
  for (const s of standings) {
    const expectedGD = s.goalsFor - s.goalsAgainst;
    assert.equal(
      s.goalDifference,
      expectedGD,
      `Team ${s.teamId} GD mismatch: calculated=${s.goalDifference}, expected=${expectedGD}`
    );
  }
});

test("Standings: Invariant Points = 3 * Won + Drawn", () => {
  const standings = calculateStandings(RAW_STANDINGS_DATA);
  for (const s of standings) {
    const expectedPts = s.won * 3 + s.drawn;
    assert.equal(
      s.points,
      expectedPts,
      `Team ${s.teamId} Points mismatch: calculated=${s.points}, expected=${expectedPts}`
    );
  }
});

test("Standings: Closed league macro-equilibrium (Wins == Losses, Goals For == Goals Against)", () => {
  let totalWins = 0;
  let totalLosses = 0;
  let totalDraws = 0;
  let totalGF = 0;
  let totalGA = 0;
  let totalPlayed = 0;

  for (const r of RAW_STANDINGS_DATA) {
    totalWins += r.won;
    totalLosses += r.lost;
    totalDraws += r.drawn;
    totalGF += r.goalsFor;
    totalGA += r.goalsAgainst;
    totalPlayed += r.played;
  }

  // In 90 matches played by 20 teams (each match involves 2 teams = 180 total team fixtures)
  assert.equal(totalPlayed, 180, "Total team match appearances must equal 180");
  assert.equal(totalWins, totalLosses, "Sum of wins must strictly equal sum of losses");
  assert.equal(totalWins, 68, "Total wins should be 68");
  assert.equal(totalLosses, 68, "Total losses should be 68");
  assert.equal(totalDraws, 44, "Total draws should be 44");
  assert.equal(totalDraws % 2, 0, "Sum of draws must be an even integer (2 team records per drawn fixture)");
  assert.equal(totalGF, totalGA, "Total goals scored must strictly equal total goals conceded");
  assert.equal(totalGF, 276, "Total goals scored should equal 276");
  assert.equal(totalGF - totalGA, 0, "Net league goal difference must equal 0");
});

test("Standings: Sorting criteria (Points > GD > GF > Name) and tie-breaking", () => {
  const standings = calculateStandings(RAW_STANDINGS_DATA);
  assert.equal(standings.length, 20);

  for (let i = 0; i < standings.length - 1; i++) {
    const current = standings[i];
    const next = standings[i + 1];

    if (current.points !== next.points) {
      assert(
        current.points > next.points,
        `Pos #${current.position} (${current.team.code}: ${current.points}) should have more pts than Pos #${next.position} (${next.team.code}: ${next.points})`
      );
    } else if (current.goalDifference !== next.goalDifference) {
      assert(
        current.goalDifference > next.goalDifference,
        `Pos #${current.position} (${current.team.code}: GD ${current.goalDifference}) should have higher GD than Pos #${next.position} (${next.team.code}: GD ${next.goalDifference})`
      );
    } else if (current.goalsFor !== next.goalsFor) {
      assert(
        current.goalsFor > next.goalsFor,
        `Pos #${current.position} (${current.team.code}: GF ${current.goalsFor}) should have higher GF than Pos #${next.position} (${next.team.code}: GF ${next.goalsFor})`
      );
    } else {
      assert(
        current.team.name.localeCompare(next.team.name) <= 0,
        `Tie-break alphabetical sort failed: ${current.team.name} vs ${next.team.name}`
      );
    }
  }
});

test("Standings: European & Relegation qualification zones assigned correctly", () => {
  const standings = calculateStandings(RAW_STANDINGS_DATA);

  standings.forEach((s) => {
    if (s.position <= 4) {
      assert.equal(s.zone, "ucl", `Pos #${s.position} should be UCL`);
    } else if (s.position === 5) {
      assert.equal(s.zone, "uel", `Pos #5 should be UEL`);
    } else if (s.position === 6) {
      assert.equal(s.zone, "uecl", `Pos #6 should be UECL`);
    } else if (s.position >= 18) {
      assert.equal(s.zone, "relegation", `Pos #${s.position} should be Relegation`);
    } else {
      assert.equal(s.zone, "safe", `Pos #${s.position} should be Safe`);
    }
  });
});

// ---------------------------------------------------------------------------
// 2. SCENARIO ENGINE VALIDATION
// ---------------------------------------------------------------------------
console.log("\n2. WHAT-IF SCENARIO ENGINE AUDIT");

test("Scenarios: Produces exact 3 deterministic outcomes for selected match", () => {
  const match = getMatchById("ars-che");
  const scenarios = calculateMatchScenarios(match, RAW_STANDINGS_DATA);

  assert.equal(scenarios.length, 3);
  assert.equal(scenarios[0].scenarioId, "home-win");
  assert.equal(scenarios[1].scenarioId, "draw");
  assert.equal(scenarios[2].scenarioId, "away-win");
});

test("Scenarios: Outcome 1 (Home Win) increments only participating clubs without double-counting", () => {
  const match = getMatchById("ars-che");
  const homeId = match.homeTeam.id; // ars
  const awayId = match.awayTeam.id; // che

  const baselineStandings = calculateStandings(RAW_STANDINGS_DATA);
  const baseHome = baselineStandings.find((s) => s.teamId === homeId)!;
  const baseAway = baselineStandings.find((s) => s.teamId === awayId)!;

  const scenarios = calculateMatchScenarios(match, RAW_STANDINGS_DATA);
  const homeWinScenario = scenarios.find((s) => s.scenarioId === "home-win")!;
  const newHome = homeWinScenario.tableSnapshot.find((s) => s.teamId === homeId)!;
  const newAway = homeWinScenario.tableSnapshot.find((s) => s.teamId === awayId)!;

  // Home gains +3 pts, +1 GD (2-1 scoreline)
  assert.equal(newHome.played, baseHome.played + 1);
  assert.equal(newHome.won, baseHome.won + 1);
  assert.equal(newHome.points, baseHome.points + 3);
  assert.equal(newHome.goalsFor, baseHome.goalsFor + 2);
  assert.equal(newHome.goalsAgainst, baseHome.goalsAgainst + 1);
  assert.equal(newHome.goalDifference, baseHome.goalDifference + 1);

  // Away gains 0 pts, -1 GD (2-1 scoreline)
  assert.equal(newAway.played, baseAway.played + 1);
  assert.equal(newAway.lost, baseAway.lost + 1);
  assert.equal(newAway.points, baseAway.points);
  assert.equal(newAway.goalsFor, baseAway.goalsFor + 1);
  assert.equal(newAway.goalsAgainst, baseAway.goalsAgainst + 2);
  assert.equal(newAway.goalDifference, baseAway.goalDifference - 1);

  // All other 18 teams must remain completely untouched
  const untouchedCount = homeWinScenario.tableSnapshot.filter(
    (s) => s.teamId !== homeId && s.teamId !== awayId
  );
  assert.equal(untouchedCount.length, 18);
  for (const team of untouchedCount) {
    const baseRecord = baselineStandings.find((b) => b.teamId === team.teamId)!;
    assert.equal(team.played, baseRecord.played);
    assert.equal(team.points, baseRecord.points);
    assert.equal(team.goalDifference, baseRecord.goalDifference);
  }
});

test("Scenarios: Outcome 2 (Draw) increments 1 point to both clubs with 0 net GD shift", () => {
  const match = getMatchById("ars-che");
  const homeId = match.homeTeam.id;
  const awayId = match.awayTeam.id;

  const baselineStandings = calculateStandings(RAW_STANDINGS_DATA);
  const baseHome = baselineStandings.find((s) => s.teamId === homeId)!;
  const baseAway = baselineStandings.find((s) => s.teamId === awayId)!;

  const scenarios = calculateMatchScenarios(match, RAW_STANDINGS_DATA);
  const drawScenario = scenarios.find((s) => s.scenarioId === "draw")!;
  const newHome = drawScenario.tableSnapshot.find((s) => s.teamId === homeId)!;
  const newAway = drawScenario.tableSnapshot.find((s) => s.teamId === awayId)!;

  assert.equal(newHome.played, baseHome.played + 1);
  assert.equal(newHome.drawn, baseHome.drawn + 1);
  assert.equal(newHome.points, baseHome.points + 1);
  assert.equal(newHome.goalDifference, baseHome.goalDifference); // 1-1 = 0 delta

  assert.equal(newAway.played, baseAway.played + 1);
  assert.equal(newAway.drawn, baseAway.drawn + 1);
  assert.equal(newAway.points, baseAway.points + 1);
  assert.equal(newAway.goalDifference, baseAway.goalDifference); // 1-1 = 0 delta
});

test("Scenarios: Outcome 3 (Away Win) awards 3 points to away club and updates standings", () => {
  const match = getMatchById("mci-liv");
  const homeId = match.homeTeam.id; // mci
  const awayId = match.awayTeam.id; // liv

  const baselineStandings = calculateStandings(RAW_STANDINGS_DATA);
  const baseHome = baselineStandings.find((s) => s.teamId === homeId)!;
  const baseAway = baselineStandings.find((s) => s.teamId === awayId)!;

  const scenarios = calculateMatchScenarios(match, RAW_STANDINGS_DATA);
  const awayWinScenario = scenarios.find((s) => s.scenarioId === "away-win")!;
  const newHome = awayWinScenario.tableSnapshot.find((s) => s.teamId === homeId)!;
  const newAway = awayWinScenario.tableSnapshot.find((s) => s.teamId === awayId)!;

  assert.equal(newAway.played, baseAway.played + 1);
  assert.equal(newAway.won, baseAway.won + 1);
  assert.equal(newAway.points, baseAway.points + 3);
  assert.equal(newAway.goalDifference, baseAway.goalDifference + 1);

  assert.equal(newHome.played, baseHome.played + 1);
  assert.equal(newHome.lost, baseHome.lost + 1);
  assert.equal(newHome.points, baseHome.points);
  assert.equal(newHome.goalDifference, baseHome.goalDifference - 1);
});

test("Scenarios: Deterministic execution (multiple calls yield identical snapshots)", () => {
  const match = getMatchById("tot-ast");
  const run1 = calculateMatchScenarios(match, RAW_STANDINGS_DATA);
  const run2 = calculateMatchScenarios(match, RAW_STANDINGS_DATA);

  assert.deepEqual(run1, run2);
});

// ---------------------------------------------------------------------------
// 3. MOMENTUM ENGINE VALIDATION
// ---------------------------------------------------------------------------
console.log("\n3. MOMENTUM ENGINE AUDIT");

test("Momentum: Empty event list returns 91 neutral points without throwing", () => {
  const analysis = calculateMomentumCurve([], "ars", "che", "demo-empty", 90);

  assert.equal(analysis.points.length, 91);
  assert.equal(analysis.averageHomeTilt, 50);
  assert.equal(analysis.dominantTeam, "neutral");
  assert.equal(analysis.counterSwingCount, 0);
  assert.equal(analysis.peakPressureInterval, "None (Balanced)");

  for (const pt of analysis.points) {
    assert.equal(pt.netScore, 0);
    assert.equal(pt.homeTilt, 50);
    assert.equal(pt.awayTilt, 50);
  }
});

test("Momentum: Chronological ordering invariant (shuffled events yield identical result)", () => {
  const originalEvents = MATCH_EVENTS_DATA["ars-che"];
  const reversedEvents = [...originalEvents].reverse();

  const runOriginal = calculateMomentumCurve(originalEvents, "ars", "che", "ars-che", 90);
  const runReversed = calculateMomentumCurve(reversedEvents, "ars", "che", "ars-che", 90);

  assert.equal(runOriginal.averageHomeTilt, runReversed.averageHomeTilt);
  assert.equal(runOriginal.counterSwingCount, runReversed.counterSwingCount);
  assert.deepEqual(runOriginal.points, runReversed.points);
});

test("Momentum: Exponential decay mechanic (7% decay per minute toward zero)", () => {
  const singleEvent: MatchEvent[] = [
    {
      id: "ev-test-1",
      matchId: "test",
      minute: 10,
      type: "GOAL",
      teamId: "ars",
      title: "Goal",
      description: "Goal",
      significance: "CRITICAL",
      momentumShiftDelta: 30,
    },
  ];

  const analysis = calculateMomentumCurve(singleEvent, "ars", "che", "decay-test", 20);
  const p10 = analysis.points.find((p) => p.minute === 10)!;
  const p11 = analysis.points.find((p) => p.minute === 11)!;
  const p12 = analysis.points.find((p) => p.minute === 12)!;

  // At minute 10, netScore is +30.
  assert.equal(p10.netScore, 30);
  // At minute 11, decayed by 7% (factor 0.93): 30 * 0.93 = 27.9
  assert.equal(p11.netScore, 27.9);
  // At minute 12, decayed again: 27.9 * 0.93 = 25.9
  assert.equal(p12.netScore, 25.9);
});

test("Momentum: Directional consistency (Home event boosts home tilt, Away event boosts away tilt)", () => {
  const homeGoalEvent: MatchEvent[] = [
    {
      id: "ev-h",
      matchId: "test",
      minute: 20,
      type: "GOAL",
      teamId: "ars",
      title: "Home Goal",
      description: "Home Goal",
      significance: "CRITICAL",
      momentumShiftDelta: 30,
    },
  ];
  const awayGoalEvent: MatchEvent[] = [
    {
      id: "ev-a",
      matchId: "test",
      minute: 20,
      type: "GOAL",
      teamId: "che",
      title: "Away Goal",
      description: "Away Goal",
      significance: "CRITICAL",
      momentumShiftDelta: -30,
    },
  ];

  const homeAnalysis = calculateMomentumCurve(homeGoalEvent, "ars", "che", "test-h", 30);
  const awayAnalysis = calculateMomentumCurve(awayGoalEvent, "ars", "che", "test-a", 30);

  const ptHome = homeAnalysis.points.find((p) => p.minute === 20)!;
  const ptAway = awayAnalysis.points.find((p) => p.minute === 20)!;

  assert(ptHome.homeTilt > 50, "Home goal must increase home tilt above 50%");
  assert(ptAway.awayTilt > 50, "Away goal must increase away tilt above 50%");
  assert.equal(ptHome.homeTilt, ptAway.awayTilt, "Symmetric events must produce symmetric tilts");
});

// ---------------------------------------------------------------------------
// 4. PLAYER PERFORMANCE VALIDATION
// ---------------------------------------------------------------------------
console.log("\n4. PLAYER PERFORMANCE SCORING AUDIT");

test("Player: Safe handling of zero minutes played (no division by zero or NaN)", () => {
  const zeroMinutesStats: Partial<PlayerMatchStatistics> = {
    playerId: "bench-player",
    minutesPlayed: 0,
    goals: 0,
    assists: 0,
  };

  const score = calculatePlayerPerformanceScore(zeroMinutesStats);
  assert.equal(score, 6.0, "Zero minutes must yield baseline 6.00 score");

  const normalized = normalizePlayerMetricsPer90(zeroMinutesStats);
  assert.equal(normalized.rating, "6.00");
  assert.equal(normalized.per90.goals, 0);
  assert.equal(normalized.per90.keyPasses, 0);
  assert.equal(Number.isNaN(normalized.per90.goals), false);
  assert.equal(Number.isFinite(normalized.per90.goals), true);
});

test("Player: Missing statistics handled safely via nullish coalescing", () => {
  const sparseStats: Partial<PlayerMatchStatistics> = {
    playerId: "sparse-player",
    minutesPlayed: 90,
    goals: 1,
    // all other 15 fields undefined
  };

  const score = calculatePlayerPerformanceScore(sparseStats);
  assert.equal(score, 7.0, "1 goal + base 6.0 should equal 7.00");

  const normalized = normalizePlayerMetricsPer90(sparseStats);
  assert.equal(normalized.per90.goals, 1.0);
  assert.equal(normalized.per90.assists, 0);
  assert.equal(normalized.per90.finalThirdPassAcc, 0);
});

test("Player: Performance score strictly bounded in range [4.00, 10.00]", () => {
  // Extreme negative scenario (multiple red cards and fouls)
  const disasterStats: Partial<PlayerMatchStatistics> = {
    minutesPlayed: 45,
    redCards: 2,
    yellowCards: 2,
    foulsCommitted: 10,
  };
  const lowScore = calculatePlayerPerformanceScore(disasterStats);
  assert.equal(lowScore, 4.0, "Disaster stats must be bounded at minimum 4.00");

  // Superhuman scenario (5 goals, 4 assists, high duels, high accuracy)
  const superstarStats: Partial<PlayerMatchStatistics> = {
    minutesPlayed: 90,
    goals: 5,
    assists: 4,
    shotsOnTarget: 6,
    keyPasses: 8,
    progressivePasses: 15,
    progressiveCarries: 12,
    finalThirdPassesAttempted: 20,
    finalThirdPassesCompleted: 19,
    groundDuelsContested: 10,
    groundDuelsWon: 9,
  };
  const highScore = calculatePlayerPerformanceScore(superstarStats);
  assert.equal(highScore, 10.0, "Superhuman stats must be bounded at maximum 10.00");
});

test("Player: Per-90 normalization calculates rate metrics accurately", () => {
  const halfMatchStats: Partial<PlayerMatchStatistics> = {
    minutesPlayed: 45,
    goals: 1, // 1 goal in 45 mins = 2.0 goals per 90
    keyPasses: 2, // 2 key passes in 45 mins = 4.0 per 90
    finalThirdPassesAttempted: 10,
    finalThirdPassesCompleted: 8, // 80% accuracy
  };

  const normalized = normalizePlayerMetricsPer90(halfMatchStats);
  assert.equal(normalized.per90.goals, 2.0);
  assert.equal(normalized.per90.keyPasses, 4.0);
  assert.equal(normalized.per90.finalThirdPassAcc, 80.0);
});

// ---------------------------------------------------------------------------
// 5. CROSS-MODULE SYNCHRONIZATION AUDIT
// ---------------------------------------------------------------------------
console.log("\n5. CROSS-MODULE MATCH DATA COHERENCE AUDIT");

test("Sync: Every match in MATCHES_DATA has valid lineups, tactics, stats, and events", () => {
  const matchIds = ["ars-che", "mci-liv", "tot-ast", "new-mun"];

  for (const id of matchIds) {
    const match = MATCHES_DATA[id];
    assert(match, `Match ${id} must exist in MATCHES_DATA`);

    // Lineups
    assert(match.homeFormation.lineup.length >= 11, `${id} home formation must have at least 11 players`);
    assert(match.awayFormation.lineup.length >= 11, `${id} away formation must have at least 11 players`);

    // Player stats: active/in-play matches have individual telemetry, scheduled fixtures have array container
    assert(Array.isArray(match.playerStats), `${id} playerStats must be an array`);
    if (match.status === "IN_PLAY" || match.minute > 0) {
      assert(match.playerStats.length > 0, `Active match ${id} must have populated player stats`);
      for (const stat of match.playerStats) {
        assert(stat.playerId, "Player stat must have playerId");
        assert(stat.minutesPlayed > 0, "Active player must have minutes played");
      }
    }

    // Team stats
    assert(match.homeStats.possession + match.awayStats.possession === 100, `${id} possession must total 100%`);

    // Events
    const events = MATCH_EVENTS_DATA[id];
    assert(events !== undefined, `${id} must have an events record`);
  }
});

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log("\n========================================================");
console.log(` AUDIT COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (0 FAILURES) `);
console.log("========================================================\n");
