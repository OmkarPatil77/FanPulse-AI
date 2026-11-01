import {
  Radio,
  Trophy,
  GitFork,
  Clock,
  Users,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  description: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Live Matches",
    href: "/live",
    icon: Radio,
    description: "Real-time match center & fixture tracker",
  },
  {
    title: "RaceState",
    href: "/racestate",
    icon: Trophy,
    description: "Table projections, UCL race & scenario modeling",
  },
  {
    title: "TactiQ",
    href: "/tactiq",
    icon: GitFork,
    description: "Pitch diagrams, tactical shapes & pressing geometry",
  },
  {
    title: "Context90",
    href: "/context90",
    icon: Clock,
    description: "Narrative timelines, match decoders & QA analysis",
  },
  {
    title: "PlayerPulse",
    href: "/playerpulse",
    icon: Users,
    description: "Head-to-head radar, roles & tactical impact",
  },
];

export const FOOTER_NAV_ITEMS: NavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Analyst preferences, club tracking & display modes",
  },
];
