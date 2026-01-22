"use client";

import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAppState, Task, Note } from "@/context/app-state-context";
import { format, subDays, isSameDay, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";

interface ActivityChartProps {
    tasks: Task[];
    notes: Note[];
    trackers: any[];
}

export function ActivityChart({ tasks, notes, trackers }: ActivityChartProps) {
    const { userSettings } = useAppState();
    const isDark = userSettings.theme === "dark" || (userSettings.theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

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

    return (
        <Card className="p-6 rounded-3xl bg-secondary/20 border-border backdrop-blur-xl">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    Activity Overview
                </h3>
                <p className="text-xs text-muted-foreground">Your productivity over the last 7 days</p>
            </div>

            <div className="h-[300px] w-full">
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
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                        <Area
                            type="monotone"
                            dataKey="tasks"
                            name="Tasks Created"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorTasks)"
                        />
                        <Area
                            type="monotone"
                            dataKey="habits"
                            name="Habits Done"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorHabits)"
                        />
                        <Area
                            type="monotone"
                            dataKey="notes"
                            name="Notes Created"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorNotes)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
