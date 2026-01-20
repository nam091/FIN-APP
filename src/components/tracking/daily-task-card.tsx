"use client";

import React from "react";
import { Check, ListTodo, Repeat, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DailyTaskCardProps {
    task: any;
    completionHistory?: boolean[]; // Last 14 days of completion
    onToggle: () => void;
}

export function DailyTaskCard({ task, completionHistory, onToggle }: DailyTaskCardProps) {
    const isCompleted = task.completed;

    // Generate mock completion history if not provided
    // In real implementation, this would come from historical task data
    const history = completionHistory || Array.from({ length: 14 }, () => Math.random() > 0.4);

    // Calculate completion rate
    const completionRate = Math.round((history.filter(Boolean).length / history.length) * 100);

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
                <div className="flex items-center gap-1 text-cyan-500 font-bold bg-cyan-500/10 px-2 py-1 rounded-lg text-xs">
                    {completionRate}%
                </div>
            </div>

            {/* Completion Chart - Last 14 days */}
            <div className="flex gap-1 h-8 mb-4 items-end">
                {history.map((completed, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex-1 rounded-sm transition-all",
                            completed
                                ? "bg-cyan-500/60 h-full"
                                : "bg-secondary h-2"
                        )}
                        title={`Day ${i + 1}: ${completed ? 'Completed' : 'Missed'}`}
                    />
                ))}
            </div>

            {/* Time Picker Display */}
            {task.dueTime && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-cyan-500/5 border border-cyan-500/10 rounded-xl text-sm">
                    <Clock className="w-4 h-4 text-cyan-500" />
                    <span className="text-muted-foreground">Scheduled:</span>
                    <span className="text-foreground font-medium">{task.dueTime}</span>
                </div>
            )}

            <Button
                onClick={onToggle}
                className={cn(
                    "w-full rounded-xl font-semibold h-12 transition-all",
                    isCompleted
                        ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
                        : "bg-secondary hover:bg-secondary/80 text-foreground"
                )}
            >
                {isCompleted ? (
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
