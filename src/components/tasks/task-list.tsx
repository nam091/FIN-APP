"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ArrowUpAz,
    Library,
    Search,
    FileText,
    Plus,
    Moon,
    Filter,
    MoreVertical,
    Check,
    Download,
    Calendar,
    CheckCircle2,
    Circle,
    MoreHorizontal,
    AlertCircle,
    Share2,
    RefreshCw,
    Pencil,
    Trash2,
    Settings
} from "lucide-react";
import { useAppState, Task } from "@/context/app-state-context";
import { cn } from "@/lib/utils";
import {
    Drawer,
    DrawerContent,
} from "@/components/ui/drawer";
import { TaskForm } from "./task-form";
import { SwipeToReveal } from "@/components/ui/swipe-to-reveal";
import { useRef } from "react";
import { BackgroundDots } from "@/components/ui/background-dots";

export function TaskList() {
    const { setActiveTab, tasks, toggleTask, deleteTask, dismissedItems, dismissItem, userSettings, t } = useAppState();
    const [filter, setFilter] = useState("All");
    const [sortBy, setSortBy] = useState<"created" | "name" | "date">("created");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskMenuOpen, setTaskMenuOpen] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
    const menuButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());


    const isInfoCardVisible = !dismissedItems.includes("task-info-card");
    const isGCalSyncing = userSettings.integrations.googleCalendarSync;

    const filteredTasks = tasks.filter(task => {
        if (filter === "All") return true;
        if (filter === "Tasks for me") return task.type === "me";
        if (filter === "Others") return task.type === "others";
        if (filter === "Upcoming") return task.type === "upcoming";
        if (filter === "Active") return !task.completed;
        if (filter === "Completed") return task.completed;
        return true;
    });

    // Sort tasks
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (sortBy === "name") return a.title.localeCompare(b.title);
        if (sortBy === "date") return (a.dueDate || "").localeCompare(b.dueDate || "");
        return b.id - a.id; // created: newest first
    });

    const cycleSortBy = () => {
        const options: ("created" | "name" | "date")[] = ["created", "name", "date"];
        const currentIndex = options.indexOf(sortBy);
        setSortBy(options[(currentIndex + 1) % options.length]);
    };

    const getSortLabel = () => {
        if (sortBy === "name") return t("name");
        if (sortBy === "date") return t("date");
        return t("created");
    };


    const handleExport = () => {
        const dataStr = JSON.stringify(tasks, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'tasks_export.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleAddTask = () => {
        setIsFormOpen(true);
    };

    const isTaskInfoVisible = !dismissedItems.includes("task-info-card");

    return (
        <div className="flex flex-col h-full bg-background text-foreground overflow-hidden relative w-full">
            <BackgroundDots />
            <header className="px-6 py-4 flex justify-between items-center shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 rounded-full bg-secondary md:hidden"
                    onClick={() => setActiveTab("home")}
                >
                    <ChevronLeft className="text-muted-foreground w-5 h-5" />
                </Button>
                <div className="hidden md:block flex-1" />
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleAddTask}
                        className="bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-full px-5 h-10 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> {t("addTask")}
                    </Button>
                    <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-muted-foreground h-10" onClick={cycleSortBy}>
                        <ArrowUpAz className="w-4 h-4 text-violet-500" />
                        <span className="text-sm font-medium hidden md:inline">{getSortLabel()}</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-secondary" onClick={() => setActiveTab("settings")}>
                        <Settings className="text-muted-foreground w-5 h-5" />
                    </Button>
                </div>
            </header>

            {/* Replaced ScrollArea with a native scrollable div */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-6">
                <div className="max-w-4xl mx-auto w-full pb-72 md:pb-20">
                    <h1 className="text-5xl font-extrabold tracking-tight mb-6 mt-4">{t("tasks")}</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {isTaskInfoVisible && (
                            <div className="bg-secondary/80 border border-border p-6 rounded-[32px] flex flex-col justify-between transition-all animate-in fade-in slide-in-from-top-4">
                                <div className="flex gap-4 mb-6">
                                    <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                                        <Library className="w-7 h-7" />
                                    </div>
                                    <p className="text-muted-foreground text-lg leading-snug">
                                        {t("overview")}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        variant="ghost"
                                        className="flex-1 py-3 px-4 rounded-full bg-background border border-border text-muted-foreground font-semibold text-sm h-12"
                                        onClick={() => alert("Task management tips: Use swipe gestures to reveal more options!")}
                                    >
                                        {t("learnMore")}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="flex-1 py-3 px-4 rounded-full bg-background border border-border text-muted-foreground font-semibold text-sm h-12"
                                        onClick={() => dismissItem("task-info-card")}
                                    >
                                        {t("dismiss")}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className={cn("hidden lg:grid grid-cols-2 gap-4", !isTaskInfoVisible && "lg:col-span-2 lg:grid-cols-4")}>
                            <TaskStatCard label={t("completed")} value={tasks.filter(t => t.completed).length.toString()} color="text-emerald-500" />
                            <TaskStatCard label={t("pending")} value={tasks.filter(t => !t.completed).length.toString()} color="text-amber-500" />
                            <TaskStatCard label={t("highPriority")} value="3" color="text-rose-500" />
                            <TaskStatCard label={t("projects")} value="4" color="text-indigo-500" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
                        <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-secondary">
                                <Search className="text-muted-foreground w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-10 h-10 rounded-full bg-secondary hover:bg-accent"
                                onClick={handleExport}
                                title="Export Tasks"
                            >
                                <Download className="text-muted-foreground w-5 h-5" />
                            </Button>
                            {isGCalSyncing && (
                                <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center border border-indigo-500/20" title="Google Calendar Synced">
                                    <Calendar className="text-indigo-400 w-5 h-5" />
                                </div>
                            )}
                        </div>
                        <FilterTab label={t("all")} active={filter === "All"} onClick={() => setFilter("All")} />
                        <FilterTab label={t("tasksForMe")} active={filter === "Tasks for me"} onClick={() => setFilter("Tasks for me")} />
                        <FilterTab label={t("tasksOthers")} active={filter === "Others"} onClick={() => setFilter("Others")} />
                        <FilterTab label={t("tasksUpcoming")} active={filter === "Upcoming"} onClick={() => setFilter("Upcoming")} />
                    </div>

                    <div className="space-y-2">
                        {sortedTasks.length > 0 ? sortedTasks.map((task) => (
                            <SwipeToReveal
                                key={task.id}
                                onDelete={() => deleteTask(task.id)}
                                onEdit={() => {
                                    setEditingTask(task);
                                    setIsFormOpen(true);
                                }}
                            >
                                <div className="flex items-center gap-4 group cursor-pointer hover:bg-secondary/40 p-3 rounded-2xl transition-colors"
                                    onClick={() => toggleTask(task.id)}>
                                    <div className="shrink-0">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center group-active:scale-90",
                                            task.completed
                                                ? "bg-violet-500 border-violet-500"
                                                : "border-border group-hover:border-violet-500"
                                        )}>
                                            {task.completed && <Check className="w-4 h-4 text-white" />}
                                            {!task.completed && (
                                                <div className="w-3 h-3 rounded-full bg-violet-500 scale-0 group-hover:scale-50 transition-transform" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={cn(
                                            "text-lg font-medium leading-tight mb-1 truncate transition-all",
                                            task.completed ? "text-muted-foreground line-through" : "text-foreground"
                                        )}>{task.title}</h3>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <FileText className="w-3.5 h-3.5" />
                                            <span className="text-sm">{task.project}</span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 hidden md:block relative">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            ref={(el) => {
                                                if (el) menuButtonRefs.current.set(task.id, el);
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (taskMenuOpen === task.id) {
                                                    setTaskMenuOpen(null);
                                                    setMenuPosition(null);
                                                } else {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setMenuPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                                                    setTaskMenuOpen(task.id);
                                                }
                                            }}>
                                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                </div>
                            </SwipeToReveal>
                        )) : (
                            <div className="text-center py-12 px-4 bg-secondary/20 rounded-[32px] border border-dashed border-border">
                                <p className="text-muted-foreground">{t("noTasks")}</p>
                            </div>
                        )}
                    </div>

                    {!isTaskInfoVisible && (
                        <div className="mt-12 text-center">
                            <Button variant="ghost" className="text-muted-foreground text-sm hover:text-foreground" onClick={() => window.location.reload()}>
                                {t("resetView")}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Drawer open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DrawerContent className="bg-transparent border-none p-0 max-w-2xl mx-auto max-h-[90vh]">
                    <TaskForm
                        onClose={() => { setIsFormOpen(false); setEditingTask(null); }}
                        editingTask={editingTask}
                    />
                </DrawerContent>
            </Drawer>

            {/* Fixed position dropdown menu - rendered outside SwipeToReveal */}
            {taskMenuOpen !== null && menuPosition && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={() => { setTaskMenuOpen(null); setMenuPosition(null); }} />
                    <div
                        className="fixed z-[101] bg-popover border border-border rounded-xl shadow-xl min-w-[120px] py-1 overflow-hidden"
                        style={{ top: menuPosition.top, right: menuPosition.right }}
                    >
                        <button
                            className="w-full px-4 py-2 text-sm text-left hover:bg-secondary flex items-center gap-2"
                            onClick={() => {
                                const task = tasks.find(t => t.id === taskMenuOpen);
                                if (task) {
                                    setEditingTask(task);
                                    setIsFormOpen(true);
                                }
                                setTaskMenuOpen(null);
                                setMenuPosition(null);
                            }}
                        >
                            <Pencil className="w-4 h-4" /> {t("edit")}
                        </button>
                        <button
                            className="w-full px-4 py-2 text-sm text-left hover:bg-secondary flex items-center gap-2 text-rose-500"
                            onClick={() => {
                                if (taskMenuOpen) deleteTask(taskMenuOpen);
                                setTaskMenuOpen(null);
                                setMenuPosition(null);
                            }}
                        >
                            <Trash2 className="w-4 h-4" /> {t("delete")}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

function FilterTab({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <Button
            variant={active ? "default" : "outline"}
            onClick={onClick}
            className={cn(
                "shrink-0 px-5 py-2.5 rounded-full font-medium text-sm h-11 transition-all",
                active ? "bg-secondary text-foreground shadow-sm" : "border-border text-muted-foreground bg-transparent hover:text-foreground"
            )}
        >
            {label}
        </Button>
    );
}

function TaskStatCard({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="bg-secondary/40 border border-border p-4 rounded-2xl">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
            <div className={cn("text-2xl font-bold", color)}>{value}</div>
        </div>
    );
}
