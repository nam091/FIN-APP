"use client";

import React from "react";
import { HomeDashboard } from "@/components/dashboard/home-dashboard";
import { FinanceDashboard } from "@/components/dashboard/finance-dashboard";
import { TaskList } from "@/components/tasks/task-list";
import { NoteList } from "@/components/notes/note-list";
import { AIChat } from "@/components/ai/ai-chat";
import { TrackingView } from "@/components/tracking/tracking-view";
import { SettingsView } from "@/components/dashboard/settings-view";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { useAppState } from "@/context/app-state-context";

export default function Home() {
  const { activeTab } = useAppState();

  return (
    <main className="flex min-h-screen bg-background text-foreground relative">
      {/* Desktop Sidebar (Hidden on mobile) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex-1 overflow-hidden relative w-full h-full">
          {activeTab === "home" && <HomeDashboard />}
          {activeTab === "finance" && <FinanceDashboard />}
          {activeTab === "tasks" && <TaskList />}
          {activeTab === "notes" && <NoteList />}
          {activeTab === "tracking" && <TrackingView />}
          {activeTab === "ai" && <AIChat />}
          {activeTab === "settings" && <SettingsView />}
        </div>

        {/* Mobile Bottom Nav (Hidden on desktop via md:hidden internally) */}
        <BottomNav />
      </div>
    </main>
  );
}
