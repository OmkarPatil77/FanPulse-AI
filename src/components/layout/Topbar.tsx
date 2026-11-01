"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS, FOOTER_NAV_ITEMS } from "@/lib/navigation";
import { useMatchContext } from "@/context/MatchContext";
import {
  Menu,
  Search,
  ChevronDown,
  Database,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const pathname = usePathname();
  const { selectedMatch, selectMatch, availableMatches } = useMatchContext();
  const [matchDropdownOpen, setMatchDropdownOpen] = useState(false);

  // Find current route title
  const currentNavItem =
    [...MAIN_NAV_ITEMS, ...FOOTER_NAV_ITEMS].find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    ) || { title: "Intelligence Hub", description: "Matchday tactical pulse" };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B0D0F]/90 backdrop-blur-md border-b border-[#272E32] px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left section: Hamburger (mobile) + Page Title + Context Badges */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-md text-[#929B9E] hover:text-[#F5F7F2] hover:bg-[#171C20] cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#F5F7F2] truncate">
                {currentNavItem.title}
              </h2>

              {/* Competition & Season Tags */}
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <span className="text-[#272E32]">/</span>
                <Badge variant="outline" size="sm">
                  Premier League
                </Badge>
                <Badge variant="muted" size="sm" className="hidden md:inline-flex">
                  2026/27
                </Badge>
                {/* Data Source Transparency Badge */}
                <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#171C20] border border-[#272E32] text-[#929B9E]">
                  <Database className="w-2.5 h-2.5 text-[#B9F36A]" />
                  Illustrative Match Data
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center/Right Section: Search + Match Context Selector + User Profile */}
      <div className="flex items-center gap-3">
        {/* Search Field Placeholder */}
        <div className="relative hidden md:block w-44 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#929B9E]" />
          <input
            type="text"
            placeholder="Search teams, players..."
            className="w-full h-9 pl-9 pr-8 text-xs bg-[#121619] border border-[#272E32] rounded-md text-[#F5F7F2] placeholder-[#929B9E]/70 focus:outline-none focus:border-[#B9F36A]/60 transition-colors"
          />
          <kbd className="hidden lg:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#929B9E] bg-[#171C20] px-1.5 py-0.5 rounded border border-[#272E32]">
            /
          </kbd>
        </div>

        {/* Global Match Context Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMatchDropdownOpen(!matchDropdownOpen)}
            className="h-9 px-2.5 sm:px-3 bg-[#121619] border border-[#272E32] hover:border-[#373F45] rounded-md flex items-center gap-2 text-xs font-medium text-[#F5F7F2] transition-colors cursor-pointer"
            aria-expanded={matchDropdownOpen}
          >
            <div className="w-2 h-2 rounded-full bg-[#B9F36A]" />
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="font-bold">{selectedMatch.homeTeam.code}</span>
              <span className="text-[#929B9E]">v</span>
              <span className="font-bold">{selectedMatch.awayTeam.code}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#929B9E]" />
          </button>

          {matchDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setMatchDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-[#121619] border border-[#272E32] rounded-lg shadow-xl z-40 p-2 space-y-1">
                <div className="px-2 py-1.5 text-[10px] font-mono uppercase text-[#929B9E] flex items-center justify-between border-b border-[#272E32] mb-1">
                  <span>Match Context</span>
                  <span>{selectedMatch.fixture.matchweekLabel}</span>
                </div>
                {availableMatches.map((m) => {
                  const isCur = m.id === selectedMatch.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        selectMatch(m.id);
                        setMatchDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors cursor-pointer flex flex-col gap-0.5 ${isCur
                        ? "bg-[#171C20] border border-[#B9F36A]/40 text-[#F5F7F2]"
                        : "text-[#929B9E] hover:text-[#F5F7F2] hover:bg-[#171C20]"
                        }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>
                          {m.homeTeam.name} vs {m.awayTeam.name}
                        </span>
                        {isCur ? (
                          <span className="text-[10px] font-mono text-[#B9F36A]">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#929B9E]">
                            {m.homeTeam.code} v {m.awayTeam.code}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#929B9E]">
                        {m.fixture.kickoffDate}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* User Profile Placeholder */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#272E32]">
          <div className="w-8 h-8 rounded-full bg-[#171C20] border border-[#272E32] flex items-center justify-center font-bold text-xs text-[#B9F36A]">
            FP
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-[#F5F7F2] leading-none">
              Analyst Pro
            </div>
            <div className="text-[10px] text-[#929B9E] font-mono leading-none mt-1">
              Tactics Tier
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
