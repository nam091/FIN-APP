"use client";

import React, { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAppState, Task, Note } from "@/context/app-state-context";
import { format, subDays } from "date-fns";
import { Card } from "@/components/ui/card";
import { Activity, CheckSquare, FileText, Flame } from "lucide-react";

interface ActivityChartProps {
    tasks: Task[];
    notes: Note[];
    trackers: any[];
}

type FilterType = "tasks" | "notes" | "habits";

export function ActivityChart({ tasks, notes, trackers }: ActivityChartProps) {
    const { userSettings, t } = useAppState();
    const [activeFilters, setActiveFilters] = useState<FilterType[]>(["tasks", "notes", "habits"]);

    const isDark = userSettings.theme === "dark" || (userSettings.theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    const toggleFilter = (filter: FilterType) => {
        setActiveFilters(prev => {
            if (prev.includes(filter)) {
                // Don't allow removing all filters
                if (prev.length === 1) return prev;
                return prev.filter(f => f !== filter);
            }
            return [...prev, filter];
        });
    };

    const data = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = subDays(new Date(), 6 - i);
            return {
                date: d,
                label: format(d, "EEE"), // Mon, Tue...
                fullDate: format(d, "yyyy-MM-dd"),
            };
        });

        return last7Days.map((day) => {
            // Tasks created on this day
            const tasksCount = tasks.filter(t => {
                if (!t.createdAt) return false;
                try {
                    return t.createdAt.startsWith(day.fullDate);
                } catch { return false; }
            }).length;

            // Notes created on this day
            const notesCount = notes.filter(n => n.date === day.fullDate).length;

            // Habits completed on this day
            let habitsCount = 0;
            trackers.forEach(tracker => {
                const entry = tracker.entries?.find((e: any) => e.date === day.fullDate);
                if (entry && entry.value >= (tracker.goal || 1)) {
                    habitsCount++;
                }
            });

            return {
                name: day.label,
                tasks: tasksCount,
                notes: notesCount,
                habits: habitsCount,
            };
        });
    }, [tasks, notes, trackers]);

    // Calculate totals
    const totalTasks = data.reduce((sum, d) => sum + d.tasks, 0);
    const totalNotes = data.reduce((sum, d) => sum + d.notes, 0);
    const totalHabits = data.reduce((sum, d) => sum + d.habits, 0);

    return (
        <Card className="p-6 rounded-3xl bg-secondary/20 border-border backdrop-blur-xl">
            {/* Header with filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        {t("activityOverview") || "Activity Overview"}
                    </h3>
                    <p className="text-xs text-muted-foreground">{t("productivityLast7Days") || "Your productivity over the last 7 days"}</p>
                </div>

                {/* Toggle Filters */}
                <div className="flex gap-2">
                    <button
                        onClick={() => toggleFilter("tasks")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeFilters.includes("tasks")
                                ? "bg-violet-500 text-white"
                                : "bg-secondary text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <CheckSquare className="w-3 h-3" />
                        <span className="hidden sm:inline">Tasks</span>
                        <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">{totalTasks}</span>
                    </button>
                    <button
                        onClick={() => toggleFilter("notes")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeFilters.includes("notes")
                                ? "bg-amber-500 text-white"
                                : "bg-secondary text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <FileText className="w-3 h-3" />
                        <span className="hidden sm:inline">Notes</span>
                        <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">{totalNotes}</span>
                    </button>
                    <button
                        onClick={() => toggleFilter("habits")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeFilters.includes("habits")
                                ? "bg-emerald-500 text-white"
                                : "bg-secondary text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Flame className="w-3 h-3" />
                        <span className="hidden sm:inline">Habits</span>
                        <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">{totalHabits}</span>
                    </button>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorNotes" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#e5e5e5"} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? "#1f2937" : "#fff",
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                            }}
                            itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                        />
                        {activeFilters.includes("tasks") && (
                            <Area
                                type="monotone"
                                dataKey="tasks"
                                name="Tasks"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorTasks)"
                            />
                        )}
                        {activeFilters.includes("habits") && (
                            <Area
                                type="monotone"
                                dataKey="habits"
                                name="Habits"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorHabits)"
                            />
                        )}
                        {activeFilters.includes("notes") && (
                            <Area
                                type="monotone"
                                dataKey="notes"
                                name="Notes"
                                stroke="#f59e0b"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorNotes)"
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
