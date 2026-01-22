"use client";

import React from "react";
import { Check, Flame, Trophy, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getLocalDateString } from "@/lib/date-utils";

interface TrackerCardProps {
    tracker: any;
    onToggle: (date: string) => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function TrackerCard({ tracker, onToggle, onEdit, onDelete }: TrackerCardProps) {
    // Basic streak calculation (simplified for now)
    const calculateStreak = () => {
        if (!tracker.entries || tracker.entries.length === 0) return 0;
        // Logic to calculate consecutive days would go here
        // For now, return a placeholder or simple count
        return tracker.entries.length;
    };

    const isCompletedToday = () => {
        const today = getLocalDateString();
        return tracker.entries?.some((e: any) => e.date === today && e.value >= (tracker.goal || 1)) ?? false;
    };

    const handleToggleToday = () => {
        const today = getLocalDateString();
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
        <div className="bg-secondary/40 backdrop-blur-xl border border-border p-5 rounded-3xl group hover:border-foreground/20 transition-all relative">
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

                {/* Edit/Delete Actions - Hidden on mobile (use swipe), visible on PC hover */}
                <div className="absolute top-4 right-4 hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-20">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onEdit?.();
                        }}
                        className="w-8 h-8 rounded-full bg-secondary/80 hover:bg-accent text-muted-foreground"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onDelete?.();
                        }}
                        className="w-8 h-8 rounded-full bg-secondary/80 hover:bg-rose-500/20 text-rose-500"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Contribution Graph (Last 14 Days) */}
            <div className="flex gap-1 h-8 mb-4 items-end">
                {[...Array(14)].map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (13 - i)); // Show last 14 days ending today
                    const dateStr = getLocalDateString(date);
                    const entry = tracker.entries?.find((e: any) => e.date === dateStr);
                    const isDone = entry && entry.value >= (tracker.goal || 1);

                    return (
                        <div
                            key={i}
                            title={dateStr}
                            className={cn(
                                "flex-1 rounded-sm transition-all",
                                isDone
                                    ? "bg-primary/80 h-full"
                                    : "bg-secondary h-2"
                            )}
                        />
                    );
                })}
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
