import { Match, RawTeamRecord, ScenarioOutcome } from "@/types/football";
import { calculateStandings } from "./standings";

/**
 * Deterministic What-If League Table Scenario Modeling
 * 
 * Takes the currently selected match and projects 3 clear deterministic outcomes:
 * 1. Home Win: Home team gains +3 pts, +1 Goal Difference; Away team gains 0 pts, -1 GD.
 * 2. Draw: Home and Away teams each gain +1 pt, 0 GD.
 * 3. Away Win: Away team gains +3 pts, +1 GD; Home team gains 0 pts, -1 GD.
 * 
 * Re-runs the full 20-team sorting algorithm for each scenario to derive exact displacements.
 */
export function calculateMatchScenarios(
  match: Match,
  baselineRecords: RawTeamRecord[]
): ScenarioOutcome[] {
  const homeId = match.homeTeam.id;
  const awayId = match.awayTeam.id;

  // Compute baseline standings before scenario
  const baselineTable = calculateStandings(baselineRecords);
  const baseHomeStanding = baselineTable.find((s) => s.teamId === homeId);
  const baseAwayStanding = baselineTable.find((s) => s.teamId === awayId);

  if (!baseHomeStanding || !baseAwayStanding) {
    return [];
  }

  // Outcome 1: Home Win (2 - 1)
  const homeWinRecords = baselineRecords.map((r) => {
    if (r.teamId === homeId) {
      return {
        ...r,
        played: r.played + 1,
        won: r.won + 1,
        goalsFor: r.goalsFor + 2,
        goalsAgainst: r.goalsAgainst + 1,
        form: [...r.form.slice(1), "W" as const],
      };
    }
    if (r.teamId === awayId) {
      return {
        ...r,
        played: r.played + 1,
        lost: r.lost + 1,
        goalsFor: r.goalsFor + 1,
        goalsAgainst: r.goalsAgainst + 2,
        form: [...r.form.slice(1), "L" as const],
      };
    }
    return r;
  });
  const homeWinTable = calculateStandings(homeWinRecords);
  const homeWinHome = homeWinTable.find((s) => s.teamId === homeId)!;
  const homeWinAway = homeWinTable.find((s) => s.teamId === awayId)!;

  // Outcome 2: Draw (1 - 1)
  const drawRecords = baselineRecords.map((r) => {
    if (r.teamId === homeId) {
      return {
        ...r,
        played: r.played + 1,
        drawn: r.drawn + 1,
        goalsFor: r.goalsFor + 1,
        goalsAgainst: r.goalsAgainst + 1,
        form: [...r.form.slice(1), "D" as const],
      };
    }
    if (r.teamId === awayId) {
      return {
        ...r,
        played: r.played + 1,
        drawn: r.drawn + 1,
        goalsFor: r.goalsFor + 1,
        goalsAgainst: r.goalsAgainst + 1,
        form: [...r.form.slice(1), "D" as const],
      };
    }
    return r;
  });
  const drawTable = calculateStandings(drawRecords);
  const drawHome = drawTable.find((s) => s.teamId === homeId)!;
  const drawAway = drawTable.find((s) => s.teamId === awayId)!;

  // Outcome 3: Away Win (0 - 1)
  const awayWinRecords = baselineRecords.map((r) => {
    if (r.teamId === homeId) {
      return {
        ...r,
        played: r.played + 1,
        lost: r.lost + 1,
        goalsFor: r.goalsFor + 0,
        goalsAgainst: r.goalsAgainst + 1,
        form: [...r.form.slice(1), "L" as const],
      };
    }
    if (r.teamId === awayId) {
      return {
        ...r,
        played: r.played + 1,
        won: r.won + 1,
        goalsFor: r.goalsFor + 1,
        goalsAgainst: r.goalsAgainst + 0,
        form: [...r.form.slice(1), "W" as const],
      };
    }
    return r;
  });
  const awayWinTable = calculateStandings(awayWinRecords);
  const awayWinHome = awayWinTable.find((s) => s.teamId === homeId)!;
  const awayWinAway = awayWinTable.find((s) => s.teamId === awayId)!;

  return [
    {
      scenarioId: "home-win",
      label: `${match.homeTeam.name} Win (Projected 2-1)`,
      description: `${match.homeTeam.name} claims all 3 points, moving to ${homeWinHome.points} pts. ${match.awayTeam.name} stays on ${homeWinAway.points} pts.`,
      projectedHomeScore: 2,
      projectedAwayScore: 1,
      homeTeamStandingsChange: {
        previousPosition: baseHomeStanding.position,
        newPosition: homeWinHome.position,
        previousPoints: baseHomeStanding.points,
        newPoints: homeWinHome.points,
        previousGD: baseHomeStanding.goalDifference,
        newGD: homeWinHome.goalDifference,
      },
      awayTeamStandingsChange: {
        previousPosition: baseAwayStanding.position,
        newPosition: homeWinAway.position,
        previousPoints: baseAwayStanding.points,
        newPoints: homeWinAway.points,
        previousGD: baseAwayStanding.goalDifference,
        newGD: homeWinAway.goalDifference,
      },
      tableSnapshot: homeWinTable,
    },
    {
      scenarioId: "draw",
      label: `Stalemate Draw (Projected 1-1)`,
      description: `Both teams share the points. ${match.homeTeam.name} advances to ${drawHome.points} pts; ${match.awayTeam.name} advances to ${drawAway.points} pts.`,
      projectedHomeScore: 1,
      projectedAwayScore: 1,
      homeTeamStandingsChange: {
        previousPosition: baseHomeStanding.position,
        newPosition: drawHome.position,
        previousPoints: baseHomeStanding.points,
        newPoints: drawHome.points,
        previousGD: baseHomeStanding.goalDifference,
        newGD: drawHome.goalDifference,
      },
      awayTeamStandingsChange: {
        previousPosition: baseAwayStanding.position,
        newPosition: drawAway.position,
        previousPoints: baseAwayStanding.points,
        newPoints: drawAway.points,
        previousGD: baseAwayStanding.goalDifference,
        newGD: drawAway.goalDifference,
      },
      tableSnapshot: drawTable,
    },
    {
      scenarioId: "away-win",
      label: `${match.awayTeam.name} Away Victory (Projected 0-1)`,
      description: `${match.awayTeam.name} takes all 3 points away from home, advancing to ${awayWinAway.points} pts and improving goal difference.`,
      projectedHomeScore: 0,
      projectedAwayScore: 1,
      homeTeamStandingsChange: {
        previousPosition: baseHomeStanding.position,
        newPosition: awayWinHome.position,
        previousPoints: baseHomeStanding.points,
        newPoints: awayWinHome.points,
        previousGD: baseHomeStanding.goalDifference,
        newGD: awayWinHome.goalDifference,
      },
      awayTeamStandingsChange: {
        previousPosition: baseAwayStanding.position,
        newPosition: awayWinAway.position,
        previousPoints: baseAwayStanding.points,
        newPoints: awayWinAway.points,
        previousGD: baseAwayStanding.goalDifference,
        newGD: awayWinAway.goalDifference,
      },
      tableSnapshot: awayWinTable,
    },
  ];
}
