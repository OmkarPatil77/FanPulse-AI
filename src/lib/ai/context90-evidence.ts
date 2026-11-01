import { MATCHES_DATA } from "@/data/matches";
import { calculateMomentumCurve } from "@/lib/football/momentum";
import { normalizePlayerMetricsPer90 } from "@/lib/football/player-performance";
import { Match, MatchEvent } from "@/types/football";

export interface EvidenceReference {
  minute?: number;
  description: string;
  source: "match_event" | "team_statistics" | "tactical_context" | "player_performance" | "momentum_indicator";
}

export interface MatchEvidencePayload {
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
  eventsTimeline: Array<{
    minute: number;
    stoppageMinute?: number;
    type: string;
    teamCode: string;
    title: string;
    description: string;
    tacticalImpact?: string;
    significance: string;
    momentumShiftDelta?: number;
  }>;
  teamStatistics: {
    home: {
      teamCode: string;
      possession: number;
      shots: number;
      shotsOnTarget: number;
      passesAttempted: number;
      passesCompleted: number;
      passAccuracy: number;
      corners: number;
      fouls: number;
      yellowCards: number;
      redCards: number;
      offsides: number;
    };
    away: {
      teamCode: string;
      possession: number;
      shots: number;
      shotsOnTarget: number;
      passesAttempted: number;
      passesCompleted: number;
      passAccuracy: number;
      corners: number;
      fouls: number;
      yellowCards: number;
      redCards: number;
      offsides: number;
    };
  };
  tacticalSetup: {
    homeFormation: string;
    awayFormation: string;
    headlineTactics: string;
    executiveRecap?: {
      title: string;
      tacticalBrief: string;
      keyObservations: string[];
    };
    homeLineup: Array<{ name: string; number: number; role: string; category: string }>;
    awayLineup: Array<{ name: string; number: number; role: string; category: string }>;
    substitutions: Array<{
      minute: number;
      teamCode: string;
      playerIn: string;
      playerOut: string;
      reason?: string;
    }>;
  };
  keyPlayerPerformances: Array<{
    name: string;
    teamCode: string;
    minutesPlayed: number;
    rating: string;
    goals: number;
    assists: number;
    shotsOnTarget: number;
    keyPasses: number;
    progressivePasses: number;
    progressiveCarries: number;
    tacklesWon: number;
    interceptions: number;
  }>;
  momentumSummary: {
    averageHomeTilt: number;
    averageAwayTilt: number;
    dominantTeam: "home" | "away" | "neutral";
    peakPressureInterval: string;
    counterSwingCount: number;
    methodologyNotice: string;
  };
  knownDataLimitations: string[];
}

/**
 * Builds a compact, structured evidence payload grounded in centralized match models.
 * Never invents statistics, players, or match events.
 */
