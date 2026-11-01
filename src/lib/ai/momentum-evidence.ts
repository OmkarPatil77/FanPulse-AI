import { MATCHES_DATA } from "@/data/matches";
import { calculateMomentumCurve, MomentumPoint } from "@/lib/football/momentum";
import { Match, MatchEvent } from "@/types/football";

export interface MomentumEvidenceReference {
  minute?: number;
  description: string;
  source: "momentum_curve" | "turning_point" | "match_event" | "team_statistics" | "heuristic_spec";
}

export interface MomentumTurningPoint {
  minute: number;
  eventType: string;
  eventTitle: string;
  initiatingTeamCode: string;
  direction: "TOWARD_HOME" | "TOWARD_AWAY";
  netScoreBefore: number;
  netScoreAfter: number;
  shiftDelta: number;
  isSustained: boolean;
  factualExplanation: string;
}

export interface MomentumEvidencePayload {
  matchContext: {
    matchId: string;
    fixtureLabel: string;
    competition: string;
    venue: string;
    status: string;
    minute: number;
    homeTeam: { id: string; name: string; code: string; score: number };
    awayTeam: { id: string; name: string; code: string; score: number };
    dataSource: "SIMULATED_DEMO_DATA";
  };
  currentMomentum: {
    currentMinute: number;
    netScore: number;
    homeTilt: number;
    awayTilt: number;
    classification: "HOME_ADVANTAGE" | "BALANCED" | "AWAY_ADVANTAGE";
    classificationThresholds: string;
    stabilityStatus: "SUSTAINED_ADVANTAGE" | "RECENT_EVENT_SURGE" | "NEUTRAL_EQUILIBRIUM";
    stabilityExplanation: string;
  };
  overallAnalysis: {
    averageHomeTilt: number;
    averageAwayTilt: number;
    peakPressureInterval: string;
    dominantTeam: "home" | "away" | "neutral";
    counterSwingCount: number;
  };
  turningPoints: MomentumTurningPoint[];
  chronologicalEvents: Array<{
    minute: number;
    teamCode: string;
    type: string;
    title: string;
    description: string;
    tacticalImpact?: string;
    momentumShiftDelta?: number;
  }>;
  phaseBreakdown: Array<{
    phase: string;
    averageNetScore: number;
    averageHomeTilt: number;
    predominantTeam: "home" | "away" | "balanced";
  }>;
  heuristicModelSpecs: {
    decayRatePerMinute: string;
    scoreRange: string;
    eventWeights: Record<string, string>;
    neutralBaseline: string;
  };
  dataLimitations: string[];
}

const MOMENTUM_DATA_LIMITATIONS = [
  "Illustrative heuristic model based on event weighting and a 7%/min exponential decay; not an official Premier League statistic.",
  "Not derived from continuous optical player tracking, camera coordinate feeds, or physical GPS tracking vests.",
  "Does not measure physical player sprint velocities, distance covered, or passing coordinate networks.",
  "Correlation between recorded match events and momentum swings does not establish unproven causal certitude.",
  "Illustrative match dataset for Premier League analytics.",
];

/**
 * Deterministically identifies turning points from momentum points and event history.
 */
