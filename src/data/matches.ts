import { Match, Formation, PlayerMatchStatistics, TeamMatchStatistics } from "@/types/football";
import { TEAMS_DATA } from "./teams";
import { PLAYERS_DATA } from "./players";
import { FIXTURES_DATA } from "./fixtures";
import { MATCH_EVENTS_DATA } from "./events";

/**
 * Lineup helper generating LineupPlayer entries
 */
function createLineupPlayer(
  playerId: string,
  x: number,
  y: number,
  role: string,
  isCaptain = false
) {
  const player = PLAYERS_DATA[playerId];
  if (!player) {
    throw new Error(`Player ${playerId} not found while generating lineup`);
  }
  return {
    playerId,
    player,
    coordinate: { x, y, role },
    isCaptain,
  };
}

// -------------------------------------------------------------
// ARSENAL VS CHELSEA (Primary Demo Match)
// -------------------------------------------------------------

const ARSENAL_LINEUP_433: Formation = {
  name: "4-3-3 Attacking",
  lineup: [
    createLineupPlayer("ars-raya", 50, 92, "Sweeper Keeper"),
    createLineupPlayer("ars-white", 82, 74, "Inverted Right Back"),
    createLineupPlayer("ars-saliba", 62, 76, "Stopper Center Back"),
    createLineupPlayer("ars-gabriel", 38, 76, "Covering Center Back"),
    createLineupPlayer("ars-calafiori", 18, 74, "Overlapping Left Back"),
    createLineupPlayer("ars-partey", 50, 58, "Single Pivot (6)"),
    createLineupPlayer("ars-rice", 32, 46, "Box-to-Box (8)"),
    createLineupPlayer("ars-odegaard", 68, 44, "Advanced Playmaker (10)", true),
    createLineupPlayer("ars-saka", 84, 26, "Inside Forward (RW)"),
    createLineupPlayer("ars-havertz", 50, 20, "Deep-Lying Target 9"),
    createLineupPlayer("ars-martinelli", 16, 26, "Touchline Winger (LW)"),
  ],
};

const CHELSEA_LINEUP_4231: Formation = {
  name: "4-2-3-1 Mid-Block",
  lineup: [
    createLineupPlayer("che-sanchez", 50, 92, "Goalkeeper"),
    createLineupPlayer("che-gusto", 82, 75, "Attacking Right Back"),
    createLineupPlayer("che-fofana", 62, 77, "Right Center Back"),
    createLineupPlayer("che-colwill", 38, 77, "Ball-Playing Left CB"),
    createLineupPlayer("che-cucurella", 18, 75, "Inverted Left Back"),
    createLineupPlayer("che-caicedo", 38, 60, "Ball-Winning Pivot"),
    createLineupPlayer("che-lavia", 62, 60, "Deep Controller Pivot"),
    createLineupPlayer("che-palmer", 50, 42, "Central Trequartista (10)", true),
    createLineupPlayer("che-madueke", 80, 32, "Inverted Winger (RW)"),
    createLineupPlayer("che-jackson", 50, 20, "Channel Runner 9"),
    createLineupPlayer("che-neto", 20, 32, "Direct Winger (LW)"),
  ],
};

const ARSENAL_STATS_DEMO: TeamMatchStatistics = {
  teamId: "ars",
  matchId: "ars-che",
  score: 2,
  shots: 14,
  shotsOnTarget: 6,
  possession: 57,
  corners: 7,
  fouls: 9,
  yellowCards: 1,
  redCards: 0,
  offsides: 2,
  fieldTilt: 61,
  passesAttempted: 520,
  passesCompleted: 442,
  passAccuracy: 85,
};

const CHELSEA_STATS_DEMO: TeamMatchStatistics = {
  teamId: "che",
  matchId: "ars-che",
  score: 1,
  shots: 9,
  shotsOnTarget: 4,
  possession: 43,
  corners: 3,
  fouls: 12,
  yellowCards: 2,
  redCards: 0,
  offsides: 3,
  fieldTilt: 39,
  passesAttempted: 390,
  passesCompleted: 312,
  passAccuracy: 80,
};

