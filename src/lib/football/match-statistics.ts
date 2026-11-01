import { Match, MatchEvent } from "@/types/football";

export interface AggregatedMatchSummary {
  matchId: string;
  totalGoals: number;
  totalShots: number;
  totalShotsOnTarget: number;
  totalCorners: number;
  totalFouls: number;
  totalYellowCards: number;
  totalRedCards: number;
  totalSubstitutions: number;
  possessionSplit: {
    home: number;
    away: number;
  };
  fieldTiltSplit: {
    home: number;
    away: number;
  };
}

/**
 * Calculates aggregated match metrics from team match statistics and event telemetry.
 */
export function calculateAggregatedMatchStats(match: Match): AggregatedMatchSummary {
  const home = match.homeStats;
  const away = match.awayStats;

  const totalGoals = home.score + away.score;
  const totalShots = home.shots + away.shots;
  const totalShotsOnTarget = home.shotsOnTarget + away.shotsOnTarget;
  const totalCorners = home.corners + away.corners;
  const totalFouls = home.fouls + away.fouls;
  const totalYellowCards = home.yellowCards + away.yellowCards;
  const totalRedCards = home.redCards + away.redCards;
  const totalSubstitutions = match.substitutions.length;

  return {
    matchId: match.id,
    totalGoals,
    totalShots,
    totalShotsOnTarget,
    totalCorners,
    totalFouls,
    totalYellowCards,
    totalRedCards,
    totalSubstitutions,
    possessionSplit: {
      home: home.possession,
      away: away.possession,
    },
    fieldTiltSplit: {
      home: home.fieldTilt,
      away: away.fieldTilt,
    },
  };
}

/**
 * Derives event counts by team and type from the raw event stream.
 */
export function countEventsByType(events: MatchEvent[]) {
  const counts: Record<string, number> = {};
  for (const event of events) {
    counts[event.type] = (counts[event.type] || 0) + 1;
  }
  return counts;
}
