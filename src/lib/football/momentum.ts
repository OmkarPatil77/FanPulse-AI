import { MatchEvent, MatchEventType } from "@/types/football";

/**
 * Transparent Event-Based Momentum Model
 * 
 * NOTE & METHODOLOGY DISCLAIMER:
 * This is a transparent illustrative heuristic indicator designed for UI visualization.
 * It is NOT a validated predictive model. It models territorial flow by accumulating
 * event weights and applying an exponential decay factor across time intervals.
 * 
 * EVENT WEIGHTING MATRIX:
 * - GOAL: +/- 30 points
 * - SHOT_ON_TARGET: +/- 12 points
 * - SHOT: +/- 6 points
 * - CORNER / SET_PIECE: +/- 8 points
 * - TACTICAL_SHIFT: +/- 10 points
 * - VAR_DECISION: +/- 15 points
 * - YELLOW_CARD: -5 points (disciplinary handicap)
 * - RED_CARD: -25 points
 * - FOUL: -3 points
 * 
 * DECAY MECHANIC:
 * In every minute with no active events, net momentum decays toward equilibrium (0)
 * at a rate of 7% per minute, simulating the natural reset of match momentum.
 */

export interface MomentumPoint {
  minute: number;
  netScore: number; // -100 to +100 (-100 = 100% away dominant, +100 = 100% home dominant)
  homeTilt: number; // 0% to 100%
  awayTilt: number; // 0% to 100%
  activeEvents: MatchEvent[];
}

export interface MomentumAnalysis {
  matchId: string;
  points: MomentumPoint[];
  averageHomeTilt: number;
  peakPressureInterval: string;
  dominantTeam: "home" | "away" | "neutral";
  counterSwingCount: number;
}

const EVENT_WEIGHTS: Record<MatchEventType, number> = {
  GOAL: 30,
  SHOT_ON_TARGET: 12,
  SHOT: 6,
  CORNER: 8,
  TACTICAL_SHIFT: 10,
  VAR_DECISION: 15,
  YELLOW_CARD: -5,
  RED_CARD: -25,
  FOUL: -3,
  ASSIST: 0,
  SAVE: 8,
  SUBSTITUTION: 5,
  OFFSIDE: -4,
};

export function calculateMomentumCurve(
  events: MatchEvent[],
  homeTeamId: string,
  awayTeamId: string,
  matchId = "demo",
  totalMinutes = 90
): MomentumAnalysis {
  // Handle empty event list cleanly
  if (!events || events.length === 0) {
    const neutralPoints: MomentumPoint[] = [];
    for (let m = 0; m <= totalMinutes; m++) {
      neutralPoints.push({
        minute: m,
        netScore: 0,
        homeTilt: 50,
        awayTilt: 50,
        activeEvents: [],
      });
    }
    return {
      matchId,
      points: neutralPoints,
      averageHomeTilt: 50,
      peakPressureInterval: "None (Balanced)",
      dominantTeam: "neutral",
      counterSwingCount: 0,
    };
  }

  // Sort events chronologically to guarantee deterministic execution
  const sortedEvents = [...events].sort((a, b) => {
    if (a.minute !== b.minute) return a.minute - b.minute;
    return (a.stoppageMinute ?? 0) - (b.stoppageMinute ?? 0);
  });

  const points: MomentumPoint[] = [];
  let currentNet = 0;
  const decayRate = 0.93; // 7% decay toward zero per minute without action

  // Group sorted events by minute
  const eventsByMinute: Record<number, MatchEvent[]> = {};
  for (const event of sortedEvents) {
    if (!eventsByMinute[event.minute]) {
      eventsByMinute[event.minute] = [];
    }
    eventsByMinute[event.minute].push(event);
  }

  let totalHomeTilt = 0;
  let counterSwings = 0;
  let previousDirection: "home" | "away" | "neutral" = "neutral";
  let maxHomeNet = -Infinity;
  let peakHomeMinute = 0;
  let hasActiveEvents = false;

  for (let m = 0; m <= totalMinutes; m++) {
    const minuteEvents = eventsByMinute[m] || [];

    // Apply exponential decay
    currentNet = currentNet * decayRate;

    // Apply event deltas
    for (const ev of minuteEvents) {
      hasActiveEvents = true;
      const isHome = ev.teamId.toLowerCase() === homeTeamId.toLowerCase();
      
      // If event explicitly defines signed momentumShiftDelta (+ = home boost, - = away boost), use directly
      let delta: number;
      if (ev.momentumShiftDelta !== undefined) {
        delta = ev.momentumShiftDelta;
      } else {
        const baseWeight = EVENT_WEIGHTS[ev.type] ?? 5;
        // Positive weights favor the team; disciplinary negative weights penalize the team
        delta = isHome ? baseWeight : -baseWeight;
      }
      currentNet += delta;
    }

    // Clamp between -95 and +95
    currentNet = Math.max(-95, Math.min(95, currentNet));

    if (currentNet > maxHomeNet) {
      maxHomeNet = currentNet;
      peakHomeMinute = m;
    }

    // Convert -100..+100 to 0..100% tilt (at net = 0, tilt is 50% home, 50% away)
    const homeTilt = Math.round(50 + currentNet / 2);
    const awayTilt = 100 - homeTilt;
    totalHomeTilt += homeTilt;

    // Detect counter-swings (> 15% across equilibrium)
    const currentDirection = currentNet > 15 ? "home" : currentNet < -15 ? "away" : "neutral";
    if (previousDirection !== "neutral" && currentDirection !== "neutral" && currentDirection !== previousDirection) {
      counterSwings++;
      previousDirection = currentDirection;
    } else if (previousDirection === "neutral" && currentDirection !== "neutral") {
      previousDirection = currentDirection;
    }

    points.push({
      minute: m,
      netScore: Math.round(currentNet * 10) / 10,
      homeTilt,
      awayTilt,
      activeEvents: minuteEvents,
    });
  }

  const averageHomeTilt = Math.round(totalHomeTilt / (totalMinutes + 1));
  const dominantTeam =
    averageHomeTilt >= 53 ? "home" : averageHomeTilt <= 47 ? "away" : "neutral";

  // Peak interval window around max moment
  const startWindow = Math.max(1, peakHomeMinute - 6);
  const endWindow = Math.min(90, peakHomeMinute + 7);
  const peakPressureInterval = hasActiveEvents ? `${startWindow}' – ${endWindow}'` : "None (Balanced)";

  return {
    matchId,
    points,
    averageHomeTilt,
    peakPressureInterval,
    dominantTeam,
    counterSwingCount: counterSwings,
  };
}
