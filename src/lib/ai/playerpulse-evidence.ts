import { MATCHES_DATA } from "@/data/matches";
import { PLAYERS_DATA } from "@/data/players";
import {
  calculatePlayerPerformanceScore,
  normalizePlayerMetricsPer90,
  NormalizedPlayerMetrics,
} from "@/lib/football/player-performance";
import { Match, Player, PlayerMatchStatistics } from "@/types/football";

export interface PlayerPulseEvidenceReference {
  minute?: number;
  description: string;
  source: "player_metric" | "player_event" | "performance_index" | "role_context" | "team_context";
}

export interface PlayerPulseEvidencePayload {
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
  playerProfile: {
    id: string;
    name: string;
    shortName: string;
    number: number;
    teamId: string;
    teamName: string;
    teamCode: string;
    positionCategory: "GK" | "DEF" | "MID" | "FWD";
    primaryRole: string;
    isCaptain: boolean;
    lineupCoordinate?: { x: number; y: number; role: string };
  };
  performanceSummary: {
    hasDetailedStats: boolean;
    minutesPlayed: number;
    heuristicPerformanceScore: number;
    ratingFormatted: string;
    scoringFormulaExplanation: string;
  };
  rawStatistics?: {
    goals: number;
    assists: number;
    shots: number;
    shotsOnTarget: number;
    passesAttempted: number;
    passesCompleted: number;
    passAccuracy: number;
    keyPasses: number;
    progressivePasses: number;
    progressiveCarries: number;
    finalThirdPassesAttempted: number;
    finalThirdPassesCompleted: number;
    finalThirdPassAccuracy: number;
    tacklesWon: number;
    interceptions: number;
    clearances: number;
    groundDuelsContested: number;
    groundDuelsWon: number;
    groundDuelWinRate: number;
    aerialDuelsContested: number;
    aerialDuelsWon: number;
    aerialDuelWinRate: number;
    foulsCommitted: number;
    foulsDrawn: number;
    yellowCards: number;
    redCards: number;
  };
  normalizedPer90?: NormalizedPlayerMetrics["per90"];
  playerEvents: Array<{
    minute: number;
    type: string;
    title: string;
    description: string;
    roleInEvent: "PRIMARY" | "SECONDARY";
    tacticalImpact?: string;
  }>;
  teamContext: {
    possession: number;
    fieldTilt: number;
    totalPassesCompleted: number;
    totalShots: number;
  };
  dataLimitations: string[];
}

const PLAYER_DATA_LIMITATIONS = [
  "Performance score is an illustrative project heuristic (base 6.00 + goals/assists/duels - discipline), not an official Premier League rating.",
  "No continuous optical player tracking, camera coordinate feeds, or physical GPS tracking vests.",
  "No physical player sprint speeds (km/h), distance covered (km), or off-ball running intensity.",
  "Only available match counting metrics and registered events are used.",
  "Illustrative match dataset for Premier League analytics.",
];

/**
 * Builds grounded player performance evidence payload for a specific player in a specific match.
 * Returns null if matchId or playerId is invalid or not in match roster.
 */