const ARSENAL_CHELSEA_PLAYER_STATS: PlayerMatchStatistics[] = [
  // Saka
  {
    playerId: "ars-saka",
    matchId: "ars-che",
    teamId: "ars",
    minutesPlayed: 85,
    goals: 1,
    assists: 1,
    shots: 4,
    shotsOnTarget: 2,
    passesAttempted: 48,
    passesCompleted: 39,
    keyPasses: 3,
    progressivePasses: 6,
    progressiveCarries: 9,
    finalThirdPassesAttempted: 24,
    finalThirdPassesCompleted: 20,
    tacklesWon: 2,
    interceptions: 1,
    clearances: 0,
    groundDuelsContested: 12,
    groundDuelsWon: 7,
    aerialDuelsContested: 2,
    aerialDuelsWon: 1,
    foulsCommitted: 1,
    foulsDrawn: 4,
    yellowCards: 0,
    redCards: 0,
  },
  // Palmer
  {
    playerId: "che-palmer",
    matchId: "ars-che",
    teamId: "che",
    minutesPlayed: 88,
    goals: 0,
    assists: 1,
    shots: 3,
    shotsOnTarget: 2,
    passesAttempted: 44,
    passesCompleted: 35,
    keyPasses: 4,
    progressivePasses: 7,
    progressiveCarries: 6,
    finalThirdPassesAttempted: 22,
    finalThirdPassesCompleted: 17,
    tacklesWon: 1,
    interceptions: 1,
    clearances: 0,
    groundDuelsContested: 10,
    groundDuelsWon: 5,
    aerialDuelsContested: 1,
    aerialDuelsWon: 0,
    foulsCommitted: 1,
    foulsDrawn: 2,
    yellowCards: 0,
    redCards: 0,
  },
  // Ødegaard
  {
    playerId: "ars-odegaard",
    matchId: "ars-che",
    teamId: "ars",
    minutesPlayed: 88,
    goals: 0,
    assists: 1,
    shots: 2,
    shotsOnTarget: 1,
    passesAttempted: 64,
    passesCompleted: 56,
    keyPasses: 3,
    progressivePasses: 8,
    progressiveCarries: 5,
    finalThirdPassesAttempted: 28,
    finalThirdPassesCompleted: 24,
    tacklesWon: 3,
    interceptions: 2,
    clearances: 1,
    groundDuelsContested: 9,
    groundDuelsWon: 5,
    aerialDuelsContested: 2,
    aerialDuelsWon: 1,
    foulsCommitted: 0,
    foulsDrawn: 2,
    yellowCards: 0,
    redCards: 0,
  },
  // Havertz
  {
    playerId: "ars-havertz",
    matchId: "ars-che",
    teamId: "ars",
    minutesPlayed: 85,
    goals: 1,
    assists: 0,
    shots: 3,
    shotsOnTarget: 2,
    passesAttempted: 32,
    passesCompleted: 26,
    keyPasses: 2,
    progressivePasses: 3,
    progressiveCarries: 4,
    finalThirdPassesAttempted: 14,
    finalThirdPassesCompleted: 11,
    tacklesWon: 2,
    interceptions: 1,
    clearances: 2,
    groundDuelsContested: 14,
    groundDuelsWon: 8,
    aerialDuelsContested: 8,
    aerialDuelsWon: 5,
    foulsCommitted: 2,
    foulsDrawn: 3,
    yellowCards: 0,
    redCards: 0,
  },
  // Jackson
  {
    playerId: "che-jackson",
    matchId: "ars-che",
    teamId: "che",
    minutesPlayed: 75,
    goals: 1,
    assists: 0,
    shots: 2,
    shotsOnTarget: 1,
    passesAttempted: 21,
    passesCompleted: 16,
    keyPasses: 1,
    progressivePasses: 2,
    progressiveCarries: 5,
    finalThirdPassesAttempted: 9,
    finalThirdPassesCompleted: 6,
    tacklesWon: 0,
    interceptions: 0,
    clearances: 1,
    groundDuelsContested: 11,
    groundDuelsWon: 4,
    aerialDuelsContested: 4,
    aerialDuelsWon: 1,
    foulsCommitted: 3,
    foulsDrawn: 2,
    yellowCards: 0,
    redCards: 0,
  },
  // Caicedo
  {
    playerId: "che-caicedo",
    matchId: "ars-che",
    teamId: "che",
    minutesPlayed: 88,
    goals: 0,
    assists: 0,
    shots: 1,
    shotsOnTarget: 0,
    passesAttempted: 52,
    passesCompleted: 45,
    keyPasses: 1,
    progressivePasses: 4,
    progressiveCarries: 3,
    finalThirdPassesAttempted: 12,
    finalThirdPassesCompleted: 9,
    tacklesWon: 5,
    interceptions: 4,
    clearances: 2,
    groundDuelsContested: 16,
    groundDuelsWon: 10,
    aerialDuelsContested: 3,
    aerialDuelsWon: 2,
    foulsCommitted: 3,
    foulsDrawn: 1,
    yellowCards: 1,
    redCards: 0,
  },
  // Rice
  {
    playerId: "ars-rice",
    matchId: "ars-che",
    teamId: "ars",
    minutesPlayed: 88,
    goals: 0,
    assists: 0,
    shots: 1,
    shotsOnTarget: 0,
    passesAttempted: 58,
    passesCompleted: 53,
    keyPasses: 2,
    progressivePasses: 6,
    progressiveCarries: 5,
    finalThirdPassesAttempted: 18,
    finalThirdPassesCompleted: 15,
    tacklesWon: 4,
    interceptions: 3,
    clearances: 2,
    groundDuelsContested: 11,
    groundDuelsWon: 7,
    aerialDuelsContested: 4,
    aerialDuelsWon: 3,
    foulsCommitted: 1,
    foulsDrawn: 1,
    yellowCards: 0,
    redCards: 0,
  },
];

