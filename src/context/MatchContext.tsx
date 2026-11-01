"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { Match, Fixture } from "@/types/football";
import { MATCHES_DATA, MATCHES_LIST } from "@/data/matches";
import { FIXTURES_LIST } from "@/data/fixtures";

export interface MatchContextType {
  selectedMatchId: string;
  selectedMatch: Match;
  availableMatches: Match[];
  availableFixtures: Fixture[];
  selectMatch: (matchId: string) => void;
  dataSource: "DEMO_SIMULATED";
  isSimulated: boolean;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

// Default initial selected match is Arsenal vs Chelsea
const DEFAULT_MATCH_ID = "ars-che";

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(DEFAULT_MATCH_ID);

  const selectedMatch = useMemo(() => {
    return MATCHES_DATA[selectedMatchId.toLowerCase()] || MATCHES_DATA[DEFAULT_MATCH_ID];
  }, [selectedMatchId]);

  const selectMatch = (matchId: string) => {
    const normalized = matchId.toLowerCase();
    if (MATCHES_DATA[normalized]) {
      setSelectedMatchId(normalized);
    }
  };

  const contextValue: MatchContextType = {
    selectedMatchId: selectedMatch.id,
    selectedMatch,
    availableMatches: MATCHES_LIST,
    availableFixtures: FIXTURES_LIST,
    selectMatch,
    dataSource: "DEMO_SIMULATED",
    isSimulated: true,
  };

  return (
    <MatchContext.Provider value={contextValue}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatchContext(): MatchContextType {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error("useMatchContext must be used within a MatchProvider");
  }
  return context;
}