export function buildPlayerPulseEvidence(
  matchId: string,
  playerId: string
): PlayerPulseEvidencePayload | null {
  if (!matchId || typeof matchId !== "string" || !playerId || typeof playerId !== "string") {
    return null;
  }

  const cleanMatchId = matchId.trim().toLowerCase();
  const cleanPlayerId = playerId.trim().toLowerCase();

  const match: Match | undefined = MATCHES_DATA[cleanMatchId];
  if (!match) return null;

  // Check if player is part of home lineup, away lineup, or substitutions
  const homeLp = match.homeFormation.lineup.find((lp) => lp.player.id === cleanPlayerId);
  const awayLp = match.awayFormation.lineup.find((lp) => lp.player.id === cleanPlayerId);
  const subRecord = match.substitutions.find(
    (s) => s.playerInId === cleanPlayerId || s.playerOutId === cleanPlayerId
  );
  const recordedStat = match.playerStats.find((s) => s.playerId === cleanPlayerId);

  // If player is not associated with this match in any way, reject
  if (!homeLp && !awayLp && !subRecord && !recordedStat) {
    return null;
  }

  // Resolve player profile
  const player: Player | undefined = PLAYERS_DATA[cleanPlayerId] || homeLp?.player || awayLp?.player;
  if (!player) return null;

  const isHome = player.teamId === match.homeTeam.id;
  const team = isHome ? match.homeTeam : match.awayTeam;
  const teamStats = isHome ? match.homeStats : match.awayStats;
  const lp = homeLp || awayLp;

  // Resolve player match statistics
  const stats: PlayerMatchStatistics | undefined = recordedStat;
  const hasDetailedStats = Boolean(stats && (stats.minutesPlayed ?? 0) > 0);

  let minutesPlayed = 0;
  let score = 6.0;
  let normalizedPer90: NormalizedPlayerMetrics["per90"] | undefined = undefined;
  let rawStatsObj: PlayerPulseEvidencePayload["rawStatistics"] = undefined;

  if (stats && hasDetailedStats) {
    minutesPlayed = stats.minutesPlayed;
    score = calculatePlayerPerformanceScore(stats);
    normalizedPer90 = normalizePlayerMetricsPer90(stats).per90;

    const passAttempted = stats.passesAttempted ?? 0;
    const passCompleted = stats.passesCompleted ?? 0;
    const passAccuracy = passAttempted > 0 ? Math.round((passCompleted / passAttempted) * 1000) / 10 : 0;

    const ftAttempted = stats.finalThirdPassesAttempted ?? 0;
    const ftCompleted = stats.finalThirdPassesCompleted ?? 0;
    const ftAccuracy = ftAttempted > 0 ? Math.round((ftCompleted / ftAttempted) * 1000) / 10 : 0;

    const groundContested = stats.groundDuelsContested ?? 0;
    const groundWon = stats.groundDuelsWon ?? 0;
    const groundDuelWinRate = groundContested > 0 ? Math.round((groundWon / groundContested) * 1000) / 10 : 0;

    const aerialContested = stats.aerialDuelsContested ?? 0;
    const aerialWon = stats.aerialDuelsWon ?? 0;
    const aerialDuelWinRate = aerialContested > 0 ? Math.round((aerialWon / aerialContested) * 1000) / 10 : 0;

    rawStatsObj = {
      goals: stats.goals ?? 0,
      assists: stats.assists ?? 0,
      shots: stats.shots ?? 0,
      shotsOnTarget: stats.shotsOnTarget ?? 0,
      passesAttempted: passAttempted,
      passesCompleted: passCompleted,
      passAccuracy,
      keyPasses: stats.keyPasses ?? 0,
      progressivePasses: stats.progressivePasses ?? 0,
      progressiveCarries: stats.progressiveCarries ?? 0,
      finalThirdPassesAttempted: ftAttempted,
      finalThirdPassesCompleted: ftCompleted,
      finalThirdPassAccuracy: ftAccuracy,
      tacklesWon: stats.tacklesWon ?? 0,
      interceptions: stats.interceptions ?? 0,
      clearances: stats.clearances ?? 0,
      groundDuelsContested: groundContested,
      groundDuelsWon: groundWon,
      groundDuelWinRate,
      aerialDuelsContested: aerialContested,
      aerialDuelsWon: aerialWon,
      aerialDuelWinRate,
      foulsCommitted: stats.foulsCommitted ?? 0,
      foulsDrawn: stats.foulsDrawn ?? 0,
      yellowCards: stats.yellowCards ?? 0,
      redCards: stats.redCards ?? 0,
    };
  } else if (lp) {
    // Starting lineup player without granular boxscore (e.g. scheduled game or defensive player without boxscore)
    minutesPlayed = match.status === "IN_PLAY" ? match.minute : 0;
    score = 6.0;
  }

  // Filter player-linked match events
  const playerEvents = match.events
    .filter((e) => e.playerId === cleanPlayerId || e.secondaryPlayerId === cleanPlayerId)
    .sort((a, b) => {
      if (a.minute !== b.minute) return a.minute - b.minute;
      return (a.stoppageMinute ?? 0) - (b.stoppageMinute ?? 0);
    })
    .map((e) => ({
      minute: e.minute,
      type: e.type,
      title: e.title,
      description: e.description,
      roleInEvent: e.playerId === cleanPlayerId ? ("PRIMARY" as const) : ("SECONDARY" as const),
      tacticalImpact: e.tacticalImpact,
    }));

  const limitations = [...PLAYER_DATA_LIMITATIONS];
  if (!hasDetailedStats) {
    limitations.push(
      "Detailed boxscore telemetry was not recorded for this player in this fixture; performance defaults to neutral 6.00 baseline."
    );
  }

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
    playerProfile: {
      id: player.id,
      name: player.name,
      shortName: player.shortName,
      number: player.number,
      teamId: player.teamId,
      teamName: team.name,
      teamCode: team.code,
      positionCategory: player.positionCategory,
      primaryRole: player.primaryRole,
      isCaptain: lp?.isCaptain ?? false,
      lineupCoordinate: lp ? { x: lp.coordinate.x, y: lp.coordinate.y, role: lp.coordinate.role } : undefined,
    },
    performanceSummary: {
      hasDetailedStats,
      minutesPlayed,
      heuristicPerformanceScore: score,
      ratingFormatted: score.toFixed(2),
      scoringFormulaExplanation:
        "Base 6.00 + Goals (+1.0), Assists (+0.6), Key Passes (+0.2), Progressive Actions (+0.04), Tackles/Interceptions (+0.15), Duel Rates (+0.25) - Discipline (-0.4 yellow, -1.5 red). Clamped to [4.00, 10.00].",
    },
    rawStatistics: rawStatsObj,
    normalizedPer90,
    playerEvents,
    teamContext: {
      possession: teamStats.possession,
      fieldTilt: teamStats.fieldTilt,
      totalPassesCompleted: teamStats.passesCompleted,
      totalShots: teamStats.shots,
    },
    dataLimitations: limitations,
  };
}
