"use client";

import React, { useState, useMemo } from "react";
import { useMatchContext } from "@/context/MatchContext";
import { Player } from "@/types/football";
import {
  Search,
  ChevronDown,
  Info,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Scale,
  Ruler,
  Footprints,
  Shirt,
  CalendarClock,
  Clock,
  CircleDollarSign,
  Globe2,
} from "lucide-react";

interface PlayerBioDetail {
  id: string;
  name: string;
  shortName: string;
  teamId: string;
  teamName: string;
  teamBadgeColor: string;
  number: number;
  positionCategory: "GK" | "DEF" | "MID" | "FWD";
  primaryRole: string;
  age: number;
  nationality: string;
  countryCode: string;
  flag: string;
  height: string;
  weight: string;
  foot: "Left" | "Right" | "Both";
  contractEnd: string;
  joined: string;
  transferValue: string;
  valueTrend: string;
  valueTrendPercent: string;
  isPositiveTrend: boolean;
  matches: number;
  cleanSheets: number;
  goalsConcededOrKeyPasses: number;
  goalsConcededOrKeyPassesLabel: string;
  highestValuation: string;
  currentValuation: string;
  peakValuation: string;
  floorValuation: string;
  growthPercent: string;
  traitsSubtitle: string;
  traits: Array<{
    label: string;
    value: number;
    display: string;
  }>;
  valuationTrajectory: Array<{
    year: string;
    value: number; // in Millions
    club: string;
    clubName: string;
    badgeBg: string;
  }>;
  pitchMetricLabel: string;
  pitchMetricValue: string;
  shotsFacedOrCreated: number;
  goalsConcededOrScored: number;
  xgotOrXg: string;
  saveOrSuccessPercent: string;
  shotType: string;
  shotSituation: string;
  shotResult: string;
  xgStat: string;
  xgotStat: string;
  filters: Array<{ label: string; count: number }>;
  pitchPoints: Array<{
    x: number;
    y: number;
    type: "saved" | "onTarget" | "goal";
  }>;
}

