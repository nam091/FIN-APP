"use client";

import React from "react";
import { Check, ListTodo, Repeat, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    const isCompletedToday = task.completed;

    // Get the last 14 days
    const getLast14Days = () => {
        const days = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    };

    const last14Days = getLast14Days();
    const today = new Date().toISOString().split('T')[0];

    // Create a map of completed dates
    const completedDates = new Set(
        completionLogs.filter(log => log.completed).map(log => log.date)
    );

    // Calculate completion rate
    const taskCreatedAt = task.createdAt ? new Date(task.createdAt).toISOString().split('T')[0] : last14Days[0];
    const relevantDays = last14Days.filter(date => date >= taskCreatedAt && date <= today);
    const completedCount = relevantDays.filter(date => completedDates.has(date)).length;
    const completionRate = relevantDays.length > 0
        ? Math.round((completedCount / relevantDays.length) * 100)
        : 0;

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
                            Daily Task
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
                <div className={cn(
                    "flex items-center gap-1 font-bold px-2 py-1 rounded-lg text-xs",
                    completionRate >= 70
                        ? "text-green-500 bg-green-500/10"
                        : completionRate >= 40
                            ? "text-yellow-500 bg-yellow-500/10"
                            : "text-muted-foreground bg-secondary"
                )}>
                    {completionRate}%
                </div>
            </div>

            {/* 14-Day Completion Chart */}
            <div className="flex gap-0.5 h-8 mb-4 items-end">
                {last14Days.map((date, i) => {
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
                            title={`${date}: ${isBeforeCreation ? 'Not tracked' : isCompleted ? 'Completed' : 'Missed'}`}
                        />
                    );
                })}
            </div>

            {/* Time Display */}
            {task.dueTime && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-cyan-500/5 border border-cyan-500/10 rounded-xl text-sm">
                    <Clock className="w-4 h-4 text-cyan-500" />
                    <span className="text-muted-foreground">Scheduled:</span>
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
                        Completed
                    </>
                ) : (
                    "Mark as Done"
                )}
            </Button>
        </div>
    );
}
