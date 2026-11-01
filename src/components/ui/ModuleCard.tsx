import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight } from "lucide-react";
import { Badge } from "./Badge";

interface ModuleCardProps {
  title: string;
  tagline: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  features: string[];
  className?: string;
}

export function ModuleCard({
  title,
  tagline,
  description,
  href,
  icon: Icon,
  badge,
  features,
  className,
}: ModuleCardProps) {
  return (
    <div
      className={cn(
        "group bg-[#171C20] border border-[#272E32] rounded-lg p-5 flex flex-col justify-between transition-all hover:border-[#373F45] hover:bg-[#1A2025]",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#121619] border border-[#272E32] flex items-center justify-center text-[#B9F36A] group-hover:border-[#B9F36A]/40 transition-colors">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#F5F7F2] text-base group-hover:text-[#B9F36A] transition-colors">
                  {title}
                </h3>
                {badge && (
                  <Badge variant="accent" size="sm">
                    {badge}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] font-mono uppercase text-[#929B9E] tracking-wider">
                {tagline}
              </p>
            </div>
          </div>

          <Link
            href={href}
            className="w-8 h-8 rounded-md bg-[#121619] border border-[#272E32] flex items-center justify-center text-[#929B9E] group-hover:text-[#B9F36A] group-hover:border-[#B9F36A]/30 transition-all"
            aria-label={`Open ${title}`}
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-xs text-[#929B9E] leading-relaxed mb-4">
          {description}
        </p>

        <div className="space-y-1.5 pt-3 border-t border-[#272E32]/70">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-[11px] text-[#F5F7F2]/80"
            >
              <div className="w-1 h-1 rounded-full bg-[#B9F36A]" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-[#272E32]/60">
        <Link
          href={href}
          className="text-xs font-semibold text-[#B9F36A] flex items-center gap-1 group-hover:gap-1.5 transition-all"
        >
          <span>Launch Module</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
