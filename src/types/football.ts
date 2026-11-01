/**
 * FanPulse AI — Football Data Types & Interfaces
 * 
 * Central domain models representing Premier League teams, players, fixtures,
 * matches, match telemetry events, player statistics, and league standings.
 * 
 * NOTE: All data marked with isSimulated: true represents DEMO / SIMULATED datasets
 * designed for UI testing and client-side deterministic models.
 */

export type MatchStatus = "SCHEDULED" | "IN_PLAY" | "COMPLETED";

export type QualificationZone = "ucl" | "uel" | "uecl" | "safe" | "relegation";

export type FormResult = "W" | "D" | "L";

export type PlayerPositionCategory = "GK" | "DEF" | "MID" | "FWD";

export type MatchEventType =
  | "GOAL"
  | "ASSIST"
  | "SHOT"
  | "SHOT_ON_TARGET"
  | "SAVE"
  | "FOUL"
  | "YELLOW_CARD"
  | "RED_CARD"
  | "SUBSTITUTION"
  | "TACTICAL_SHIFT"
  | "VAR_DECISION"
  | "CORNER"
  | "OFFSIDE";

export type EventSignificance = "CRITICAL" | "HIGH" | "MODERATE" | "LOW";

export interface Team {
  id: string; // e.g. "ars", "che", "mci", "liv"
  name: string; // "Arsenal"
  shortName: string; // "Arsenal"
  code: string; // "ARS"
  venue: string; // "Emirates Stadium, London"
  primaryColor: string; // "#EF0107"
  accentColor: string;
}

export interface Player {
  id: string; // e.g. "ars-saka"
  teamId: string;
  name: string;
  shortName: string;
  number: number;
  positionCategory: PlayerPositionCategory;
  primaryRole: string; // e.g. "Inside Forward (RW)", "Box-to-Box (8)"
  photoUrl?: string;
}

export interface TacticalCoordinate {
  x: number; // 0 to 100 percentage (width-wise across pitch)
  y: number; // 0 to 100 percentage (length-wise down pitch, 0 = opponent goal, 100 = own goal)
  role: string;
  instruction?: string;
}

export interface LineupPlayer {
  playerId: string;
  player: Player;
  coordinate: TacticalCoordinate;
  isCaptain?: boolean;
}

export interface Formation {
  name: string; // e.g. "4-3-3 Attacking", "3-2-4-1 Build-Up", "4-2-3-1 Mid-Block"
  lineup: LineupPlayer[];
}

export interface Fixture {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  competition: string; // "Premier League"
  season: string; // "2026/27"
  matchweek: number;
  matchweekLabel: string; // "Matchweek 10"
  venue: string;
  kickoffDate: string; // "Sat 31 Oct · 17:30 BST"
  status: MatchStatus;
  headlineTactics: string;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  minute: number;
  stoppageMinute?: number;
  type: MatchEventType;
  teamId: string;
  playerId?: string;
  secondaryPlayerId?: string; // e.g. player replaced or assist provider
  title: string;
  description: string;
  tacticalImpact?: string;
  significance: EventSignificance;
  momentumShiftDelta?: number; // e.g. +25 for home boost, -20 for away boost
}

export interface PlayerMatchStatistics {
  playerId: string;
  matchId: string;
  teamId: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  passesAttempted: number;
  passesCompleted: number;
  keyPasses: number;
  progressivePasses: number;
  progressiveCarries: number;
  finalThirdPassesAttempted: number;
  finalThirdPassesCompleted: number;
  tacklesWon: number;
  interceptions: number;
  clearances: number;
  groundDuelsContested: number;
  groundDuelsWon: number;
  aerialDuelsContested: number;
  aerialDuelsWon: number;
  foulsCommitted: number;
  foulsDrawn: number;
  yellowCards: number;
  redCards: number;
  saves?: number;
  goalsConceded?: number;
}

export interface TeamMatchStatistics {
  teamId: string;
  matchId: string;
  score: number;
  shots: number;
  shotsOnTarget: number;
  possession: number; // percentage (0 - 100)
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  offsides: number;
  fieldTilt: number; // percentage (0 - 100)
  passesAttempted: number;
  passesCompleted: number;
  passAccuracy: number; // percentage
}

export interface Substitution {
  minute: number;
  teamId: string;
  playerInId: string;
  playerOutId: string;
  reason?: string;
}

export interface Match {
  id: string; // Stable ID matching Fixture.id
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
  status: MatchStatus;
  minute: number;
  homeScore: number;
  awayScore: number;
  homeFormation: Formation;
  awayFormation: Formation;
  homeStats: TeamMatchStatistics;
  awayStats: TeamMatchStatistics;
  events: MatchEvent[];
  playerStats: PlayerMatchStatistics[];
  substitutions: Substitution[];
  executiveRecap?: {
    title: string;
    tacticalBrief: string;
    keyObservations: string[];
  };
  isSimulated: boolean; // Flag verifying demo dataset
}

export interface RawTeamRecord {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  form: FormResult[];
}

export interface LeagueStanding {
  position: number;
  teamId: string;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: FormResult[];
  zone: QualificationZone;
  isSimulated: boolean;
}

export interface ScenarioOutcome {
  scenarioId: "home-win" | "draw" | "away-win";
  label: string;
  description: string;
  projectedHomeScore: number;
  projectedAwayScore: number;
  homeTeamStandingsChange: {
    previousPosition: number;
    newPosition: number;
    previousPoints: number;
    newPoints: number;
    previousGD: number;
    newGD: number;
  };
  awayTeamStandingsChange: {
    previousPosition: number;
    newPosition: number;
    previousPoints: number;
    newPoints: number;
    previousGD: number;
    newGD: number;
  };
  tableSnapshot: LeagueStanding[];
}
