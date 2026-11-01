"use client";

import React, { useState, useMemo, useRef } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { useMatchContext } from "@/context/MatchContext";
import { RAW_STANDINGS_DATA } from "@/data/standings";
import { calculateStandings } from "@/lib/football/standings";
import { calculateMatchScenarios } from "@/lib/football/scenarios";
import { buildRaceStateEvidence } from "@/lib/ai/racestate-evidence";
import { RaceStateAnalysisResult } from "@/lib/ai/gemini-service";
import {
  Trophy,
  RotateCcw,
  Check,
  Send,
  Loader2,
  Trash2,
  AlertCircle,
  ArrowRight,
  Info,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  SlidersHorizontal,
  Sun,
  Moon,
  Columns,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  result?: RaceStateAnalysisResult;
  timestamp: string;
}

let messageCounter = 0;
function createMessageId(): string {
  messageCounter += 1;
  return `racestate-msg-${messageCounter}`;
}

// Club Badge colors & symbols for authentic Premier League graphic look
const CLUB_CRESTS: Record<
  string,
  { bg: string; border: string; text: string; code: string; secondary?: string }
> = {
  liv: { bg: "#C8102E", border: "#9E0C24", text: "#FFFFFF", code: "LIV" },
  mci: { bg: "#6CABDD", border: "#4F9BCF", text: "#FFFFFF", code: "MCI" },
  lei: { bg: "#003090", border: "#00246D", text: "#FDBE11", code: "LEI" },
  che: { bg: "#034694", border: "#022F66", text: "#FFFFFF", code: "CHE" },
  mun: { bg: "#DA291C", border: "#B51F14", text: "#FBE122", code: "MUN" },
  wol: { bg: "#FDB913", border: "#CFA010", text: "#231F20", code: "WOL" },
  tot: { bg: "#132257", border: "#0B1536", text: "#FFFFFF", code: "TOT" },
  ars: { bg: "#EF0107", border: "#C00005", text: "#FFFFFF", code: "ARS" },
  bur: { bg: "#6C1D45", border: "#521434", text: "#99D6EA", code: "BUR" },
  cry: { bg: "#1B458F", border: "#123066", text: "#C4122E", code: "CRY" },
  eve: { bg: "#003399", border: "#002266", text: "#FFFFFF", code: "EVE" },
  new: { bg: "#241F20", border: "#110E0F", text: "#FFFFFF", code: "NEW" },
  sou: { bg: "#D71920", border: "#AD1218", text: "#FFFFFF", code: "SOU" },
  bha: { bg: "#0057B8", border: "#003F85", text: "#FFFFFF", code: "BHA" },
  whu: { bg: "#7A263A", border: "#581A29", text: "#1BB1E7", code: "WHU" },
  bou: { bg: "#DA291C", border: "#B51F14", text: "#000000", code: "BOU" },
  avl: { bg: "#670E36", border: "#4A0825", text: "#95BFE5", code: "AVL" },
  nfo: { bg: "#DD0000", border: "#AA0000", text: "#FFFFFF", code: "NFO" },
  ful: { bg: "#000000", border: "#222222", text: "#CC0000", code: "FUL" },
  bre: { bg: "#E30613", border: "#B8040E", text: "#FEE100", code: "BRE" },
  ips: { bg: "#0000FF", border: "#0000B3", text: "#FFFFFF", code: "IPS" },
};

