"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Calendar, MapPin, ChevronRight, Check } from "lucide-react";
import { useMatchContext } from "@/context/MatchContext";
import { Match, Fixture } from "@/types/football";
import { getTeamById } from "@/data/teams";

export type CardMatchItem = Match | Fixture;

interface MatchCardProps {
  match: CardMatchItem;
  variant?: "compact" | "detailed" | "featured";
  className?: string;
  onSelect?: () => void;
}

export function MatchCard({
  match,
  variant = "detailed",
  className,
  onSelect,
}: MatchCardProps) {
  const { selectedMatch, selectMatch } = useMatchContext();
  const isSelected = selectedMatch.id === match.id;

  const handleSelect = () => {
    selectMatch(match.id);
    if (onSelect) onSelect();
  };

  // Safe resolver for both Match and Fixture representations
  const isFullMatch = "homeFormation" in match;
  const homeName = isFullMatch
    ? match.homeTeam.name
    : getTeamById(match.homeTeamId).name;
  const homeCode = isFullMatch
    ? match.homeTeam.code
    : getTeamById(match.homeTeamId).code;

  const awayName = isFullMatch
    ? match.awayTeam.name
    : getTeamById(match.awayTeamId).name;
  const awayCode = isFullMatch
    ? match.awayTeam.code
    : getTeamById(match.awayTeamId).code;

  const venue = isFullMatch ? match.fixture.venue : match.venue;
  const kickoffDate = isFullMatch ? match.fixture.kickoffDate : match.kickoffDate;
  const matchweek = isFullMatch ? match.fixture.matchweekLabel : match.matchweekLabel;
  const headlineTactics = isFullMatch ? match.fixture.headlineTactics : match.headlineTactics;

  const isInPlay = match.status === "IN_PLAY";
  const minute = isFullMatch ? match.minute : undefined;
  const scoreDisplay =
    isFullMatch && match.homeScore !== undefined
      ? `${match.homeScore} - ${match.awayScore}`
      : null;

  if (variant === "compact") {
    return (
      <div
        onClick={handleSelect}
        className={cn(
          "bg-[#171C20] border rounded-lg p-3 cursor-pointer transition-all hover:border-[#373F45]",
          isSelected ? "border-[#B9F36A]/50 bg-[#171C20]" : "border-[#272E32]",
          className
        )}
      >
        <div className="flex items-center justify-between text-[11px] text-[#929B9E] mb-2">
          <span>{matchweek}</span>
          <span className="font-mono">{kickoffDate.split("·")[0]}</span>
        </div>
        <div className="flex items-center justify-between font-semibold text-sm text-[#F5F7F2]">
          <span className="truncate">{homeName}</span>
          {scoreDisplay ? (
            <span className="text-xs font-mono font-bold text-[#B9F36A] px-2">
              {scoreDisplay}
            </span>
          ) : (
            <span className="text-xs text-[#929B9E] px-2 font-mono">VS</span>
          )}
          <span className="truncate">{awayName}</span>
        </div>
        {isSelected && (
          <div className="mt-2 pt-2 border-t border-[#272E32] flex items-center justify-between text-[11px] text-[#B9F36A]">
            <span>Active match context</span>
            <Check className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <div
        className={cn(
          "bg-[#171C20] border border-[#272E32] rounded-xl p-5 relative overflow-hidden transition-all hover:border-[#373F45]",
          isSelected && "border-[#B9F36A]/40",
          className
        )}
      >
        {/* Subtle accent top border glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B9F36A]/60 to-transparent" />

        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="accent" size="sm">
              Featured Fixture
            </Badge>
            <span className="text-xs text-[#929B9E] font-medium">
              Premier League · {matchweek}
            </span>
            <span className="text-[10px] font-mono uppercase bg-[#121619] border border-[#272E32] px-1.5 py-0.5 rounded text-[#929B9E]">
              Illustrative Match Data
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#929B9E]">
            <Calendar className="w-3.5 h-3.5" />
            <span>{kickoffDate}</span>
          </div>
        </div>

        {/* Big Teams Display */}
        <div className="grid grid-cols-1 sm:grid-cols-7 items-center gap-4 py-4 border-y border-[#272E32]/80 my-2">
          <div className="sm:col-span-3 flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#121619] border border-[#272E32] flex items-center justify-center font-bold text-sm text-[#F5F7F2]">
              {homeCode}
            </div>
            <div>
              <div className="text-lg font-bold text-[#F5F7F2]">
                {homeName}
              </div>
              <div className="text-xs text-[#929B9E]">Home Team · Emirates</div>
            </div>
          </div>

          <div className="sm:col-span-1 text-center py-1 sm:py-0">
            {scoreDisplay ? (
              <div className="inline-block px-3 py-1 rounded bg-[#121619] border border-[#B9F36A]/40 text-sm font-mono font-bold text-[#B9F36A]">
                {scoreDisplay}
                {isInPlay && (
                  <div className="text-[9px] font-mono text-[#F4B860] uppercase">
                    In-Play {minute ? `(${minute}')` : ""}
                  </div>
                )}
              </div>
            ) : (
              <div className="inline-block px-3 py-1 rounded bg-[#121619] border border-[#272E32] text-xs font-mono font-bold text-[#929B9E]">
                VS
              </div>
            )}
          </div>

          <div className="sm:col-span-3 flex items-center sm:justify-end gap-3 text-left sm:text-right">
            <div className="order-2 sm:order-1">
              <div className="text-lg font-bold text-[#F5F7F2]">
                {awayName}
              </div>
              <div className="text-xs text-[#929B9E]">Away Team · London</div>
            </div>
            <div className="order-1 sm:order-2 w-11 h-11 rounded-lg bg-[#121619] border border-[#272E32] flex items-center justify-center font-bold text-sm text-[#F5F7F2]">
              {awayCode}
            </div>
          </div>
        </div>

        {/* Tactical preview hook & actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-1">
          <div className="flex items-center gap-2 text-xs text-[#929B9E]">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#929B9E]" />
            <span className="truncate">{venue}</span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline text-[#F5F7F2]/80 truncate">
              {headlineTactics}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={isSelected ? "secondary" : "outline"}
              size="sm"
              onClick={handleSelect}
              className="gap-1.5"
            >
              {isSelected ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#B9F36A]" />
                  Context Active
                </>
              ) : (
                "Set Active Context"
              )}
            </Button>
            <Link href="/tactiq">
              <Button variant="primary" size="sm" className="gap-1">
                Open TactiQ
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Detailed standard match card
  return (
    <div
      className={cn(
        "bg-[#171C20] border rounded-lg p-4 transition-all hover:border-[#373F45]",
        isSelected ? "border-[#B9F36A]/50 bg-[#171C20]" : "border-[#272E32]",
        className
      )}
    >
      <div className="flex items-center justify-between text-xs text-[#929B9E] mb-3">
        <span className="font-medium text-[#F5F7F2]/90">{matchweek}</span>
        <span className="font-mono">{kickoffDate}</span>
      </div>

      <div className="flex items-center justify-between py-2 border-y border-[#272E32]/70">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded bg-[#121619] border border-[#272E32] flex items-center justify-center text-xs font-bold text-[#F5F7F2]">
            {homeCode}
          </span>
          <span className="font-semibold text-sm text-[#F5F7F2]">
            {homeName}
          </span>
        </div>

        {scoreDisplay ? (
          <span className="text-xs font-mono font-bold text-[#B9F36A] px-2">
            {scoreDisplay}
          </span>
        ) : (
          <span className="text-xs font-mono text-[#929B9E] px-2 font-semibold">
            VS
          </span>
        )}

        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-sm text-[#F5F7F2]">
            {awayName}
          </span>
          <span className="w-7 h-7 rounded bg-[#121619] border border-[#272E32] flex items-center justify-center text-xs font-bold text-[#F5F7F2]">
            {awayCode}
          </span>
        </div>
      </div>

      <p className="text-xs text-[#929B9E] my-3 line-clamp-1">
        {headlineTactics}
      </p>

      <div className="flex items-center justify-between pt-1 text-xs">
        <span className="text-[#929B9E] truncate max-w-[160px]">
          {venue.split(",")[0]}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelect}
            className="text-xs h-7 px-2"
          >
            {isSelected ? (
              <span className="text-[#B9F36A] flex items-center gap-1">
                <Check className="w-3 h-3" /> Selected
              </span>
            ) : (
              "Focus"
            )}
          </Button>
          <Link href="/tactiq">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2.5 gap-1"
            >
              Analyze
              <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
