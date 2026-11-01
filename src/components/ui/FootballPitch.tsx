"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface PitchPlayer {
  id: string;
  number: number;
  name: string;
  role: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  team: "home" | "away";
}

interface FootballPitchProps {
  formation?: string;
  players?: PitchPlayer[];
  showZones?: boolean;
  showPassingLines?: boolean;
  selectedPlayerId?: string | null;
  onSelectPlayer?: (player: PitchPlayer) => void;
  className?: string;
}

export const DEFAULT_FORMATIONS: Record<string, PitchPlayer[]> = {
  "4-3-3 Attacking": [
    { id: "1", number: 1, name: "Raya", role: "Sweeper Keeper", x: 50, y: 92, team: "home" },
    { id: "2", number: 4, name: "White", role: "Inverted RB", x: 82, y: 74, team: "home" },
    { id: "3", number: 2, name: "Saliba", role: "Stopper CB", x: 62, y: 76, team: "home" },
    { id: "4", number: 6, name: "Gabriel", role: "Covering CB", x: 38, y: 76, team: "home" },
    { id: "5", number: 33, name: "Calafiori", role: "Overlapping LB", x: 18, y: 74, team: "home" },
    { id: "6", number: 5, name: "Partey", role: "Single Pivot (6)", x: 50, y: 58, team: "home" },
    { id: "7", number: 8, name: "Ødegaard", role: "Advanced Playmaker (10)", x: 68, y: 44, team: "home" },
    { id: "8", number: 41, name: "Rice", role: "Box-to-Box (8)", x: 32, y: 46, team: "home" },
    { id: "9", number: 7, name: "Saka", role: "Inside Forward (RW)", x: 84, y: 26, team: "home" },
    { id: "10", number: 29, name: "Havertz", role: "Deep-lying 9", x: 50, y: 20, team: "home" },
    { id: "11", number: 11, name: "Martinelli", role: "Touchline Winger (LW)", x: 16, y: 26, team: "home" },
  ],
  "3-2-4-1 Build-Up": [
    { id: "1", number: 31, name: "Ederson", role: "Sweeper Keeper", x: 50, y: 92, team: "home" },
    { id: "2", number: 25, name: "Akanji", role: "Right CB", x: 74, y: 76, team: "home" },
    { id: "3", number: 3, name: "Dias", role: "Central CB", x: 50, y: 78, team: "home" },
    { id: "4", number: 24, name: "Gvardiol", role: "Left CB", x: 26, y: 76, team: "home" },
    { id: "5", number: 16, name: "Rodri", role: "Holding Pivot", x: 40, y: 62, team: "home" },
    { id: "6", number: 82, name: "Lewis", role: "Inverted Midfielder", x: 60, y: 62, team: "home" },
    { id: "7", number: 20, name: "Bernardo", role: "Half-space Pocket", x: 68, y: 42, team: "home" },
    { id: "8", number: 17, name: "De Bruyne", role: "Creative Free 8", x: 32, y: 42, team: "home" },
    { id: "9", number: 47, name: "Foden", role: "Right Wing Overload", x: 85, y: 28, team: "home" },
    { id: "10", number: 9, name: "Haaland", role: "Poacher / Target Man", x: 50, y: 18, team: "home" },
    { id: "11", number: 11, name: "Doku", role: "1v1 Isolation Winger", x: 15, y: 28, team: "home" },
  ],
  "4-2-3-1 Mid-Block": [
    { id: "1", number: 1, name: "Sanchez", role: "Goalkeeper", x: 50, y: 92, team: "home" },
    { id: "2", number: 27, name: "Gusto", role: "Fullback", x: 82, y: 75, team: "home" },
    { id: "3", number: 29, name: "Fofana", role: "Right CB", x: 62, y: 77, team: "home" },
    { id: "4", number: 6, name: "Colwill", role: "Ball-playing CB", x: 38, y: 77, team: "home" },
    { id: "5", number: 3, name: "Cucurella", role: "Tuck-in LB", x: 18, y: 75, team: "home" },
    { id: "6", number: 25, name: "Caicedo", role: "Ball-winning Mid", x: 38, y: 60, team: "home" },
    { id: "7", number: 45, name: "Lavia", role: "Deep Controller", x: 62, y: 60, team: "home" },
    { id: "8", number: 20, name: "Palmer", role: "Central Trequartista", x: 50, y: 42, team: "home" },
    { id: "9", number: 11, name: "Madueke", role: "Inverted Winger", x: 80, y: 32, team: "home" },
    { id: "10", number: 15, name: "Jackson", role: "Channel Runner 9", x: 50, y: 20, team: "home" },
    { id: "11", number: 7, name: "Neto", role: "Direct Winger", x: 20, y: 32, team: "home" },
  ],
};

