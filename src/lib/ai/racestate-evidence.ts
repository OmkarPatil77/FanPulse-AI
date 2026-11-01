import { Match, LeagueStanding, ScenarioOutcome, QualificationZone, FormResult } from "@/types/football";
import { MATCHES_DATA } from "@/data/matches";
import { RAW_STANDINGS_DATA } from "@/data/standings";
import { calculateStandings } from "@/lib/football/standings";
import { calculateMatchScenarios } from "@/lib/football/scenarios";

export interface RaceStateEvidenceReference {
  position?: number;
  teamCode?: string;
  teamName?: string;
  description: string;
  source: "baseline_standings" | "scenario_outcome" | "zone_boundary" | "tie_breaker" | "mathematical_buffer";
}

export interface DeterministicInsight {
  category: "FACT" | "SCENARIO" | "INTERPRETATION";
  title: string;
  detail: string;
  relatedScenarioId?: "home-win" | "draw" | "away-win";
}

export interface RaceStateEvidencePayload {
  matchContext: {
    matchId: string;
    fixtureLabel: string;
    competition: string;
    season: string;
    matchweek: number;
    matchweekLabel: string;
    venue: string;
    status: Match["status"];
    homeTeam: {
      id: string;
      name: string;
      code: string;
      baselinePosition: number;
      baselinePoints: number;
      baselineGD: number;
      baselinePlayed: number;
      baselineWon: number;
      baselineDrawn: number;
      baselineLost: number;
      baselineForm: FormResult[];
      baselineZone: QualificationZone;
    };
    awayTeam: {
      id: string;
      name: string;
      code: string;
      baselinePosition: number;
      baselinePoints: number;
      baselineGD: number;
      baselinePlayed: number;
      baselineWon: number;
      baselineDrawn: number;
      baselineLost: number;
      baselineForm: FormResult[];
      baselineZone: QualificationZone;
    };
    dataSource: "SIMULATED_DEMO_DATA";
  };
  baselineStandingsSummary: {
    totalClubs: number;
    leader: { name: string; code: string; points: number; gd: number; position: number };
    topFourBoundary: {
      fourthPlace: { name: string; code: string; points: number; gd: number };
      fifthPlace: { name: string; code: string; points: number; gd: number };
      bufferPoints: number;
    };
    europeanBoundary: {
      sixthPlace: { name: string; code: string; points: number; gd: number };
      seventhPlace: { name: string; code: string; points: number; gd: number };
      bufferPoints: number;
    };
    relegationBoundary: {
      seventeenthPlace: { name: string; code: string; points: number; gd: number };
      eighteenthPlace: { name: string; code: string; points: number; gd: number };
      bufferPoints: number;
    };
    tieBreakerRules: string[];
    table: Array<{
      position: number;
      teamId: string;
      teamName: string;
      code: string;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: number;
      points: number;
      zone: QualificationZone;
    }>;
  };
  scenarios: Array<{
    scenarioId: "home-win" | "draw" | "away-win";
    label: string;
    description: string;
    projectedHomeScore: number;
    projectedAwayScore: number;
    isHypotheticalModelInput: boolean;
    homeImpact: {
      teamName: string;
      code: string;
      previousPosition: number;
      newPosition: number;
      positionDelta: number; // positive = climbed, negative = dropped, 0 = unchanged
      previousPoints: number;
      newPoints: number;
      pointsGained: number;
      previousGD: number;
      newGD: number;
      gdShift: number;
      previousZone: QualificationZone;
      newZone: QualificationZone;
      zoneTransition: string;
    };
    awayImpact: {
      teamName: string;
      code: string;
      previousPosition: number;
      newPosition: number;
      positionDelta: number;
      previousPoints: number;
      newPoints: number;
      pointsGained: number;
      previousGD: number;
      newGD: number;
      gdShift: number;
      previousZone: QualificationZone;
      newZone: QualificationZone;
      zoneTransition: string;
    };
    thirdPartyDisplacements: Array<{
      teamName: string;
      code: string;
      previousPosition: number;
      newPosition: number;
      positionDelta: number;
    }>;
  }>;
  deterministicInsights: DeterministicInsight[];
  dataLimitations: string[];
}

const RACESTATE_DATA_LIMITATIONS = [
  "Standings calculations and what-if scenario displacements are derived from an illustrative Matchweek 9 baseline dataset.",
  "Projected scenario scorelines (Home Win 2-1, Draw 1-1, Away Win 0-1) are fixed hypothetical inputs designed for table displacement modeling, NOT predictive betting odds or machine-learning forecasts.",
  "No title-winning probabilities, Champions League qualification odds, or relegation percentages exist in this deterministic dataset.",
  "A single match outcome does not mathematically guarantee or foreclose any club's final end-of-season finishing position.",
  "Tie-breaking criteria strictly follow official Premier League regulations: 1. Total Points, 2. Goal Difference, 3. Goals For, 4. Team Name (alphabetical).",
];