// -------------------------------------------------------------
// MANCHESTER CITY VS LIVERPOOL (Second Marquee Match)
// -------------------------------------------------------------

const CITY_LINEUP_3241: Formation = {
  name: "3-2-4-1 Build-Up",
  lineup: [
    createLineupPlayer("mci-ederson", 50, 92, "Sweeper Keeper"),
    createLineupPlayer("mci-akanji", 74, 76, "Right Hybrid CB"),
    createLineupPlayer("mci-dias", 50, 78, "Central CB", true),
    createLineupPlayer("mci-gvardiol", 26, 76, "Left Wide CB"),
    createLineupPlayer("mci-rodri", 40, 62, "Holding Pivot (6)"),
    createLineupPlayer("mci-lewis", 60, 62, "Inverted Midfielder"),
    createLineupPlayer("mci-bernardo", 68, 42, "Half-space Pocket"),
    createLineupPlayer("mci-debruyne", 32, 42, "Creative Free 8"),
    createLineupPlayer("mci-foden", 85, 28, "Inside Playmaker (RW)"),
    createLineupPlayer("mci-haaland", 50, 18, "Target Poacher 9"),
    createLineupPlayer("mci-doku", 15, 28, "1v1 Isolation Winger"),
  ],
};

const LIVERPOOL_LINEUP_433: Formation = {
  name: "4-3-3 Attacking",
  lineup: [
    createLineupPlayer("liv-alisson", 50, 92, "Goalkeeper"),
    createLineupPlayer("liv-trent", 82, 74, "Inverted Quarterback RB"),
    createLineupPlayer("liv-konate", 62, 76, "Athletic Stopper CB"),
    createLineupPlayer("liv-vandijk", 38, 76, "Leader Covering CB", true),
    createLineupPlayer("liv-robertson", 18, 74, "Attacking Overlap LB"),
    createLineupPlayer("liv-gravenberch", 50, 58, "Press-Resistant Pivot"),
    createLineupPlayer("liv-macallister", 32, 46, "Tempo Controller 8"),
    createLineupPlayer("liv-szoboszlai", 68, 44, "High-Press Free 8"),
    createLineupPlayer("liv-salah", 84, 26, "Inside Goalscorer (RW)"),
    createLineupPlayer("liv-nunez", 50, 20, "Chaos Channel Striker"),
    createLineupPlayer("liv-diaz", 16, 26, "Direct Dribbler (LW)"),
  ],
};

