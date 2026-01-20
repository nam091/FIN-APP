"use client";

import React from "react";
import { Check, ListTodo, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DailyTaskCardProps {
    task: any;
    onToggle: () => void;
}

export function DailyTaskCard({ task, onToggle }: DailyTaskCardProps) {
    const isCompleted = task.completed;

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
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-cyan-500 font-bold bg-cyan-500/10 px-2 py-1 rounded-lg text-xs">
                    <ListTodo className="w-3 h-3" />
                    Task
                </div>
            </div>

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
