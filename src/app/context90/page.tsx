"use client";

import React, { useState, useMemo } from "react";
import { useMatchContext } from "@/context/MatchContext";
import { Context90AnalysisResult } from "@/lib/ai/gemini-service";
import {
  Send,
  Loader2,
  FileText,
  Clock,
  Info,
  CheckCircle2,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
  analysis?: Context90AnalysisResult;
  isError?: boolean;
}

const FILTER_TABS = [
  { id: "all", label: "All events" },
  { id: "goals", label: "Goals" },
  { id: "substitutions", label: "Substitutions" },
  { id: "cards", label: "Cards" },
  { id: "chances", label: "Chances" },
];

let msgCounter = 1;
function generateMessageId(prefix: string): string {
  return `${prefix}-${msgCounter++}`;
}

export default function Context90Page() {
  const { selectedMatch } = useMatchContext();
  const [activeTab, setActiveTab] = useState<string>("goals");
  const [userQuery, setUserQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Chat conversation history isolated per matchId
  const [chatsByMatch, setChatsByMatch] = useState<Record<string, ChatMessage[]>>({});

  const chatHistory = useMemo(() => {
    return chatsByMatch[selectedMatch.id] || [];
  }, [chatsByMatch, selectedMatch.id]);

  const events = selectedMatch.events;

  // Filter events according to active tab
  const filteredEvents = useMemo(() => {
    if (activeTab === "all") return events;
    if (activeTab === "goals") {
      return events.filter((e) => e.type === "GOAL");
    }
    if (activeTab === "substitutions") {
      return events.filter((e) => e.type === "SUBSTITUTION");
    }
    if (activeTab === "cards") {
      return events.filter(
        (e) => e.type === "YELLOW_CARD" || e.type === "RED_CARD"
      );
    }
    if (activeTab === "chances") {
      return events.filter(
        (e) =>
          e.type === "SHOT_ON_TARGET" ||
          e.type === "CORNER" ||
          e.type === "VAR_DECISION" ||
          e.type === "TACTICAL_SHIFT"
      );
    }
    return events;
  }, [events, activeTab]);

  const handleSendPrompt = async (promptText?: string) => {
    const query = (promptText || userQuery).trim();
    if (!query || isLoading) return;

    setApiError(null);
    const userMsgId = generateMessageId("user");
    const assistantMsgId = generateMessageId("assistant");

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      {
        id: userMsgId,
        role: "user",
        text: query,
        time: "Just now",
      },
    ];

    setChatsByMatch((prev) => ({
      ...prev,
      [selectedMatch.id]: newHistory,
    }));
    setUserQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/context90", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          question: query,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorText =
          data.error || data.answer || "Unable to complete tactical analysis.";
        setApiError(errorText);
        setChatsByMatch((prev) => ({
          ...prev,
          [selectedMatch.id]: [
            ...newHistory,
            {
              id: assistantMsgId,
              role: "assistant",
              text: `Analysis notice: ${errorText}`,
              time: "Server Response",
              isError: true,
            },
          ],
        }));
        return;
      }

      const result = data as Context90AnalysisResult;
      setChatsByMatch((prev) => ({
        ...prev,
        [selectedMatch.id]: [
          ...newHistory,
          {
            id: assistantMsgId,
            role: "assistant",
            text: result.answer,
            time: "Grounded Analysis",
            analysis: result,
          },
        ],
      }));
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Network error contacting Context90 service.";
      setApiError(errorMsg);
      setChatsByMatch((prev) => ({
        ...prev,
        [selectedMatch.id]: [
          ...newHistory,
          {
            id: assistantMsgId,
            role: "assistant",
            text: `Communication error: ${errorMsg}. Please verify connection and retry.`,
            time: "Network Error",
            isError: true,
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatsByMatch((prev) => ({
      ...prev,
      [selectedMatch.id]: [],
    }));
    setApiError(null);
  };

  return (
    <div className="space-y-7 font-poppins pb-10">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Context90
          </h1>
          <p className="text-xs sm:text-sm text-[#8E9CA8] mt-1 max-w-2xl leading-relaxed">
            Understand the story behind every match event — a narrated timeline, AI summary and match recap.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#12161F] border border-[#1E2633] text-[11px] font-mono text-[#8E9CA8] tracking-wider uppercase shrink-0 self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8E9CA8]" />
          STATIC PLACEHOLDER
        </div>
      </div>

      {/* 2. TWO-COLUMN WORKSPACE: LEFT (Timeline) & RIGHT (Summaries & Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================
            LEFT COLUMN: Match event timeline (7 cols)
           ======================================================== */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Match event timeline
          </h2>

          {/* Filter Pills Container */}
          <div className="bg-[#12161F] border border-[#1E2633] p-1 rounded-xl inline-flex gap-1 max-w-full overflow-x-auto scrollbar-none">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${activeTab === tab.id
                  ? "bg-[#B9F36A] text-[#0B0D11] font-bold shadow-sm"
                  : "text-[#8E9CA8] hover:text-white bg-transparent"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Timeline Events List */}
          <div className="space-y-3.5 pt-1">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8E9CA8] bg-[#12161F] rounded-2xl border border-[#1E2633]">
                No events recorded under this filter for {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}.
              </div>
            ) : (
              filteredEvents.map((event) => {
                const isGoal = event.type === "GOAL";
                const isSub = event.type === "SUBSTITUTION";
                const isCard =
                  event.type === "YELLOW_CARD" || event.type === "RED_CARD";

                const badgeLabel = isGoal
                  ? "GOAL"
                  : isSub
                    ? "SUB"
                    : isCard
                      ? "CARD"
                      : event.type.replace("_", " ");

                return (
                  <div key={event.id} className="flex items-start gap-2.5 sm:gap-3.5 group">
                    {/* Minute Circle Badge */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#B9F36A] text-[#0B0D11] font-mono font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-md mt-1 group-hover:scale-105 transition-transform">
                      {event.minute}&apos;
                    </div>

                    {/* Event Detail Card */}
                    <div className="flex-1 bg-[#12161F] border border-[#1E2633] rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between hover:border-[#2C3849] transition-all shadow-md">
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                          {event.title}
                        </h3>
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
                          {badgeLabel}
                        </span>
                      </div>

                      <p className="text-xs text-[#8E9CA8] leading-relaxed">
                        {event.description}
                      </p>

                      {event.tacticalImpact && (
                        <div className="mt-2.5 pt-2 border-t border-[#1E2633]/60 text-[11px] text-[#A3B1BF] flex items-start gap-1.5">
                          <span className="text-[#B9F36A] font-mono font-bold text-[10px] uppercase shrink-0">
                            Impact:
                          </span>
                          <span>{event.tacticalImpact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: AI match summary, Match recap & Ask (5 cols)
           ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Match Recap Section */}
          <div className="space-y-2.5">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Match recap
            </h3>
            <div className="bg-[#12161F] border border-[#1E2633] rounded-2xl p-5 flex items-start gap-3.5 shadow-md">
              <FileText className="w-5 h-5 text-[#B9F36A] shrink-0 mt-0.5" />
              <p className="text-xs text-[#8E9CA8] leading-relaxed">
                {selectedMatch.executiveRecap?.tacticalBrief ||
                  "The full written recap will sit here — structured by half, with the decisive moments pulled from the timeline above."}
              </p>
            </div>
          </div>

          {/* 3. Ask About This Match Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Ask about this match
              </h3>
              {chatHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear inquiry thread"
                  className="p-1 rounded text-[#8E9CA8] hover:text-white transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="space-y-2"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={userQuery}
                  disabled={isLoading}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="e.g. Why did the momentum shift at 57'?"
                  maxLength={500}
                  className="w-full bg-[#12161F] border border-[#1E2633] rounded-2xl py-3 pl-4 pr-14 text-xs sm:text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#B9F36A] transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading || !userQuery.trim()}
                  className="absolute right-2 p-2.5 rounded-xl bg-[#B9F36A] text-[#0B0D11] hover:bg-[#a3e635] disabled:opacity-40 transition-all cursor-pointer shadow-md"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-[#475569] px-1">
                Question interface placeholder — answers arrive with the AI layer.
              </p>
            </form>

            {/* Error Message */}
            {apiError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-300 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{apiError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setApiError(null)}
                  className="text-[10px] text-red-300 hover:text-white underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Interactive Chat Responses Area (When inquiries are asked) */}
            {chatHistory.length > 0 && (
              <div className="space-y-3 pt-2 max-h-[420px] overflow-y-auto pr-1">
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${msg.role === "user"
                      ? "bg-[#1E293B] border-[#334155] text-white ml-4 shadow"
                      : msg.isError
                        ? "bg-red-950/30 border-red-900/50 text-red-300 mr-2"
                        : "bg-[#12161F] border-[#1E2633] text-white mr-2 shadow-lg"
                      }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#8E9CA8]">
                      <span className={msg.role === "user" ? "text-[#B9F36A] font-bold" : "text-[#8E9CA8] font-semibold"}>
                        {msg.role === "user" ? "Tactical Inquiry" : "Context90 Analyst"}
                      </span>
                      <span>{msg.time}</span>
                    </div>

                    <p className="text-xs text-[#F5F7F2] whitespace-pre-line leading-relaxed">
                      {msg.text}
                    </p>

                    {/* Grounded Key Points */}
                    {msg.analysis && msg.analysis.keyPoints.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-[#1E2633]">
                        <div className="text-[10px] font-mono uppercase text-[#B9F36A] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Key Observations:
                        </div>
                        <ul className="space-y-1 text-[11px] text-[#8E9CA8] pl-3.5 list-disc marker:text-[#B9F36A]">
                          {msg.analysis.keyPoints.map((kp, idx) => (
                            <li key={idx} className="leading-snug">{kp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Empirical Citations */}
                    {msg.analysis && msg.analysis.evidence.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-mono uppercase text-[#8E9CA8] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#F4B860]" /> Empirical Citations:
                        </div>
                        <div className="flex flex-col gap-1">
                          {msg.analysis.evidence.map((ev, idx) => (
                            <div
                              key={idx}
                              className="p-1.5 rounded bg-[#0E131A] border border-[#1E2633] text-[10px] flex items-center gap-2 text-[#8E9CA8]"
                            >
                              {ev.minute !== undefined && (
                                <span className="font-mono font-bold text-[#B9F36A] px-1 py-0.2 rounded bg-[#162719]">
                                  {ev.minute}&apos;
                                </span>
                              )}
                              <span className="text-white/80">{ev.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Data Boundary */}
                    {msg.analysis && msg.analysis.limitations.length > 0 && (
                      <div className="pt-1 text-[10px] text-[#64748B] flex items-center gap-1">
                        <Info className="w-3 h-3 shrink-0" />
                        <span>{msg.analysis.limitations[0]}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