function getZoneLabel(zone: QualificationZone): string {
  switch (zone) {
    case "ucl":
      return "UEFA Champions League (Positions 1-4)";
    case "uel":
      return "UEFA Europa League (Position 5)";
    case "uecl":
      return "UEFA Conference League (Position 6)";
    case "relegation":
      return "Relegation Zone (Positions 18-20)";
    case "safe":
    default:
      return "Mid-Table Safety (Positions 7-17)";
  }
}

function describeZoneTransition(
  teamName: string,
  prevZone: QualificationZone,
  newZone: QualificationZone,
  newPos: number
): string {
  if (prevZone === newZone) {
    if (newZone === "ucl") return `${teamName} maintains UEFA Champions League standing (Pos #${newPos}).`;
    if (newZone === "relegation") return `${teamName} remains in the relegation zone (Pos #${newPos}).`;
    if (newZone === "uel" || newZone === "uecl") return `${teamName} maintains secondary European qualification (Pos #${newPos}).`;
    return `${teamName} remains in mid-table (Pos #${newPos}).`;
  }

  return `${teamName} transitions from ${getZoneLabel(prevZone)} into ${getZoneLabel(newZone)} at Pos #${newPos}.`;
}

/**
 * Builds grounded league table and scenario evidence payload for the RaceState module.
 * Returns null if matchId is unknown or invalid.
 */
