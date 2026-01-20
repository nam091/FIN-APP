"use client";

import React from "react";
import { Home, ListTodo, BookOpen, MessageSquare, Wallet, Activity } from "lucide-react";
import { useAppState } from "@/context/app-state-context";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const { activeTab, setActiveTab } = useAppState();

    // 6 items total: Finance, Tasks, Tracking, Notes, AI, Home
    // Layout: row of 6 equally spaced items
    const navItems = [
        { id: "finance", icon: Wallet, label: "Finance" },
        { id: "tasks", icon: ListTodo, label: "Tasks" },
        { id: "tracking", icon: Activity, label: "Tracking" },
        { id: "home", icon: Home, label: "Home" },
        { id: "notes", icon: BookOpen, label: "Notes" },
        { id: "ai", icon: MessageSquare, label: "AI" },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-sm z-50">
            <div className="flex items-center justify-between gap-1 max-w-lg mx-auto bg-secondary/80 backdrop-blur-xl rounded-2xl p-2 border border-border/50">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        className={cn(
                            "flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all duration-200",
                            activeTab === item.id
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setActiveTab(item.id as any)}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className={cn(
                            "text-[10px] font-medium truncate",
                            activeTab === item.id ? "opacity-100" : "opacity-70"
                        )}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
