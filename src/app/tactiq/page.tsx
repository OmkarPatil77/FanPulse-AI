"use client";

import React, { useState } from "react";
import { useMatchContext } from "@/context/MatchContext";
import {
  Send,
  Loader2,
  Trash2,
  User,
  Layers,
  Info,
  Activity,
  FileText,
  ChevronRight,
} from "lucide-react";
import { TactiQAnalysisResult } from "@/lib/ai/gemini-service";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  timestamp: string;
  question?: string;
  analysis?: TactiQAnalysisResult;
  error?: string;
}

let messageCounter = 0;
function createMessageId(): string {
  messageCounter += 1;
  return `tactiq-msg-${messageCounter}`;
}

/* SVG Crest Components */
function ArsenalCrest({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 46" className={className} fill="none">
      <path
        d="M20 1L38 6V26C38 35.5 28.5 43.5 20 45C11.5 43.5 2 35.5 2 26V6L20 1Z"
        fill="#EF0107"
        stroke="#D1B358"
        strokeWidth="2"
      />
      <path
        d="M10 24H28M26 21L31 24L26 27M13 28A4 4 0 1 0 13 20A4 4 0 1 0 13 28Z"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChelseaCrest({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" className={className} fill="none">
      <circle cx="22" cy="22" r="21" fill="#034694" stroke="#D1B358" strokeWidth="2" />
      <circle cx="22" cy="22" r="16" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 2" />
      <path
        d="M22 13C20 13 18 15 18 17C18 19 20 20 22 21C25 21 27 23 27 26C27 29 24 31 21 31C18 31 16 29 16 28M22 17L25 15M20 25L17 27"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Authentic Football Pitch Heatmap Graphic (Dynamic based on selected player) */
function TacticalHeatmap({
  playerId = "ars-white",
  positionCategory = "DEF",
}: {
  playerId?: string;
  positionCategory?: string;
}) {
  // Compute realistic heat center ellipses based on player ID and role
  const getHeatCenters = () => {
    if (playerId === "ars-white") {
      // Inverted right back: flank progression + inner half-space double pivot
      return (
        <>
          <ellipse cx="205" cy="125" rx="38" ry="24" fill="url(#heat-flank)" />
          <ellipse cx="165" cy="130" rx="32" ry="20" fill="url(#heat-flank)" />
          <ellipse cx="175" cy="98" rx="28" ry="22" fill="url(#heat-dense)" />
          <ellipse cx="145" cy="92" rx="22" ry="18" fill="url(#heat-pivot)" />
        </>
      );
    }
    if (playerId === "ars-saka") {
      // High right winger touchline isolations + cut inside
      return (
        <>
          <ellipse cx="225" cy="128" rx="34" ry="22" fill="url(#heat-dense)" />
          <ellipse cx="210" cy="105" rx="30" ry="20" fill="url(#heat-flank)" />
          <ellipse cx="235" cy="85" rx="26" ry="18" fill="url(#heat-pivot)" />
        </>
      );
    }
    if (playerId === "ars-odegaard" || playerId === "che-palmer") {
      // Right half-space playmaker & Zone 14 central link
      return (
        <>
          <ellipse cx="180" cy="88" rx="35" ry="24" fill="url(#heat-dense)" />
          <ellipse cx="195" cy="108" rx="30" ry="20" fill="url(#heat-flank)" />
          <ellipse cx="155" cy="80" rx="26" ry="18" fill="url(#heat-pivot)" />
        </>
      );
    }
    if (playerId === "ars-rice" || playerId === "che-caicedo") {
      // Central double-pivot / defensive destroyer screen
      return (
        <>
          <ellipse cx="140" cy="85" rx="36" ry="26" fill="url(#heat-dense)" />
          <ellipse cx="120" cy="85" rx="30" ry="22" fill="url(#heat-flank)" />
          <ellipse cx="155" cy="100" rx="25" ry="18" fill="url(#heat-pivot)" />
        </>
      );
    }
    if (playerId === "ars-havertz" || playerId === "che-jackson") {
      // Center forward: penalty area presence + channel separation runs
      return (
        <>
          <ellipse cx="230" cy="85" rx="32" ry="24" fill="url(#heat-dense)" />
          <ellipse cx="205" cy="70" rx="28" ry="18" fill="url(#heat-flank)" />
          <ellipse cx="185" cy="95" rx="25" ry="18" fill="url(#heat-pivot)" />
        </>
      );
    }
    if (positionCategory === "GK") {
      // Goalkeeper: goal area and penalty box distribution
      return (
        <>
          <ellipse cx="32" cy="85" rx="22" ry="26" fill="url(#heat-dense)" />
          <ellipse cx="50" cy="85" rx="26" ry="20" fill="url(#heat-pivot)" />
        </>
      );
    }
    if (positionCategory === "DEF") {
      // Center backs / fullbacks: defensive third coverage
      return (
        <>
          <ellipse cx="90" cy="85" rx="32" ry="25" fill="url(#heat-dense)" />
          <ellipse cx="110" cy="115" rx="30" ry="20" fill="url(#heat-flank)" />
          <ellipse cx="75" cy="75" rx="24" ry="18" fill="url(#heat-pivot)" />
        </>
      );
    }
    // Default midfield / attacking distribution
    return (
      <>
        <ellipse cx="160" cy="85" rx="34" ry="22" fill="url(#heat-dense)" />
        <ellipse cx="190" cy="110" rx="28" ry="20" fill="url(#heat-flank)" />
        <ellipse cx="135" cy="75" rx="25" ry="18" fill="url(#heat-pivot)" />
      </>
    );
  };

  return (
    <div
      aria-label={`Tactical touch heatmap for player ${playerId}`}
      className="relative w-full aspect-[16/10] bg-[#090D14] rounded-xl overflow-hidden border border-[#1E293B] shadow-inner flex items-center justify-center select-none group"
    >
      <svg
        viewBox="0 0 280 170"
        className="w-full h-full text-white/20 stroke-current fill-none"
        strokeWidth="1.5"
      >
        <defs>
          <radialGradient id="heat-dense" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#10B981" stopOpacity="0.6" />
            <stop offset="90%" stopColor="#06B6D4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat-flank" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#10B981" stopOpacity="0.65" />
            <stop offset="80%" stopColor="#06B6D4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat-pivot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
            <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.65" />
            <stop offset="80%" stopColor="#10B981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
          <filter id="heat-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* Pitch Boundary */}
        <rect x="12" y="10" width="256" height="150" rx="3" stroke="currentColor" strokeWidth="1.5" />
        {/* Halfway Line */}
        <line x1="140" y1="10" x2="140" y2="160" stroke="currentColor" strokeWidth="1.5" />
        {/* Center Circle */}
        <circle cx="140" cy="85" r="28" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="140" cy="85" r="2" className="fill-white/30 stroke-none" />

        {/* Left Penalty Area */}
        <rect x="12" y="40" width="45" height="90" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12" y="60" width="16" height="50" stroke="currentColor" strokeWidth="1.2" />

        {/* Right Penalty Area */}
        <rect x="223" y="40" width="45" height="90" stroke="currentColor" strokeWidth="1.5" />
        <rect x="252" y="60" width="16" height="50" stroke="currentColor" strokeWidth="1.2" />

        {/* Heat Map Glowing Layers (Filtered Blur) */}
        <g filter="url(#heat-blur)">
          {getHeatCenters()}
        </g>
      </svg>

      <div className="absolute top-2 right-2 text-[9px] font-mono uppercase bg-[#0B0E14]/90 px-1.5 py-0.5 rounded text-[#94A3B8] border border-white/10">
        Touch Heatmap
      </div>
    </div>
  );
}

const TACTICAL_PHASES = [
  { id: 0, label: "Base Shape", desc: "Starting nominal formation layout" },
  { id: 1, label: "Inversion & Overload", desc: "Fullback tucks inside to overload midfield" },
  { id: 2, label: "Rest Defense", desc: "3-man defensive line controlling transitions" },
];

const SUGGESTED_TACTICAL_QUESTIONS: Record<string, string[]> = {
  "ars-che": [
    "Why does Arsenal's midfield have a numerical advantage?",
    "What does Ben White's structural inversion achieve in build-up?",
    "What did Pedro Neto's introduction change in transition speed?",
    "How does Chelsea exploit space behind inverted fullbacks?",
  ],
  "mci-liv": [
    "How does City's box midfield match up against Liverpool's 4-3-3?",
    "What is the tactical purpose of City's 3-man rest defense against Salah?",
    "Where can Liverpool's attacking trio exploit transitional space?",
    "How do the midfield line numbers compare in central progression?",
  ],
  "tot-ast": [
    "How does Tottenham's aggressive high line interact with Villa's block?",
    "What tactical risks exist in this 4-3-3 vs 4-2-3-1 matchup?",
    "Where are the key 1v1 transitional battles likely to materialize?",
    "How does Aston Villa absorb central pressure and counter wide?",
  ],
};

function getDefaultWelcomeChat(
  matchId: string,
  fixtureLabel: string,
  homeFormation: string,
  awayFormation: string
): ChatMessage[] {
  return [
    {
      id: createMessageId(),
      sender: "ai",
      timestamp: "Just now",
      analysis: {
        success: true,
        answer: `Welcome to the TactiQ Tactical Analyst for ${fixtureLabel}. Systems have registered ${homeFormation} vs ${awayFormation}.

• Arsenal generates a 4v3 numerical overload in central midfield with Ben White tucking inside alongside Declan Rice.
• Chelsea's compact 4-2-3-1 mid-block restricts direct vertical progression through Zone 14.
• Pedro Neto's introduction on the left flank adds vertical threat against Arsenal's high rest-defense line.

Analysis strictly grounded in recorded nominal positions, pitch coordinates, and live event telemetry.`,
        keyPoints: [
          "Arsenal creates 4v3 numerical overload in central midfield with White tucking inside.",
          "Away team compact 4-2-3-1 shape creates central resistance.",
          "Illustrative analysis strictly grounded in recorded formations and coordinates.",
        ],
        evidence: [
          { description: `${homeFormation} nominal shape deployed`, source: "formation" },
          { description: `${awayFormation} defensive structure deployed`, source: "formation" },
        ],
        limitations: [
          "Match telemetry and structural positions are calibrated to match events.",
        ],
        dataSource: "SIMULATED_DEMO_DATA",
        matchId,
        matchLabel: fixtureLabel,
      },
    },
  ];
}

export default function TactiQPage() {
  const { selectedMatch } = useMatchContext();
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home");
  const [showZones, setShowZones] = useState(true);
  const [showMotionPaths, setShowMotionPaths] = useState(true);
  const [tacticalPhase, setTacticalPhase] = useState<number>(1);
  const [focusedPlayerId, setFocusedPlayerId] = useState<string>("ars-white");

  // Chat State isolated strictly per match
  const [chatsByMatch, setChatsByMatch] = useState<Record<string, ChatMessage[]>>({});
  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const fixtureLabel = `${selectedMatch.homeTeam.name} vs ${selectedMatch.awayTeam.name}`;
  const currentChat =
    chatsByMatch[selectedMatch.id] ||
    getDefaultWelcomeChat(
      selectedMatch.id,
      fixtureLabel,
      selectedMatch.homeFormation.name,
      selectedMatch.awayFormation.name
    );

  const activeFormation =
    selectedTeam === "home" ? selectedMatch.homeFormation : selectedMatch.awayFormation;
  const activeTeam =
    selectedTeam === "home" ? selectedMatch.homeTeam : selectedMatch.awayTeam;

  // Resolve currently focused player from active lineup
  const focusedLineupPlayer =
    activeFormation.lineup.find((lp) => lp.player.id === focusedPlayerId) ||
    activeFormation.lineup[1] ||
    activeFormation.lineup[0];

  const handleAskQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setApiError(null);

    const userMsg: ChatMessage = {
      id: createMessageId(),
      sender: "user",
      timestamp: "Just now",
      question: trimmed,
    };

    setChatsByMatch((prev) => {
      const existing = prev[selectedMatch.id] || currentChat;
      return {
        ...prev,
        [selectedMatch.id]: [...existing, userMsg],
      };
    });

    setInputQuestion("");

    try {
      const res = await fetch("/api/ai/tactiq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          question: trimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.error || data.answer || "Tactical analysis request failed.";
        setApiError(errorMsg);

        const errorAiMsg: ChatMessage = {
          id: createMessageId(),
          sender: "ai",
          timestamp: "Just now",
          error: errorMsg,
          analysis: {
            success: false,
            answer: errorMsg,
            keyPoints: ["Upstream processing error"],
            evidence: [],
            limitations: ["Analysis temporarily interrupted."],
            dataSource: "SIMULATED_DEMO_DATA",
            matchId: selectedMatch.id,
            matchLabel: fixtureLabel,
            error: errorMsg,
          },
        };

        setChatsByMatch((prev) => ({
          ...prev,
          [selectedMatch.id]: [...(prev[selectedMatch.id] || []), errorAiMsg],
        }));
        return;
      }

      const aiMsg: ChatMessage = {
        id: createMessageId(),
        sender: "ai",
        timestamp: "Just now",
        analysis: data as TactiQAnalysisResult,
      };

      setChatsByMatch((prev) => ({
        ...prev,
        [selectedMatch.id]: [...(prev[selectedMatch.id] || []), aiMsg],
      }));
    } catch {
      const fallbackErr = "Network error: Unable to communicate with the tactical analysis service.";
      setApiError(fallbackErr);
      const fallbackAiMsg: ChatMessage = {
        id: createMessageId(),
        sender: "ai",
        timestamp: "Just now",
        error: fallbackErr,
      };
      setChatsByMatch((prev) => ({
        ...prev,
        [selectedMatch.id]: [...(prev[selectedMatch.id] || []), fallbackAiMsg],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatsByMatch((prev) => ({
      ...prev,
      [selectedMatch.id]: getDefaultWelcomeChat(
        selectedMatch.id,
        fixtureLabel,
        selectedMatch.homeFormation.name,
        selectedMatch.awayFormation.name
      ),
    }));
    setApiError(null);
  };

  const matchQuestions =
    SUGGESTED_TACTICAL_QUESTIONS[selectedMatch.id] ||
    SUGGESTED_TACTICAL_QUESTIONS["ars-che"];

  // Dynamic player summary description
  const getPlayerTacticalSummary = () => {
    const p = focusedLineupPlayer;
    if (p.player.id === "ars-white") {
      return "Inverting to midfield to create numerical overloading advantage in the double pivot alongside Declan Rice.";
    }
    if (p.player.id === "ars-saka") {
      return "Holding touchline width, attacking the isolated fullback in 1v1 transitional overloads.";
    }
    if (p.player.id === "ars-rice") {
      return "Anchoring the central defensive pivot, breaking passing lanes and distributing vertically.";
    }
    if (p.player.id === "ars-odegaard") {
      return "Occupying the right half-space, orchestrating combinations and releasing inverted runners.";
    }
    if (p.player.id === "ars-saliba") {
      return "Leading the high rest-defense line, controlling vertical recoveries and progressive line-breaking carries.";
    }
    if (p.player.id === "che-palmer") {
      return "Floating between lines in Zone 14 to receive on the half-turn and exploit transitional pockets.";
    }
    if (p.player.id === "che-caicedo") {
      return "Defensive midfield destroyer screening the back four and contesting second balls in the mid-block.";
    }
    if (p.player.id === "che-jackson") {
      return "Stretching the defensive line with channel runs, creating separation for supporting runners.";
    }
    if (p.player.positionCategory === "GK") {
      return "Sweeper-keeper distribution aiding build-up phase against aggressive pressing structures.";
    }
    if (p.player.positionCategory === "DEF") {
      return `Executing ${p.coordinate.role} duties with structured defensive compactness and lateral cover.`;
    }
    if (p.player.positionCategory === "MID") {
      return `Controlling tempo and linking phases through ${p.coordinate.role} structural positioning.`;
    }
    return `Targeting high-value offensive zones with ${p.coordinate.role} movement and direct pressure.`;
  };

  return (
    <div className="space-y-6 font-poppins pb-8">
      {/* 1. TOP SUB-HEADER */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            TactiQ
          </h1>
          <span className="text-[#334155] font-light text-lg">|</span>
          <span className="text-base font-semibold text-[#8E9CA8]">Tactical Hub</span>
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#122E1A] border border-[#165526] text-[#B9F36A] text-[10px] font-bold font-mono uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B9F36A] animate-pulse" />
            LIVE
          </span>
        </div>
        <span className="text-[10px] font-mono tracking-widest text-[#64748B] font-semibold uppercase">
          TACTICAL ANALYST · MATCH INTELLIGENCE
        </span>
      </div>

      {/* 2. MATCH SCORE & FORMATION VIEW BAR */}
      <div className="bg-[#12161F] border border-[#1F2733] rounded-2xl p-3.5 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4">
        {/* Left: Team Crests, Venue, and Score */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1A222D] border border-[#273240] flex items-center justify-center shrink-0">
            {selectedMatch.homeTeam.code === "ARS" ? (
              <ArsenalCrest className="w-5 h-6 sm:w-6 sm:h-7" />
            ) : (
              <span className="font-bold text-xs text-[#B9F36A] font-mono">{selectedMatch.homeTeam.code}</span>
            )}
          </div>

          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8E9CA8] flex items-center gap-1.5 truncate">
              <span className="truncate">{selectedMatch.fixture.venue.toUpperCase()}</span>
              <span>·</span>
              <span className="shrink-0">MATCH 08:55 ({selectedMatch.status === "IN_PLAY" ? "LIVE" : selectedMatch.status})</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 mt-0.5 flex-wrap">
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">
                {selectedMatch.homeTeam.name}
              </h2>
              <span className="text-base sm:text-xl font-mono font-black text-[#B9F36A] shrink-0">
                {selectedMatch.homeScore} - {selectedMatch.awayScore}
              </span>
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">
                {selectedMatch.awayTeam.name}
              </h2>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#1A222D] border border-[#273240] flex items-center justify-center shrink-0 ml-0.5 sm:ml-1">
                {selectedMatch.awayTeam.code === "CHE" ? (
                  <ChelseaCrest className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <span className="font-bold text-[10px] text-white font-mono">{selectedMatch.awayTeam.code}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Formation View Segmented Switcher */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <span className="text-xs font-mono uppercase text-[#8E9CA8] font-bold mr-1">
            FORMATION View:
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedTeam("home");
              setFocusedPlayerId("ars-white");
            }}
            className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer ${
              selectedTeam === "home"
                ? "bg-[#B9F36A] text-[#0B0D11] shadow-[#B9F36A]/20"
                : "bg-[#161D27] text-[#8E9CA8] border border-[#232F3E] hover:text-white"
            }`}
          >
            {selectedMatch.homeTeam.code} ({selectedMatch.homeFormation.name.split(" ")[0]})
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedTeam("away");
              setFocusedPlayerId("che-palmer");
            }}
            className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer ${
              selectedTeam === "away"
                ? "bg-[#B9F36A] text-[#0B0D11] shadow-[#B9F36A]/20"
                : "bg-[#161D27] text-[#8E9CA8] border border-[#232F3E] hover:text-white"
            }`}
          >
            {selectedMatch.awayTeam.code} ({selectedMatch.awayFormation.name.split(" ")[0]})
          </button>
        </div>
      </div>

      {/* 3. THREE-COLUMN WORKSPACE GRID (Responsive: md:2-cols, xl:12-cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 items-start">
        {/* ========================================================
            COLUMN 1: LIVE TACTICAL BOARD (Pitch & Inspector)
           ======================================================== */}
        <div className="md:col-span-2 xl:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-wide">
              Live Tactical Board
            </h2>
            <span className="text-xs font-mono text-[#8E9CA8]">
              Click any player node to inspect
            </span>
          </div>

          <div className="bg-[#12161F] border border-[#1E2633] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
            {/* Top Control Bar inside Pitch card */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2633] flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white">
                  {activeTeam.name} Starting XI Nominal Shape
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-[#182618] border border-[#B9F36A]/40 text-[#B9F36A]">
                  {activeFormation.name.toUpperCase()}
                </span>
              </div>

              {/* Toggles: Zone Analysis & Motion Paths */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs text-[#8E9CA8] font-medium">Zone Analysis</span>
                  <div
                    onClick={() => setShowZones(!showZones)}
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                      showZones ? "bg-[#B9F36A]" : "bg-[#252F3D]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-[#0B0D11] shadow-md transition-transform duration-200 ${
                        showZones ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs text-[#8E9CA8] font-medium">Motion Paths</span>
                  <div
                    onClick={() => setShowMotionPaths(!showMotionPaths)}
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                      showMotionPaths ? "bg-[#B9F36A]" : "bg-[#252F3D]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-[#0B0D11] shadow-md transition-transform duration-200 ${
                        showMotionPaths ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                </label>
              </div>
            </div>

            {/* Visual Pitch Container with Lawn Cut Stripes */}
            <div
              className="relative w-full aspect-[68/96] max-w-[560px] mx-auto rounded-xl overflow-hidden border border-[#1C2C20] shadow-2xl select-none"
              style={{
                background:
                  "repeating-linear-gradient(to right, #112817, #112817 10%, #142F1C 10%, #142F1C 20%)",
              }}
            >
              {/* Pitch Markings SVG */}
              <svg
                viewBox="0 0 680 960"
                className="w-full h-full text-white/35 stroke-current fill-none absolute inset-0 pointer-events-none"
                strokeWidth="2.5"
              >
                <defs>
                  {/* Arrowhead marker for dynamic motion paths */}
                  <marker
                    id="motion-arrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#B9F36A" />
                  </marker>
                </defs>

                {/* Outer Field Boundary */}
                <rect x="25" y="25" width="630" height="910" rx="3" strokeWidth="3" />

                {/* Halfway Line */}
                <line x1="25" y1="480" x2="655" y2="480" strokeWidth="2.5" />

                {/* Center Circle & Spot */}
                <circle cx="340" cy="480" r="85" strokeWidth="2.5" />
                <circle cx="340" cy="480" r="4.5" className="fill-white stroke-none" />

                {/* Top Penalty Box (Opponent) */}
                <rect x="140" y="25" width="400" height="150" strokeWidth="2.5" />
                <rect x="250" y="25" width="180" height="50" strokeWidth="2" />
                <circle cx="340" cy="100" r="4" className="fill-white stroke-none" />
                <path d="M 270 175 A 85 85 0 0 0 410 175" strokeWidth="2" />

                {/* Bottom Penalty Box (Own Half) */}
                <rect x="140" y="785" width="400" height="150" strokeWidth="2.5" />
                <rect x="250" y="885" width="180" height="50" strokeWidth="2" />
                <circle cx="340" cy="860" r="4" className="fill-white stroke-none" />
                <path d="M 270 785 A 85 85 0 0 1 410 785" strokeWidth="2" />

                {/* Corner Arcs */}
                <path d="M 25 45 A 20 20 0 0 1 45 25" strokeWidth="2" />
                <path d="M 635 25 A 20 20 0 0 1 655 45" strokeWidth="2" />
                <path d="M 25 915 A 20 20 0 0 0 45 935" strokeWidth="2" />
                <path d="M 635 935 A 20 20 0 0 0 655 915" strokeWidth="2" />

                {/* Zone Analysis (5 Vertical Channels) */}
                {showZones && (
                  <g stroke="#B9F36A" strokeWidth="1.2" strokeDasharray="5 7" opacity="0.3">
                    <line x1="139" y1="25" x2="139" y2="935" />
                    <line x1="260" y1="25" x2="260" y2="935" />
                    <line x1="420" y1="25" x2="420" y2="935" />
                    <line x1="541" y1="25" x2="541" y2="935" />
                  </g>
                )}

                {/* Dynamic Motion Paths (Arsenal Inversion & Transition Vectors) */}
                {showMotionPaths && selectedTeam === "home" && tacticalPhase >= 1 && (
                  <g>
                    {/* Primary vector: Inverted curve from Right-Back into Double Pivot */}
                    <path
                      d="M 555 615 Q 460 575 365 530"
                      stroke="#B9F36A"
                      strokeWidth="2.8"
                      strokeDasharray="6 4"
                      fill="none"
                      markerEnd="url(#motion-arrow)"
                    />
                    {/* Secondary vector: Forward progressive passing lane into Half-space */}
                    <path
                      d="M 555 615 Q 525 500 480 440"
                      stroke="#B9F36A"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      opacity="0.8"
                      fill="none"
                      markerEnd="url(#motion-arrow)"
                    />
                  </g>
                )}

                {/* Dynamic Motion Paths (Chelsea Transition & Overlap Vectors) */}
                {showMotionPaths && selectedTeam === "away" && tacticalPhase >= 1 && (
                  <g>
                    {/* Palmer roaming into Zone 14 */}
                    <path
                      d="M 545 385 Q 450 365 355 375"
                      stroke="#B9F36A"
                      strokeWidth="2.8"
                      strokeDasharray="6 4"
                      fill="none"
                      markerEnd="url(#motion-arrow)"
                    />
                    {/* Jackson channel run between center-backs */}
                    <path
                      d="M 340 240 L 340 145"
                      stroke="#B9F36A"
                      strokeWidth="2.2"
                      strokeDasharray="4 4"
                      fill="none"
                      markerEnd="url(#motion-arrow)"
                    />
                  </g>
                )}

                {/* Phase 2: Rest Defense Lines */}
                {tacticalPhase === 2 && (
                  <g stroke="#38BDF8" strokeWidth="1.8" strokeDasharray="3 3" opacity="0.65">
                    <line x1="160" y1="740" x2="520" y2="740" />
                  </g>
                )}
              </svg>

              {/* Attacking Direction Tag */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] tracking-widest font-mono uppercase text-white/50 flex items-center gap-1.5 pointer-events-none">
                <span>ATTACKING DIRECTION</span>
                <span>▲</span>
              </div>

              {/* Players Nodes Overlay with Safety Edge Offset */}
              <div className="absolute inset-0 pointer-events-auto">
                {activeFormation.lineup.map((lp) => {
                  const p = lp.player;
                  const coord = lp.coordinate;
                  const isBenWhite = p.id === "ars-white" && selectedTeam === "home";
                  const isSelected = focusedLineupPlayer.player.id === p.id;
                  const isGK = p.positionCategory === "GK";

                  // Safety boundary clamp for name tags near sidelines
                  const tagAlignment =
                    coord.x > 75
                      ? "-translate-x-2 items-end"
                      : coord.x < 25
                      ? "translate-x-2 items-start"
                      : "items-center";

                  return (
                    <div
                      key={p.id}
                      onClick={() => setFocusedPlayerId(p.id)}
                      style={{
                        left: `${coord.x}%`,
                        top: `${coord.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      className="absolute flex flex-col items-center cursor-pointer group z-10 transition-transform duration-150 hover:scale-110"
                    >
                      {/* Jersey Circle Node */}
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs shadow-lg transition-all ${
                          isBenWhite || isSelected
                            ? "bg-[#B9F36A] text-[#0B0D11] border-2 border-white ring-4 ring-[#B9F36A]/30 scale-110"
                            : isGK
                            ? "bg-[#0F172A] text-white border-2 border-white/60"
                            : selectedTeam === "home"
                            ? "bg-[#DC2626] text-white border-2 border-white/80"
                            : "bg-[#2563EB] text-white border-2 border-white/80"
                        }`}
                      >
                        {p.number}
                      </div>

                      {/* Name Tag Pill */}
                      <div className={`mt-1 flex flex-col ${tagAlignment}`}>
                        <div
                          className={`px-1 sm:px-2 py-0.5 rounded text-[9px] sm:text-[11px] font-semibold max-w-[65px] sm:max-w-[95px] truncate text-center leading-tight transition-colors ${
                            isBenWhite || isSelected
                              ? "bg-[#0B0F14] text-[#B9F36A] border border-[#B9F36A]/60 shadow-md"
                              : "bg-[#0B0F14]/90 text-white border border-[#273241]/80 group-hover:text-[#B9F36A]"
                          }`}
                        >
                          {p.shortName}
                        </div>

                        {/* Inverted Badge for White */}
                        {isBenWhite && (
                          <span className="text-[8px] sm:text-[9px] font-mono text-[#B9F36A] bg-[#122A16] px-1 sm:px-1.5 py-0.2 rounded mt-0.5 border border-[#B9F36A]/50 font-bold whitespace-nowrap">
                            Inverted
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating Bottom Bar inside Pitch */}
              <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-4 right-2 sm:right-4 bg-[#0B0F14]/95 border border-[#273241] rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 flex items-center justify-between shadow-2xl backdrop-blur-xs">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-full text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 ${
                      selectedTeam === "home" ? "bg-[#DC2626]" : "bg-[#2563EB]"
                    }`}
                  >
                    {focusedLineupPlayer.player.number}
                  </div>
                  <span className="text-xs font-bold text-white truncate">
                    #{focusedLineupPlayer.player.number} {focusedLineupPlayer.player.name}
                  </span>
                  <span className="text-[#64748B] text-xs shrink-0">|</span>
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase text-[#B9F36A] font-semibold truncate">
                    {focusedLineupPlayer.coordinate.role.toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline-block text-[10px] font-mono bg-[#182618] border border-[#B9F36A]/40 text-[#B9F36A] px-2 py-0.5 rounded font-bold shrink-0 ml-2">
                  Role: {focusedLineupPlayer.player.positionCategory}
                </span>
              </div>
            </div>

            {/* Interactive Tactical Phase Selector & Carousel Dots */}
            <div className="flex items-center justify-between pt-1 px-1">
              <div className="text-[11px] font-mono text-[#8E9CA8] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B9F36A]" />
                <span>
                  Phase {tacticalPhase + 1}/3:{" "}
                  <strong className="text-white">
                    {TACTICAL_PHASES[tacticalPhase].label}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {TACTICAL_PHASES.map((phase) => (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => setTacticalPhase(phase.id)}
                    title={`${phase.label} — ${phase.desc}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      tacticalPhase === phase.id
                        ? "w-6 bg-[#B9F36A]"
                        : "w-2 bg-[#273240] hover:bg-[#3D4D61]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Player Role Inspector Card below Pitch */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-white">
              <User className="w-3.5 h-3.5 text-[#8E9CA8]" />
              <span>Player Role Inspector</span>
            </div>

            <div className="bg-[#12161F] border border-[#1E2633] rounded-xl p-3.5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3 min-w-0">
                {/* Stylized Player Portrait */}
                <div
                  className={`w-10 h-10 rounded-full border border-[#334155] flex items-center justify-center font-mono font-extrabold text-sm shadow shrink-0 ${
                    selectedTeam === "home"
                      ? "bg-gradient-to-br from-[#7F1D1D] to-[#1E293B] text-white"
                      : "bg-gradient-to-br from-[#1E3A8A] to-[#1E293B] text-white"
                  }`}
                >
                  #{focusedLineupPlayer.player.number}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">
                    {focusedLineupPlayer.player.name}
                  </h4>
                  <p className="text-xs text-[#8E9CA8] truncate">
                    Position: <strong className="text-white">{focusedLineupPlayer.player.positionCategory}</strong> · Role:{" "}
                    <strong className="text-[#B9F36A]">{focusedLineupPlayer.coordinate.role}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 ml-3">
                <div className="text-xs font-mono text-[#8E9CA8]">
                  Coords: ({focusedLineupPlayer.coordinate.x}%, {focusedLineupPlayer.coordinate.y}%)
                </div>
                <div className="text-[10px] font-mono text-[#B9F36A] font-semibold">
                  Map Metrics
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            COLUMN 2: LIVE TACTICAL INSIGHTS
           ======================================================== */}
        <div className="md:col-span-1 xl:col-span-3 space-y-3">
          <h2 className="text-base font-bold text-white tracking-wide">
            Live Tactical Insights
          </h2>

          <div className="bg-[#12161F] border border-[#1E2633] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
            {/* Header: Icon + Title */}
            <div className="flex items-center gap-2 pb-2 border-b border-[#1E2633]">
              <div className="w-6 h-6 rounded-lg bg-[#B9F36A]/10 border border-[#B9F36A]/30 flex items-center justify-center text-[#B9F36A]">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Tactical Insights
              </span>
            </div>

            {/* Card 1: Tactical Shift */}
            <div className="bg-[#0E131A] border border-[#1F2734] rounded-xl p-3.5 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E9CA8] font-bold block">
                TACTICAL SHIFT:
              </span>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#1A222D] flex items-center justify-center shrink-0">
                  {selectedTeam === "home" ? (
                    <ArsenalCrest className="w-4 h-5" />
                  ) : (
                    <ChelseaCrest className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">
                    {activeTeam.name}
                  </h4>
                  <div className="text-xs font-semibold text-white">
                    {activeFormation.name.split(" ")[0]} Attacking{" "}
                    <span className="text-[#B9F36A] font-bold">(Active)</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#8E9CA8] italic leading-relaxed pt-1">
                {selectedTeam === "home"
                  ? "Inverted right-back shifts into double pivot during build-up phases to create central 4v3 overload."
                  : "Central playmaker drifts between lines into Zone 14 to exploit space behind inverted fullbacks."}
              </p>
            </div>

            {/* Card 2: In Focus with Dynamic Heatmap */}
            <div className="bg-[#0E131A] border border-[#1F2734] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E9CA8] font-bold">
                  IN FOCUS:
                </span>
                {selectedTeam === "home" ? (
                  <ArsenalCrest className="w-3.5 h-4" />
                ) : (
                  <ChelseaCrest className="w-3.5 h-3.5" />
                )}
              </div>

              <h4 className="text-sm font-bold text-white">
                {focusedLineupPlayer.player.name} ({focusedLineupPlayer.player.number})
              </h4>

              {/* Pitch Heatmap Graphic */}
              <TacticalHeatmap
                playerId={focusedLineupPlayer.player.id}
                positionCategory={focusedLineupPlayer.player.positionCategory}
              />

              <p className="text-[11px] text-[#8E9CA8] text-center pt-0.5 leading-snug">
                {getPlayerTacticalSummary()}
              </p>
            </div>

            {/* Card 3: Opponent Defensive Structure */}
            <div className="bg-[#0E131A] border border-[#1F2734] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2">
                {selectedTeam === "home" ? (
                  <ChelseaCrest className="w-4 h-4" />
                ) : (
                  <ArsenalCrest className="w-3.5 h-4" />
                )}
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E9CA8] font-bold">
                  {selectedTeam === "home" ? "CHELSEA DEFENSIVE BLOCK" : "ARSENAL HIGH PRESS"}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">
                  {selectedTeam === "home" ? "4-2-3-1" : "4-3-3 / 3-2-5"}
                </h4>
                <div className="text-xs text-[#8E9CA8] font-semibold">
                  {selectedTeam === "home" ? "Mid-Block Compactness" : "Front-Foot Rest Defense"}
                </div>
              </div>

              <p className="text-[11px] text-[#8E9CA8] leading-relaxed">
                {selectedTeam === "home"
                  ? "Compact central midfield mid-block denying central progression through double pivot."
                  : "High counter-pressing block compressing space and forcing direct clearances."}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================
            COLUMN 3: TACTICAL ANALYST CHAT
           ======================================================== */}
        <div className="md:col-span-1 xl:col-span-3 space-y-3">
          <h2 className="text-base font-bold text-white tracking-wide">
            Tactical Analyst
          </h2>

          <div className="bg-[#12161F] border border-[#1E2633] rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col min-h-[580px] xl:h-[760px]">
            {/* Header of Analyst Panel (Simple professional icons, no AI sparkles) */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2633] mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#B9F36A]/10 border border-[#B9F36A]/30 flex items-center justify-center text-[#B9F36A]">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  TACTICAL ANALYST
                </span>
              </div>

              <button
                type="button"
                onClick={handleClearChat}
                title="Reset conversation"
                className="p-1 rounded text-[#8E9CA8] hover:text-white transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Suggested Inquiry Chips (Multi-line readable format, no awkward ellipsis) */}
            <div className="space-y-1.5 mb-3 shrink-0">
              {matchQuestions.slice(0, 4).map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleAskQuestion(q)}
                  className="w-full text-left text-xs text-[#8E9CA8] hover:text-[#B9F36A] bg-[#0E131A] hover:bg-[#161F2C] border border-[#1F2734] hover:border-[#B9F36A]/40 p-2.5 rounded-xl transition line-clamp-2 leading-snug disabled:opacity-50 cursor-pointer shadow-sm group flex items-start gap-2"
                >
                  <span className="text-[10px] font-mono text-[#B9F36A] bg-[#122A16] px-1.5 py-0.2 rounded shrink-0 font-bold">
                    Q{idx + 1}
                  </span>
                  <span className="flex-1">{q}</span>
                  <ChevronRight className="w-3 h-3 text-[#64748B] group-hover:text-[#B9F36A] shrink-0 mt-0.5" />
                </button>
              ))}
            </div>

            {/* Chat Transcript Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs min-h-0">
              {currentChat.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  {msg.sender === "user" ? (
                    <div className="bg-[#1E293B] text-white p-3 rounded-xl border border-[#334155] text-xs font-medium ml-4 shadow">
                      {msg.question}
                    </div>
                  ) : (
                    <div className="bg-[#0E131A] border border-[#1F2734] rounded-xl p-3.5 space-y-2.5 text-xs shadow-lg">
                      <div className="flex items-center gap-1.5 text-[#B9F36A] font-bold text-xs">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Tactical Analysis Brief</span>
                      </div>

                      {msg.analysis ? (
                        <>
                          <p className="text-[#F5F7F2] leading-relaxed whitespace-pre-line text-[11px]">
                            {msg.analysis.answer}
                          </p>

                          <div className="pt-2 border-t border-[#1F2734] text-[10px] text-[#64748B] flex items-start gap-1">
                            <Info className="w-3 h-3 shrink-0 mt-0.5" />
                            <span>
                              Calibrated with nominal structures, pitch coordinates, and telemetry.
                            </span>
                          </div>
                        </>
                      ) : (
                        <p className="text-red-400 text-xs">{msg.error || "Response unavailable."}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-[#0E131A] border border-[#1F2734] rounded-xl text-xs text-[#8E9CA8]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B9F36A]" />
                  <span>Synthesizing tactical structures...</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {apiError && (
              <div className="p-2 mb-2 rounded bg-red-950/40 border border-red-900/60 text-red-300 text-[10px] shrink-0">
                {apiError}
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion(inputQuestion);
              }}
              className="pt-3 border-t border-[#1E2633] space-y-1.5 shrink-0"
            >
              <div className="relative">
                <input
                  type="text"
                  value={inputQuestion}
                  maxLength={500}
                  disabled={isLoading}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  placeholder="Ask a tactical question..."
                  className="w-full bg-[#0E131A] border border-[#1F2734] rounded-xl py-2 pl-3 pr-9 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#B9F36A] disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputQuestion.trim()}
                  className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-[#B9F36A] text-[#0B0D11] hover:bg-[#a6e655] disabled:opacity-40 transition cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#64748B] font-mono px-0.5">
                <span>
                  Telemetry: <strong className="text-[#B9F36A]">Active Matchweek 10 · Synced</strong>
                </span>
                <span>{inputQuestion.length}/500</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
