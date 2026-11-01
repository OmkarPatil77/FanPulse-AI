import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  badge?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  change,
  changeType = "neutral",
  icon: Icon,
  badge,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-[#171C20] border border-[#272E32] rounded-lg p-4 transition-all hover:border-[#373F45]",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#929B9E] uppercase tracking-wider">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#121619] border border-[#272E32] text-[#929B9E]">
              {badge}
            </span>
          )}
          {Icon && (
            <div className="p-1.5 rounded bg-[#121619] border border-[#272E32] text-[#929B9E]">
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-[#F5F7F2] font-mono">
          {value}
        </div>

        {change && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium font-mono px-1.5 py-0.5 rounded",
              changeType === "positive" && "text-[#B9F36A] bg-[#B9F36A]/10",
              changeType === "negative" && "text-[#EF6B6B] bg-[#EF6B6B]/10",
              changeType === "neutral" && "text-[#929B9E] bg-[#272E32]/50"
            )}
          >
            {changeType === "positive" && <TrendingUp className="w-3 h-3" />}
            {changeType === "negative" && <TrendingDown className="w-3 h-3" />}
            {changeType === "neutral" && <Minus className="w-3 h-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {subtext && (
        <p className="text-xs text-[#929B9E] mt-2 border-t border-[#272E32]/60 pt-2">
          {subtext}
        </p>
      )}
    </div>
  );
}
