import { PlayerMatchStatistics } from "@/types/football";

/**
 * Transparent Heuristic Player Performance Score
 * 
 * NOTE & METHODOLOGY DISCLAIMER:
 * This is an open, transparent statistical index calculated directly from available match
 * metrics. It is an illustrative research heuristic and NOT an official Premier League rating.
 * 
 * SCORING FORMULA:
 * Base Score: 6.00
 * Attacking & Creation:
 *   + 1.00 per Goal
 *   + 0.60 per Assist
 *   + 0.15 per Shot on Target
 *   + 0.20 per Key Pass
 * Progression:
 *   + 0.04 per Progressive Pass
 *   + 0.04 per Progressive Carry
 *   + 0.25 if Final Third Pass Accuracy >= 80% (0.10 if >= 70%)
 * Defensive & Possession:
 *   + 0.15 per Tackle Won
 *   + 0.15 per Interception
 *   + 0.25 if Ground Duel Win % >= 55%
 * Disciplinary / Penalties:
 *   - 0.40 per Yellow Card
 *   - 1.50 per Red Card
 *   - 0.08 per Foul Committed
 * 
 * Bounds: Clamped to range [4.00, 10.00], rounded to two decimal places.
 */

export interface NormalizedPlayerMetrics {
  playerId: string;
  minutesPlayed: number;
  rating: string;
  per90: {
    goals: number;
    assists: number;
    shots: number;
    shotsOnTarget: number;
    keyPasses: number;
    progressivePasses: number;
    progressiveCarries: number;
    finalThirdPassAcc: number;
    tacklesInterceptions: number;
    groundDuelWinRate: number;
    aerialDuelWinRate: number;
  };
}

export function calculatePlayerPerformanceScore(stats?: Partial<PlayerMatchStatistics> | null): number {
  if (!stats || !stats.minutesPlayed || stats.minutesPlayed <= 0) return 6.0;

  let score = 6.0;

  // Goals & Assists
  score += (stats.goals ?? 0) * 1.0;
  score += (stats.assists ?? 0) * 0.6;
  score += (stats.shotsOnTarget ?? 0) * 0.15;
  score += (stats.keyPasses ?? 0) * 0.2;

  // Progression
  score += (stats.progressivePasses ?? 0) * 0.04;
  score += (stats.progressiveCarries ?? 0) * 0.04;

  const attempted = stats.finalThirdPassesAttempted ?? 0;
  const completed = stats.finalThirdPassesCompleted ?? 0;
  const finalThirdAcc = attempted > 0 ? (completed / attempted) * 100 : 0;

  if (finalThirdAcc >= 80) score += 0.25;
  else if (finalThirdAcc >= 70) score += 0.1;

  // Defending & Duels
  score += (stats.tacklesWon ?? 0) * 0.15;
  score += (stats.interceptions ?? 0) * 0.15;

  const groundContested = stats.groundDuelsContested ?? 0;
  const groundWon = stats.groundDuelsWon ?? 0;
  const groundDuelRate = groundContested > 0 ? (groundWon / groundContested) * 100 : 0;
  if (groundDuelRate >= 55) score += 0.25;

  // Discipline deductions
  score -= (stats.yellowCards ?? 0) * 0.4;
  score -= (stats.redCards ?? 0) * 1.5;
  score -= (stats.foulsCommitted ?? 0) * 0.08;

  // Strict clamp [4.00, 10.00]
  const clamped = Math.max(4.0, Math.min(10.0, score));
  return Math.round(clamped * 100) / 100;
}

export function normalizePlayerMetricsPer90(stats?: Partial<PlayerMatchStatistics> | null): NormalizedPlayerMetrics {
  const minutes = stats?.minutesPlayed ?? 0;
  // If player did not play (0 minutes), factor is 0 so rates do not extrapolate from 0 minutes
  const factor = minutes > 0 ? 90 / minutes : 0;

  const attempted = stats?.finalThirdPassesAttempted ?? 0;
  const completed = stats?.finalThirdPassesCompleted ?? 0;
  const finalThirdPassAcc = attempted > 0 ? Math.round((completed / attempted) * 1000) / 10 : 0;

  const groundContested = stats?.groundDuelsContested ?? 0;
  const groundWon = stats?.groundDuelsWon ?? 0;
  const groundDuelWinRate = groundContested > 0 ? Math.round((groundWon / groundContested) * 1000) / 10 : 0;

  const aerialContested = stats?.aerialDuelsContested ?? 0;
  const aerialWon = stats?.aerialDuelsWon ?? 0;
  const aerialDuelWinRate = aerialContested > 0 ? Math.round((aerialWon / aerialContested) * 1000) / 10 : 0;

  const score = calculatePlayerPerformanceScore(stats);

  return {
    playerId: stats?.playerId ?? "unknown",
    minutesPlayed: minutes,
    rating: score.toFixed(2),
    per90: {
      goals: Math.round((stats?.goals ?? 0) * factor * 10) / 10,
      assists: Math.round((stats?.assists ?? 0) * factor * 10) / 10,
      shots: Math.round((stats?.shots ?? 0) * factor * 10) / 10,
      shotsOnTarget: Math.round((stats?.shotsOnTarget ?? 0) * factor * 10) / 10,
      keyPasses: Math.round((stats?.keyPasses ?? 0) * factor * 10) / 10,
      progressivePasses: Math.round((stats?.progressivePasses ?? 0) * factor * 10) / 10,
      progressiveCarries: Math.round((stats?.progressiveCarries ?? 0) * factor * 10) / 10,
      finalThirdPassAcc,
      tacklesInterceptions: Math.round(((stats?.tacklesWon ?? 0) + (stats?.interceptions ?? 0)) * factor * 10) / 10,
      groundDuelWinRate,
      aerialDuelWinRate,
    },
  };
}
