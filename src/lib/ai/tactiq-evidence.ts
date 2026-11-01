import { MATCHES_DATA } from "@/data/matches";
import { PLAYERS_DATA } from "@/data/players";
import { Match } from "@/types/football";

export interface TacticalEvidenceReference {
  minute?: number;
  description: string;
  source: "formation" | "player_role" | "tactical_shift" | "match_event" | "team_statistics";
}

export interface TactiQEvidencePayload {
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
  formations: {
    home: {
      name: string;
      lineCounts: { gk: number; def: number; mid: number; fwd: number };
      players: Array<{
        name: string;
        shortName: string;
        number: number;
        positionCategory: string;
        role: string;
        coordinates: { x: number; y: number };
        isCaptain: boolean;
      }>;
    };
    away: {
      name: string;
      lineCounts: { gk: number; def: number; mid: number; fwd: number };
      players: Array<{
        name: string;
        shortName: string;
        number: number;
        positionCategory: string;
        role: string;
        coordinates: { x: number; y: number };
        isCaptain: boolean;
      }>;
    };
    comparison: {
      defenseDifference: string;
      midfieldDifference: string;
      forwardDifference: string;
      numericalSummary: string;
    };
  };
  recordedTacticalShifts: Array<{
    minute: number;
    teamCode: string;
    type: string;
    title: string;
    description: string;
    tacticalImpact?: string;
  }>;
  decisiveEvents: Array<{
    minute: number;
    teamCode: string;
    type: string;
    title: string;
    description: string;
    tacticalImpact?: string;
  }>;
  substitutions: Array<{
    minute: number;
    teamCode: string;
    playerIn: string;
    playerOut: string;
    reason?: string;
  }>;
  teamStatistics: {
    home: {
      teamCode: string;
      possession: number;
      fieldTilt: number;
      shots: number;
      shotsOnTarget: number;
      passesAttempted: number;
      passesCompleted: number;
      passAccuracy: number;
      corners: number;
      fouls: number;
      offsides: number;
    };
    away: {
      teamCode: string;
      possession: number;
      fieldTilt: number;
      shots: number;
      shotsOnTarget: number;
      passesAttempted: number;
      passesCompleted: number;
      passAccuracy: number;
      corners: number;
      fouls: number;
      offsides: number;
    };
  };
  executiveRecap?: {
    title: string;
    tacticalBrief: string;
    keyObservations: string[];
  };
  dataLimitations: string[];
}

const TACTICAL_DATA_LIMITATIONS = [
  "Illustrative match data (not derived from live optical or camera tracking).",
  "No optical player-tracking coordinates, continuous trajectories, or physical sprint velocities.",
  "No real-time defensive line height measurements in meters.",
  "No calculated pressing intensity metrics (e.g. PPDA - passes per defensive action).",
  "No complete coordinate-based passing network diagrams.",
  "Only registered lineup coordinates and explicit match telemetry events are available.",
];

/**
 * Builds grounded tactical evidence payload for a specific match fixture.
 * Returns null if matchId is invalid or not in registry.
 */
