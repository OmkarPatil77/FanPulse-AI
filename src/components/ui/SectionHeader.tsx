import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  badge,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4",
        className
      )}
    >
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-semibold text-[#F5F7F2] tracking-wide">
            {title}
          </h2>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs text-[#929B9E] mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
