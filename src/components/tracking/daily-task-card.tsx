"use client";

import React from "react";
import { Check, ListTodo, Repeat, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getLocalDateString } from "@/lib/date-utils";
import { useAppState } from "@/context/app-state-context";

interface CompletionLog {
    date: string;
    completed: boolean;
}

interface DailyTaskCardProps {
    task: any;
    completionLogs?: CompletionLog[];
    onToggle: () => void;
    onLogCompletion?: (taskId: number, date: string, completed: boolean) => void;
}

export function DailyTaskCard({ task, completionLogs = [], onToggle, onLogCompletion }: DailyTaskCardProps) {
    const { t } = useAppState();
    const today = getLocalDateString();

    // Create a map of completed dates
    const completedDates = new Set(
        completionLogs.filter(log => log.completed).map(log => log.date)
    );

    const isCompletedToday = completedDates.has(today);

    // Get the last 14 days for chart
    const getLast14Days = () => {
        const days = [];
        const todayDate = new Date();
        for (let i = 13; i >= 0; i--) {
            const date = new Date(todayDate);
            date.setDate(todayDate.getDate() - i);
            days.push(getLocalDateString(date));
        }
        return days;
    };

    const last14Days = getLast14Days();

    // Calculate total days from creation to today
    const taskCreatedAt = task.createdAt
        ? getLocalDateString(new Date(task.createdAt))
        : today;

    const getAllDaysFromCreation = () => {
        const days = [];
        const [sy, sm, sd] = taskCreatedAt.split('-').map(Number);
        const [ey, em, ed] = today.split('-').map(Number);

        const current = new Date(sy, sm - 1, sd);
        const end = new Date(ey, em - 1, ed);

        while (current <= end) {
            days.push(getLocalDateString(current));
            current.setDate(current.getDate() + 1);
        }
        return days;
    };

    const allDaysFromCreation = getAllDaysFromCreation();
    const totalDays = allDaysFromCreation.length;
    const completedCount = allDaysFromCreation.filter(date => completedDates.has(date)).length;
    const completionRate = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

    // Calculate current streak (consecutive days ending today or yesterday)
    const calculateStreak = () => {
        let streak = 0;
        const sortedDays = [...allDaysFromCreation].reverse(); // Most recent first

        for (let i = 0; i < sortedDays.length; i++) {
            const date = sortedDays[i];
            // Skip today if not completed yet (allow for in-progress day)
            if (i === 0 && date === today && !completedDates.has(date)) {
                continue;
            }
            if (completedDates.has(date)) {
                streak++;
            } else {
                break; // Streak broken
            }
        }
        return streak;
    };

    const streak = calculateStreak();

    // Handle toggle and log to database
    const handleToggle = async () => {
        onToggle(); // Toggle in app state

        // Log completion to database
        if (onLogCompletion) {
            onLogCompletion(task.id, today, !isCompletedToday);
        }
    };

    return (
        <div className="bg-secondary/40 backdrop-blur-xl border border-border p-5 rounded-3xl group hover:border-cyan-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
                        <ListTodo className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">{task.title}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Repeat className="w-3 h-3" />
                            {t("dailyTask")}
                            {task.dueTime && (
                                <>
                                    <span className="mx-1">•</span>
                                    <Clock className="w-3 h-3" />
                                    {task.dueTime}
                                </>
                            )}
                        </p>
                    </div>
                </div>
                {/* Streak Badge (like Habits) */}
                <div className="flex items-center gap-1 text-orange-500 font-bold bg-orange-500/10 px-2 py-1 rounded-lg text-xs">
                    <Flame className="w-3 h-3 fill-orange-500" />
                    {streak}
                </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-3 mb-4 text-xs">
                <div className={cn(
                    "flex items-center gap-1 font-bold px-2 py-1 rounded-lg",
                    completionRate >= 70
                        ? "text-green-500 bg-green-500/10"
                        : completionRate >= 40
                            ? "text-yellow-500 bg-yellow-500/10"
                            : "text-muted-foreground bg-secondary"
                )}>
                    {completionRate}%
                </div>
                <span className="text-muted-foreground">
                    {completedCount}/{totalDays} {t("days")}
                </span>
            </div>

            {/* 14-Day Completion Chart */}
            <div className="flex gap-0.5 h-8 mb-4 items-end">
                {last14Days.map((date) => {
                    const isToday = date === today;
                    const isBeforeCreation = date < taskCreatedAt;
                    const isCompleted = completedDates.has(date);
                    const isFuture = date > today;

                    return (
                        <div
                            key={date}
                            className={cn(
                                "flex-1 rounded-sm transition-all",
                                isBeforeCreation && "bg-secondary/30 h-1",
                                isFuture && "bg-secondary/30 h-1",
                                !isBeforeCreation && !isFuture && isCompleted && "bg-cyan-500 h-full",
                                !isBeforeCreation && !isFuture && !isCompleted && "bg-secondary h-2",
                                isToday && "ring-1 ring-cyan-500 ring-offset-1 ring-offset-background"
                            )}
                            title={`${date}: ${isBeforeCreation ? t("notTracked") : isCompleted ? t("completed") : t("missed")}`}
                        />
                    );
                })}
            </div>

            {/* Time Display */}
            {task.dueTime && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-cyan-500/5 border border-cyan-500/10 rounded-xl text-sm">
                    <Clock className="w-4 h-4 text-cyan-500" />
                    <span className="text-muted-foreground">{t("scheduled")}</span>
                    <span className="text-foreground font-medium">{task.dueTime}</span>
                </div>
            )}

            <Button
                onClick={handleToggle}
                className={cn(
                    "w-full rounded-xl font-semibold h-12 transition-all",
                    isCompletedToday
                        ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
                        : "bg-secondary hover:bg-secondary/80 text-foreground"
                )}
            >
                {isCompletedToday ? (
                    <>
                        <Check className="w-5 h-5 mr-2" />
                        {t("completed")}
                    </>
                ) : (
                    t("markAsDone")
                )}
            </Button>
        </div>
    );
}
