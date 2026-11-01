import { Fixture } from "@/types/football";

/**
 * Premier League Matchweek 10 Fixtures — Centralized Registry
 * Stable fixture IDs matching Match objects.
 */
export const FIXTURES_DATA: Record<string, Fixture> = {
  "ars-che": {
    id: "ars-che",
    homeTeamId: "ars",
    awayTeamId: "che",
    competition: "Premier League",
    season: "2026/27",
    matchweek: 10,
    matchweekLabel: "Matchweek 10",
    venue: "Emirates Stadium, London",
    kickoffDate: "Sat 31 Oct · 17:30 BST",
    status: "IN_PLAY",
    headlineTactics: "High-block counter-press vs Transitional 4-2-3-1",
  },
  "mci-liv": {
    id: "mci-liv",
    homeTeamId: "mci",
    awayTeamId: "liv",
    competition: "Premier League",
    season: "2026/27",
    matchweek: 10,
    matchweekLabel: "Matchweek 10",
    venue: "Etihad Stadium, Manchester",
    kickoffDate: "Sun 1 Nov · 16:30 BST",
    status: "SCHEDULED",
    headlineTactics: "Positional fluid 3-2-4-1 vs Direct vertical overload",
  },
  "tot-ast": {
    id: "tot-ast",
    homeTeamId: "tot",
    awayTeamId: "avl",
    competition: "Premier League",
    season: "2026/27",
    matchweek: 10,
    matchweekLabel: "Matchweek 10",
    venue: "Tottenham Hotspur Stadium, London",
    kickoffDate: "Sun 1 Nov · 14:00 BST",
    status: "SCHEDULED",
    headlineTactics: "Inverted fullbacks vs Mid-block compact traps",
  },
  "new-mun": {
    id: "new-mun",
    homeTeamId: "new",
    awayTeamId: "mun",
    competition: "Premier League",
    season: "2026/27",
    matchweek: 10,
    matchweekLabel: "Matchweek 10",
    venue: "St. James' Park, Newcastle",
    kickoffDate: "Mon 2 Nov · 20:00 BST",
    status: "SCHEDULED",
    headlineTactics: "Intense perimeter pressing vs Rapid channel breaks",
  },
  "bha-nfo": {
    id: "bha-nfo",
    homeTeamId: "bha",
    awayTeamId: "nfo",
    competition: "Premier League",
    season: "2026/27",
    matchweek: 10,
    matchweekLabel: "Matchweek 10",
    venue: "Amex Stadium, Brighton",
    kickoffDate: "Sat 31 Oct · 15:00 BST",
    status: "SCHEDULED",
    headlineTactics: "Baiting deep press vs Low-block counter punch",
  },
  "whu-bou": {
    id: "whu-bou",
    homeTeamId: "whu",
    awayTeamId: "bou",
    competition: "Premier League",
    season: "2026/27",
    matchweek: 10,
    matchweekLabel: "Matchweek 10",
    venue: "London Stadium, London",
    kickoffDate: "Sat 31 Oct · 15:00 BST",
    status: "SCHEDULED",
    headlineTactics: "Direct diagonal aerial switches vs High-intensity sprint recovery",
  },
};

export const FIXTURES_LIST: Fixture[] = Object.values(FIXTURES_DATA);

export function getFixtureById(id: string): Fixture {
  const fixture = FIXTURES_DATA[id.toLowerCase()];
  if (!fixture) {
    throw new Error(`Fixture with ID "${id}" not found in FIXTURES_DATA`);
  }
  return fixture;
}
