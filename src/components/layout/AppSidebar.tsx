"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MAIN_NAV_ITEMS, FOOTER_NAV_ITEMS } from "@/lib/navigation";
import { Zap, X } from "lucide-react";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#0D1117] border-r border-[#1B2028] font-poppins transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand / Logo Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-6">
          <Link
            href="/live"
            onClick={onClose}
            className="flex items-center gap-3.5 group"
          >
            {/* Lime Neon Rounded Badge with Lightning Bolt */}
            <div className="w-11 h-11 rounded-xl bg-[#BAF36A] flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-[1.02]">
              <Zap className="w-5 h-5 text-[#0B0D11] stroke-[2.5] fill-none" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[17px] tracking-tight text-white leading-tight">
                FanPulse AI
              </span>
              <span className="text-[9.5px] font-semibold text-[#64748B] tracking-[0.1em] uppercase leading-none mt-1">
                FOOTBALL INTELLIGENCE
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[#8B949E] hover:text-white hover:bg-[#161C24]"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-1.5">
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[14.5px] font-medium transition-all group relative",
                  isActive
                    ? "bg-[#182614] text-[#BAF36A]"
                    : "text-[#8B949E] hover:text-white hover:bg-[#161C24]"
                )}
              >
                {/* Active Left Indicator Pill */}
                {isActive && (
                  <span className="absolute left-1.5 top-2.5 bottom-2.5 w-1 rounded-full bg-[#BAF36A]" />
                )}

                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 stroke-[1.8] transition-colors",
                    isActive
                      ? "text-[#BAF36A]"
                      : "text-[#8B949E] group-hover:text-white"
                  )}
                />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer / Settings Link */}
        <div className="p-3.5 border-t border-[#1B2028]">
          {FOOTER_NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[14.5px] font-medium transition-all group relative",
                  isActive
                    ? "bg-[#182614] text-[#BAF36A]"
                    : "text-[#8B949E] hover:text-white hover:bg-[#161C24]"
                )}
              >
                {isActive && (
                  <span className="absolute left-1.5 top-2.5 bottom-2.5 w-1 rounded-full bg-[#BAF36A]" />
                )}

                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 stroke-[1.8] transition-colors",
                    isActive
                      ? "text-[#BAF36A]"
                      : "text-[#8B949E] group-hover:text-white"
                  )}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
