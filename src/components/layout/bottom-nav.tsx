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

    return (
        <div
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
            style={{
                // Smooth gradient mask for blur fade
                maskImage: "linear-gradient(to top, black 70%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to top, black 70%, transparent 100%)"
            }}
        >
            {/* Background blur layer with smooth fade */}
            <div className="absolute inset-0 backdrop-blur-2xl bg-background/60" />

            {/* Content */}
            <div className="relative px-4 pb-6 pt-4 pointer-events-auto">
                <div className="relative flex items-center max-w-md mx-auto bg-secondary/50 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10 shadow-lg shadow-black/20 overflow-hidden">

                    {/* Sliding Highlight Pill */}
                    <div
                        className="absolute top-1.5 bottom-1.5 rounded-xl bg-primary shadow-lg shadow-primary/30 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)"
                        style={{
                            width: `calc(${itemWidthPercentage}% - 8px)`,
                            left: `calc(${activeIndex * itemWidthPercentage}% + 4px)`,
                            transform: `scale(${activeIndex === -1 ? 0 : 1})`,
                        }}
                    />

                    {/* Navigation Items */}
                    {navItems.map((item, index) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                className={cn(
                                    "relative flex-1 flex items-center justify-center h-12 rounded-xl transition-all duration-300 z-10",
                                    isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                                onClick={() => setActiveTab(item.id as any)}
                            >
                                <item.icon
                                    className={cn(
                                        "w-5 h-5 transition-all duration-300",
                                        isActive ? "scale-110" : "scale-100"
                                    )}
                                />

                                {/* Shared Indicator Dot (now internal to simplify, but could be shared) */}
                                <div
                                    className={cn(
                                        "absolute -bottom-1 w-1 h-1 rounded-full bg-primary-foreground transition-all duration-500",
                                        isActive ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-0 translate-y-2"
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