export function buildTacticalEvidence(matchId: string): TactiQEvidencePayload | null {
  if (!matchId || typeof matchId !== "string") return null;

  const cleanMatchId = matchId.trim().toLowerCase();
  const match: Match | undefined = MATCHES_DATA[cleanMatchId];
  if (!match) return null;

  // Process Home Lineup & Line Counts
  const homeLineup = match.homeFormation.lineup.map((lp) => ({
    name: lp.player.name,
    shortName: lp.player.shortName,
    number: lp.player.number,
    positionCategory: lp.player.positionCategory,
    role: lp.coordinate.role,
    coordinates: { x: lp.coordinate.x, y: lp.coordinate.y },
    isCaptain: lp.isCaptain || false,
  }));

  const homeCounts = {
    gk: homeLineup.filter((p) => p.positionCategory === "GK").length,
    def: homeLineup.filter((p) => p.positionCategory === "DEF").length,
    mid: homeLineup.filter((p) => p.positionCategory === "MID").length,
    fwd: homeLineup.filter((p) => p.positionCategory === "FWD").length,
  };

  // Process Away Lineup & Line Counts
  const awayLineup = match.awayFormation.lineup.map((lp) => ({
    name: lp.player.name,
    shortName: lp.player.shortName,
    number: lp.player.number,
    positionCategory: lp.player.positionCategory,
    role: lp.coordinate.role,
    coordinates: { x: lp.coordinate.x, y: lp.coordinate.y },
    isCaptain: lp.isCaptain || false,
  }));

  const awayCounts = {
    gk: awayLineup.filter((p) => p.positionCategory === "GK").length,
    def: awayLineup.filter((p) => p.positionCategory === "DEF").length,
    mid: awayLineup.filter((p) => p.positionCategory === "MID").length,
    fwd: awayLineup.filter((p) => p.positionCategory === "FWD").length,
  };

  // Deterministic line comparisons
  const defDiff = `${match.homeTeam.code}: ${homeCounts.def} defenders vs ${match.awayTeam.code}: ${awayCounts.def} defenders`;
  const midDiff = `${match.homeTeam.code}: ${homeCounts.mid} central midfielders vs ${match.awayTeam.code}: ${awayCounts.mid} central midfielders`;
  const fwdDiff = `${match.homeTeam.code}: ${homeCounts.fwd} attackers vs ${match.awayTeam.code}: ${awayCounts.fwd} attackers`;
  const numericalSummary = `${match.homeFormation.name} (${homeCounts.def}-${homeCounts.mid}-${homeCounts.fwd}) vs ${match.awayFormation.name} (${awayCounts.def}-${awayCounts.mid}-${awayCounts.fwd})`;

  // Sort events chronologically
  const sortedEvents = [...match.events].sort((a, b) => {
    if (a.minute !== b.minute) return a.minute - b.minute;
    return (a.stoppageMinute || 0) - (b.stoppageMinute || 0);
  });

  // Filter tactical shifts
  const recordedTacticalShifts = sortedEvents
    .filter((e) => e.type === "TACTICAL_SHIFT" || e.type === "SUBSTITUTION")
    .map((e) => {
      const team = e.teamId === match.homeTeam.id ? match.homeTeam.code : match.awayTeam.code;
      return {
        minute: e.minute,
        teamCode: team,
        type: e.type,
        title: e.title,
        description: e.description,
        tacticalImpact: e.tacticalImpact,
      };
    });

  // Filter decisive match events (goals, cards, VAR decisions)
  const decisiveEvents = sortedEvents
    .filter((e) => ["GOAL", "RED_CARD", "YELLOW_CARD", "VAR_DECISION"].includes(e.type))
    .map((e) => {
      const team = e.teamId === match.homeTeam.id ? match.homeTeam.code : match.awayTeam.code;
      return {
        minute: e.minute,
        teamCode: team,
        type: e.type,
        title: e.title,
        description: e.description,
        tacticalImpact: e.tacticalImpact,
      };
    });

  // Format substitutions with player names from PLAYERS_DATA
  const formattedSubstitutions = match.substitutions.map((sub) => {
    const pIn = PLAYERS_DATA[sub.playerInId]?.name || sub.playerInId;
    const pOut = PLAYERS_DATA[sub.playerOutId]?.name || sub.playerOutId;
    const teamCode = sub.teamId === match.homeTeam.id ? match.homeTeam.code : match.awayTeam.code;
    return {
      minute: sub.minute,
      teamCode,
      playerIn: pIn,
      playerOut: pOut,
      reason: sub.reason,
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
    formations: {
      home: {
        name: match.homeFormation.name,
        lineCounts: homeCounts,
        players: homeLineup,
      },
      away: {
        name: match.awayFormation.name,
        lineCounts: awayCounts,
        players: awayLineup,
      },
      comparison: {
        defenseDifference: defDiff,
        midfieldDifference: midDiff,
        forwardDifference: fwdDiff,
        numericalSummary,
      },
    },
    recordedTacticalShifts,
    decisiveEvents,
    substitutions: formattedSubstitutions,
    teamStatistics: {
      home: {
        teamCode: match.homeTeam.code,
        possession: match.homeStats.possession,
        fieldTilt: match.homeStats.fieldTilt,
        shots: match.homeStats.shots,
        shotsOnTarget: match.homeStats.shotsOnTarget,
        passesAttempted: match.homeStats.passesAttempted,
        passesCompleted: match.homeStats.passesCompleted,
        passAccuracy: match.homeStats.passAccuracy,
        corners: match.homeStats.corners,
        fouls: match.homeStats.fouls,
        offsides: match.homeStats.offsides,
      },
      away: {
        teamCode: match.awayTeam.code,
        possession: match.awayStats.possession,
        fieldTilt: match.awayStats.fieldTilt,
        shots: match.awayStats.shots,
        shotsOnTarget: match.awayStats.shotsOnTarget,
        passesAttempted: match.awayStats.passesAttempted,
        passesCompleted: match.awayStats.passesCompleted,
        passAccuracy: match.awayStats.passAccuracy,
        corners: match.awayStats.corners,
        fouls: match.awayStats.fouls,
        offsides: match.awayStats.offsides,
      },
    },
    executiveRecap: match.executiveRecap
      ? {
          title: match.executiveRecap.title,
          tacticalBrief: match.executiveRecap.tacticalBrief,
          keyObservations: [...match.executiveRecap.keyObservations],
        }
      : undefined,
    dataLimitations: TACTICAL_DATA_LIMITATIONS,
  };
}