export function buildRaceStateEvidence(matchId: string): RaceStateEvidencePayload | null {
  if (!matchId || typeof matchId !== "string") {
    return null;
  }

  const cleanMatchId = matchId.trim().toLowerCase();
  const match: Match | undefined = MATCHES_DATA[cleanMatchId];
  if (!match) {
    return null;
  }

  // Calculate baseline standings
  const baselineTable: LeagueStanding[] = calculateStandings(RAW_STANDINGS_DATA);
  if (!baselineTable || baselineTable.length < 20) {
    return null;
  }

  const baseHome = baselineTable.find((s) => s.teamId === match.homeTeam.id);
  const baseAway = baselineTable.find((s) => s.teamId === match.awayTeam.id);
  if (!baseHome || !baseAway) {
    return null;
  }

  // Calculate deterministic scenarios using existing engine
  const scenarioOutcomes: ScenarioOutcome[] = calculateMatchScenarios(match, RAW_STANDINGS_DATA);

  // Summarize key league boundaries
  const leader = baselineTable[0];
  const fourth = baselineTable[3];
  const fifth = baselineTable[4];
  const sixth = baselineTable[5];
  const seventh = baselineTable[6];
  const seventeenth = baselineTable[16];
  const eighteenth = baselineTable[17];

  const uclBuffer = fourth && fifth ? fourth.points - fifth.points : 0;
  const europeBuffer = sixth && seventh ? sixth.points - seventh.points : 0;
  const relegationBuffer = seventeenth && eighteenth ? seventeenth.points - eighteenth.points : 0;

  // Process scenarios with third-party displacement tracking
  const processedScenarios = scenarioOutcomes.map((scen) => {
    const homeNew = scen.tableSnapshot.find((s) => s.teamId === match.homeTeam.id)!;
    const awayNew = scen.tableSnapshot.find((s) => s.teamId === match.awayTeam.id)!;

    const homeDelta = baseHome.position - homeNew.position;
    const awayDelta = baseAway.position - awayNew.position;

    // Identify third-party teams displaced by this match outcome
    const thirdPartyDisplacements = scen.tableSnapshot
      .filter((s) => s.teamId !== match.homeTeam.id && s.teamId !== match.awayTeam.id)
      .map((s) => {
        const base = baselineTable.find((b) => b.teamId === s.teamId);
        const prevPos = base?.position ?? s.position;
        return {
          teamName: s.team.name,
          code: s.team.code,
          previousPosition: prevPos,
          newPosition: s.position,
          positionDelta: prevPos - s.position,
        };
      })
      .filter((t) => t.previousPosition !== t.newPosition);

    return {
      scenarioId: scen.scenarioId,
      label: scen.label,
      description: scen.description,
      projectedHomeScore: scen.projectedHomeScore,
      projectedAwayScore: scen.projectedAwayScore,
      isHypotheticalModelInput: true,
      homeImpact: {
        teamName: match.homeTeam.name,
        code: match.homeTeam.code,
        previousPosition: baseHome.position,
        newPosition: homeNew.position,
        positionDelta: homeDelta,
        previousPoints: baseHome.points,
        newPoints: homeNew.points,
        pointsGained: homeNew.points - baseHome.points,
        previousGD: baseHome.goalDifference,
        newGD: homeNew.goalDifference,
        gdShift: homeNew.goalDifference - baseHome.goalDifference,
        previousZone: baseHome.zone,
        newZone: homeNew.zone,
        zoneTransition: describeZoneTransition(match.homeTeam.name, baseHome.zone, homeNew.zone, homeNew.position),
      },
      awayImpact: {
        teamName: match.awayTeam.name,
        code: match.awayTeam.code,
        previousPosition: baseAway.position,
        newPosition: awayNew.position,
        positionDelta: awayDelta,
        previousPoints: baseAway.points,
        newPoints: awayNew.points,
        pointsGained: awayNew.points - baseAway.points,
        previousGD: baseAway.goalDifference,
        newGD: awayNew.goalDifference,
        gdShift: awayNew.goalDifference - baseAway.goalDifference,
        previousZone: baseAway.zone,
        newZone: awayNew.zone,
        zoneTransition: describeZoneTransition(match.awayTeam.name, baseAway.zone, awayNew.zone, awayNew.position),
      },
      thirdPartyDisplacements,
    };
  });

  // Build rigorous deterministic insights
  const deterministicInsights: DeterministicInsight[] = [];

  // FACT 1: Points gap & baseline table position
  const pointsGap = Math.abs(baseHome.points - baseAway.points);
  const higherRanked = baseHome.position < baseAway.position ? baseHome : baseAway;
  const lowerRanked = baseHome.position < baseAway.position ? baseAway : baseHome;

  if (baseHome.points === baseAway.points) {
    deterministicInsights.push({
      category: "FACT",
      title: "Clubs Level on Points in Baseline Table",
      detail: `${baseHome.team.name} (Pos #${baseHome.position}) and ${baseAway.team.name} (Pos #${baseAway.position}) enter the fixture dead-level on ${baseHome.points} points, separated strictly by goal difference (${baseHome.goalDifference > 0 ? `+${baseHome.goalDifference}` : baseHome.goalDifference} vs ${baseAway.goalDifference > 0 ? `+${baseAway.goalDifference}` : baseAway.goalDifference}).`,
    });
  } else {
    deterministicInsights.push({
      category: "FACT",
      title: "Current Baseline Points Separation",
      detail: `${higherRanked.team.name} leads ${lowerRanked.team.name} by ${pointsGap} point${pointsGap > 1 ? "s" : ""} in the baseline standings (${higherRanked.points} pts vs ${lowerRanked.points} pts).`,
    });
  }

  // FACT 2: Proximity to key zones (Title, UCL, Relegation)
  if (baseHome.position <= 4 || baseAway.position <= 4) {
    deterministicInsights.push({
      category: "FACT",
      title: "Top-Four Champions League Buffer",
      detail: `4th-place ${fourth.team.name} holds ${fourth.points} points with a ${uclBuffer}-point cushion over 5th-place ${fifth.team.name} (${fifth.points} pts).`,
    });
  }

  if (baseHome.position >= 15 || baseAway.position >= 15) {
    deterministicInsights.push({
      category: "FACT",
      title: "Relegation Safety Margin",
      detail: `17th-place ${seventeenth.team.name} holds ${seventeenth.points} points, maintaining a ${relegationBuffer}-point safety gap above 18th-place ${eighteenth.team.name} (${eighteenth.points} pts).`,
    });
  }

  // SCENARIO INSIGHTS: Evaluate projected moves
  const homeWinScen = processedScenarios.find((s) => s.scenarioId === "home-win");
  const drawScen = processedScenarios.find((s) => s.scenarioId === "draw");
  const awayWinScen = processedScenarios.find((s) => s.scenarioId === "away-win");

  if (homeWinScen) {
    const { homeImpact, awayImpact, thirdPartyDisplacements } = homeWinScen;
    const displacedText =
      thirdPartyDisplacements.length > 0
        ? ` Displaces ${thirdPartyDisplacements.map((t) => `${t.teamName} (${t.previousPosition} → ${t.newPosition})`).join(", ")}.`
        : "";

    deterministicInsights.push({
      category: "SCENARIO",
      title: `Scenario Impact: ${match.homeTeam.name} Win`,
      detail: `${match.homeTeam.name} gains 3 points (advancing to ${homeImpact.newPoints} pts, Pos #${homeImpact.newPosition}). ${match.awayTeam.name} stays on ${awayImpact.newPoints} pts (Pos #${awayImpact.newPosition}).${displacedText}`,
      relatedScenarioId: "home-win",
    });
  }

  if (drawScen) {
    const { homeImpact, awayImpact } = drawScen;
    deterministicInsights.push({
      category: "SCENARIO",
      title: "Scenario Impact: Shared Points Draw",
      detail: `Both sides gain 1 point. ${match.homeTeam.name} moves to ${homeImpact.newPoints} pts (Pos #${homeImpact.newPosition}); ${match.awayTeam.name} moves to ${awayImpact.newPoints} pts (Pos #${awayImpact.newPosition}). Net GD delta is 0 for both teams.`,
      relatedScenarioId: "draw",
    });
  }

  if (awayWinScen) {
    const { homeImpact, awayImpact, thirdPartyDisplacements } = awayWinScen;
    const displacedText =
      thirdPartyDisplacements.length > 0
        ? ` Displaces ${thirdPartyDisplacements.map((t) => `${t.teamName} (${t.previousPosition} → ${t.newPosition})`).join(", ")}.`
        : "";

    deterministicInsights.push({
      category: "SCENARIO",
      title: `Scenario Impact: ${match.awayTeam.name} Away Victory`,
      detail: `${match.awayTeam.name} claims 3 away points (advancing to ${awayImpact.newPoints} pts, Pos #${awayImpact.newPosition}). ${match.homeTeam.name} remains on ${homeImpact.newPoints} pts (Pos #${homeImpact.newPosition}).${displacedText}`,
      relatedScenarioId: "away-win",
    });
  }

  // INTERPRETATION: Broad race context
  deterministicInsights.push({
    category: "INTERPRETATION",
    title: "Fixture Stakes in the Wider League Picture",
    detail: `With ${match.fixture.matchweekLabel} underway, points earned or dropped in head-to-head encounters alter mathematical point buffers between tier contenders. However, as 29 matchweeks remain in the season, this fixture does not mathematically finalize any qualification or relegation outcomes.`,
  });

  return {
    matchContext: {
      matchId: match.id,
      fixtureLabel: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      competition: "Premier League 2026/27",
      season: "2026/27",
      matchweek: match.fixture.matchweek,
      matchweekLabel: match.fixture.matchweekLabel,
      venue: match.fixture.venue,
      status: match.status,
      homeTeam: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        code: match.homeTeam.code,
        baselinePosition: baseHome.position,
        baselinePoints: baseHome.points,
        baselineGD: baseHome.goalDifference,
        baselinePlayed: baseHome.played,
        baselineWon: baseHome.won,
        baselineDrawn: baseHome.drawn,
        baselineLost: baseHome.lost,
        baselineForm: baseHome.form,
        baselineZone: baseHome.zone,
      },
      awayTeam: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        code: match.awayTeam.code,
        baselinePosition: baseAway.position,
        baselinePoints: baseAway.points,
        baselineGD: baseAway.goalDifference,
        baselinePlayed: baseAway.played,
        baselineWon: baseAway.won,
        baselineDrawn: baseAway.drawn,
        baselineLost: baseAway.lost,
        baselineForm: baseAway.form,
        baselineZone: baseAway.zone,
      },
      dataSource: "SIMULATED_DEMO_DATA",
    },
    baselineStandingsSummary: {
      totalClubs: baselineTable.length,
      leader: {
        name: leader.team.name,
        code: leader.team.code,
        points: leader.points,
        gd: leader.goalDifference,
        position: leader.position,
      },
      topFourBoundary: {
        fourthPlace: {
          name: fourth.team.name,
          code: fourth.team.code,
          points: fourth.points,
          gd: fourth.goalDifference,
        },
        fifthPlace: {
          name: fifth.team.name,
          code: fifth.team.code,
          points: fifth.points,
          gd: fifth.goalDifference,
        },
        bufferPoints: uclBuffer,
      },
      europeanBoundary: {
        sixthPlace: {
          name: sixth.team.name,
          code: sixth.team.code,
          points: sixth.points,
          gd: sixth.goalDifference,
        },
        seventhPlace: {
          name: seventh.team.name,
          code: seventh.team.code,
          points: seventh.points,
          gd: seventh.goalDifference,
        },
        bufferPoints: europeBuffer,
      },
      relegationBoundary: {
        seventeenthPlace: {
          name: seventeenth.team.name,
          code: seventeenth.team.code,
          points: seventeenth.points,
          gd: seventeenth.goalDifference,
        },
        eighteenthPlace: {
          name: eighteenth.team.name,
          code: eighteenth.team.code,
          points: eighteenth.points,
          gd: eighteenth.goalDifference,
        },
        bufferPoints: relegationBuffer,
      },
      tieBreakerRules: [
        "1. Points (Descending)",
        "2. Goal Difference (Descending)",
        "3. Goals For (Descending)",
        "4. Team Name (Alphabetical A-Z)",
      ],
      table: baselineTable.map((s) => ({
        position: s.position,
        teamId: s.teamId,
        teamName: s.team.name,
        code: s.team.code,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDifference: s.goalDifference,
        points: s.points,
        zone: s.zone,
      })),
    },
    scenarios: processedScenarios,
    deterministicInsights,
    dataLimitations: RACESTATE_DATA_LIMITATIONS,
  };
}
