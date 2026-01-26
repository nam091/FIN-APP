"use client";

import React, { useMemo } from "react";
import { Home, ListTodo, BookOpen, MessageSquare, Wallet, Activity } from "lucide-react";
import { useAppState } from "@/context/app-state-context";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const { activeTab, setActiveTab } = useAppState();

    const navItems = [
        { id: "home", icon: Home },
        { id: "finance", icon: Wallet },
        { id: "tasks", icon: ListTodo },
        { id: "tracking", icon: Activity },
        { id: "notes", icon: BookOpen },
        { id: "ai", icon: MessageSquare },
    ];

    const activeIndex = useMemo(() => {
        return navItems.findIndex(item => item.id === activeTab);
    }, [activeTab, navItems]);

    const itemWidthPercentage = 100 / navItems.length;

    if (activeTab === "ai") return null;

    return (
        <div
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-safe"
            style={{
                // Smooth gradient mask for blur fade
                maskImage: "linear-gradient(to top, black 70%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to top, black 70%, transparent 100%)"
            }}
        >
            {/* Background blur layer with smooth fade */}
            <div className="absolute inset-0 backdrop-blur-2xl bg-background/60" />

            {/* Content */}
            <div className="relative px-6 pb-6 pt-4 pointer-events-auto flex justify-center">
                <div className="relative flex items-center w-full max-w-[400px] bg-secondary/80 backdrop-blur-2xl rounded-[28px] p-2 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">

                    {/* Sliding Highlight Pill */}
                    <div
                        className="absolute top-2 bottom-2 rounded-2xl bg-primary shadow-lg shadow-primary/30 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                        style={{
                            width: `calc((100% - 16px) / ${navItems.length})`,
                            left: 8,
                            transform: `translateX(calc(${activeIndex} * 100%))`,
                            opacity: activeIndex === -1 ? 0 : 1,
                        }}
                    />

                    {/* Navigation Items */}
                    {navItems.map((item, index) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                className={cn(
                                    "relative flex-1 flex items-center justify-center h-12 rounded-2xl transition-all duration-300 z-10 p-0 outline-none",
                                    isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground active:scale-90"
                                )}
                                onClick={() => setActiveTab(item.id as any)}
                            >
                                <item.icon
                                    className={cn(
                                        "w-5 h-5 transition-all duration-300",
                                        isActive ? "scale-110" : "scale-100"
                                    )}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
