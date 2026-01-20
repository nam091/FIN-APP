"use client";

import React from "react";
import { Check, ListTodo, Repeat, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DailyTaskCardProps {
    task: any;
    onToggle: () => void;
}

export function DailyTaskCard({ task, onToggle }: DailyTaskCardProps) {
    const isCompleted = task.completed;

    // Get today's date info
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday

    // For daily tasks, we show a simple weekly view
    // Mark today as completed/incomplete, rest as "future" or "unknown"
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

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
                    isCompleted
                        ? "text-green-500 bg-green-500/10"
                        : "text-muted-foreground bg-secondary"
                )}>
                    {isCompleted ? "Done" : "Pending"}
                </div>
            </div>

            {/* Weekly Progress View */}
            <div className="flex gap-1 mb-4">
                {weekDays.map((day, i) => {
                    const isToday = i === dayOfWeek;
                    const isPast = i < dayOfWeek;
                    const isFuture = i > dayOfWeek;

                    return (
                        <div
                            key={day}
                            className="flex-1 flex flex-col items-center gap-1"
                        >
                            <span className={cn(
                                "text-[10px] font-medium",
                                isToday ? "text-cyan-500" : "text-muted-foreground"
                            )}>
                                {day}
                            </span>
                            <div className={cn(
                                "w-full h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-all",
                                isToday && isCompleted && "bg-green-500 text-white",
                                isToday && !isCompleted && "bg-cyan-500/20 border-2 border-cyan-500 border-dashed text-cyan-500",
                                isPast && "bg-muted text-muted-foreground",
                                isFuture && "bg-secondary/50 text-muted-foreground/50"
                            )}>
                                {isToday && isCompleted && <Check className="w-3 h-3" />}
                                {isToday && !isCompleted && "?"}
                                {isPast && "-"}
                                {isFuture && ""}
                            </div>
                        </div>
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