const PLAYERS_SHOWCASE: Record<string, PlayerBioDetail> = {
  "mci-trafford": {
    id: "mci-trafford",
    name: "James Trafford",
    shortName: "Trafford",
    teamId: "mci",
    teamName: "Manchester City",
    teamBadgeColor: "#6CABDD",
    number: 1,
    positionCategory: "GK",
    primaryRole: "Goalkeeper",
    age: 23,
    nationality: "English",
    countryCode: "ENG",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    height: "197 cm",
    weight: "87 kg",
    foot: "Right",
    contractEnd: "Jun 30, 2030",
    joined: "Jul 29, 2025",
    transferValue: "€32.7M",
    valueTrend: "▼ 8.3%",
    valueTrendPercent: "8.3%",
    isPositiveTrend: true,
    matches: 17,
    cleanSheets: 7,
    goalsConcededOrKeyPasses: 18,
    goalsConcededOrKeyPassesLabel: "Goals Conceded",
    highestValuation: "€40.6M (Dec 1, 2025)",
    currentValuation: "€32.7M",
    peakValuation: "€40.7M",
    floorValuation: "€1.2M",
    growthPercent: "+2,625%",
    traitsSubtitle: "Stats compared to other keepers",
    traits: [
      { label: "Accurate long balls %", value: 9, display: "9%" },
      { label: "Sweeper", value: 96, display: "96%" },
      { label: "Goals conceded", value: 98, display: "98%" },
      { label: "Save percentage", value: 97, display: "97%" },
      { label: "High claim", value: 6, display: "6%" },
      { label: "Clean sheet", value: 95, display: "95%" },
    ],
    valuationTrajectory: [
      { year: "2020", value: 0.5, club: "mci", clubName: "Man City", badgeBg: "#6CABDD" },
      { year: "2021", value: 1.2, club: "acc", clubName: "Accrington", badgeBg: "#C8102E" },
      { year: "2022", value: 8.5, club: "bol", clubName: "Bolton", badgeBg: "#132257" },
      { year: "2023", value: 19.0, club: "bur", clubName: "Burnley", badgeBg: "#6C1D45" },
      { year: "2024", value: 24.5, club: "bur", clubName: "Burnley", badgeBg: "#6C1D45" },
      { year: "2025", value: 40.6, club: "mci", clubName: "Man City", badgeBg: "#6CABDD" },
      { year: "2026", value: 32.7, club: "mci", clubName: "Man City", badgeBg: "#6CABDD" },
    ],
    pitchMetricLabel: "Save percentage",
    pitchMetricValue: "70%",
    shotsFacedOrCreated: 21,
    goalsConcededOrScored: 6,
    xgotOrXg: "8.56",
    saveOrSuccessPercent: "70%",
    shotType: "Right foot",
    shotSituation: "Fast break",
    shotResult: "Goal",
    xgStat: "0.65",
    xgotStat: "0.92",
    filters: [
      { label: "Saves", count: 9 },
      { label: "Goals conceded", count: 6 },
      { label: "Penalty", count: 5 },
      { label: "Fast break", count: 7 },
      { label: "Shots outside box", count: 39 },
    ],
    pitchPoints: [
      { x: 30, y: 35, type: "saved" },
      { x: 32, y: 48, type: "saved" },
      { x: 42, y: 25, type: "saved" },
      { x: 50, y: 55, type: "saved" },
      { x: 62, y: 40, type: "saved" },
      { x: 70, y: 22, type: "saved" },
      { x: 74, y: 45, type: "saved" },
      { x: 55, y: 70, type: "onTarget" },
      { x: 68, y: 65, type: "onTarget" },
      { x: 80, y: 52, type: "onTarget" },
      { x: 45, y: 80, type: "onTarget" },
      { x: 82, y: 48, type: "goal" },
      { x: 78, y: 78, type: "goal" },
      { x: 38, y: 72, type: "goal" },
    ],
  },
  "ars-saka": {
    id: "ars-saka",
    name: "Bukayo Saka",
    shortName: "Saka",
    teamId: "ars",
    teamName: "Arsenal",
    teamBadgeColor: "#EF0107",
    number: 7,
    positionCategory: "FWD",
    primaryRole: "Inside Forward (RW)",
    age: 23,
    nationality: "English",
    countryCode: "ENG",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    height: "178 cm",
    weight: "73 kg",
    foot: "Left",
    contractEnd: "Jun 30, 2027",
    joined: "Jul 1, 2019",
    transferValue: "€140.0M",
    valueTrend: "▲ 12.5%",
    valueTrendPercent: "12.5%",
    isPositiveTrend: true,
    matches: 19,
    cleanSheets: 8,
    goalsConcededOrKeyPasses: 42,
    goalsConcededOrKeyPassesLabel: "Key Chances",
    highestValuation: "€140.0M (Oct 2026)",
    currentValuation: "€140.0M",
    peakValuation: "€140.0M",
    floorValuation: "€7.0M",
    growthPercent: "+1,900%",
    traitsSubtitle: "Stats compared to other wingers",
    traits: [
      { label: "Dribble Success %", value: 89, display: "89%" },
      { label: "Key Passes", value: 95, display: "95%" },
      { label: "Goal Threat", value: 92, display: "92%" },
      { label: "Cross Accuracy", value: 88, display: "88%" },
      { label: "Progression", value: 96, display: "96%" },
      { label: "Press Resistance", value: 91, display: "91%" },
    ],
    valuationTrajectory: [
      { year: "2020", value: 20.0, club: "ars", clubName: "Arsenal", badgeBg: "#EF0107" },
      { year: "2021", value: 45.0, club: "ars", clubName: "Arsenal", badgeBg: "#EF0107" },
      { year: "2022", value: 70.0, club: "ars", clubName: "Arsenal", badgeBg: "#EF0107" },
      { year: "2023", value: 100.0, club: "ars", clubName: "Arsenal", badgeBg: "#EF0107" },
      { year: "2024", value: 120.0, club: "ars", clubName: "Arsenal", badgeBg: "#EF0107" },
      { year: "2025", value: 130.0, club: "ars", clubName: "Arsenal", badgeBg: "#EF0107" },
      { year: "2026", value: 140.0, club: "ars", clubName: "Arsenal", badgeBg: "#EF0107" },
    ],
    pitchMetricLabel: "Pass completion",
    pitchMetricValue: "84%",
    shotsFacedOrCreated: 34,
    goalsConcededOrScored: 8,
    xgotOrXg: "6.84",
    saveOrSuccessPercent: "84%",
    shotType: "Left foot",
    shotSituation: "Cut inside / Box entry",
    shotResult: "Goal",
    xgStat: "0.78",
    xgotStat: "0.95",
    filters: [
      { label: "Chances", count: 18 },
      { label: "Key Passes", count: 12 },
      { label: "Penalty", count: 3 },
      { label: "Fast break", count: 11 },
      { label: "Shots outside box", count: 24 },
    ],
    pitchPoints: [
      { x: 72, y: 25, type: "saved" },
      { x: 80, y: 35, type: "saved" },
      { x: 65, y: 40, type: "saved" },
      { x: 85, y: 30, type: "saved" },
      { x: 78, y: 60, type: "onTarget" },
      { x: 82, y: 70, type: "onTarget" },
      { x: 88, y: 45, type: "goal" },
      { x: 84, y: 55, type: "goal" },
    ],
  },
  "che-palmer": {
    id: "che-palmer",
    name: "Cole Palmer",
    shortName: "Palmer",
    teamId: "che",
    teamName: "Chelsea",
    teamBadgeColor: "#034694",
    number: 20,
    positionCategory: "MID",
    primaryRole: "Central Playmaker",
    age: 22,
    nationality: "English",
    countryCode: "ENG",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    height: "189 cm",
    weight: "74 kg",
    foot: "Left",
    contractEnd: "Jun 30, 2033",
    joined: "Sep 1, 2023",
    transferValue: "€130.0M",
    valueTrend: "▲ 18.2%",
    valueTrendPercent: "18.2%",
    isPositiveTrend: true,
    matches: 20,
    cleanSheets: 6,
    goalsConcededOrKeyPasses: 48,
    goalsConcededOrKeyPassesLabel: "Key Chances",
    highestValuation: "€130.0M (Oct 2026)",
    currentValuation: "€130.0M",
    peakValuation: "€130.0M",
    floorValuation: "€15.0M",
    growthPercent: "+766%",
    traitsSubtitle: "Stats compared to other attacking midfielders",
    traits: [
      { label: "Decisive Passes", value: 98, display: "98%" },
      { label: "Penalty Conversion", value: 99, display: "99%" },
      { label: "Shot On Target %", value: 91, display: "91%" },
      { label: "Progressive Carries", value: 94, display: "94%" },
      { label: "Chances Created", value: 97, display: "97%" },
      { label: "Press Resistance", value: 88, display: "88%" },
    ],
    valuationTrajectory: [
      { year: "2020", value: 2.0, club: "mci", clubName: "Man City", badgeBg: "#6CABDD" },
      { year: "2021", value: 8.0, club: "mci", clubName: "Man City", badgeBg: "#6CABDD" },
      { year: "2022", value: 15.0, club: "mci", clubName: "Man City", badgeBg: "#6CABDD" },
      { year: "2023", value: 45.0, club: "che", clubName: "Chelsea", badgeBg: "#034694" },
      { year: "2024", value: 80.0, club: "che", clubName: "Chelsea", badgeBg: "#034694" },
      { year: "2025", value: 110.0, club: "che", clubName: "Chelsea", badgeBg: "#034694" },
      { year: "2026", value: 130.0, club: "che", clubName: "Chelsea", badgeBg: "#034694" },
    ],
    pitchMetricLabel: "Chances Conversion",
    pitchMetricValue: "78%",
    shotsFacedOrCreated: 42,
    goalsConcededOrScored: 11,
    xgotOrXg: "9.21",
    saveOrSuccessPercent: "78%",
    shotType: "Left foot",
    shotSituation: "Penalty / Open play",
    shotResult: "Goal",
    xgStat: "0.82",
    xgotStat: "0.98",
    filters: [
      { label: "Key Passes", count: 22 },
      { label: "Goals", count: 11 },
      { label: "Penalty", count: 7 },
      { label: "Fast break", count: 9 },
      { label: "Shots outside box", count: 19 },
    ],
    pitchPoints: [
      { x: 55, y: 35, type: "saved" },
      { x: 65, y: 45, type: "saved" },
      { x: 72, y: 55, type: "saved" },
      { x: 80, y: 40, type: "onTarget" },
      { x: 84, y: 65, type: "onTarget" },
      { x: 88, y: 50, type: "goal" },
      { x: 78, y: 38, type: "goal" },
    ],
  },
  "ars-rice": {
    id: "ars-rice",
    name: "Declan Rice",
    shortName: "Rice",
    teamId: "ars",
    teamName: "Arsenal",
    teamBadgeColor: "#EF0107",
    number: 41,
    positionCategory: "MID",
    primaryRole: "Box-to-Box (8)",
    age: 25,
    nationality: "English",
    countryCode: "ENG",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    height: "185 cm",
    weight: "80 kg",
    foot: "Right",
    contractEnd: "Jun 30, 2028",
    joined: "Jul 15, 2023",
    transferValue: "€120.0M",
    valueTrend: "▲ 9.1%",
    valueTrendPercent: "9.1%",
    isPositiveTrend: true,
    matches: 21,
    cleanSheets: 10,
    goalsConcededOrKeyPasses: 29,
    goalsConcededOrKeyPassesLabel: "Ball Regains",
    highestValuation: "€120.0M (Oct 2026)",
    currentValuation: "€120.0M",
    peakValuation: "€120.0M",
    floorValuation: "€35.0M",
    growthPercent: "+242%",
    traitsSubtitle: "Stats compared to other central midfielders",
    traits: [
      { label: "Interceptions", value: 96, display: "96%" },
      { label: "Tackles Won", value: 94, display: "94%" },
      { label: "Pass Completion", value: 92, display: "92%" },
      { label: "Progressive Carries", value: 89, display: "89%" },
      { label: "Ground Duels", value: 91, display: "91%" },
      { label: "Work Rate", value: 98, display: "98%" },
    ],
    valuationTrajectory: [
      { year: "2020", value: 35.0, club: "whu", clubName: "West Ham", badgeBg: "#7A263A" },
      { year: "2021", value: 65.0, club: "whu", clubName: "West Ham", badgeBg: "#7A263A" },
      { year: "2022", value: 80.0, club: "whu", clubName: "West Ham", badgeBg: "#7A263A" },
      { year: "2023", value: 110.0, club: "ars", clubName: "Arsenal", badgeBg: "#EF0107" },
      { year: "2024", value: 110.0, club: "ars", clubName: "Arsenal", badgeBg: "#EF0107" },
      { year: "2025", value: 115.0, club: "ars", clubName: "Arsenal", badgeBg: "#EF0107" },
      { year: "2026", value: 120.0, club: "ars", clubName: "Arsenal", badgeBg: "#EF0107" },
    ],
    pitchMetricLabel: "Duel Win Rate",
    pitchMetricValue: "68%",
    shotsFacedOrCreated: 26,
    goalsConcededOrScored: 4,
    xgotOrXg: "4.12",
    saveOrSuccessPercent: "68%",
    shotType: "Right foot",
    shotSituation: "Long range / Edge of box",
    shotResult: "Saved",
    xgStat: "0.22",
    xgotStat: "0.45",
    filters: [
      { label: "Tackles", count: 19 },
      { label: "Interceptions", count: 14 },
      { label: "Recoveries", count: 28 },
      { label: "Duels", count: 32 },
      { label: "Crosses defended", count: 16 },
    ],
    pitchPoints: [
      { x: 45, y: 40, type: "saved" },
      { x: 50, y: 60, type: "saved" },
      { x: 55, y: 30, type: "saved" },
      { x: 62, y: 50, type: "onTarget" },
      { x: 48, y: 75, type: "onTarget" },
    ],
  },
};