export function identifyTurningPoints(
  points: MomentumPoint[],
  events: MatchEvent[],
  homeTeamId: string,
  homeTeamCode: string,
  awayTeamCode: string
): MomentumTurningPoint[] {
  if (!events || events.length === 0 || !points || points.length === 0) {
    return [];
  }

  const sortedEvents = [...events].sort((a, b) => {
    if (a.minute !== b.minute) return a.minute - b.minute;
    return (a.stoppageMinute ?? 0) - (b.stoppageMinute ?? 0);
  });

  const turningPoints: MomentumTurningPoint[] = [];

  for (const event of sortedEvents) {
    const m = event.minute;
    const pointCurrent = points.find((p) => p.minute === m);
    const pointPrev = points.find((p) => p.minute === Math.max(0, m - 1));

    const netBefore = pointPrev ? pointPrev.netScore : 0;
    const netAfter = pointCurrent ? pointCurrent.netScore : netBefore;
    const isHome = event.teamId.toLowerCase() === homeTeamId.toLowerCase();
    const teamCode = isHome ? homeTeamCode : awayTeamCode;

    // Check if event is significant: high delta (>= 15), Goal, Red Card, VAR Decision, or Tactical Shift
    const explicitDelta = event.momentumShiftDelta;
    const isHighImpact =
      ["GOAL", "RED_CARD", "VAR_DECISION", "TACTICAL_SHIFT"].includes(event.type) ||
      (explicitDelta !== undefined && Math.abs(explicitDelta) >= 15);

    if (isHighImpact) {
      // Evaluate if momentum stayed in the same direction for the next 5 minutes
      const futurePoint = points.find((p) => p.minute === Math.min(90, m + 5));
      const direction: "TOWARD_HOME" | "TOWARD_AWAY" =
        netAfter >= netBefore ? "TOWARD_HOME" : "TOWARD_AWAY";

      let isSustained = false;
      if (futurePoint) {
        if (direction === "TOWARD_HOME" && futurePoint.netScore > 10) isSustained = true;
        if (direction === "TOWARD_AWAY" && futurePoint.netScore < -10) isSustained = true;
      }

      const deltaValue = explicitDelta !== undefined ? explicitDelta : netAfter - netBefore;
      const signedDeltaStr = deltaValue > 0 ? `+${deltaValue}` : `${deltaValue}`;

      const explanation = `${event.title} at ${m}' shifted momentum ${signedDeltaStr} points (${direction === "TOWARD_HOME" ? homeTeamCode : awayTeamCode} directional flow, net score moved from ${netBefore} to ${netAfter}).`;

      turningPoints.push({
        minute: m,
        eventType: event.type,
        eventTitle: event.title,
        initiatingTeamCode: teamCode,
        direction,
        netScoreBefore: netBefore,
        netScoreAfter: netAfter,
        shiftDelta: deltaValue,
        isSustained,
        factualExplanation: explanation,
      });
    }
  }

  return turningPoints;
}

/**
 * Builds grounded momentum evidence payload for a specific match fixture.
 * Returns null if matchId is invalid or not in registry.
 */
