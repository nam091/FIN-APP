"use client";

import React, { useEffect, useState } from "react";
import { Plus, Activity, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackerCard } from "./tracker-card";
import { DailyTaskCard } from "./daily-task-card";
import { useSession } from "next-auth/react";
import { NewTrackerModal } from "./new-tracker-modal";
import { useAppState } from "@/context/app-state-context";
import { getLocalDateString } from "@/lib/date-utils";
import { BackgroundDots } from "@/components/ui/background-dots";
import { SwipeToReveal } from "@/components/ui/swipe-to-reveal";

export function TrackingView() {
    const { data: session } = useSession();
    const { tasks, toggleTask, t } = useAppState();
    const [trackers, setTrackers] = useState<any[]>([]);
    const [dailyTasksWithHistory, setDailyTasksWithHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [editingTracker, setEditingTracker] = useState<any>(null);

    // Filter daily repeating tasks from app state
    const dailyTasks = tasks.filter(task =>
        task.repeat?.toLowerCase() === 'daily' ||
        task.repeat?.toLowerCase() === 'everyday' ||
        task.repeat?.toLowerCase() === 'hằng ngày'
    );

    // Fetch trackers and completion history
    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user?.email) return;
            try {
                // Fetch trackers
                const trackersRes = await fetch("/api/trackers");
                if (trackersRes.ok) {
                    const data = await trackersRes.json();
                    setTrackers(data);
                }

                // Fetch completion history for daily tasks
                const historyRes = await fetch("/api/tasks/completions");
                if (historyRes.ok) {
                    const historyData = await historyRes.json();
                    setDailyTasksWithHistory(historyData);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [session]);

    // Merge app state tasks with database history
    const getMergedDailyTasks = () => {
        return dailyTasks.map(task => {
            const dbTask = dailyTasksWithHistory.find((t: any) => t.id === task.id);
            return {
                ...task,
                completionLogs: dbTask?.completionLogs || [],
                createdAt: dbTask?.createdAt || task.createdAt
            };
        });
    };

    const mergedDailyTasks = getMergedDailyTasks();

    // Log completion to database
    const handleLogCompletion = async (taskId: number, date: string, completed: boolean) => {
        try {
            await fetch("/api/tasks/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskId, date, completed })
            });
            // Update local state
            setDailyTasksWithHistory(prev => prev.map(t => {
                if (t.id !== taskId) return t;
                const existingLogIndex = t.completionLogs?.findIndex((l: any) => l.date === date) ?? -1;
                const newLogs = [...(t.completionLogs || [])];
                if (existingLogIndex >= 0) {
                    newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], completed };
                } else {
                    newLogs.push({ date, completed });
                }
                return { ...t, completionLogs: newLogs };
            }));
        } catch (error) {
            console.error("Failed to log completion", error);
        }
    };

    const handleSaveTracker = async (trackerData: any) => {
        setIsLoading(true);
        try {
            const isEditing = !!trackerData.id;
            const url = isEditing ? `/api/trackers/${trackerData.id}` : "/api/trackers";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(trackerData),
            });

            if (res.ok) {
                const savedTracker = await res.json();
                if (isEditing) {
                    setTrackers(prev => prev.map(t => t.id === savedTracker.id ? { ...t, ...savedTracker } : t));
                } else {
                    setTrackers([savedTracker, ...trackers]);
                }
                setEditingTracker(null);
            }
        } catch (error) {
            console.error("Failed to save tracker", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTracker = async (trackerId: string) => {
        if (!confirm(t("deleteHabitConfirm"))) return;

        try {
            const res = await fetch(`/api/trackers/${trackerId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setTrackers(prev => prev.filter(t => t.id !== trackerId));
            }
        } catch (error) {
            console.error("Failed to delete tracker", error);
        }
    };

    const handleToggle = async (trackerId: string, date: string) => {
        // Optimistic update
        setTrackers(prev => prev.map(t => {
            if (t.id !== trackerId) return t;

            const entries = t.entries || [];
            const existingEntryIndex = entries.findIndex((e: any) => e.date === date);
            let newEntries = [...entries];

            if (existingEntryIndex >= 0) {
                if (newEntries[existingEntryIndex].value >= t.goal) {
                    newEntries[existingEntryIndex].value = 0;
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
                body: JSON.stringify({ date, value: 1 }),
            });
        } catch (error) {
            console.error("Failed to log entry", error);
        }
    };

    const totalItems = trackers.length + dailyTasks.length;
    const today = getLocalDateString();

    // Calculate tasks done today based on history
    const tasksDoneToday = mergedDailyTasks.filter(task => {
        const completedToday = task.completionLogs?.some((log: any) => log.date === today && log.completed);
        return completedToday || task.completed; // Fallback to current state
    }).length;

    return (
        <div className="flex flex-col h-full bg-background text-foreground overflow-hidden relative cursor-default w-full">
            <BackgroundDots />

            <header className="px-6 py-4 flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    <Activity className="w-6 h-6 text-indigo-500" />
                    {t("habitTracking")}
                </h1>
                <Button
                    onClick={() => {
                        setEditingTracker(null);
                        setIsNewModalOpen(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-4 h-4 mr-2" /> {t("newHabit")}
                </Button>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar px-6 z-10 pb-20">
                <div className="max-w-6xl mx-auto w-full pt-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                            <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-1">{t("habits")}</div>
                            <div className="text-2xl font-bold text-foreground">{trackers.length}</div>
                        </div>
                        <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                            <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-1">{t("dailyTasks")}</div>
                            <div className="text-2xl font-bold text-cyan-500">{dailyTasks.length}</div>
                        </div>
                        <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                            <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-1">{t("totalItems")}</div>
                            <div className="text-2xl font-bold text-foreground">{totalItems}</div>
                        </div>
                        <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                            <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-1">{t("tasksDone")}</div>
                            <div className="text-2xl font-bold text-green-500">{tasksDoneToday}</div>
                        </div>
                    </div>

                    {/* Daily Tasks Section */}
                    {mergedDailyTasks.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-cyan-500">
                                <ListTodo className="w-5 h-5" />
                                {t("dailyTasks")} ({mergedDailyTasks.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {mergedDailyTasks.map(task => (
                                    <DailyTaskCard
                                        key={task.id}
                                        task={task}
                                        completionLogs={task.completionLogs}
                                        onToggle={() => toggleTask(task.id)}
                                        onLogCompletion={handleLogCompletion}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Habits Section */}
                    {trackers.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-500">
                                <Activity className="w-5 h-5" />
                                {t("habits")} ({trackers.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {trackers.map(tracker => (
                                    <SwipeToReveal
                                        key={tracker.id}
                                        onDelete={() => handleDeleteTracker(tracker.id)}
                                        onEdit={() => {
                                            setEditingTracker(tracker);
                                            setIsNewModalOpen(true);
                                        }}
                                    >
                                        <TrackerCard
                                            tracker={tracker}
                                            onToggle={(date) => handleToggle(tracker.id, date)}
                                            onEdit={() => {
                                                setEditingTracker(tracker);
                                                setIsNewModalOpen(true);
                                            }}
                                            onDelete={() => handleDeleteTracker(tracker.id)}
                                        />
                                    </SwipeToReveal>
                                ))}
                            </div>
                        </div>
                    )}

                    {totalItems === 0 && !isLoading && (
                        <div className="text-center py-20 opacity-50">
                            <Activity className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-xl font-medium">{t("noHabits")}</p>
                            <p className="text-sm">{t("createHabitDesc")}</p>
                        </div>
                    )}
                </div>
            </div>

            <NewTrackerModal
                open={isNewModalOpen}
                editingTracker={editingTracker}
                onOpenChange={(open) => {
                    setIsNewModalOpen(open);
                    if (!open) setEditingTracker(null);
                }}
                onSave={handleSaveTracker}
            />
        </div>
    );
}