const CITY_STATS_DEMO: TeamMatchStatistics = {
  teamId: "mci",
  matchId: "mci-liv",
  score: 1,
  shots: 12,
  shotsOnTarget: 5,
  possession: 62,
  corners: 6,
  fouls: 8,
  yellowCards: 1,
  redCards: 0,
  offsides: 1,
  fieldTilt: 64,
  passesAttempted: 610,
  passesCompleted: 549,
  passAccuracy: 90,
};

const LIVERPOOL_STATS_DEMO: TeamMatchStatistics = {
  teamId: "liv",
  matchId: "mci-liv",
  score: 1,
  shots: 11,
  shotsOnTarget: 4,
  possession: 38,
  corners: 4,
  fouls: 10,
  yellowCards: 2,
  redCards: 0,
  offsides: 2,
  fieldTilt: 36,
  passesAttempted: 350,
  passesCompleted: 280,
  passAccuracy: 80,
};

const CITY_LIVERPOOL_PLAYER_STATS: PlayerMatchStatistics[] = [
  {
    playerId: "mci-foden",
    matchId: "mci-liv",
    teamId: "mci",
    minutesPlayed: 90,
    goals: 0,
    assists: 0,
    shots: 3,
    shotsOnTarget: 2,
    passesAttempted: 52,
    passesCompleted: 46,
    keyPasses: 3,
    progressivePasses: 6,
    progressiveCarries: 7,
    finalThirdPassesAttempted: 26,
    finalThirdPassesCompleted: 23,
    tacklesWon: 1,
    interceptions: 1,
    clearances: 0,
    groundDuelsContested: 9,
    groundDuelsWon: 5,
    aerialDuelsContested: 1,
    aerialDuelsWon: 0,
    foulsCommitted: 1,
    foulsDrawn: 2,
    yellowCards: 0,
    redCards: 0,
  },
  {
    playerId: "liv-salah",
    matchId: "mci-liv",
    teamId: "liv",
    minutesPlayed: 90,
    goals: 1,
    assists: 0,
    shots: 4,
    shotsOnTarget: 2,
    passesAttempted: 36,
    passesCompleted: 29,
    keyPasses: 2,
    progressivePasses: 4,
    progressiveCarries: 6,
    finalThirdPassesAttempted: 18,
    finalThirdPassesCompleted: 14,
    tacklesWon: 1,
    interceptions: 0,
    clearances: 0,
    groundDuelsContested: 8,
    groundDuelsWon: 4,
    aerialDuelsContested: 2,
    aerialDuelsWon: 1,
    foulsCommitted: 0,
    foulsDrawn: 1,
    yellowCards: 0,
    redCards: 0,
  },
];

// -------------------------------------------------------------
// CENTRAL MATCHES REGISTRY
// -------------------------------------------------------------

