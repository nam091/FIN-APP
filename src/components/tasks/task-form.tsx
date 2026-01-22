"use client";

import React, { useState, useEffect } from "react";
import { useAppState, Task } from "@/context/app-state-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { X, ListTodo, Briefcase, Clock, Bell, Calendar, Repeat, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskFormProps {
    onClose: () => void;
    editingTask?: Task | null;
}

const TASK_TYPES = [
    { id: "me", labelKey: "myTasks", icon: ListTodo },
    { id: "others", labelKey: "delegated", icon: Briefcase },
    { id: "upcoming", labelKey: "tasksUpcoming", icon: Clock },
] as const;

const REPEAT_OPTIONS = [
    { id: "none", labelKey: "noRepeat" },
    { id: "daily", labelKey: "daily" },
    { id: "weekly", labelKey: "weekly" },
    { id: "monthly", labelKey: "monthly" },
    { id: "yearly", labelKey: "yearly" },
] as const;

const REMINDER_OPTIONS = [
    { id: "none", labelKey: "noReminder" },
    { id: "5min", label: "5 min" },
    { id: "15min", label: "15 min" },
    { id: "30min", label: "30 min" },
    { id: "1hour", label: "1 hour" },
    { id: "1day", label: "1 day" },
] as const;

export function TaskForm({ onClose, editingTask }: TaskFormProps) {
    const { addTask, updateTask, t } = useAppState();

    const [title, setTitle] = useState("");
    const [project, setProject] = useState("");
    const [type, setType] = useState("me");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [reminder, setReminder] = useState("none");
    const [repeat, setRepeat] = useState("none");
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Pre-fill form when editing
    useEffect(() => {
        if (editingTask) {
            setTitle(editingTask.title);
            setProject(editingTask.project || "");
            setType(editingTask.type || "me");
            setDueDate(editingTask.dueDate || "");
            setDueTime(editingTask.dueTime || "");
            setReminder(editingTask.reminder || "none");
            setRepeat(editingTask.repeat || "none");
        }
    }, [editingTask]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        const taskData = {
            title,
            project: project || "Personal",
            type: type as "me" | "others" | "upcoming",
            completed: editingTask?.completed || false,
            dueDate: dueDate || undefined,
            dueTime: dueTime || undefined,
            reminder: reminder !== "none" ? reminder : undefined,
            repeat: repeat !== "none" ? repeat : undefined,
        };

        if (editingTask) {
            updateTask(editingTask.id, taskData);
        } else {
            addTask(taskData);
        }
        onClose();
    };

    const isEditing = !!editingTask;

    return (
        <div className="flex flex-col h-[85vh] md:h-full bg-background rounded-t-[32px] md:rounded-3xl border border-border overflow-hidden">
            {/* Fixed Header */}
            <div className="flex justify-between items-center p-6 pb-4 border-b border-border/50">
                <h2 className="text-2xl font-bold text-foreground">{isEditing ? t("editTask") : t("newTask")}</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-secondary">
                    <X className="w-6 h-6 text-muted-foreground" />
                </Button>
            </div>

            {/* Scrollable Content */}
            <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6"
                data-vaul-no-drag
            >
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">{t("title")}</label>
                    <Input
                        placeholder={t("taskPlaceholder")}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-secondary/50 border-border rounded-2xl h-16 px-5 focus-visible:ring-primary/30 text-lg"
                        autoFocus
                    />
                </div>

                {/* Project */}
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">{t("project")}</label>
                    <Input
                        placeholder={t("projectPlaceholder")}
                        value={project}
                        onChange={(e) => setProject(e.target.value)}
                        className="bg-secondary/50 border-border rounded-2xl h-14 px-5 focus-visible:ring-primary/30 text-base"
                    />
                </div>

                {/* Task Type */}
                <div className="space-y-3">
                    <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">{t("type")}</label>
                    <div className="grid grid-cols-3 gap-3">
                        {TASK_TYPES.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setType(item.id)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                                    type === item.id
                                        ? "bg-violet-600/20 border-violet-500 text-violet-400 scale-105"
                                        : "bg-secondary border-border text-muted-foreground hover:border-accent hover:scale-105"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-xs font-semibold">{t(item.labelKey)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date & Time Row - Custom Pickers */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> {t("dueDate")}
                        </label>
                        <DatePicker
                            value={dueDate}
                            onChange={setDueDate}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {t("time")}
                        </label>
                        <TimePicker
                            value={dueTime}
                            onChange={setDueTime}
                        />
                    </div>
                </div>

                {/* Advanced Options Toggle */}
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-muted-foreground text-sm font-medium hover:text-foreground transition-colors py-2"
                >
                    <ChevronDown className={cn("w-4 h-4 transition-transform", showAdvanced && "rotate-180")} />
                    {t("advancedOptions")}
                </button>

                {showAdvanced && (
                    <div className="space-y-5 animate-in slide-in-from-top-2">
                        {/* Reminder */}
                        <div className="space-y-3">
                            <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                                <Bell className="w-3.5 h-3.5" /> {t("reminder")}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {REMINDER_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setReminder(opt.id)}
                                        className={cn(
                                            "px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all",
                                            reminder === opt.id
                                                ? "bg-amber-500/20 border-amber-500 text-amber-400"
                                                : "bg-secondary border-border text-muted-foreground hover:border-accent"
                                        )}
                                    >
                                        {"labelKey" in opt ? t(opt.labelKey as any) : opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Repeat */}
                        <div className="space-y-3">
                            <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                                <Repeat className="w-3.5 h-3.5" /> {t("repeat")}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {REPEAT_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setRepeat(opt.id)}
                                        className={cn(
                                            "px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all",
                                            repeat === opt.id
                                                ? "bg-indigo-500/20 border-indigo-500 text-indigo-400"
                                                : "bg-secondary border-border text-muted-foreground hover:border-accent"
                                        )}
                                    >
                                        {t(opt.labelKey as any)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-4 pb-2">
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold h-16 rounded-2xl text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isEditing ? t("saveChanges") : t("addTask")}
                    </Button>
                </div>
            </form>
        </div>
    );
}