export function buildMomentumEvidence(matchId: string): MomentumEvidencePayload | null {
  if (!matchId || typeof matchId !== "string") return null;

  const cleanMatchId = matchId.trim().toLowerCase();
  const match: Match | undefined = MATCHES_DATA[cleanMatchId];
  if (!match) return null;

  // Run deterministic calculation engine
  const momentumAnalysis = calculateMomentumCurve(
    match.events,
    match.homeTeam.id,
    match.awayTeam.id,
    match.id,
    90
  );

  const points = momentumAnalysis.points;
  const currentMinute = match.status === "IN_PLAY" ? Math.min(match.minute, 90) : 90;
  const currentPoint = points.find((p) => p.minute === currentMinute) || points[points.length - 1];

  const netScore = currentPoint ? currentPoint.netScore : 0;
  const homeTilt = currentPoint ? currentPoint.homeTilt : 50;
  const awayTilt = currentPoint ? currentPoint.awayTilt : 50;

  // Classify current momentum
  let classification: "HOME_ADVANTAGE" | "BALANCED" | "AWAY_ADVANTAGE" = "BALANCED";
  if (netScore > 15) {
    classification = "HOME_ADVANTAGE";
  } else if (netScore < -15) {
    classification = "AWAY_ADVANTAGE";
  }

  // Determine stability: check if netScore has been consistent for the prior 5 minutes
  const priorMinute = Math.max(0, currentMinute - 5);
  const priorPoint = points.find((p) => p.minute === priorMinute);
  const priorNet = priorPoint ? priorPoint.netScore : 0;

  let stabilityStatus: "SUSTAINED_ADVANTAGE" | "RECENT_EVENT_SURGE" | "NEUTRAL_EQUILIBRIUM" =
    "NEUTRAL_EQUILIBRIUM";
  let stabilityExplanation = "Momentum is fluctuating near the neutral baseline (±15 net score).";

  if (classification === "HOME_ADVANTAGE") {
    if (priorNet > 10) {
      stabilityStatus = "SUSTAINED_ADVANTAGE";
      stabilityExplanation = `${match.homeTeam.name} has maintained a sustained momentum advantage exceeding +15 over the past 5+ minutes.`;
    } else {
      stabilityStatus = "RECENT_EVENT_SURGE";
      stabilityExplanation = `${match.homeTeam.name} momentum surged recently from a baseline of ${priorNet} to ${netScore}.`;
    }
  } else if (classification === "AWAY_ADVANTAGE") {
    if (priorNet < -10) {
      stabilityStatus = "SUSTAINED_ADVANTAGE";
      stabilityExplanation = `${match.awayTeam.name} has maintained a sustained momentum advantage below -15 over the past 5+ minutes.`;
    } else {
      stabilityStatus = "RECENT_EVENT_SURGE";
      stabilityExplanation = `${match.awayTeam.name} momentum shifted recently from a baseline of ${priorNet} to ${netScore}.`;
    }
  }

  // Identify turning points
  const turningPoints = identifyTurningPoints(
    points,
    match.events,
    match.homeTeam.id,
    match.homeTeam.code,
    match.awayTeam.code
  );

  // Chronologically sorted events
  const chronologicalEvents = [...match.events]
    .sort((a, b) => {
      if (a.minute !== b.minute) return a.minute - b.minute;
      return (a.stoppageMinute ?? 0) - (b.stoppageMinute ?? 0);
    })
    .map((e) => ({
      minute: e.minute,
      teamCode: e.teamId === match.homeTeam.id ? match.homeTeam.code : match.awayTeam.code,
      type: e.type,
      title: e.title,
      description: e.description,
      tacticalImpact: e.tacticalImpact,
      momentumShiftDelta: e.momentumShiftDelta,
    }));

  // Phase breakdown (15-minute segments)
  const phases = [
    { name: "0' – 15' (Opening Phase)", start: 0, end: 15 },
    { name: "16' – 30' (Mid First Half)", start: 16, end: 30 },
    { name: "31' – 45' (Closing First Half)", start: 31, end: 45 },
    { name: "46' – 60' (Early Second Half)", start: 46, end: 60 },
    { name: "61' – 75' (Mid Second Half)", start: 61, end: 75 },
    { name: "76' – 90' (Closing Crunch)", start: 76, end: 90 },
  ];

  const phaseBreakdown = phases.map((phase) => {
    const phasePoints = points.filter((p) => p.minute >= phase.start && p.minute <= phase.end);
    const avgNet =
      phasePoints.length > 0
        ? Math.round((phasePoints.reduce((acc, p) => acc + p.netScore, 0) / phasePoints.length) * 10) / 10
        : 0;
    const avgTilt = Math.round(50 + avgNet / 2);
    let pred: "home" | "away" | "balanced" = "balanced";
    if (avgNet > 10) pred = "home";
    else if (avgNet < -10) pred = "away";

    return {
      phase: phase.name,
      averageNetScore: avgNet,
      averageHomeTilt: avgTilt,
      predominantTeam: pred,
    };
  });

  return {
    matchContext: {
      matchId: match.id,
      fixtureLabel: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      competition: "Premier League 2024/25",
      venue: match.fixture.venue,
      status: match.status,
      minute: match.minute,
      homeTeam: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        code: match.homeTeam.code,
        score: match.homeScore,
      },
      awayTeam: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        code: match.awayTeam.code,
        score: match.awayScore,
      },
      dataSource: "SIMULATED_DEMO_DATA",
    },
    currentMomentum: {
      currentMinute,
      netScore,
      homeTilt,
      awayTilt,
      classification,
      classificationThresholds: "Home Advantage: netScore > +15; Balanced: -15 to +15; Away Advantage: netScore < -15",
      stabilityStatus,
      stabilityExplanation,
    },
    overallAnalysis: {
      averageHomeTilt: momentumAnalysis.averageHomeTilt,
      averageAwayTilt: 100 - momentumAnalysis.averageHomeTilt,
      peakPressureInterval: momentumAnalysis.peakPressureInterval,
      dominantTeam: momentumAnalysis.dominantTeam,
      counterSwingCount: momentumAnalysis.counterSwingCount,
    },
    turningPoints,
    chronologicalEvents,
    phaseBreakdown,
    heuristicModelSpecs: {
      decayRatePerMinute: "7% decay toward 0 per inactive minute (decayFactor = 0.93)",
      scoreRange: "-95 (maximum away ascendancy) to +95 (maximum home ascendancy)",
      eventWeights: {
        GOAL: "+/- 30 points",
        SHOT_ON_TARGET: "+/- 12 points",
        SHOT: "+/- 6 points",
        CORNER: "+/- 8 points",
        TACTICAL_SHIFT: "+/- 10 points",
        VAR_DECISION: "+/- 15 points",
        YELLOW_CARD: "-5 points",
        RED_CARD: "-25 points",
      },
      neutralBaseline: "netScore = 0 (tilt: 50% home / 50% away)",
    },
    dataLimitations: MOMENTUM_DATA_LIMITATIONS,
  };
}
