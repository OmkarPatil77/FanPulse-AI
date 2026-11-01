"use client";

import React, { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { Topbar } from "./Topbar";
import { MatchProvider } from "@/context/MatchContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <MatchProvider>
      <div className="min-h-screen bg-[#0B0D0F] text-[#F5F7F2] flex">
        {/* Responsive Sidebar */}
        <AppSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area (offset by 64 = 16rem on large screens) */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </MatchProvider>
  );
}
