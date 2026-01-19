"use client";

import React, { useEffect, useState } from "react";
import { Plus, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackerCard } from "./tracker-card";
import { useSession } from "next-auth/react";
import { NewTrackerModal } from "./new-tracker-modal";

export function TrackingView() {
    const { data: session } = useSession();
    const [trackers, setTrackers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);

    useEffect(() => {
        const fetchTrackers = async () => {
            if (!session?.user?.email) return;
            try {
                const res = await fetch("/api/trackers");
                if (res.ok) {
                    const data = await res.json();
                    setTrackers(data);
                }
            } catch (error) {
                console.error("Failed to fetch trackers", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrackers();
    }, [session]);

    const handleCreateTracker = async (trackerData: any) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/trackers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(trackerData),
            });
            if (res.ok) {
                const newTracker = await res.json();
                setTrackers([newTracker, ...trackers]);
            }
        } catch (error) {
            console.error("Failed to create tracker", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = async (trackerId: string, date: string) => {
        // Optimistic update
        setTrackers(prev => prev.map(t => {
            if (t.id !== trackerId) return t;

            const existingEntryIndex = t.entries.findIndex((e: any) => e.date === date);
            let newEntries = [...t.entries];

            if (existingEntryIndex >= 0) {
                // Toggle off if it's a simple boolean habit (value >= goal)
                // For now assuming habit toggle
                if (newEntries[existingEntryIndex].value >= t.goal) {
                    newEntries[existingEntryIndex].value = 0; // or remove
                } else {
                    newEntries[existingEntryIndex].value = t.goal;
                }
            } else {
                newEntries.push({ date, value: t.goal });
            }

            return { ...t, entries: newEntries };
        }));

        try {
            await fetch(`/api/trackers/${trackerId}/entries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, value: 1 }), // Assuming simple toggle for now
            });
        } catch (error) {
            console.error("Failed to log entry", error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background text-foreground overflow-hidden relative cursor-default w-full">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                    backgroundSize: "30px 30px"
                }}
            />

            <header className="px-6 py-4 flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    <Activity className="w-6 h-6 text-indigo-500" />
                    Habit Tracking
                </h1>
                <Button
                    onClick={() => setIsNewModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-4 h-4 mr-2" /> New Habit
                </Button>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar px-6 z-10 pb-20">
                <div className="max-w-6xl mx-auto w-full pt-4">
                    {/* Summary Stats Placeholder */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                            <div className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Active Streak</div>
                            <div className="text-2xl font-bold text-foreground">12 days</div>
                        </div>
                        <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                            <div className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Completion Rate</div>
                            <div className="text-2xl font-bold text-foreground">85%</div>
                        </div>
                        <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                            <div className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Total Habits</div>
                            <div className="text-2xl font-bold text-foreground">{trackers.length}</div>
                        </div>
                        <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                            <div className="text-muted-foreground text-xs uppercase font-bold tracking-wider mb-1">Perfect Days</div>
                            <div className="text-2xl font-bold text-foreground">5</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trackers.map(tracker => (
                            <TrackerCard
                                key={tracker.id}
                                tracker={tracker}
                                onToggle={(date) => handleToggle(tracker.id, date)}
                            />
                        ))}
                    </div>

                    {trackers.length === 0 && !isLoading && (
                        <div className="text-center py-20 opacity-50">
                            <Activity className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-xl font-medium">No habits tracked yet.</p>
                            <p className="text-sm">Start building your streak today!</p>
                        </div>
                    )}
                </div>
            </div>

            <NewTrackerModal
                open={isNewModalOpen}
                onOpenChange={setIsNewModalOpen}
                onSave={handleCreateTracker}
            />
        </div>
    );
}