export function FootballPitch({
  formation = "4-3-3 Attacking",
  players,
  showZones = true,
  showPassingLines = true,
  selectedPlayerId,
  onSelectPlayer,
  className,
}: FootballPitchProps) {
  const [internalSelected, setInternalSelected] = useState<string | null>(
    selectedPlayerId || null
  );

  const activePlayers = players || DEFAULT_FORMATIONS[formation] || DEFAULT_FORMATIONS["4-3-3 Attacking"];

  const handlePlayerClick = (p: PitchPlayer) => {
    setInternalSelected(p.id);
    if (onSelectPlayer) {
      onSelectPlayer(p);
    }
  };

  const selectedPlayer = activePlayers.find(
    (p) => p.id === (selectedPlayerId ?? internalSelected)
  );

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {/* Pitch Frame */}
      <div className="relative w-full aspect-[68/100] max-w-[540px] bg-[#0E1316] rounded-xl border border-[#272E32] overflow-hidden shadow-2xl p-3 sm:p-5 select-none">
        {/* Subtle Pitch Grass Grid Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(#1B242A_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Pitch Lines SVG */}
        <svg
          viewBox="0 0 680 1050"
          className="w-full h-full text-[#2B353B] stroke-current fill-none"
          strokeWidth="3.5"
        >
          {/* Outer Boundary */}
          <rect
            x="25"
            y="25"
            width="630"
            height="1000"
            rx="2"
            stroke="currentColor"
            strokeWidth="4"
          />

          {/* Halfway Line */}
          <line x1="25" y1="525" x2="655" y2="525" stroke="currentColor" strokeWidth="3.5" />

          {/* Center Circle & Spot */}
          <circle cx="340" cy="525" r="91.5" stroke="currentColor" strokeWidth="3" />
          <circle cx="340" cy="525" r="5" className="fill-[#3A464E] stroke-none" />

          {/* Top Penalty Area (Opponent) */}
          <rect x="139" y="25" width="402" height="165" stroke="currentColor" strokeWidth="3" />
          <rect x="249" y="25" width="182" height="55" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="340" cy="110" r="4.5" className="fill-[#3A464E] stroke-none" />
          {/* Top Penalty Arc */}
          <path
            d="M 270 190 A 91.5 91.5 0 0 0 410 190"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          {/* Top Goal */}
          <rect x="290" y="8" width="100" height="17" stroke="currentColor" strokeDasharray="3 3" />

          {/* Bottom Penalty Area (Own Half) */}
          <rect x="139" y="860" width="402" height="165" stroke="currentColor" strokeWidth="3" />
          <rect x="249" y="970" width="182" height="55" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="340" cy="940" r="4.5" className="fill-[#3A464E] stroke-none" />
          {/* Bottom Penalty Arc */}
          <path
            d="M 270 860 A 91.5 91.5 0 0 1 410 860"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          {/* Bottom Goal */}
          <rect x="290" y="1025" width="100" height="17" stroke="currentColor" strokeDasharray="3 3" />

          {/* Corner Arcs */}
          <path d="M 25 45 A 20 20 0 0 1 45 25" stroke="currentColor" strokeWidth="2.5" />
          <path d="M 635 25 A 20 20 0 0 1 655 45" stroke="currentColor" strokeWidth="2.5" />
          <path d="M 25 1005 A 20 20 0 0 0 45 1025" stroke="currentColor" strokeWidth="2.5" />
          <path d="M 635 1025 A 20 20 0 0 0 655 1005" stroke="currentColor" strokeWidth="2.5" />

          {/* Tactical Five Vertical Lanes / Zones (Optional Overlay) */}
          {showZones && (
            <g stroke="#1F282E" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.6">
              {/* Left Flank Boundary */}
              <line x1="139" y1="25" x2="139" y2="1025" />
              {/* Left Half-space Boundary */}
              <line x1="260" y1="25" x2="260" y2="1025" />
              {/* Right Half-space Boundary */}
              <line x1="420" y1="25" x2="420" y2="1025" />
              {/* Right Flank Boundary */}
              <line x1="541" y1="25" x2="541" y2="1025" />
            </g>
          )}

          {/* Passing Networks Lines (Subtle Tactical Triangle) */}
          {showPassingLines && (
            <g stroke="#B9F36A" strokeWidth="1.2" opacity="0.25" strokeDasharray="3 3">
              <line x1="340" y1="580" x2="217" y2="460" />
              <line x1="340" y1="580" x2="462" y2="440" />
              <line x1="217" y1="460" x2="340" y2="200" />
              <line x1="462" y1="440" x2="340" y2="200" />
              <line x1="462" y1="440" x2="571" y2="260" />
              <line x1="217" y1="460" x2="108" y2="260" />
            </g>
          )}
        </svg>

        {/* Tactical Direction Arrow Indicator */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] tracking-widest font-mono uppercase text-[#929B9E]/60 flex items-center gap-1.5 pointer-events-none">
          <span>Attacking Direction</span>
          <span>▲</span>
        </div>

        {/* Players Nodes Overlay */}
        <div className="absolute inset-0 pointer-events-auto">
          {activePlayers.map((player) => {
            const isSelected = selectedPlayer?.id === player.id;
            return (
              <div
                key={player.id}
                onClick={() => handlePlayerClick(player)}
                style={{
                  left: `${player.x}%`,
                  top: `${player.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className={cn(
                  "absolute flex flex-col items-center cursor-pointer group transition-all duration-150 z-10",
                  isSelected ? "scale-110 z-20" : "hover:scale-105"
                )}
              >
                {/* Jersey / Node Circle */}
                <div
                  className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs border shadow-lg transition-colors",
                    isSelected
                      ? "bg-[#B9F36A] text-[#0B0D0F] border-[#B9F36A] ring-4 ring-[#B9F36A]/20"
                      : "bg-[#171C20] text-[#F5F7F2] border-[#272E32] group-hover:border-[#B9F36A]/60"
                  )}
                >
                  {player.number}
                </div>

                {/* Player Name Tag */}
                <div
                  className={cn(
                    "mt-1 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold whitespace-nowrap leading-tight transition-colors pointer-events-none",
                    isSelected
                      ? "bg-[#121619] text-[#B9F36A] border border-[#B9F36A]/40"
                      : "bg-[#121619]/90 text-[#F5F7F2] border border-[#272E32]/80 group-hover:text-[#B9F36A]"
                  )}
                >
                  {player.name}
                </div>

                {/* Small Role Indicator on Hover/Active */}
                {isSelected && (
                  <span className="text-[9px] font-mono text-[#929B9E] bg-[#0B0D0F] px-1 rounded mt-0.5 border border-[#272E32]">
                    {player.role.split(" ")[0]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Player Inspector Pill */}
      {selectedPlayer && (
        <div className="mt-3 flex items-center gap-3 bg-[#121619] border border-[#272E32] rounded-lg px-3.5 py-2 text-xs w-full max-w-[540px] justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#B9F36A] text-[#0B0D0F] font-mono font-bold flex items-center justify-center text-[10px]">
              {selectedPlayer.number}
            </span>
            <span className="font-bold text-[#F5F7F2]">{selectedPlayer.name}</span>
            <span className="text-[#929B9E]">·</span>
            <span className="text-[#929B9E]">{selectedPlayer.role}</span>
          </div>
          <span className="text-[11px] font-mono text-[#B9F36A] bg-[#B9F36A]/10 px-2 py-0.5 rounded">
            Pos: {selectedPlayer.x}%, {selectedPlayer.y}%
          </span>
        </div>
      )}
    </div>
  );
}
