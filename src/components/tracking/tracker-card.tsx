"use client";

import React from "react";
import { Check, Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TrackerCardProps {
    tracker: any;
    onToggle: (date: string) => void;
}

export function TrackerCard({ tracker, onToggle }: TrackerCardProps) {
    // Basic streak calculation (simplified for now)
    const calculateStreak = () => {
        if (!tracker.entries || tracker.entries.length === 0) return 0;
        // Logic to calculate consecutive days would go here
        // For now, return a placeholder or simple count
        return tracker.entries.length;
    };

    const isCompletedToday = () => {
        const today = new Date().toISOString().split('T')[0];
        return tracker.entries.some((e: any) => e.date === today && e.value >= (tracker.goal || 1));
    };

    const handleToggleToday = () => {
        const today = new Date().toISOString().split('T')[0];
        onToggle(today);
    };

    const streak = calculateStreak();
    const completed = isCompletedToday();

    // Color definitions
    const colorStyles: Record<string, string> = {
        blue: "bg-blue-500/10 border-blue-500/20 text-blue-500",
        green: "bg-green-500/10 border-green-500/20 text-green-500",
        red: "bg-red-500/10 border-red-500/20 text-red-500",
        purple: "bg-purple-500/10 border-purple-500/20 text-purple-500",
        orange: "bg-orange-500/10 border-orange-500/20 text-orange-500",
    };
    const activeStyle = colorStyles[tracker.color] || colorStyles.blue;

    return (
        <div className="bg-secondary/40 backdrop-blur-xl border border-border p-5 rounded-3xl group hover:border-foreground/20 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", activeStyle)}>
                        {/* We could render dynamic icons here */}
                        <Flame className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">{tracker.title}</h3>
                        <p className="text-xs text-muted-foreground">{tracker.description || "Daily Goal"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-orange-500 font-bold bg-orange-500/10 px-2 py-1 rounded-lg text-xs">
                    <Flame className="w-3 h-3 fill-orange-500" />
                    {streak}
                </div>
            </div>

            {/* Contribution Graph (Mini Calendar) Placeholder */}
            <div className="flex gap-1 h-8 mb-4 items-end opacity-50">
                {[...Array(14)].map((_, i) => (
                    <div key={i} className={cn(
                        "flex-1 rounded-sm transition-all",
                        Math.random() > 0.5 ? "bg-primary/20 h-full" : "bg-secondary h-2"
                    )} />
                ))}
            </div>

            <Button
                onClick={handleToggleToday}
                className={cn(
                    "w-full rounded-xl font-semibold h-12 transition-all",
                    completed
                        ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
                        : "bg-secondary hover:bg-secondary/80 text-foreground"
                )}
            >
                {completed ? (
                    <>
                        <Check className="w-5 h-5 mr-2" />
                        Completed
                    </>
                ) : (
                    "Mark as Done"
                )}
            </Button>
        </div>
    );
}
