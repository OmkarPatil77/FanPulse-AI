"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useMatchContext } from "@/context/MatchContext";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Radio,
  Clock,
  ArrowRight,
  Check,
} from "lucide-react";

/* -------------------------------------------------------------
   SVG Team Crest Component for Premier League
   ------------------------------------------------------------- */
function TeamCrest({ code, className = "w-6 h-6" }: { code: string; className?: string }) {
  const c = code.toUpperCase();

  if (c === "ARS") {
    // Arsenal: Red shield with gold border & white cannon
    return (
      <svg viewBox="0 0 40 46" className={className} fill="none">
        <path d="M20 1L38 6V26C38 35.5 28.5 43.5 20 45C11.5 43.5 2 35.5 2 26V6L20 1Z" fill="#EF0107" stroke="#D1B358" strokeWidth="2" />
        <path d="M10 24H28M26 21L31 24L26 27M13 28A4 4 0 1 0 13 20A4 4 0 1 0 13 28Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (c === "CHE") {
    // Chelsea: Blue circle with gold border & rampant lion
    return (
      <svg viewBox="0 0 44 44" className={className} fill="none">
        <circle cx="22" cy="22" r="21" fill="#034694" stroke="#D1B358" strokeWidth="2" />
        <circle cx="22" cy="22" r="16" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M22 13C20 13 18 15 18 17C18 19 20 20 22 21C25 21 27 23 27 26C27 29 24 31 21 31C18 31 16 29 16 28M22 17L25 15M20 25L17 27" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (c === "MCI") {
    // Manchester City: Sky blue circle with ship
    return (
      <svg viewBox="0 0 44 44" className={className} fill="none">
        <circle cx="22" cy="22" r="21" fill="#6CABDD" stroke="#1C2C5B" strokeWidth="2" />
        <circle cx="22" cy="22" r="16" fill="#FFFFFF" />
        <path d="M14 26L22 14L30 26H14Z" fill="#D1B358" stroke="#1C2C5B" strokeWidth="1.5" />
        <path d="M12 28C16 33 28 33 32 28" stroke="#C8102E" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (c === "LIV") {
    // Liverpool: Red shield with gold liver bird
    return (
      <svg viewBox="0 0 40 46" className={className} fill="none">
        <path d="M20 1L38 7V27C38 36 29 44 20 45C11 44 2 36 2 27V7L20 1Z" fill="#C8102E" stroke="#00B2A9" strokeWidth="2" />
        <path d="M20 14V32M16 18C18 15 22 15 24 18M15 28C17 31 23 31 25 28" stroke="#D1B358" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (c === "MUN") {
    // Manchester United: Red shield with devil
    return (
      <svg viewBox="0 0 40 46" className={className} fill="none">
        <path d="M20 1L38 6V26C38 35.5 28.5 43.5 20 45C11.5 43.5 2 35.5 2 26V6L20 1Z" fill="#DA291C" stroke="#FFE500" strokeWidth="2" />
        <circle cx="20" cy="23" r="11" fill="#FFE500" />
        <path d="M17 19L20 27L23 19M15 23H25" stroke="#DA291C" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (c === "TOT") {
    // Tottenham: Deep navy with white cockerel
    return (
      <svg viewBox="0 0 40 46" className={className} fill="none">
        <path d="M20 1L38 6V26C38 35.5 28.5 43.5 20 45C11.5 43.5 2 35.5 2 26V6L20 1Z" fill="#132257" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="20" cy="33" r="5" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        <path d="M20 15V28M17 19L20 15L23 19" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (c === "AVL") {
    // Aston Villa: Claret & blue shield with gold lion
    return (
      <svg viewBox="0 0 40 46" className={className} fill="none">
        <path d="M20 1L38 6V26C38 35.5 28.5 43.5 20 45C11.5 43.5 2 35.5 2 26V6L20 1Z" fill="#670E36" stroke="#95BFE5" strokeWidth="2" />
        <path d="M16 23C16 19 24 19 24 23C24 27 16 27 16 31H24" stroke="#FFE500" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (c === "NEW") {
    // Newcastle United: Black and white stripes shield
    return (
      <svg viewBox="0 0 40 46" className={className} fill="none">
        <path d="M20 1L38 6V26C38 35.5 28.5 43.5 20 45C11.5 43.5 2 35.5 2 26V6L20 1Z" fill="#241F20" stroke="#41B6E6" strokeWidth="2" />
        <path d="M12 8V38M20 8V42M28 8V38" stroke="#FFFFFF" strokeWidth="4" />
      </svg>
    );
  }

  if (c === "BHA") {
    // Brighton: Blue and white seagull circle
    return (
      <svg viewBox="0 0 44 44" className={className} fill="none">
        <circle cx="22" cy="22" r="21" fill="#0057B8" stroke="#FFCD00" strokeWidth="2" />
        <circle cx="22" cy="22" r="16" fill="#FFFFFF" />
        <path d="M14 22Q19 18 22 22Q25 18 30 22" stroke="#0057B8" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (c === "BOU") {
    // Bournemouth: Red & black stripes
    return (
      <svg viewBox="0 0 40 46" className={className} fill="none">
        <path d="M20 1L38 6V26C38 35.5 28.5 43.5 20 45C11.5 43.5 2 35.5 2 26V6L20 1Z" fill="#DA291C" stroke="#D1B358" strokeWidth="2" />
        <path d="M14 10V36M26 10V36" stroke="#000000" strokeWidth="5" />
      </svg>
    );
  }

  if (c === "BRE") {
    // Brentford: Red shield with bee
    return (
      <svg viewBox="0 0 40 46" className={className} fill="none">
        <path d="M20 1L38 6V26C38 35.5 28.5 43.5 20 45C11.5 43.5 2 35.5 2 26V6L20 1Z" fill="#E30613" stroke="#FBB800" strokeWidth="2" />
        <circle cx="20" cy="23" r="7" fill="#FBB800" />
        <line x1="13" y1="23" x2="27" y2="23" stroke="#000000" strokeWidth="2" />
      </svg>
    );
  }

  if (c === "NFO") {
    // Nottingham Forest: Red with Sherwood tree
    return (
      <svg viewBox="0 0 40 46" className={className} fill="none">
        <path d="M20 1L38 6V26C38 35.5 28.5 43.5 20 45C11.5 43.5 2 35.5 2 26V6L20 1Z" fill="#DD0000" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M20 16L14 26H26L20 16ZM20 26V34" stroke="#FFFFFF" strokeWidth="2" fill="none" />
      </svg>
    );
  }

  if (c === "FUL") {
    // Fulham: White and black shield with red monogram
    return (
      <svg viewBox="0 0 40 46" className={className} fill="none">
        <path d="M20 1L38 6V26C38 35.5 28.5 43.5 20 45C11.5 43.5 2 35.5 2 26V6L20 1Z" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
        <path d="M14 18H26M14 24H22M14 30H20" stroke="#CC0000" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (c === "WHU") {
    // West Ham: Claret & blue shield with yellow crossed hammers
    return (
      <svg viewBox="0 0 40 46" className={className} fill="none">
        <path d="M20 1L38 6V26C38 35.5 28.5 43.5 20 45C11.5 43.5 2 35.5 2 26V6L20 1Z" fill="#7A263A" stroke="#1BB1E7" strokeWidth="2" />
        <path d="M13 15L27 29M27 15L13 29" stroke="#FFE500" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (c === "EVE") {
    // Everton: Royal blue tower shield
    return (
      <svg viewBox="0 0 40 46" className={className} fill="none">
        <path d="M20 1L38 6V26C38 35.5 28.5 43.5 20 45C11.5 43.5 2 35.5 2 26V6L20 1Z" fill="#003399" stroke="#FFFFFF" strokeWidth="2" />
        <rect x="16" y="16" width="8" height="14" fill="#FFFFFF" rx="1" />
        <path d="M15 16L20 10L25 16H15Z" fill="#FFFFFF" />
      </svg>
    );
  }

  if (c === "SOU") {
    // Southampton: Red and white stripes with halo
    return (
      <svg viewBox="0 0 40 46" className={className} fill="none">
        <path d="M20 1L38 6V26C38 35.5 28.5 43.5 20 45C11.5 43.5 2 35.5 2 26V6L20 1Z" fill="#D71920" stroke="#130C0E" strokeWidth="2" />
        <circle cx="20" cy="12" r="6" stroke="#FFE500" strokeWidth="2" fill="none" />
        <path d="M12 20V38M20 20V42M28 20V38" stroke="#FFFFFF" strokeWidth="3" />
      </svg>
    );
  }

  if (c === "WOL") {
    // Wolverhampton: Gold hexagon with black angular wolf head
    return (
      <svg viewBox="0 0 44 44" className={className} fill="none">
        <polygon points="22,3 39,12 39,32 22,41 5,32 5,12" fill="#FDB913" stroke="#231F20" strokeWidth="2" />
        <polygon points="22,14 27,24 24,28 22,25 20,28 17,24" fill="#231F20" />
      </svg>
    );
  }

  if (c === "CRY") {
    // Crystal Palace: Red & blue vertical stripes with eagle
    return (
      <svg viewBox="0 0 40 46" className={className} fill="none">
        <path d="M20 1L38 6V26C38 35.5 28.5 43.5 20 45C11.5 43.5 2 35.5 2 26V6L20 1Z" fill="#1B458F" stroke="#C4122E" strokeWidth="2" />
        <path d="M14 8V38M26 8V38" stroke="#C4122E" strokeWidth="5" />
        <path d="M16 22L20 16L24 22" stroke="#FFE500" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (c === "LEI") {
    // Leicester City: Blue circle with golden fox head
    return (
      <svg viewBox="0 0 44 44" className={className} fill="none">
        <circle cx="22" cy="22" r="21" fill="#0053A0" stroke="#FDBE11" strokeWidth="2" />
        <polygon points="22,14 28,26 22,23 16,26" fill="#FDBE11" />
      </svg>
    );
  }

  if (c === "IPS") {
    // Ipswich Town: Blue & red shield with rampant horse
    return (
      <svg viewBox="0 0 40 46" className={className} fill="none">
        <path d="M20 1L38 6V26C38 35.5 28.5 43.5 20 45C11.5 43.5 2 35.5 2 26V6L20 1Z" fill="#003399" stroke="#D11E39" strokeWidth="2" />
        <path d="M20 16C18 16 16 18 16 22C16 26 24 24 24 28C24 32 20 32 20 32" stroke="#FFE500" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Generic clean circular emblem fallback with team initials
  return (
    <div className={`rounded-full bg-[#271038] border border-white/20 flex items-center justify-center font-mono font-bold text-[10px] text-white shadow-sm ${className}`}>
      {c.slice(0, 3)}
    </div>
  );
}

/* -------------------------------------------------------------
   Canonical Matchweek 10 Fixtures Slate (Strictly 20 Teams, No Duplicates)
   ------------------------------------------------------------- */
interface FixtureRowItem {
  id: string;
  homeTeam: { name: string; code: string };
  awayTeam: { name: string; code: string };
  scoreOrTime: string;
  status: "FT" | "HT" | "LIVE" | "SCHEDULED";
  minute?: number;
  hasRedCard?: boolean;
  redCardTeam?: "home" | "away";
  broadcasters?: string[];
  isMatchContextAvailable: boolean;
}

// 5 Saturday Finished Fixtures (10 teams)
const YESTERDAY_FIXTURES: FixtureRowItem[] = [
  {
    id: "bha-nfo",
    homeTeam: { name: "Brighton & Hove Albion", code: "BHA" },
    awayTeam: { name: "Nottingham Forest", code: "NFO" },
    scoreOrTime: "2 - 1",
    status: "FT",
    isMatchContextAvailable: true,
  },
  {
    id: "whu-bou",
    homeTeam: { name: "West Ham United", code: "WHU" },
    awayTeam: { name: "Bournemouth", code: "BOU" },
    scoreOrTime: "1 - 0",
    status: "FT",
    isMatchContextAvailable: true,
  },
  {
    id: "bre-ful",
    homeTeam: { name: "Brentford", code: "BRE" },
    awayTeam: { name: "Fulham", code: "FUL" },
    scoreOrTime: "2 - 0",
    status: "FT",
    isMatchContextAvailable: false,
  },
  {
    id: "lei-ips",
    homeTeam: { name: "Leicester City", code: "LEI" },
    awayTeam: { name: "Ipswich Town", code: "IPS" },
    scoreOrTime: "1 - 1",
    status: "FT",
    isMatchContextAvailable: false,
  },
  {
    id: "eve-sou",
    homeTeam: { name: "Everton", code: "EVE" },
    awayTeam: { name: "Southampton", code: "SOU" },
    scoreOrTime: "1 - 0",
    status: "FT",
    hasRedCard: true,
    redCardTeam: "away",
    isMatchContextAvailable: false,
  },
];

export default function LiveMatchesPage() {
  const { selectedMatch, selectMatch, availableMatches } = useMatchContext();
  const [matchweek, setMatchweek] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Live in-play match (Arsenal vs Chelsea) from MatchContext
  const primaryLiveMatch =
    availableMatches.find((m) => m.id === "ars-che") || selectedMatch;

  // 5 Sunday & Monday Fixtures (Remaining 10 teams - ZERO team overlaps with Yesterday)
  const todayFixtures: FixtureRowItem[] = useMemo(() => {
    return [
      {
        id: primaryLiveMatch.id,
        homeTeam: {
          name: primaryLiveMatch.homeTeam.name,
          code: primaryLiveMatch.homeTeam.code,
        },
        awayTeam: {
          name: primaryLiveMatch.awayTeam.name,
          code: primaryLiveMatch.awayTeam.code,
        },
        scoreOrTime: `${primaryLiveMatch.homeScore} - ${primaryLiveMatch.awayScore}`,
        status: primaryLiveMatch.status === "IN_PLAY" ? "LIVE" : "SCHEDULED",
        minute: primaryLiveMatch.minute,
        broadcasters: ["SELECT HD", "PREMIER"],
        isMatchContextAvailable: true,
      },
      {
        id: "tot-ast",
        homeTeam: { name: "Tottenham Hotspur", code: "TOT" },
        awayTeam: { name: "Aston Villa", code: "AVL" },
        scoreOrTime: "14:00",
        status: "SCHEDULED",
        broadcasters: ["SELECT HD", "PREMIER"],
        isMatchContextAvailable: true,
      },
      {
        id: "mci-liv",
        homeTeam: { name: "Manchester City", code: "MCI" },
        awayTeam: { name: "Liverpool", code: "LIV" },
        scoreOrTime: "16:30",
        status: "SCHEDULED",
        broadcasters: ["SELECT HD", "PREMIER"],
        isMatchContextAvailable: true,
      },
      {
        id: "wol-cry",
        homeTeam: { name: "Wolverhampton Wanderers", code: "WOL" },
        awayTeam: { name: "Crystal Palace", code: "CRY" },
        scoreOrTime: "17:30",
        status: "SCHEDULED",
        broadcasters: ["SELECT HD", "PREMIER"],
        isMatchContextAvailable: false,
      },
      {
        id: "new-mun",
        homeTeam: { name: "Newcastle United", code: "NEW" },
        awayTeam: { name: "Manchester United", code: "MUN" },
        scoreOrTime: "20:00",
        status: "SCHEDULED",
        broadcasters: ["SELECT HD", "PREMIER"],
        isMatchContextAvailable: true,
      },
    ];
  }, [primaryLiveMatch]);

  // Filter both lists based on search
  const filteredYesterday = useMemo(() => {
    if (!searchQuery.trim()) return YESTERDAY_FIXTURES;
    const q = searchQuery.toLowerCase();
    return YESTERDAY_FIXTURES.filter(
      (m) =>
        m.homeTeam.name.toLowerCase().includes(q) ||
        m.awayTeam.name.toLowerCase().includes(q) ||
        m.homeTeam.code.toLowerCase().includes(q) ||
        m.awayTeam.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredToday = useMemo(() => {
    if (!searchQuery.trim()) return todayFixtures;
    const q = searchQuery.toLowerCase();
    return todayFixtures.filter(
      (m) =>
        m.homeTeam.name.toLowerCase().includes(q) ||
        m.awayTeam.name.toLowerCase().includes(q) ||
        m.homeTeam.code.toLowerCase().includes(q) ||
        m.awayTeam.code.toLowerCase().includes(q)
    );
  }, [searchQuery, todayFixtures]);

  const handleSelectFixture = (fixtureId: string) => {
    // If it corresponds to a match in context, select it
    if (availableMatches.some((m) => m.id === fixtureId)) {
      selectMatch(fixtureId);
    } else {
      // Default to live primary match
      selectMatch("ars-che");
    }
  };

  return (
    <div className="space-y-6 font-poppins pb-16 max-w-5xl mx-auto">
      {/* 1. TOP MATCHWEEK NAVIGATOR */}
      <div className="flex items-center justify-center gap-4 py-1">
        <button
          type="button"
          onClick={() => setMatchweek((w) => Math.max(1, w - 1))}
          aria-label="Previous Matchweek"
          className="w-8 h-8 rounded-full bg-[#141A22] hover:bg-[#1A222D] border border-[#222B36] hover:border-[#BAF36A]/40 flex items-center justify-center text-[#8E9CA8] hover:text-white transition cursor-pointer shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center select-none">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
            Matchweek {matchweek}
          </h2>
          <p className="text-xs text-[#8E9CA8] font-medium">
            Sat 31 Oct - Mon 2 Nov
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMatchweek((w) => Math.min(38, w + 1))}
          aria-label="Next Matchweek"
          className="w-8 h-8 rounded-full bg-[#141A22] hover:bg-[#1A222D] border border-[#222B36] hover:border-[#BAF36A]/40 flex items-center justify-center text-[#8E9CA8] hover:text-white transition cursor-pointer shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Search & Context Status Bar */}
      <div className="flex items-center justify-between px-2 gap-4">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fixtures or teams..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-[#12161F] border border-[#1E2633] rounded-xl text-white placeholder-[#64748B] focus:outline-none focus:border-[#BAF36A] focus:ring-1 focus:ring-[#BAF36A]/30 transition"
          />
        </div>

        <div className="text-[11px] font-mono text-[#8E9CA8] hidden sm:flex items-center gap-2">
          <span>Active Context:</span>
          <span className="font-bold text-[#BAF36A] bg-[#182614] border border-[#BAF36A]/30 px-2 py-0.5 rounded">
            {selectedMatch.homeTeam.code} vs {selectedMatch.awayTeam.code}
          </span>
        </div>
      </div>

      {/* 2. MAIN FIXTURES CONTAINER */}
      <div className="bg-[#12161F] border border-[#1E2633] rounded-2xl sm:rounded-3xl p-3 sm:p-6 lg:p-7 shadow-xl space-y-6 sm:space-y-8 select-none">
        {/* ========================================================
            SECTION A: YESTERDAY (Full Time Results - 5 Matches, 10 Teams)
           ======================================================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-xl font-bold text-white tracking-tight">
                Yesterday
              </h3>
              <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#1A222D] border border-[#273240] text-[#8E9CA8]">
                {filteredYesterday.length} FT
              </span>
            </div>
            <button
              type="button"
              className="text-xs text-[#8E9CA8] hover:text-white px-2.5 sm:px-3 py-1 rounded-full bg-[#1A222D] border border-[#273240] hover:border-[#BAF36A]/40 transition flex items-center gap-1 cursor-pointer"
            >
              <span>Live blog</span>
              <ChevronRight className="w-3 h-3 text-[#BAF36A]" />
            </button>
          </div>

          <div className="divide-y divide-[#1E2633]">
            {filteredYesterday.map((m) => {
              const isSelected = selectedMatch.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectFixture(m.id)}
                  className={`py-3 sm:py-3.5 flex items-center justify-between cursor-pointer group transition-all rounded-xl px-1.5 sm:px-3 ${
                    isSelected
                      ? "bg-[#182614]/80 ring-1 ring-[#BAF36A]/60 shadow-md"
                      : "hover:bg-[#161D27]/70"
                  }`}
                >
                  {/* Left: Status indicator (FT) */}
                  <div className="w-8 sm:w-14 shrink-0 text-left">
                    <span className="text-xs font-mono font-bold text-[#64748B]">
                      {m.status}
                    </span>
                  </div>

                  {/* Center: Matchup (Home - Score - Away) */}
                  <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-4 max-w-xl mx-auto min-w-0">
                    {/* Home Team */}
                    <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-2 text-right min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#BAF36A] transition-colors truncate">
                        {m.homeTeam.name}
                      </span>
                      <TeamCrest code={m.homeTeam.code} className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                    </div>

                    {/* Score */}
                    <div className="shrink-0 px-2 sm:px-3 py-1 font-mono font-black text-xs sm:text-sm text-white bg-[#1A222D] border border-[#273240] rounded-md text-center min-w-[44px] sm:min-w-[50px] shadow-xs">
                      {m.scoreOrTime}
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 flex items-center justify-start gap-1.5 sm:gap-2 text-left min-w-0">
                      <TeamCrest code={m.awayTeam.code} className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                      <div className="flex items-center gap-1 truncate">
                        <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#BAF36A] transition-colors truncate">
                          {m.awayTeam.name}
                        </span>
                        {m.hasRedCard && (
                          <span
                            className="w-1.5 h-2.5 bg-[#EF4444] rounded-[1px] shrink-0"
                            title="Red Card Issued"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Status */}
                  <div className="w-7 sm:w-14 shrink-0 text-right">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-[#BAF36A] bg-[#182614] border border-[#BAF36A]/40 px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                        <Check className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">Active</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#64748B] group-hover:text-[#BAF36A] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                        Select
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            SECTION B: TODAY & UPCOMING (Live In-Play & Remaining 10 Teams)
           ======================================================== */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-xl font-bold text-white tracking-tight">
                Today
              </h3>
              <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#182614] border border-[#BAF36A]/30 text-[#BAF36A] font-bold">
                1 LIVE · {filteredToday.length - 1} Scheduled
              </span>
            </div>
            <button
              type="button"
              className="text-xs text-[#8E9CA8] hover:text-white px-2.5 sm:px-3 py-1 rounded-full bg-[#1A222D] border border-[#273240] hover:border-[#BAF36A]/40 transition flex items-center gap-1 cursor-pointer"
            >
              <span>Live blog</span>
              <ChevronRight className="w-3 h-3 text-[#BAF36A]" />
            </button>
          </div>

          <div className="divide-y divide-[#1E2633]">
            {filteredToday.map((m) => {
              const isSelected = selectedMatch.id === m.id;
              const isLive = m.status === "LIVE" || m.status === "HT";

              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectFixture(m.id)}
                  className={`py-3.5 sm:py-4 flex items-center justify-between cursor-pointer group transition-all rounded-xl px-1.5 sm:px-3 relative ${
                    isSelected
                      ? "bg-[#182614]/80 ring-1 ring-[#BAF36A]/60 shadow-lg"
                      : "hover:bg-[#161D27]/70"
                  } ${
                    isLive
                      ? "border-l-4 border-l-[#BAF36A] pl-2 sm:pl-3 bg-[#BAF36A]/5"
                      : ""
                  }`}
                >
                  {/* Left: Status indicator (HT, 78', or Kickoff Time) */}
                  <div className="w-10 sm:w-16 shrink-0 text-left">
                    {isLive ? (
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1 text-[11px] sm:text-xs font-mono font-bold text-[#BAF36A]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#BAF36A] animate-pulse" />
                          {m.status === "HT" ? "HT" : `${m.minute || 78}'`}
                        </span>
                        <span className="text-[9px] font-mono text-[#BAF36A]/80 uppercase tracking-widest font-semibold">
                          LIVE
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-mono font-semibold text-[#8E9CA8]">
                        {m.scoreOrTime}
                      </span>
                    )}
                  </div>

                  {/* Center: Matchup (Home - Score - Away + Broadcasters) */}
                  <div className="flex-1 flex flex-col items-center min-w-0">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-4 w-full max-w-xl mx-auto min-w-0">
                      {/* Home Team */}
                      <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-2 text-right min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#BAF36A] transition-colors truncate">
                          {m.homeTeam.name}
                        </span>
                        <TeamCrest code={m.homeTeam.code} className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                      </div>

                      {/* Center Score Pill */}
                      <div
                        className={`shrink-0 px-2 sm:px-3 py-1 font-mono font-black text-xs sm:text-sm rounded-md shadow min-w-[46px] sm:min-w-[54px] text-center transition-all ${
                          isLive
                            ? "bg-[#BAF36A] text-[#0B0D11] shadow-md font-bold"
                            : "bg-[#1A222D] text-white border border-[#273240]"
                        }`}
                      >
                        {m.scoreOrTime}
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 flex items-center justify-start gap-1.5 sm:gap-2 text-left min-w-0">
                        <TeamCrest code={m.awayTeam.code} className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                        <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#BAF36A] transition-colors truncate">
                          {m.awayTeam.name}
                        </span>
                      </div>
                    </div>

                    {/* Broadcaster Badges */}
                    {m.broadcasters && (
                      <div className="flex items-center justify-center gap-1.5 mt-1.5">
                        <div className="px-1.5 sm:px-2 py-0.5 rounded bg-[#1A222D] border border-[#273240] text-[8px] font-mono text-[#8E9CA8] font-bold tracking-wider shadow-xs">
                          SPORT
                        </div>
                        <div className="px-1.5 sm:px-2 py-0.5 rounded bg-white/10 border border-white/15 text-white text-[8px] font-mono font-extrabold tracking-wider shadow-xs">
                          SELECT HD
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Selection sync indicator */}
                  <div className="w-7 sm:w-16 shrink-0 text-right">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-[#BAF36A] bg-[#182614] border border-[#BAF36A]/40 px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                        <Check className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">Active</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#64748B] group-hover:text-[#BAF36A] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                        Select
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. ACTIVE MATCH CONTEXT QUICK-ACTION TRAY */}
      <div className="bg-[#12161F] border border-[#1E2633] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#182614] border border-[#BAF36A]/30 flex items-center justify-center text-[#BAF36A] shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#BAF36A] font-bold">
                Synchronized Match Context
              </span>
              <span className="text-xs text-[#8E9CA8]">· Matchweek {matchweek}</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5">
              {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name} ({selectedMatch.homeScore} - {selectedMatch.awayScore})
            </h4>
          </div>
        </div>

        {/* Quick Launch Buttons into Analysis Modules */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <Link
            href="/tactiq"
            className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-[#161D27] hover:bg-[#1E2633] border border-[#273240] hover:border-[#BAF36A]/40 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group"
          >
            <span>TactiQ Board</span>
            <ArrowRight className="w-3 h-3 text-[#BAF36A] group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/context90"
            className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-[#161D27] hover:bg-[#1E2633] border border-[#273240] hover:border-[#BAF36A]/40 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group"
          >
            <span>Context90</span>
            <ArrowRight className="w-3 h-3 text-[#BAF36A] group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/playerpulse"
            className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-[#161D27] hover:bg-[#1E2633] border border-[#273240] hover:border-[#BAF36A]/40 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group"
          >
            <span>PlayerPulse</span>
            <ArrowRight className="w-3 h-3 text-[#BAF36A] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Information Telemetry Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-[11px] font-mono text-[#64748B] px-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#BAF36A]" />
          <span>Premier League Match Center Telemetry · 10 Fixtures · 20 Clubs</span>
        </div>
        <span>Select any fixture to update tactical modules</span>
      </div>
    </div>
  );
}
