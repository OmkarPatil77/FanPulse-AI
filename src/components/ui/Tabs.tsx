"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  badge?: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "pill" | "underline";
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  variant = "pill",
}: TabsProps) {
  if (variant === "underline") {
    return (
      <div
        className={cn(
          "flex items-center gap-6 border-b border-[#272E32] text-sm overflow-x-auto",
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "pb-3 pt-1 font-medium transition-all relative whitespace-nowrap cursor-pointer flex items-center gap-2",
                isActive
                  ? "text-[#F5F7F2] font-semibold"
                  : "text-[#929B9E] hover:text-[#F5F7F2]"
              )}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-[10px] rounded font-mono font-bold",
                    isActive
                      ? "bg-[#B9F36A]/20 text-[#B9F36A]"
                      : "bg-[#171C20] text-[#929B9E]"
                  )}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B9F36A]" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex p-1 bg-[#121619] border border-[#272E32] rounded-lg gap-1 overflow-x-auto",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer",
              isActive
                ? "bg-[#171C20] text-[#F5F7F2] border border-[#272E32] shadow-sm font-semibold"
                : "text-[#929B9E] hover:text-[#F5F7F2] hover:bg-[#171C20]/50"
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.2 text-[10px] rounded font-mono",
                  isActive
                    ? "bg-[#B9F36A]/20 text-[#B9F36A]"
                    : "bg-[#272E32] text-[#929B9E]"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
