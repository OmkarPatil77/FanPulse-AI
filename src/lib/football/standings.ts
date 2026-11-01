import { RawTeamRecord, LeagueStanding, QualificationZone } from "@/types/football";
import { getTeamById } from "@/data/teams";

/**
 * Deterministic League Standings Calculator
 * 
 * Rules:
 * - Played = Won + Drawn + Lost
 * - Goal Difference = Goals For - Goals Against
 * - Points = (Won * 3) + (Drawn * 1)
 * - Sorting criteria:
 *   1. Points (descending)
 *   2. Goal Difference (descending)
 *   3. Goals For (descending)
 *   4. Team Name (alphabetical)
 * - European & Relegation zones:
 *   - Positions 1 to 4: UEFA Champions League (ucl)
 *   - Position 5: UEFA Europa League (uel)
 *   - Position 6: UEFA Conference League (uecl)
 *   - Positions 18 to 20: Relegation (relegation)
 *   - Positions 7 to 17: Safe (safe)
 */
export function calculateStandings(records: RawTeamRecord[]): LeagueStanding[] {
  // Map and compute metrics
  const computed = records.map((record) => {
    const team = getTeamById(record.teamId);
    const played = record.played ?? (record.won + record.drawn + record.lost);
    const goalDifference = record.goalsFor - record.goalsAgainst;
    const points = record.won * 3 + record.drawn * 1;

    return {
      teamId: record.teamId,
      team,
      played,
      won: record.won,
      drawn: record.drawn,
      lost: record.lost,
      goalsFor: record.goalsFor,
      goalsAgainst: record.goalsAgainst,
      goalDifference,
      points,
      form: record.form || [],
      isSimulated: true,
    };
  });

  // Sort deterministically
  computed.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.name.localeCompare(b.team.name);
  });

  // Assign positions and qualification zones
  return computed.map((entry, index) => {
    const position = index + 1;
    let zone: QualificationZone = "safe";

    if (position <= 4) {
      zone = "ucl";
    } else if (position === 5) {
      zone = "uel";
    } else if (position === 6) {
      zone = "uecl";
    } else if (position >= 18) {
      zone = "relegation";
    }

    return {
      ...entry,
      position,
      zone,
    };
  });
}