export function buildMatchEvidence(matchId: string): MatchEvidencePayload | null {
  if (!matchId) return null;
  const match: Match | undefined = MATCHES_DATA[matchId.toLowerCase()];
  if (!match) {
    return null;
  }

  const homeCode = match.homeTeam.code;
  const awayCode = match.awayTeam.code;

  // 1. Match Events Timeline (Chronologically Sorted)
  const sortedEvents = [...match.events].sort((a, b) => {
    if (a.minute !== b.minute) return a.minute - b.minute;
    return (a.stoppageMinute ?? 0) - (b.stoppageMinute ?? 0);
  });

  const eventsTimeline = sortedEvents.map((ev: MatchEvent) => ({
    minute: ev.minute,
    stoppageMinute: ev.stoppageMinute,
    type: ev.type,
    teamCode: ev.teamId.toLowerCase() === match.homeTeam.id.toLowerCase() ? homeCode : awayCode,
    title: ev.title,
    description: ev.description,
    tacticalImpact: ev.tacticalImpact,
    significance: ev.significance,
    momentumShiftDelta: ev.momentumShiftDelta,
  }));

  // 2. Tactical Lineups
  const homeLineup = match.homeFormation.lineup.map((lp) => ({
    name: lp.player.name,
    number: lp.player.number,
    role: lp.player.primaryRole,
    category: lp.player.positionCategory,
  }));

  const awayLineup = match.awayFormation.lineup.map((lp) => ({
    name: lp.player.name,
    number: lp.player.number,
    role: lp.player.primaryRole,
    category: lp.player.positionCategory,
  }));

  const substitutions = match.substitutions.map((sub) => {
    const isHome = sub.teamId.toLowerCase() === match.homeTeam.id.toLowerCase();
    const lineup = isHome ? match.homeFormation.lineup : match.awayFormation.lineup;
    const playerIn = lineup.find((lp) => lp.playerId === sub.playerInId)?.player.name || sub.playerInId;
    const playerOut = lineup.find((lp) => lp.playerId === sub.playerOutId)?.player.name || sub.playerOutId;
    return {
      minute: sub.minute,
      teamCode: isHome ? homeCode : awayCode,
      playerIn,
      playerOut,
      reason: sub.reason,
    };
  });

  // 3. Key Player Performance Index
  const keyPlayerPerformances = match.playerStats.map((stat) => {
    const isHome = stat.teamId.toLowerCase() === match.homeTeam.id.toLowerCase();
    const lineup = isHome ? match.homeFormation.lineup : match.awayFormation.lineup;
    const player = lineup.find((lp) => lp.playerId === stat.playerId)?.player;
    const playerName = player ? player.name : stat.playerId;
    const normalized = normalizePlayerMetricsPer90(stat);

    return {
      name: playerName,
      teamCode: isHome ? homeCode : awayCode,
      minutesPlayed: stat.minutesPlayed,
      rating: normalized.rating,
      goals: stat.goals ?? 0,
      assists: stat.assists ?? 0,
      shotsOnTarget: stat.shotsOnTarget ?? 0,
      keyPasses: stat.keyPasses ?? 0,
      progressivePasses: stat.progressivePasses ?? 0,
      progressiveCarries: stat.progressiveCarries ?? 0,
      tacklesWon: stat.tacklesWon ?? 0,
      interceptions: stat.interceptions ?? 0,
    };
  });

  // 4. Momentum Analysis
  const momentum = calculateMomentumCurve(
    match.events,
    match.homeTeam.id,
    match.awayTeam.id,
    match.id,
    90
  );

  return {
    matchContext: {
      matchId: match.id,
      fixtureLabel: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      competition: match.fixture.competition,
      venue: match.fixture.venue,
      status: match.status,
      minute: match.minute,
      homeTeam: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        code: homeCode,
        score: match.homeScore,
      },
      awayTeam: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        code: awayCode,
        score: match.awayScore,
      },
      dataSource: "SIMULATED_DEMO_DATA",
    },
    eventsTimeline,
    teamStatistics: {
      home: {
        teamCode: homeCode,
        possession: match.homeStats.possession,
        shots: match.homeStats.shots,
        shotsOnTarget: match.homeStats.shotsOnTarget,
        passesAttempted: match.homeStats.passesAttempted,
        passesCompleted: match.homeStats.passesCompleted,
        passAccuracy: match.homeStats.passAccuracy,
        corners: match.homeStats.corners,
        fouls: match.homeStats.fouls,
        yellowCards: match.homeStats.yellowCards,
        redCards: match.homeStats.redCards,
        offsides: match.homeStats.offsides,
      },
      away: {
        teamCode: awayCode,
        possession: match.awayStats.possession,
        shots: match.awayStats.shots,
        shotsOnTarget: match.awayStats.shotsOnTarget,
        passesAttempted: match.awayStats.passesAttempted,
        passesCompleted: match.awayStats.passesCompleted,
        passAccuracy: match.awayStats.passAccuracy,
        corners: match.awayStats.corners,
        fouls: match.awayStats.fouls,
        yellowCards: match.awayStats.yellowCards,
        redCards: match.awayStats.redCards,
        offsides: match.awayStats.offsides,
      },
    },
    tacticalSetup: {
      homeFormation: match.homeFormation.name,
      awayFormation: match.awayFormation.name,
      headlineTactics: match.fixture.headlineTactics,
      executiveRecap: match.executiveRecap,
      homeLineup,
      awayLineup,
      substitutions,
    },
    keyPlayerPerformances,
    momentumSummary: {
      averageHomeTilt: momentum.averageHomeTilt,
      averageAwayTilt: 100 - momentum.averageHomeTilt,
      dominantTeam: momentum.dominantTeam,
      peakPressureInterval: momentum.peakPressureInterval,
      counterSwingCount: momentum.counterSwingCount,
      methodologyNotice:
        "Event-based momentum indicator calculated from event weights and 7%/min decay. Represents flow velocity, not optical tracking field tilt.",
    },
    knownDataLimitations: [
      "Illustrative match dataset (Matchweek 10 schedule).",
      "No optical camera tracking or high-frequency player GPS coordinate tracking.",
      "Momentum is an event-weighted heuristic model, not optical final-third touch tilt.",
      "Substitutions and tactical shifts are limited to officially recorded telemetry milestones.",
    ],
  };
}