export const MATCHES_DATA: Record<string, Match> = {
  "ars-che": {
    id: "ars-che",
    fixture: FIXTURES_DATA["ars-che"],
    homeTeam: TEAMS_DATA.ars,
    awayTeam: TEAMS_DATA.che,
    status: "IN_PLAY",
    minute: 78,
    homeScore: 2,
    awayScore: 1,
    homeFormation: ARSENAL_LINEUP_433,
    awayFormation: CHELSEA_LINEUP_4231,
    homeStats: ARSENAL_STATS_DEMO,
    awayStats: CHELSEA_STATS_DEMO,
    events: MATCH_EVENTS_DATA["ars-che"] || [],
    playerStats: ARSENAL_CHELSEA_PLAYER_STATS,
    substitutions: [
      {
        minute: 62,
        teamId: "che",
        playerInId: "che-neto",
        playerOutId: "che-madueke",
        reason: "Tactical width shift",
      },
      {
        minute: 68,
        teamId: "ars",
        playerInId: "ars-trossard",
        playerOutId: "ars-martinelli",
        reason: "Pressing endurance refresh",
      },
    ],
    executiveRecap: {
      title: "Arsenal Structural Overload Exploits Chelsea Rest Defense",
      tacticalBrief:
        "Arsenal established 61% field tilt by utilizing Ben White as an inverted pivot alongside Partey, pulling Chelsea's midfield line laterally and freeing Saka in 1v1 situations against Cucurella. Chelsea responded with vertical channel runs through Jackson and Palmer, equalizing before Havertz converted a cutback to restore Arsenal's advantage.",
      keyObservations: [
        "White underlap produced 2 big chances and the match-opening goal.",
        "Caicedo caution at 27' reduced central pressing aggressiveness by 22%.",
        "Chelsea's transition xG remains dangerous despite territory deficit.",
      ],
    },
    isSimulated: true,
  },

  "mci-liv": {
    id: "mci-liv",
    fixture: FIXTURES_DATA["mci-liv"],
    homeTeam: TEAMS_DATA.mci,
    awayTeam: TEAMS_DATA.liv,
    status: "SCHEDULED",
    minute: 0,
    homeScore: 1,
    awayScore: 1,
    homeFormation: CITY_LINEUP_3241,
    awayFormation: LIVERPOOL_LINEUP_433,
    homeStats: CITY_STATS_DEMO,
    awayStats: LIVERPOOL_STATS_DEMO,
    events: MATCH_EVENTS_DATA["mci-liv"] || [],
    playerStats: CITY_LIVERPOOL_PLAYER_STATS,
    substitutions: [],
    executiveRecap: {
      title: "Positional Fluidity Meets Vertical Directness at the Etihad",
      tacticalBrief:
        "A monumental clash between Guardiola's 3-2-4-1 box midfield and Slot's high-tempo vertical transition system. Tactical battle centers on whether Liverpool can isolate Salah against Gvardiol or if City can pin Liverpool into deep rest defense.",
      keyObservations: [
        "De Bruyne vs Gravenberch in the right half-space channel.",
        "Haaland vs Van Dijk in primary aerial duels.",
      ],
    },
    isSimulated: true,
  },

  "tot-ast": {
    id: "tot-ast",
    fixture: FIXTURES_DATA["tot-ast"],
    homeTeam: TEAMS_DATA.tot,
    awayTeam: TEAMS_DATA.avl,
    status: "SCHEDULED",
    minute: 0,
    homeScore: 0,
    awayScore: 0,
    homeFormation: ARSENAL_LINEUP_433, // Reusable geometric fallback shape
    awayFormation: CHELSEA_LINEUP_4231,
    homeStats: { ...ARSENAL_STATS_DEMO, teamId: "tot", score: 0 },
    awayStats: { ...CHELSEA_STATS_DEMO, teamId: "avl", score: 0 },
    events: MATCH_EVENTS_DATA["tot-ast"] || [],
    playerStats: [],
    substitutions: [],
    executiveRecap: {
      title: "High-Line Pressing vs Emery's Mid-Block Trap",
      tacticalBrief:
        "Tottenham's hyper-aggressive 52m defensive line faces Aston Villa's disciplined mid-block and rapid vertical channel counters.",
      keyObservations: ["Offside line discipline will dictate transition frequency."],
    },
    isSimulated: true,
  },

  "new-mun": {
    id: "new-mun",
    fixture: FIXTURES_DATA["new-mun"],
    homeTeam: TEAMS_DATA.new,
    awayTeam: TEAMS_DATA.mun,
    status: "SCHEDULED",
    minute: 0,
    homeScore: 0,
    awayScore: 0,
    homeFormation: ARSENAL_LINEUP_433,
    awayFormation: CHELSEA_LINEUP_4231,
    homeStats: { ...ARSENAL_STATS_DEMO, teamId: "new", score: 0 },
    awayStats: { ...CHELSEA_STATS_DEMO, teamId: "mun", score: 0 },
    events: MATCH_EVENTS_DATA["new-mun"] || [],
    playerStats: [],
    substitutions: [],
    executiveRecap: {
      title: "Physical Perimeter Pressing at St. James' Park",
      tacticalBrief:
        "Newcastle aims to disrupt Manchester United's buildup via intense wide traps and direct channel breaks.",
      keyObservations: ["Midfield second-ball win rate is decisive."],
    },
    isSimulated: true,
  },
};

export const MATCHES_LIST: Match[] = Object.values(MATCHES_DATA);

export function getMatchById(matchId: string): Match {
  const match = MATCHES_DATA[matchId.toLowerCase()];
  if (!match) {
    throw new Error(`Match with ID "${matchId}" not found in MATCHES_DATA`);
  }
  return match;
}
