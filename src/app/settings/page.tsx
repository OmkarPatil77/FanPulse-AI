"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Settings,
  Check,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [dataDensity, setDataDensity] = useState<"compact" | "comfortable">("comfortable");
  const [favoriteClub, setFavoriteClub] = useState("Arsenal");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const settingsTabs = [
    { id: "profile", label: "Analyst Profile" },
    { id: "preferences", label: "Preferences & Club" },
    { id: "density", label: "Display & Density" },
    { id: "notifications", label: "Matchday Alerts" },
    { id: "api", label: "Data Pipeline & APIs" },
  ];

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <PageHeader
        title="Settings & Analyst Configuration"
        description="Configure your intelligence workspace, preferred clubs, metric conventions, notification triggers, and live telemetry feeds."
        badge={
          <Badge variant="outline" size="sm">
            <Settings className="w-3 h-3 text-[#929B9E]" />
            Preferences
          </Badge>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            className="gap-1.5"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#0B0D0F]" />
                Saved
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        }
      />

      {/* Tabs */}
      <Tabs
        tabs={settingsTabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pill"
      />

      {/* Tab 1: Analyst Profile */}
      {activeTab === "profile" && (
        <div className="bg-[#171C20] border border-[#272E32] rounded-xl p-5 space-y-6">
          <SectionHeader
            title="Analyst Profile"
            subtitle="Your personal identification and subscription tier"
          />

          <div className="flex items-center gap-4 pb-4 border-b border-[#272E32]">
            <div className="w-16 h-16 rounded-full bg-[#121619] border border-[#272E32] flex items-center justify-center text-xl font-bold font-mono text-[#B9F36A]">
              FP
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F5F7F2]">Analyst Pro Desk</h3>
              <p className="text-xs text-[#929B9E]">analyst@fanpulse.ai</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="accent" size="sm">
                  Premier Intelligence Tier
                </Badge>
                <span className="text-[11px] font-mono text-[#929B9E]">
                  ID: #FP-9281-26
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[#929B9E] font-medium">Display Name</label>
              <input
                type="text"
                defaultValue="Analyst Pro"
                className="w-full h-9 px-3 bg-[#121619] border border-[#272E32] rounded-md text-[#F5F7F2] focus:outline-none focus:border-[#B9F36A]/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#929B9E] font-medium">Email Address</label>
              <input
                type="email"
                defaultValue="analyst@fanpulse.ai"
                className="w-full h-9 px-3 bg-[#121619] border border-[#272E32] rounded-md text-[#F5F7F2] focus:outline-none focus:border-[#B9F36A]/60"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Club & Preferences */}
      {activeTab === "preferences" && (
        <div className="bg-[#171C20] border border-[#272E32] rounded-xl p-5 space-y-6">
          <SectionHeader
            title="Club & Tactical Focus"
            subtitle="Prioritize analysis and notifications for your preferred club"
          />

          <div className="space-y-2 text-xs">
            <label className="text-[#929B9E] font-medium">
              Primary Followed Club
            </label>
            <select
              value={favoriteClub}
              onChange={(e) => setFavoriteClub(e.target.value)}
              className="w-full sm:w-72 h-9 px-3 bg-[#121619] border border-[#272E32] rounded-md text-[#F5F7F2] focus:outline-none focus:border-[#B9F36A]/60"
            >
              <option value="Arsenal">Arsenal</option>
              <option value="Manchester City">Manchester City</option>
              <option value="Liverpool">Liverpool</option>
              <option value="Chelsea">Chelsea</option>
              <option value="Aston Villa">Aston Villa</option>
              <option value="Tottenham Hotspur">Tottenham Hotspur</option>
              <option value="Newcastle United">Newcastle United</option>
            </select>
            <p className="text-[11px] text-[#929B9E]">
              Tactical presets and telemetry will automatically align with this club.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Display & Density */}
      {activeTab === "density" && (
        <div className="bg-[#171C20] border border-[#272E32] rounded-xl p-5 space-y-6">
          <SectionHeader
            title="Display & Data Density"
            subtitle="Adjust spacing and metric view mode for complex match data tables"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setDataDensity("comfortable")}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${dataDensity === "comfortable"
                  ? "bg-[#1D2429] border-[#B9F36A]"
                  : "bg-[#121619] border-[#272E32] hover:border-[#373F45]"
                }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#F5F7F2] mb-1">
                <span>Comfortable Mode</span>
                {dataDensity === "comfortable" && (
                  <Check className="w-4 h-4 text-[#B9F36A]" />
                )}
              </div>
              <p className="text-xs text-[#929B9E]">
                Spacious table rows with contextual metric chips and full team names.
              </p>
            </div>

            <div
              onClick={() => setDataDensity("compact")}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${dataDensity === "compact"
                  ? "bg-[#1D2429] border-[#B9F36A]"
                  : "bg-[#121619] border-[#272E32] hover:border-[#373F45]"
                }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#F5F7F2] mb-1">
                <span>Compact Mode</span>
                {dataDensity === "compact" && (
                  <Check className="w-4 h-4 text-[#B9F36A]" />
                )}
              </div>
              <p className="text-xs text-[#929B9E]">
                Data-dense layout optimized for dual monitors and rapid multi-table scanning.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Notifications */}
      {activeTab === "notifications" && (
        <div className="bg-[#171C20] border border-[#272E32] rounded-xl p-5 space-y-4">
          <SectionHeader
            title="Matchday Alerts & Triggers"
            subtitle="Instant notifications for significant momentum shifts and tactical events"
          />

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-lg bg-[#121619] border border-[#272E32]">
              <div>
                <div className="font-semibold text-[#F5F7F2]">
                  Tactical Momentum Swings (&gt; 25% Shift)
                </div>
                <div className="text-[#929B9E] text-[11px]">
                  Alert when a team establishes sustained territorial dominance.
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 accent-[#B9F36A] rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#121619] border border-[#272E32]">
              <div>
                <div className="font-semibold text-[#F5F7F2]">
                  Managerial Substitution & Formation Morph
                </div>
                <div className="text-[#929B9E] text-[11px]">
                  Detect when in-game personnel adjustments shift nominal formation.
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 accent-[#B9F36A] rounded"
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab 5: Data Pipelines */}
      {activeTab === "api" && (
        <div className="bg-[#171C20] border border-[#272E32] rounded-xl p-5 space-y-4">
          <SectionHeader
            title="Match Data Pipeline"
            subtitle="Match event ingestion and live telemetry feeds"
          />

          <div className="p-3.5 rounded-lg bg-[#121619] border border-[#272E32] text-xs space-y-2">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[#F5F7F2] font-semibold">
                Premier League Telemetry Stream (Active Ingestion)
              </span>
              <Badge variant="accent" size="sm">
                Connected
              </Badge>
            </div>
            <p className="text-[#929B9E] text-[11px]">
              Live match event ingestion, spatial coordinate tracking, and tactical telemetry processing pipeline.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