export default function PlayerPulsePage() {
  const { selectedMatch } = useMatchContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [activePlayerKey, setActivePlayerKey] = useState("mci-trafford");
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeFilterIndex, setActiveFilterIndex] = useState<number | null>(null);

  // Extract all players featured in the match lineups
  const matchPlayersList = useMemo(() => {
    const list: Player[] = [];
    selectedMatch.homeFormation.lineup.forEach((lp) => list.push(lp.player));
    selectedMatch.awayFormation.lineup.forEach((lp) => list.push(lp.player));
    return list;
  }, [selectedMatch]);

  // Active player dataset
  const activePlayerData = useMemo(() => {
    if (PLAYERS_SHOWCASE[activePlayerKey]) {
      return PLAYERS_SHOWCASE[activePlayerKey];
    }
    // Fallback to match player if found
    const found = matchPlayersList.find((p) => p.id === activePlayerKey);
    if (found) {
      return {
        id: found.id,
        name: found.name,
        shortName: found.shortName,
        teamId: found.teamId,
        teamName: found.teamId === "ars" ? "Arsenal" : found.teamId === "che" ? "Chelsea" : "Manchester City",
        teamBadgeColor: found.teamId === "ars" ? "#EF0107" : "#034694",
        number: found.number,
        positionCategory: found.positionCategory,
        primaryRole: found.primaryRole,
        age: 24,
        nationality: "English",
        countryCode: "ENG",
        flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        height: "184 cm",
        weight: "77 kg",
        foot: "Right" as const,
        contractEnd: "Jun 30, 2028",
        joined: "Jul 1, 2022",
        transferValue: "€65.0M",
        valueTrend: "▲ 5.4%",
        valueTrendPercent: "5.4%",
        isPositiveTrend: true,
        matches: 15,
        cleanSheets: 6,
        goalsConcededOrKeyPasses: 22,
        goalsConcededOrKeyPassesLabel: "Chances",
        highestValuation: "€65.0M (2026)",
        currentValuation: "€65.0M",
        peakValuation: "€65.0M",
        floorValuation: "€10.0M",
        growthPercent: "+550%",
        traitsSubtitle: "Positional baseline comparison",
        traits: [
          { label: "Passing %", value: 85, display: "85%" },
          { label: "Progression", value: 80, display: "80%" },
          { label: "Duels Won", value: 75, display: "75%" },
          { label: "Key Passes", value: 82, display: "82%" },
          { label: "Work Rate", value: 88, display: "88%" },
          { label: "Impact", value: 84, display: "84%" },
        ],
        valuationTrajectory: [
          { year: "2021", value: 10.0, club: "mci", clubName: "Club", badgeBg: "#6CABDD" },
          { year: "2022", value: 25.0, club: "mci", clubName: "Club", badgeBg: "#6CABDD" },
          { year: "2023", value: 40.0, club: "mci", clubName: "Club", badgeBg: "#6CABDD" },
          { year: "2024", value: 55.0, club: "mci", clubName: "Club", badgeBg: "#6CABDD" },
          { year: "2025", value: 60.0, club: "mci", clubName: "Club", badgeBg: "#6CABDD" },
          { year: "2026", value: 65.0, club: "mci", clubName: "Club", badgeBg: "#6CABDD" },
        ],
        pitchMetricLabel: "Action Success",
        pitchMetricValue: "81%",
        shotsFacedOrCreated: 24,
        goalsConcededOrScored: 4,
        xgotOrXg: "4.8",
        saveOrSuccessPercent: "81%",
        shotType: "Right foot",
        shotSituation: "Open play",
        shotResult: "On Target",
        xgStat: "0.45",
        xgotStat: "0.62",
        filters: [
          { label: "Passes", count: 48 },
          { label: "Duels", count: 14 },
          { label: "Recoveries", count: 8 },
        ],
        pitchPoints: [
          { x: 50, y: 50, type: "saved" as const },
          { x: 60, y: 40, type: "onTarget" as const },
          { x: 75, y: 45, type: "goal" as const },
        ],
      };
    }
    return PLAYERS_SHOWCASE["mci-trafford"];
  }, [activePlayerKey, matchPlayersList]);

  // Filtered player keys for quick selection
  const allAvailablePlayerKeys = useMemo(() => {
    const defaultKeys = Object.keys(PLAYERS_SHOWCASE);
    const fromLineups = matchPlayersList.map((p) => p.id);
    const combined = Array.from(new Set([...defaultKeys, ...fromLineups]));
    if (!searchQuery.trim()) return combined;
    return combined.filter((id) => {
      const showcase = PLAYERS_SHOWCASE[id];
      if (showcase) {
        return (
          showcase.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          showcase.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          showcase.primaryRole.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      const matchP = matchPlayersList.find((p) => p.id === id);
      return (
        matchP?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        matchP?.primaryRole.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [matchPlayersList, searchQuery]);

  // Hexagonal Spider Radar Chart SVG computation
  const radarData = useMemo(() => {
    const cx = 160;
    const cy = 135;
    const r = 78;
    const traits = activePlayerData.traits;
    const count = traits.length;

    // Concentric Web rings (4 rings)
    const rings = [0.25, 0.5, 0.75, 1.0].map((scale) => {
      return (
        Array.from({ length: count })
          .map((_, i) => {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
            const x = cx + r * scale * Math.cos(angle);
            const y = cy + r * scale * Math.sin(angle);
            return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join(" ") + " Z"
      );
    });

    // Radial spokes
    const spokes = Array.from({ length: count }).map((_, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return { x1: cx, y1: cy, x2: x, y2: y };
    });

    // Polygon points for active traits
    const polygonPoints = traits
      .map((t, i) => {
        const scale = Math.max(0.12, Math.min(1.0, t.value / 100));
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
        const x = cx + r * scale * Math.cos(angle);
        const y = cy + r * scale * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    // Label anchor positions with slight offset outwards
    const labels = traits.map((t, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
      const labelDist = r + 24;
      const x = cx + labelDist * Math.cos(angle);
      const y = cy + labelDist * Math.sin(angle);

      return {
        x,
        y,
        display: t.display,
        label: t.label,
        angle,
      };
    });

    return { rings, spokes, polygonPoints, labels };
  }, [activePlayerData.traits]);

  // Valuation Trajectory SVG calculation
  const trajectoryChart = useMemo(() => {
    const data = activePlayerData.valuationTrajectory;
    const width = 500;
    const height = 180;
    const paddingLeft = 45;
    const paddingRight = 25;
    const paddingTop = 25;
    const paddingBottom = 30;

    const maxVal = 80; // €80M top ceiling
    const minVal = 0;

    const stepX = (width - paddingLeft - paddingRight) / (data.length - 1);

    const points = data.map((d, i) => {
      const x = paddingLeft + i * stepX;
      const y =
        height -
        paddingBottom -
        (Math.min(maxVal, d.value) / (maxVal - minVal)) *
        (height - paddingTop - paddingBottom);
      return { x, y, ...d };
    });

    const pathD = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    return { points, pathD, width, height, paddingLeft, paddingRight };
  }, [activePlayerData.valuationTrajectory]);

  return (
    <div className="space-y-6 font-poppins pb-12 text-[#E1E7EC] selection:bg-[#2563EB]/40">
      {/* Top Navbar & Header Breadcrumb Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[#8E9CA8]">
            <span className="hover:text-white transition cursor-pointer">Home</span>
            <span className="text-[#4E5D6C]">&gt;</span>
            <span className="text-white font-medium">Players</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Season Selector Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#141A22] border border-[#222B36] text-xs font-medium text-white shadow-sm cursor-pointer hover:border-[#303D4C] transition">
            <Calendar className="w-3.5 h-3.5 text-[#8E9CA8]" />
            <span>Season 2025/2026</span>
            <ChevronDown className="w-3 h-3 text-[#8E9CA8]" />
          </div>

          {/* Search Players Bar */}
          <div className="relative w-52 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search players..."
              className="w-full bg-[#141A22] border border-[#222B36] rounded-lg pl-3 pr-8 py-1.5 text-xs text-white placeholder-[#687787] focus:outline-none focus:border-[#3B82F6] transition shadow-inner"
            />
            <Search className="w-3.5 h-3.5 text-[#8E9CA8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Horizontal Quick-Select Players Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {allAvailablePlayerKeys.slice(0, 10).map((key) => {
          const isSelected = key === activePlayerData.id;
          const showcase = PLAYERS_SHOWCASE[key];
          const name = showcase ? showcase.name : key;
          const team = showcase ? showcase.teamName : "Premier League";

          return (
            <button
              key={key}
              onClick={() => setActivePlayerKey(key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition border shrink-0 ${isSelected
                ? "bg-[#1E293B] border-[#3B82F6] text-white shadow-md ring-1 ring-[#3B82F6]/50"
                : "bg-[#131921] border-[#222B36] text-[#8E9CA8] hover:text-white hover:bg-[#18212B]"
                }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${isSelected ? "bg-[#3B82F6] text-white" : "bg-[#1F2732] text-[#8E9CA8]"
                  }`}
              >
                {name.substring(0, 1)}
              </div>
              <span className="font-medium">{name}</span>
              <span className="text-[10px] text-[#5A6878]">({team})</span>
            </button>
          );
        })}
      </div>

      {/* TOP GRID: Hero Player Card + Player Traits Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* HERO PLAYER CARD (8 Cols) */}
        <div className="lg:col-span-8 bg-[#141A22] border border-[#222B36] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl">
          {/* Subtle Circular Team Crest Watermark Background */}
          <div className="absolute -left-12 -top-12 w-96 h-96 rounded-full border border-white/[0.03] bg-radial from-white/[0.04] to-transparent pointer-events-none" />
          <div className="absolute right-6 top-6 text-[110px] font-black text-white/[0.02] select-none pointer-events-none tracking-tighter">
            {activePlayerData.teamId.toUpperCase()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start relative z-10">
            {/* Left Column: Player Photo Card Container */}
            <div className="sm:col-span-4 flex flex-col items-center">
              <div className="w-full aspect-[4/5] max-w-[210px] rounded-2xl bg-gradient-to-b from-[#1C2430] to-[#10151C] border border-[#2A3543] p-3 flex flex-col justify-end items-center relative shadow-lg overflow-hidden group">
                {/* Visual Kit Silhouette / Glove Art */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#EC4899]/30 to-[#3B82F6]/20 blur-xl opacity-60" />
                </div>

                {/* Stylized Player Jersey Avatar Graphic */}
                <div className="relative z-10 flex flex-col items-center w-full">
                  <div className="w-20 h-20 rounded-full border-2 border-white/20 bg-gradient-to-b from-[#F472B6] to-[#DB2777] shadow-lg flex items-center justify-center text-white font-extrabold text-2xl relative">
                    {activePlayerData.shortName.substring(0, 2).toUpperCase()}
                    {/* Position Mini Badge */}
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#141A22] border border-white/20 text-[#60A5FA]">
                      #{activePlayerData.number}
                    </span>
                  </div>

                  <div className="mt-3 px-3 py-1 rounded-full bg-[#18212B]/90 border border-white/10 text-[10px] font-medium text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                    <span>In Starting XI</span>
                  </div>
                </div>

                {/* Kit sponsor watermark styling */}
                <div className="text-[10px] tracking-widest uppercase font-mono text-white/30 text-center mt-3 z-10">
                  {activePlayerData.teamName}
                </div>
              </div>
            </div>

            {/* Right Column: Bio Details, Name, Follow, Attributes */}
            <div className="sm:col-span-8 flex flex-col justify-between h-full space-y-4">
              <div>
                {/* Title Row with Name & Follow Button */}
                <div className="flex items-center justify-between gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {activePlayerData.name}
                  </h1>
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition shadow-md shrink-0 ${isFollowing
                      ? "bg-[#1E293B] border border-[#3B82F6] text-[#60A5FA]"
                      : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                      }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>

                {/* Team Badge & Team Name */}
                <div className="flex items-center gap-2 mt-1.5">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: activePlayerData.teamBadgeColor }}
                  >
                    ⚽
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {activePlayerData.teamName}
                  </span>
                </div>

                {/* Demographic Subtitle Pipe Bar */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#8E9CA8] mt-2">
                  <span>{activePlayerData.age} years old</span>
                  <span className="text-[#3E4D5D]">|</span>
                  <span className="flex items-center gap-1">
                    <span>{activePlayerData.flag}</span>
                    <span>{activePlayerData.nationality}</span>
                  </span>
                  <span className="text-[#3E4D5D]">|</span>
                  <span>{activePlayerData.primaryRole}</span>
                  <span className="text-[#3E4D5D]">|</span>
                  <span>#{activePlayerData.number}</span>
                </div>
              </div>

              {/* 2-Column Bio Stats Grid with Icons */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs border-t border-[#222B36] pt-3.5">
                {/* Column 1 */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Ruler className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                    <span className="text-[#8E9CA8] w-20">Height</span>
                    <span className="text-white font-medium">{activePlayerData.height}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Scale className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                    <span className="text-[#8E9CA8] w-20">Weight</span>
                    <span className="text-white font-medium">{activePlayerData.weight}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Shirt className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                    <span className="text-[#8E9CA8] w-20">Shirt</span>
                    <span className="text-white font-medium">{activePlayerData.number}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Footprints className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                    <span className="text-[#8E9CA8] w-20">Preferred foot</span>
                    <span className="text-white font-medium">{activePlayerData.foot}</span>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Globe2 className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                    <span className="text-[#8E9CA8] w-24">Country</span>
                    <span className="text-white font-medium">{activePlayerData.nationality}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CircleDollarSign className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                    <span className="text-[#8E9CA8] w-24">Transfer value</span>
                    <span className="text-white font-medium">{activePlayerData.transferValue}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CalendarClock className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                    <span className="text-[#8E9CA8] w-24">Contract end</span>
                    <span className="text-white font-medium">{activePlayerData.contractEnd}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                    <span className="text-[#8E9CA8] w-24">Joined</span>
                    <span className="text-white font-medium">{activePlayerData.joined}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 4 Key Stats Bar with Vertical Dividers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#222B36]">
            <div>
              <span className="text-xs text-[#8E9CA8] block">Matches</span>
              <span className="text-2xl font-bold text-white block mt-0.5">
                {activePlayerData.matches}
              </span>
            </div>

            <div>
              <span className="text-xs text-[#8E9CA8] block">Clean sheets</span>
              <span className="text-2xl font-bold text-white block mt-0.5">
                {activePlayerData.cleanSheets}
              </span>
            </div>

            <div>
              <span className="text-xs text-[#8E9CA8] block">
                {activePlayerData.goalsConcededOrKeyPassesLabel}
              </span>
              <span className="text-2xl font-bold text-white block mt-0.5">
                {activePlayerData.goalsConcededOrKeyPasses}
              </span>
            </div>

            <div>
              <span className="text-xs text-[#8E9CA8] block">Transfer Value</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold text-white">
                  {activePlayerData.transferValue}
                </span>
                <span className="text-[11px] font-semibold text-[#22C55E] flex items-center">
                  <span>{activePlayerData.valueTrend}</span>
                </span>
              </div>
              <span className="text-[10px] text-[#64748B] block">vs last update</span>
            </div>
          </div>
        </div>

        {/* PLAYER TRAITS RADAR CARD (4 Cols) */}
        <div className="lg:col-span-4 bg-[#141A22] border border-[#222B36] rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-white">Player Traits</h3>
              <Info className="w-3.5 h-3.5 text-[#8E9CA8]" />
            </div>
            <p className="text-xs text-[#8E9CA8] mt-1">{activePlayerData.traitsSubtitle}</p>

            {/* Hexagonal Spider/Radar Canvas */}
            <div className="relative w-full aspect-square max-w-[320px] mx-auto mt-3">
              <svg viewBox="0 0 320 270" className="w-full h-full overflow-visible">
                {/* Concentric Hexagon Background Grid */}
                {radarData.rings.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    fill="none"
                    stroke="#222C38"
                    strokeWidth="1.2"
                    strokeDasharray={i === 3 ? "none" : "2,2"}
                  />
                ))}

                {/* Spokes from Center to Vertices */}
                {radarData.spokes.map((s, i) => (
                  <line
                    key={i}
                    x1={s.x1}
                    y1={s.y1}
                    x2={s.x2}
                    y2={s.y2}
                    stroke="#222C38"
                    strokeWidth="1.2"
                  />
                ))}

                {/* Electric Blue Filled Radar Polygon */}
                <polygon
                  points={radarData.polygonPoints}
                  fill="rgba(47, 109, 246, 0.45)"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                />

                {/* Labels around perimeter */}
                {radarData.labels.map((item, i) => {
                  return (
                    <g key={i}>
                      <text
                        x={item.x}
                        y={item.y - 7}
                        textAnchor="middle"
                        className="fill-white font-extrabold text-[11px]"
                      >
                        {item.display}
                      </text>
                      <text
                        x={item.x}
                        y={item.y + 6}
                        textAnchor="middle"
                        className="fill-[#8E9CA8] text-[9px] font-medium"
                      >
                        {item.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM GRID: Transfer Value Progression Line Chart + Pitch Spatial Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* BOTTOM-LEFT: Transfer Value Progression (6 cols) */}
        <div className="lg:col-span-6 bg-[#141A22] border border-[#222B36] rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            {/* Header: Title and Highest Tag */}
            <div className="flex items-center justify-between pb-3 border-b border-[#222B36]">
              <h3 className="text-base font-bold text-white">
                Transfer Value: {activePlayerData.currentValuation}
              </h3>
              <span className="text-xs text-[#8E9CA8]">
                Highest: <strong className="text-white">{activePlayerData.highestValuation}</strong>
              </span>
            </div>

            {/* 4 Summary Stat Cards */}
            <div className="grid grid-cols-4 gap-2.5 my-4">
              <div className="p-3 rounded-xl bg-[#11161D] border border-[#222B36]">
                <span className="text-[10px] text-[#8E9CA8] block">Current value</span>
                <span className="text-sm sm:text-base font-bold text-white block mt-0.5">
                  {activePlayerData.currentValuation}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#11161D] border border-[#222B36]">
                <span className="text-[10px] text-[#8E9CA8] block">Highest value</span>
                <span className="text-sm sm:text-base font-bold text-white block mt-0.5">
                  {activePlayerData.peakValuation}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#11161D] border border-[#222B36]">
                <span className="text-[10px] text-[#8E9CA8] block">Lowest value</span>
                <span className="text-sm sm:text-base font-bold text-white block mt-0.5">
                  {activePlayerData.floorValuation}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#11161D] border border-[#222B36]">
                <span className="text-[10px] text-[#8E9CA8] block">Growth</span>
                <span className="text-sm sm:text-base font-bold text-[#22C55E] block mt-0.5">
                  {activePlayerData.growthPercent}
                </span>
              </div>
            </div>

            {/* Line Chart with Y-Axis and Club Crest Nodes */}
            <div className="relative w-full h-48 mt-4">
              <svg
                viewBox={`0 0 ${trajectoryChart.width} ${trajectoryChart.height}`}
                className="w-full h-full overflow-visible"
              >
                {/* Horizontal grid lines & Y labels */}
                {[
                  { label: "€80M", val: 80, y: 25 },
                  { label: "€60M", val: 60, y: 55 },
                  { label: "€40M", val: 40, y: 88 },
                  { label: "€20M", val: 20, y: 120 },
                  { label: "€0", val: 0, y: 150 },
                ].map((row, idx) => (
                  <g key={idx}>
                    <text
                      x="35"
                      y={row.y + 3}
                      textAnchor="end"
                      className="fill-[#64748B] text-[9.5px] font-mono"
                    >
                      {row.label}
                    </text>
                    <line
                      x1={trajectoryChart.paddingLeft}
                      y1={row.y}
                      x2={trajectoryChart.width - trajectoryChart.paddingRight}
                      y2={row.y}
                      stroke="#1E2633"
                      strokeWidth="1"
                    />
                  </g>
                ))}

                {/* Curved Line Path */}
                <path
                  d={trajectoryChart.pathD}
                  fill="none"
                  stroke="#5B9BFC"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Club nodes on line points */}
                {trajectoryChart.points.map((pt, i) => {
                  const isLatest = i === trajectoryChart.points.length - 1;

                  return (
                    <g key={i}>
                      {/* Outer circular badge */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isLatest ? "5.5" : "4.5"}
                        fill={pt.badgeBg}
                        stroke="#141A22"
                        strokeWidth="2"
                      />
                      {isLatest && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="8"
                          fill="none"
                          stroke="#5B9BFC"
                          strokeWidth="1.5"
                          className="animate-pulse"
                        />
                      )}
                      {/* Year label on X-axis */}
                      <text
                        x={pt.x}
                        y={trajectoryChart.height - 5}
                        textAnchor="middle"
                        className="fill-[#8E9CA8] text-[10px] font-medium"
                      >
                        {pt.year}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* BOTTOM-RIGHT: Match Spatial Actions & Goal Frame (6 cols) */}
        <div className="lg:col-span-6 bg-[#141A22] border border-[#222B36] rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            {/* Header: League & Season Dropdown */}
            <div className="flex items-center justify-between pb-3 border-b border-[#222B36]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#8E9CA8]">2025/2026</span>
                <span className="text-[#3E4D5D]">|</span>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white cursor-pointer hover:text-[#60A5FA] transition">
                  <span>🏆 Premier League</span>
                  <ChevronDown className="w-3 h-3 text-[#8E9CA8]" />
                </div>
              </div>
            </div>

            {/* Split Section: Pitch Visual on Left, Shot/Goal Visual on Right */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-4">
              {/* Pitch Visual (7 Cols) */}
              <div className="sm:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Premier League</span>
                    <span className="text-xs text-[#5B9BFC] font-medium">
                      {activePlayerData.pitchMetricLabel}: {activePlayerData.pitchMetricValue}
                    </span>
                  </div>

                  {/* Dark Pitch Canvas */}
                  <div className="relative w-full aspect-[4/3] bg-[#0E141C] border border-[#222B36] rounded-xl p-2.5 mt-2.5">
                    <svg viewBox="0 0 100 80" className="w-full h-full overflow-hidden rounded-lg">
                      {/* Outer boundary */}
                      <rect
                        x="4"
                        y="4"
                        width="92"
                        height="72"
                        fill="#0E141C"
                        stroke="#222C38"
                        strokeWidth="1.2"
                      />
                      {/* Halfway line */}
                      <line x1="50" y1="4" x2="50" y2="76" stroke="#222C38" strokeWidth="1" />
                      <circle cx="50" cy="40" r="10" fill="none" stroke="#222C38" strokeWidth="1" />

                      {/* Penalty box (Left) */}
                      <rect
                        x="4"
                        y="18"
                        width="18"
                        height="44"
                        fill="none"
                        stroke="#222C38"
                        strokeWidth="1"
                      />
                      <rect
                        x="4"
                        y="28"
                        width="7"
                        height="24"
                        fill="none"
                        stroke="#222C38"
                        strokeWidth="1"
                      />

                      {/* Penalty box (Right) */}
                      <rect
                        x="78"
                        y="18"
                        width="18"
                        height="44"
                        fill="none"
                        stroke="#222C38"
                        strokeWidth="1"
                      />
                      <rect
                        x="89"
                        y="28"
                        width="7"
                        height="24"
                        fill="none"
                        stroke="#222C38"
                        strokeWidth="1"
                      />

                      {/* Plotted action dots */}
                      {activePlayerData.pitchPoints.map((pt, i) => (
                        <circle
                          key={i}
                          cx={pt.x}
                          cy={pt.y}
                          r="2.8"
                          fill={
                            pt.type === "saved"
                              ? "#3B82F6"
                              : pt.type === "onTarget"
                                ? "#FFFFFF"
                                : "#EF4444"
                          }
                          stroke="#0E141C"
                          strokeWidth="0.8"
                        />
                      ))}
                    </svg>

                    {/* Dot Legend */}
                    <div className="flex items-center justify-between text-[9px] text-[#8E9CA8] mt-2 pt-1 border-t border-[#1C2532]">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Saved
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-white" /> On Target
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Goal Conceded
                      </span>
                    </div>
                  </div>

                  {/* 4 Stats Under Pitch */}
                  <div className="grid grid-cols-4 gap-2 text-center mt-3 pt-2 border-t border-[#222B36]">
                    <div>
                      <span className="text-sm font-bold text-white block">
                        {activePlayerData.shotsFacedOrCreated}
                      </span>
                      <span className="text-[9px] text-[#8E9CA8]">Shots faced</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">
                        {activePlayerData.goalsConcededOrScored}
                      </span>
                      <span className="text-[9px] text-[#8E9CA8]">Goals conceded</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">
                        {activePlayerData.xgotOrXg}
                      </span>
                      <span className="text-[9px] text-[#8E9CA8]">xGOT faced</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#5B9BFC] block">
                        {activePlayerData.saveOrSuccessPercent}
                      </span>
                      <span className="text-[9px] text-[#8E9CA8]">Save %</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shot Details & Goal Net (5 Cols) */}
              <div className="sm:col-span-5 flex flex-col justify-between">
                <div>
                  {/* Match Navigation Pill */}
                  <div className="flex items-center justify-between bg-[#11161D] border border-[#222B36] rounded-lg px-2 py-1 text-xs text-white">
                    <button className="text-[#8E9CA8] hover:text-white transition">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#6CABDD]" />
                      <span>1 - 2</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#034694]" />
                    </div>
                    <button className="text-[#8E9CA8] hover:text-white transition">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 3D Goal Mouth Net Representation */}
                  <div className="relative w-full aspect-[16/9] bg-[#11161D] border border-[#222B36] rounded-lg p-2 mt-2.5">
                    <svg viewBox="0 0 100 55" className="w-full h-full">
                      {/* Net grid lines */}
                      <line x1="12" y1="12" x2="88" y2="12" stroke="#222C38" strokeWidth="0.8" />
                      <line x1="12" y1="24" x2="88" y2="24" stroke="#222C38" strokeWidth="0.8" />
                      <line x1="12" y1="36" x2="88" y2="36" stroke="#222C38" strokeWidth="0.8" />
                      <line x1="26" y1="12" x2="26" y2="48" stroke="#222C38" strokeWidth="0.8" />
                      <line x1="42" y1="12" x2="42" y2="48" stroke="#222C38" strokeWidth="0.8" />
                      <line x1="58" y1="12" x2="58" y2="48" stroke="#222C38" strokeWidth="0.8" />
                      <line x1="74" y1="12" x2="74" y2="48" stroke="#222C38" strokeWidth="0.8" />

                      {/* Goal Frame Posts & Crossbar */}
                      <polyline
                        points="12,48 12,12 88,12 88,48"
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="2.2"
                      />

                      {/* Shot entry strike mark */}
                      <circle cx="80" cy="40" r="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
                    </svg>

                    <span className="absolute top-1.5 right-2 text-[8px] font-mono text-[#8E9CA8]">
                      {activePlayerData.xgStat} xG
                    </span>
                    <span className="absolute bottom-1.5 right-2 text-[8px] font-mono text-[#5B9BFC]">
                      {activePlayerData.xgotStat} xGOT
                    </span>
                  </div>

                  {/* Shot details table */}
                  <div className="mt-2 space-y-1 text-[10.5px]">
                    <div className="flex justify-between">
                      <span className="text-[#8E9CA8]">Shot type</span>
                      <span className="text-white font-medium">{activePlayerData.shotType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E9CA8]">Situation</span>
                      <span className="text-white font-medium">{activePlayerData.shotSituation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E9CA8]">Result</span>
                      <span className="text-[#EF4444] font-semibold">{activePlayerData.shotResult}</span>
                    </div>
                  </div>
                </div>

                {/* Filter tag pills */}
                <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-[#222B36]">
                  <span className="text-[9px] uppercase font-mono text-[#64748B] w-full block mb-0.5">
                    Filter
                  </span>
                  {activePlayerData.filters.map((f, i) => {
                    const isSelected = activeFilterIndex === i;
                    return (
                      <button
                        key={i}
                        onClick={() => setActiveFilterIndex(isSelected ? null : i)}
                        className={`text-[9.5px] px-2 py-0.5 rounded-md transition border ${isSelected
                          ? "bg-[#2563EB] text-white border-[#2563EB]"
                          : "bg-[#11161D] text-[#8E9CA8] border-[#222B36] hover:text-white"
                          }`}
                      >
                        {f.label} <strong className="font-semibold text-white">{f.count}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