function ClubCrest({
  teamId,
  teamCode,
  size = "md",
}: {
  teamId: string;
  teamCode: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const crest = CLUB_CRESTS[teamId] || {
    bg: "#1E293B",
    border: "#334155",
    text: "#FFFFFF",
    code: teamCode,
  };

  const dim =
    size === "sm"
      ? "w-5 h-5 text-[9px]"
      : size === "lg"
        ? "w-8 h-8 text-xs"
        : size === "xl"
          ? "w-10 h-10 text-sm font-extrabold"
          : "w-6 h-6 text-[10px]";

  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-bold font-poppins shadow-md shrink-0 border ring-1 ring-white/10`}
      style={{
        backgroundColor: crest.bg,
        borderColor: crest.border,
        color: crest.text,
      }}
    >
      {crest.code.substring(0, 3)}
    </div>
  );
}

// Premier League Lion Emblem SVG
function PremierLeagueLion({ className = "w-6 h-6 text-[#38003C]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
      {/* Crown */}
      <path d="M26 25 L34 36 L50 22 L66 36 L74 25 L71 40 L29 40 Z" fill="currentColor" />
      <circle cx="26" cy="22" r="3" fill="currentColor" />
      <circle cx="50" cy="19" r="3" fill="currentColor" />
      <circle cx="74" cy="22" r="3" fill="currentColor" />
      {/* Lion Profile Head */}
      <path
        d="M30 42 C30 42 26 48 26 56 C26 68 35 76 46 80 C43 85 46 91 48 93 C55 91 58 84 58 84 C65 82 72 77 75 68 C78 59 76 50 73 46 C70 42 66 42 63 42 C61 42 58 45 56 46 C54 44 51 41 46 41 C40 41 35 42 30 42 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function RaceStatePage() {
  const { selectedMatch } = useMatchContext();
  const [activeTab, setActiveTab] = useState("all");
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [tableStyle, setTableStyle] = useState<"broadcast-white" | "broadcast-dark">("broadcast-white");
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  // AI inquiry chat state isolated per match
  const [chatHistoryByMatch, setChatHistoryByMatch] = useState<Record<string, ChatMessage[]>>({});
  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Deterministically compute baseline standings table (Points = 3 * W + D, GD = GF - GA)
  const baselineStandings = useMemo(() => {
    return calculateStandings(RAW_STANDINGS_DATA);
  }, []);

  // Baseline position lookup map for calculating deltas
  const baselinePosMap = useMemo(() => {
    const map: Record<string, { position: number; points: number; gd: number }> = {};
    baselineStandings.forEach((s) => {
      map[s.teamId] = { position: s.position, points: s.points, gd: s.goalDifference };
    });
    return map;
  }, [baselineStandings]);

  // Deterministically compute match-specific scenarios for the currently selected match
  const scenarios = useMemo(() => {
    return calculateMatchScenarios(selectedMatch, RAW_STANDINGS_DATA);
  }, [selectedMatch]);

  // Derived deterministic evidence payload for the active match
  const evidencePayload = useMemo(() => {
    return buildRaceStateEvidence(selectedMatch.id);
  }, [selectedMatch.id]);

  // Reset active scenario simulation whenever the selected match changes
  const [prevMatchId, setPrevMatchId] = useState(selectedMatch.id);
  if (selectedMatch.id !== prevMatchId) {
    setPrevMatchId(selectedMatch.id);
    setActiveScenarioId(null);
  }

  // Determine which standings snapshot to display (baseline vs active scenario snapshot)
  const activeSnapshot = useMemo(() => {
    if (!activeScenarioId) return baselineStandings;
    const foundScenario = scenarios.find((s) => s.scenarioId === activeScenarioId);
    return foundScenario ? foundScenario.tableSnapshot : baselineStandings;
  }, [activeScenarioId, scenarios, baselineStandings]);

  const filterTabs = [
    { id: "all", label: "Full Table (20)", count: 20 },
    { id: "ucl", label: "Champions League (Top 4)", count: 4 },
    { id: "europe", label: "Europe (1-6)", count: 6 },
    { id: "relegation", label: "Relegation (18-20)", count: 3 },
  ];

  const displayedRows = activeSnapshot.filter((row) => {
    if (activeTab === "ucl") return row.position <= 4;
    if (activeTab === "europe") return row.position <= 6;
    if (activeTab === "relegation") return row.position >= 18;
    return true;
  });

  const leaderStanding = activeSnapshot[0];
  const fourthStanding = activeSnapshot[3];
  const fifthStanding = activeSnapshot[4];
  const eighteenthStanding = activeSnapshot[17];
  const seventeenthStanding = activeSnapshot[16];

  const uclBuffer =
    fourthStanding && fifthStanding ? fourthStanding.points - fifthStanding.points : 0;
  const relegationBuffer =
    seventeenthStanding && eighteenthStanding
      ? seventeenthStanding.points - eighteenthStanding.points
      : 0;

  // Active chat messages for current match
  const activeChat = useMemo(() => {
    return chatHistoryByMatch[selectedMatch.id] || [];
  }, [chatHistoryByMatch, selectedMatch.id]);

  // Suggested contextual inquiries tailored to active match
  const suggestedQuestions = useMemo(() => {
    const home = selectedMatch.homeTeam.name;
    const away = selectedMatch.awayTeam.name;
    return [
      `How does a ${home} win alter the title race and top-four picture?`,
      `What are the European qualification stakes between ${home} and ${away}?`,
      `Which clubs outside this fixture are displaced by a draw?`,
      `What tie-break rules currently determine the top-four boundary?`,
      `What limitations should I keep in mind when viewing these scenarios?`,
    ];
  }, [selectedMatch.homeTeam.name, selectedMatch.awayTeam.name]);

  const handleAskQuestion = async (queryText?: string) => {
    const questionToAsk = (queryText || inputQuestion).trim();
    if (!questionToAsk || isLoadingAi) return;

    setInputQuestion("");
    setAiError(null);
    setIsLoadingAi(true);

    const userMessage: ChatMessage = {
      id: createMessageId(),
      sender: "user",
      text: questionToAsk,
      timestamp: "Just now",
    };

    setChatHistoryByMatch((prev) => ({
      ...prev,
      [selectedMatch.id]: [...(prev[selectedMatch.id] || []), userMessage],
    }));

    try {
      const response = await fetch("/api/ai/racestate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          question: questionToAsk,
        }),
      });

      const data: RaceStateAnalysisResult = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to receive league intelligence response from server.");
      }

      const aiMessage: ChatMessage = {
        id: createMessageId(),
        sender: "ai",
        text: data.answer,
        result: data,
        timestamp: "Just now",
      };

      setChatHistoryByMatch((prev) => ({
        ...prev,
        [selectedMatch.id]: [...(prev[selectedMatch.id] || []), aiMessage],
      }));
    } catch (err: unknown) {
      const errorMsg =
        (err as Error).message || "An unexpected error occurred during inquiry analysis.";
      setAiError(errorMsg);

      const errorMessage: ChatMessage = {
        id: createMessageId(),
        sender: "ai",
        text: `Analysis unavailable: ${errorMsg}`,
        timestamp: "Just now",
      };

      setChatHistoryByMatch((prev) => ({
        ...prev,
        [selectedMatch.id]: [...(prev[selectedMatch.id] || []), errorMessage],
      }));
    } finally {
      setIsLoadingAi(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleClearChat = () => {
    setChatHistoryByMatch((prev) => ({
      ...prev,
      [selectedMatch.id]: [],
    }));
    setAiError(null);
  };

  const activeScenarioObj = scenarios.find((s) => s.scenarioId === activeScenarioId);
  const activeProcessedScen = evidencePayload?.scenarios.find(
    (s) => s.scenarioId === activeScenarioId
  );

  return (
    <div className="space-y-6 font-poppins pb-12 text-[#E1E7EC]">
      {/* Header with Title and Reset Controls */}
      <PageHeader
        title="RaceState League Intelligence"
        description="Deterministic Premier League standings engine and scenario intelligence. Models points, goal difference, and qualification displacement live across all 20 clubs."
        badge={
          <div className="flex items-center gap-2 font-poppins">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#38003C] text-white text-xs font-bold shadow-md">
              <Trophy className="w-3.5 h-3.5 text-[#00FF87]" />
              {selectedMatch.fixture.matchweekLabel} Baseline
            </span>
            <span className="text-[10px] font-mono uppercase bg-[#141A22] border border-[#272E32] px-2.5 py-1 rounded text-[#8E9CA8]">
              OFFICIAL FORMULA: PTS = 3W + D
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#8E9CA8]">
              Fixture in focus:{" "}
              <strong className="text-white">
                {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
              </strong>
            </span>
            {activeScenarioId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveScenarioId(null)}
                className="text-xs gap-1.5 text-[#00FF87] hover:text-white border-[#00FF87]/30 hover:bg-[#00FF87]/10"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset to Baseline
              </Button>
            )}
          </div>
        }
      />

      {/* 4 SUMMARY STAT CARDS (POLISHED, HIGH-CONTRAST, MODERN UX) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: League Leader */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121B26] to-[#0E141C] border border-[#223348] shadow-md flex flex-col justify-between hover:border-[#3B82F6]/50 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#8E9CA8] uppercase tracking-wider">
              League Leader
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6CABDD]/15 text-[#6CABDD] border border-[#6CABDD]/30">
              {leaderStanding.team.code}
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {leaderStanding.points}
              </span>
              <span className="text-xs font-bold text-[#8E9CA8] uppercase">Points</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1C2633] flex items-center justify-between text-[11px] text-[#8E9CA8]">
            <span className="truncate">{leaderStanding.team.name}</span>
            <span className="font-semibold text-[#00FF87] shrink-0">
              +{leaderStanding.goalDifference} GD
            </span>
          </div>
        </div>

        {/* Card 2: UCL 4th Cutoff */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#18182B] to-[#0E141C] border border-[#2D2A4C] shadow-md flex flex-col justify-between hover:border-[#60A5FA]/50 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#8E9CA8] uppercase tracking-wider">
              UCL 4th Place Cutoff
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#60A5FA]/15 text-[#60A5FA] border border-[#60A5FA]/30">
              +{uclBuffer} pt buffer
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {fourthStanding.points}
              </span>
              <span className="text-xs font-bold text-[#8E9CA8] uppercase">Points</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#232038] flex items-center justify-between text-[11px] text-[#8E9CA8]">
            <span className="truncate">{fourthStanding.team.name}</span>
            <span className="font-semibold text-white/80 shrink-0">
              over 5th ({fifthStanding.team.code})
            </span>
          </div>
        </div>

        {/* Card 3: Safety Line */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#261518] to-[#0E141C] border border-[#442328] shadow-md flex flex-col justify-between hover:border-[#EF4444]/50 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#8E9CA8] uppercase tracking-wider">
              Safety Line (17th)
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${relegationBuffer <= 2
                  ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30"
                  : "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30"
                }`}
            >
              +{relegationBuffer} pt safety
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {seventeenthStanding.points}
              </span>
              <span className="text-xs font-bold text-[#8E9CA8] uppercase">Points</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#311B1E] flex items-center justify-between text-[11px] text-[#8E9CA8]">
            <span className="truncate">{seventeenthStanding.team.name}</span>
            <span className="font-semibold text-[#EF4444] shrink-0">
              over 18th ({eighteenthStanding.team.code})
            </span>
          </div>
        </div>

        {/* Card 4: Tie-Break Order */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121921] to-[#0E141C] border border-[#222E3C] shadow-md flex flex-col justify-between hover:border-[#94A3B8]/50 transition group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#8E9CA8] uppercase tracking-wider">
              Tie-Break Criteria
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-white/70 bg-white/5 border border-white/10">
              Official
            </span>
          </div>

          <div className="my-2">
            <span className="text-lg font-bold text-white tracking-tight block">
              PTS → GD → GF
            </span>
          </div>

          <div className="pt-2 border-t border-[#1E2632] flex items-center justify-between text-[11px] text-[#8E9CA8]">
            <span>Closed 20-club model</span>
            <span className="font-semibold text-white/70">Alphabetical 4th</span>
          </div>
        </div>
      </div>

      {/* MATCHDAY SIMULATION BOARD (REFINED HIGH-IMPACT BROADCAST UX) */}
      <div className="p-5 sm:p-6 bg-[#121721] border border-[#202936] rounded-2xl space-y-5 shadow-xl relative overflow-hidden">
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#3B82F6]/5 via-transparent to-transparent pointer-events-none" />

        {/* Header: Fixture Banner with Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#202936]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C2432] border border-[#2B384B] flex items-center justify-center text-white shadow-inner">
              <SlidersHorizontal className="w-5 h-5 text-[#60A5FA]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Matchday Simulation Board
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/30">
                  {selectedMatch.homeTeam.code} vs {selectedMatch.awayTeam.code}
                </span>
              </div>
              <p className="text-xs text-[#8E9CA8] mt-0.5">
                Click any match outcome below to calculate deterministic table displacement across all 20 clubs.
              </p>
            </div>
          </div>

          {activeScenarioId && (
            <button
              onClick={() => setActiveScenarioId(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1C2533] hover:bg-[#253245] text-xs font-bold text-white border border-[#3B82F6]/50 shadow-md transition shrink-0 group"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#00FF87] group-hover:rotate-[-45deg] transition-transform" />
              <span>Reset Standings</span>
            </button>
          )}
        </div>

        {/* 3 Outcome Interactive Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((scen) => {
            const isSelected = activeScenarioId === scen.scenarioId;
            const isHomeWin = scen.scenarioId === "home-win";
            const isDraw = scen.scenarioId === "draw";

            return (
              <button
                key={scen.scenarioId}
                onClick={() => setActiveScenarioId(isSelected ? null : scen.scenarioId)}
                className={`p-5 rounded-2xl text-left transition-all border flex flex-col justify-between relative overflow-hidden group ${isSelected
                    ? "bg-[#1B2433] border-[#3B82F6] shadow-xl ring-2 ring-[#3B82F6]/60"
                    : "bg-[#0E131A] border-[#1F2734] hover:border-[#334255] hover:bg-[#141B24]"
                  }`}
              >
                {/* Active Indicator Top Pill */}
                <div className="flex items-center justify-between w-full mb-3">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${isHomeWin
                        ? "bg-[#EF0107]/15 text-[#FF6B6B] border-[#EF0107]/30"
                        : isDraw
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : "bg-[#034694]/20 text-[#60A5FA] border-[#034694]/40"
                      }`}
                  >
                    {isHomeWin
                      ? `${selectedMatch.homeTeam.code} Win (+3 PTS)`
                      : isDraw
                        ? "Score Draw (+1 PT EACH)"
                        : `${selectedMatch.awayTeam.code} Win (+3 PTS)`}
                  </span>

                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#00FF87] bg-[#00FF87]/15 px-2 py-0.5 rounded-full border border-[#00FF87]/30">
                      <Check className="w-3 h-3" /> Live
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#64748B] group-hover:text-white transition">
                      Simulate
                    </span>
                  )}
                </div>

                {/* Scoreline Centerpiece with Team Badges */}
                <div className="my-2 flex items-center justify-between p-3 rounded-xl bg-[#141A24] border border-[#202936]">
                  <div className="flex items-center gap-2">
                    <ClubCrest
                      teamId={selectedMatch.homeTeam.id}
                      teamCode={selectedMatch.homeTeam.code}
                      size="md"
                    />
                    <span className="font-bold text-xs text-white">
                      {selectedMatch.homeTeam.code}
                    </span>
                  </div>

                  <div className="text-xl sm:text-2xl font-black text-white tracking-wider font-mono">
                    {isHomeWin ? "2 — 1" : isDraw ? "1 — 1" : "1 — 2"}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">
                      {selectedMatch.awayTeam.code}
                    </span>
                    <ClubCrest
                      teamId={selectedMatch.awayTeam.id}
                      teamCode={selectedMatch.awayTeam.code}
                      size="md"
                    />
                  </div>
                </div>

                {/* Scenario Description */}
                <p className="text-xs text-[#8E9CA8] mt-2 mb-3 leading-relaxed line-clamp-2">
                  {scen.label}
                </p>

                {/* Projected Standings Footer Bar */}
                <div className="pt-3 border-t border-[#1E2632] flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#8E9CA8]">{selectedMatch.homeTeam.code}:</span>
                    <span
                      className={`font-bold ${scen.homeTeamStandingsChange.newPosition <
                          scen.homeTeamStandingsChange.previousPosition
                          ? "text-[#00FF87]"
                          : "text-white"
                        }`}
                    >
                      Pos #{scen.homeTeamStandingsChange.newPosition}
                    </span>
                    {scen.homeTeamStandingsChange.newPosition <
                      scen.homeTeamStandingsChange.previousPosition && (
                        <span className="text-[10px] text-[#00FF87]">▲</span>
                      )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[#8E9CA8]">{selectedMatch.awayTeam.code}:</span>
                    <span
                      className={`font-bold ${scen.awayTeamStandingsChange.newPosition <
                          scen.awayTeamStandingsChange.previousPosition
                          ? "text-[#60A5FA]"
                          : "text-white"
                        }`}
                    >
                      Pos #{scen.awayTeamStandingsChange.newPosition}
                    </span>
                    {scen.awayTeamStandingsChange.newPosition <
                      scen.awayTeamStandingsChange.previousPosition && (
                        <span className="text-[10px] text-[#60A5FA]">▲</span>
                      )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Simulation Alert Strip (When an outcome is active) */}
        {activeScenarioObj && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#1B2738] to-[#121924] border border-[#3B82F6]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn shadow-lg">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF87] animate-pulse shrink-0" />
              <div>
                <span className="font-bold text-white block">
                  Projecting Scenario: {activeScenarioObj.label}
                </span>
                <span className="text-[#8E9CA8] text-[11px]">
                  The official table below now reflects recalculated points, goal difference, and rank adjustments.
                </span>
              </div>
            </div>

            {activeProcessedScen?.thirdPartyDisplacements &&
              activeProcessedScen.thirdPartyDisplacements.length > 0 && (
                <div className="px-3 py-1.5 rounded-lg bg-[#0F141C] border border-[#202936] text-[11px] text-[#F59E0B] font-medium shrink-0">
                  Displaces:{" "}
                  {activeProcessedScen.thirdPartyDisplacements
                    .map((t) => `${t.teamName} (#${t.previousPosition} → #${t.newPosition})`)
                    .join(", ")}
                </div>
              )}
          </div>
        )}
      </div>

      {/* FILTER TABS & TABLE VIEW CONTROLS (CLEAN SEGMENTED CONTROL UX) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Segmented Control Pill Bar */}
        <div className="inline-flex p-1 rounded-xl bg-[#0E131A] border border-[#1F2734] gap-1">
          {filterTabs.map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${isTabActive
                    ? "bg-[#1E293B] text-white shadow-sm ring-1 ring-white/10"
                    : "text-[#8E9CA8] hover:text-white"
                  }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* View and Theme Toggles */}
        <div className="flex items-center gap-2">
          {/* Detailed stats toggle */}
          <button
            onClick={() => setShowDetailedStats(!showDetailedStats)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-medium transition ${showDetailedStats
                ? "bg-[#1E293B] text-white border-[#3B82F6]"
                : "bg-[#121721] text-[#8E9CA8] border-[#202936] hover:text-white"
              }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{showDetailedStats ? "Compact View" : "Full Boxscore (W/D/L)"}</span>
          </button>

          {/* Table background theme toggle */}
          <button
            onClick={() =>
              setTableStyle(tableStyle === "broadcast-white" ? "broadcast-dark" : "broadcast-white")
            }
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-[#202936] bg-[#121721] text-[#8E9CA8] hover:text-white font-medium transition"
          >
            {tableStyle === "broadcast-white" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Theme: Broadcast White</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#60A5FA]" />
                <span>Theme: Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PREMIER LEAGUE OFFICIAL BROADCAST STANDINGS CARD (EXACT UI/UX FROM REFERENCE IMAGE) */}
      <div
        className={`rounded-2xl transition-all shadow-2xl overflow-hidden p-6 sm:p-8 relative ${tableStyle === "broadcast-white"
            ? "bg-[#FFFFFF] text-[#1E293B] border border-slate-200"
            : "bg-[#121721] text-[#F1F5F9] border border-[#202936]"
          }`}
      >
        {/* Official Premier League Header */}
        <div className="flex flex-col items-center justify-center pb-4 text-center select-none">
          <div className="flex items-center gap-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${tableStyle === "broadcast-white" ? "text-[#38003C]" : "text-white"
                }`}
            >
              Premier
            </span>
            <PremierLeagueLion
              className={`w-8 h-8 sm:w-9 sm:h-9 ${tableStyle === "broadcast-white" ? "text-[#38003C]" : "text-[#00FF87]"
                }`}
            />
            <span
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${tableStyle === "broadcast-white" ? "text-[#38003C]" : "text-white"
                }`}
            >
              League
            </span>
          </div>
        </div>

        {/* Matchweek Label & Column Titles */}
        <div
          className={`flex items-center justify-between pb-3 pt-2 text-xs font-bold uppercase tracking-wider border-b ${tableStyle === "broadcast-white"
              ? "border-slate-200 text-slate-700"
              : "border-[#202936] text-[#8E9CA8]"
            }`}
        >
          <div className="italic font-extrabold text-sm tracking-wide">
            {selectedMatch.fixture.matchweekLabel.toUpperCase()}
          </div>

          <div className="flex items-center gap-6 sm:gap-8 font-semibold">
            {showDetailedStats && (
              <>
                <span className="w-6 text-center hidden md:inline-block">W</span>
                <span className="w-6 text-center hidden md:inline-block">D</span>
                <span className="w-6 text-center hidden md:inline-block">L</span>
                <span className="w-8 text-center hidden lg:inline-block">GF</span>
                <span className="w-8 text-center hidden lg:inline-block">GA</span>
              </>
            )}
            <span className="w-6 text-center">P</span>
            <span className="w-8 text-center">GD</span>
            <span
              className={`w-9 text-right font-extrabold ${tableStyle === "broadcast-white" ? "text-[#38003C]" : "text-white"
                }`}
            >
              PTS
            </span>
          </div>
        </div>

        {/* Table Rows (Clean and spacious like official broadcast image) */}
        <div
          className={`divide-y ${tableStyle === "broadcast-white" ? "divide-slate-100" : "divide-[#1A222E]"
            }`}
        >
          {displayedRows.map((teamStanding) => {
            const isUCL = teamStanding.zone === "ucl";
            const isEurope = teamStanding.zone === "uel" || teamStanding.zone === "uecl";
            const isRel = teamStanding.zone === "relegation";

            const isHome = teamStanding.teamId === selectedMatch.homeTeam.id;
            const isAway = teamStanding.teamId === selectedMatch.awayTeam.id;
            const isFocusMatch = isHome || isAway;

            // Scenario position delta
            const basePos = baselinePosMap[teamStanding.teamId]?.position || teamStanding.position;
            const posDelta = basePos - teamStanding.position; // positive means moved up

            return (
              <div
                key={teamStanding.teamId}
                className={`py-3 px-1 sm:px-2 flex items-center justify-between transition-colors ${tableStyle === "broadcast-white"
                    ? isFocusMatch
                      ? "bg-slate-50 font-bold"
                      : "hover:bg-slate-50/80"
                    : isFocusMatch
                      ? "bg-[#1A2330] font-bold"
                      : "hover:bg-[#161D27]"
                  }`}
              >
                {/* Left side: Pos + Colored Dot + Crest + Team Name */}
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-2">
                  {/* Position number */}
                  <span
                    className={`w-5 text-right font-bold text-sm ${tableStyle === "broadcast-white" ? "text-slate-900" : "text-white"
                      }`}
                  >
                    {teamStanding.position}
                  </span>

                  {/* Colored status dot matching screenshot */}
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${isUCL
                        ? "bg-[#581C87]" // deep purple for UCL
                        : isEurope
                          ? "bg-[#0284C7]" // sky blue for UEL
                          : isRel
                            ? "bg-[#DC2626]" // crimson red for relegation
                            : "bg-slate-300 opacity-60"
                      }`}
                  />

                  {/* Club Crest */}
                  <ClubCrest
                    teamId={teamStanding.teamId}
                    teamCode={teamStanding.team.code}
                    size="md"
                  />

                  {/* Full Club Name */}
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`text-sm sm:text-base font-semibold truncate ${tableStyle === "broadcast-white" ? "text-slate-900" : "text-white"
                        }`}
                    >
                      {teamStanding.team.name}
                    </span>

                    {/* Active Match Pill */}
                    {isFocusMatch && (
                      <span className="hidden sm:inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#38003C] text-[#00FF87]">
                        Active Fixture
                      </span>
                    )}

                    {/* Scenario displacement tag */}
                    {posDelta !== 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center ${posDelta > 0
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                      >
                        {posDelta > 0 ? (
                          <span className="flex items-center">
                            <ArrowUpRight className="w-3 h-3" />+{posDelta}
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <ArrowDownRight className="w-3 h-3" />
                            {posDelta}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side: P, GD, PTS */}
                <div className="flex items-center gap-6 sm:gap-8 font-poppins text-xs sm:text-sm shrink-0">
                  {showDetailedStats && (
                    <>
                      <span className="w-6 text-center text-slate-500 hidden md:inline-block">
                        {teamStanding.won}
                      </span>
                      <span className="w-6 text-center text-slate-500 hidden md:inline-block">
                        {teamStanding.drawn}
                      </span>
                      <span className="w-6 text-center text-slate-500 hidden md:inline-block">
                        {teamStanding.lost}
                      </span>
                      <span className="w-8 text-center text-slate-500 hidden lg:inline-block">
                        {teamStanding.goalsFor}
                      </span>
                      <span className="w-8 text-center text-slate-500 hidden lg:inline-block">
                        {teamStanding.goalsAgainst}
                      </span>
                    </>
                  )}

                  <span
                    className={`w-6 text-center font-medium ${tableStyle === "broadcast-white" ? "text-slate-600" : "text-[#8E9CA8]"
                      }`}
                  >
                    {teamStanding.played}
                  </span>

                  <span
                    className={`w-8 text-center font-medium ${teamStanding.goalDifference > 0
                        ? "text-emerald-600 font-semibold"
                        : teamStanding.goalDifference < 0
                          ? "text-rose-600 font-semibold"
                          : tableStyle === "broadcast-white"
                            ? "text-slate-500"
                            : "text-[#8E9CA8]"
                      }`}
                  >
                    {teamStanding.goalDifference > 0
                      ? `+${teamStanding.goalDifference}`
                      : teamStanding.goalDifference}
                  </span>

                  <span
                    className={`w-9 text-right font-extrabold text-sm sm:text-base ${tableStyle === "broadcast-white" ? "text-slate-950" : "text-white"
                      }`}
                  >
                    {teamStanding.points}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Hashtag watermark matching screenshot */}
        <div className="mt-6 pt-3 flex items-center justify-between border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#581C87]" /> UEFA Champions League
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0284C7]" /> Europa League
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" /> Relegation Zone
            </span>
          </div>

          <span
            className={`font-black tracking-tight text-sm ${tableStyle === "broadcast-white" ? "text-[#38003C]" : "text-white/60"
              }`}
          >
            #PL
          </span>
        </div>
      </div>

      {/* RACESTATE MATCHWEEK SCENARIO INQUIRIES WORKSPACE */}
      <div className="p-5 sm:p-6 bg-[#121721] border border-[#202936] rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1C2533] border border-[#2E3C4F] flex items-center justify-center text-white shadow-sm">
              <MessageSquare className="w-4 h-4 text-[#60A5FA]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                RaceState AI Analyst
              </h3>
              <p className="text-xs text-[#8E9CA8]">
                Grounded conversational intelligence evaluating table displacement, zone transitions,
                and point buffers.
              </p>
            </div>
          </div>

          {activeChat.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="text-xs gap-1.5 text-[#8E9CA8] hover:text-[#EF4444] border-[#222B36]"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History
            </Button>
          )}
        </div>

        {/* Contextual Suggested Questions */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-[#8E9CA8]">
            Suggested Matchweek Analysis Questions:
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAskQuestion(q)}
                disabled={isLoadingAi}
                className="text-xs font-poppins text-left px-3.5 py-2 rounded-xl bg-[#0E131A] hover:bg-[#1A2330] border border-[#1F2734] hover:border-[#3B82F6] text-white transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                <ArrowRight className="w-3 h-3 text-[#60A5FA] shrink-0" />
                <span>{q}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Stream */}
        {activeChat.length > 0 ? (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 pt-2">
            {activeChat.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-xl border ${msg.sender === "user"
                    ? "bg-[#1E293B] border-[#334155] ml-8"
                    : "bg-[#0E131A] border-[#1F2734] mr-4 space-y-3"
                  }`}
              >
                <div className="flex items-center justify-between text-xs text-[#8E9CA8] mb-1 font-medium">
                  <span className="font-bold text-white">
                    {msg.sender === "user" ? "Inquiry" : "RaceState AI Analyst"}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <p className="text-xs leading-relaxed text-white whitespace-pre-wrap">{msg.text}</p>

                {/* Structured Output Components */}
                {msg.result && (
                  <div className="mt-3 space-y-3 pt-3 border-t border-[#202936]">
                    {/* Key Points */}
                    {msg.result.keyPoints && msg.result.keyPoints.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] uppercase font-bold text-[#60A5FA]">
                          Key Displacements:
                        </span>
                        <ul className="list-disc list-inside text-xs text-[#8E9CA8] space-y-0.5">
                          {msg.result.keyPoints.map((kp, kIdx) => (
                            <li key={kIdx} className="leading-relaxed">
                              <span className="text-white">{kp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Empirical Evidence Citations */}
                    {msg.result.evidence && msg.result.evidence.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] uppercase font-bold text-[#8E9CA8]">
                          Empirical Evidence Citations:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {msg.result.evidence.map((ev, evIdx) => (
                            <div
                              key={evIdx}
                              className="text-xs bg-[#141A22] border border-[#202936] p-2.5 rounded-xl text-[#8E9CA8] space-y-0.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-white font-bold">
                                  {ev.teamCode ? `${ev.teamCode} ` : ""}
                                  {ev.position ? `(Pos #${ev.position})` : ""}
                                </span>
                                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#1F2734] text-[#8E9CA8]">
                                  {ev.source.replace("_", " ")}
                                </span>
                              </div>
                              <p className="text-white text-[11px]">{ev.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Disclaimers & Assumptions */}
                    {msg.result.limitations && msg.result.limitations.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-[#141A22] border border-[#202936] text-[10px] text-[#8E9CA8] space-y-1">
                        <span className="uppercase font-bold text-[#F59E0B] flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Data Boundaries &amp; Assumptions:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5">
                          {msg.result.limitations.map((lim, lIdx) => (
                            <li key={lIdx}>{lim}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>
        ) : (
          <div className="p-6 text-center rounded-xl bg-[#0E131A] border border-dashed border-[#202936] text-[#8E9CA8] text-xs space-y-2">
            <Info className="w-5 h-5 mx-auto text-[#60A5FA]" />
            <p className="font-semibold text-white">No inquiries submitted yet for this fixture.</p>
            <p className="text-[11px] max-w-md mx-auto">
              Select a suggested scenario question above or type your inquiry to evaluate title race
              stakes, European qualification math, or relegation buffers.
            </p>
          </div>
        )}

        {/* Input Bar */}
        <div className="space-y-2 pt-2">
          {aiError && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAskQuestion();
                }
              }}
              placeholder={`Ask RaceState about ${selectedMatch.homeTeam.name} vs ${selectedMatch.awayTeam.name} table impact... (Max 500 chars)`}
              maxLength={500}
              disabled={isLoadingAi}
              className="flex-1 bg-[#0E131A] border border-[#1F2734] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] transition shadow-inner"
            />
            <Button
              onClick={() => handleAskQuestion()}
              disabled={isLoadingAi || !inputQuestion.trim()}
              variant="primary"
              size="sm"
              className="gap-1.5 px-5 rounded-xl font-semibold"
            >
              {isLoadingAi ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </>
              )}
            </Button>
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#64748B] font-mono px-1">
            <span>AI Match Analyst • Grounded strictly in matchweek telemetry</span>
            <span>{inputQuestion.length}/500</span>
          </div>
        </div>
      </div>
    </div>
  );
}
