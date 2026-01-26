"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ArrowUpAz,
    Plus,
    Target,
    TrendingUp,
    Calendar,
    CheckCircle2,
    MoreVertical,
    Pencil,
    Trash2,
    Settings,
    Search,
    Download,
    PiggyBank,
    ShoppingBag,
    Car,
    Home as HomeIcon,
    GraduationCap,
    Plane,
    Gift,
    Sparkles
} from "lucide-react";
import { useAppState, Target as TargetType } from "@/context/app-state-context";
import { cn } from "@/lib/utils";
import {
    Drawer,
    DrawerContent,
} from "@/components/ui/drawer";
import { TargetForm } from "./target-form";
import { SwipeToReveal } from "@/components/ui/swipe-to-reveal";
import { useRef } from "react";
import { BackgroundDots } from "@/components/ui/background-dots";

const CATEGORY_ICONS: Record<string, any> = {
    savings: PiggyBank,
    shopping: ShoppingBag,
    car: Car,
    home: HomeIcon,
    education: GraduationCap,
    travel: Plane,
    gift: Gift,
    other: Sparkles,
};

const CATEGORY_COLORS: Record<string, string> = {
    savings: "text-emerald-500",
    shopping: "text-pink-500",
    car: "text-blue-500",
    home: "text-amber-500",
    education: "text-violet-500",
    travel: "text-cyan-500",
    gift: "text-rose-500",
    other: "text-indigo-500",
};

// Map category id to translation key
const CATEGORY_TRANSLATION_KEYS: Record<string, string> = {
    savings: "savings",
    shopping: "shopping",
    car: "car",
    home: "homeCategory",
    education: "education",
    travel: "travel",
    gift: "gift",
    other: "other",
};

export function TargetList() {
    const { setActiveTab, targets, deleteTarget, dismissedItems, dismissItem, t } = useAppState();
    const [filter, setFilter] = useState("All");
    const [sortBy, setSortBy] = useState<"created" | "name" | "deadline" | "progress">("created");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTarget, setEditingTarget] = useState<TargetType | null>(null);
    const [targetMenuOpen, setTargetMenuOpen] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
    const menuButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    const isInfoCardVisible = !dismissedItems.includes("target-info-card");

    const filteredTargets = targets.filter(target => {
        if (filter === "All") return true;
        if (filter === "Active") return target.status === "active";
        if (filter === "Completed") return target.status === "completed";
        if (filter === "Cancelled") return target.status === "cancelled";
        return true;
    });

    // Sort targets
    const sortedTargets = [...filteredTargets].sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "deadline") return (a.deadline || "").localeCompare(b.deadline || "");
        if (sortBy === "progress") {
            const progressA = a.targetAmount > 0 ? (a.currentAmount / a.targetAmount) : 0;
            const progressB = b.targetAmount > 0 ? (b.currentAmount / b.targetAmount) : 0;
            return progressB - progressA;
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    const cycleSortBy = () => {
        const options: ("created" | "name" | "deadline" | "progress")[] = ["created", "name", "deadline", "progress"];
        const currentIndex = options.indexOf(sortBy);
        setSortBy(options[(currentIndex + 1) % options.length]);
    };

    const getSortLabel = () => {
        if (sortBy === "name") return t("name");
        if (sortBy === "deadline") return t("deadline");
        if (sortBy === "progress") return t("progress");
        return t("created");
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(targets, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'targets_export.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleAddTarget = () => {
        setEditingTarget(null);
        setIsFormOpen(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getProgress = (target: TargetType) => {
        if (target.targetAmount <= 0) return 0;
        return Math.min(100, Math.round((target.currentAmount / target.targetAmount) * 100));
    };

    // Summary stats
    const activeTargets = targets.filter(t => t.status === "active");
    const completedTargets = targets.filter(t => t.status === "completed");
    const totalTargetAmount = activeTargets.reduce((sum, t) => sum + t.targetAmount, 0);
    const totalCurrentAmount = activeTargets.reduce((sum, t) => sum + t.currentAmount, 0);

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
                        onClick={handleAddTarget}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full px-5 h-10 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> {t("addTarget")}
                    </Button>
                    <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-muted-foreground h-10" onClick={cycleSortBy}>
                        <ArrowUpAz className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium hidden md:inline">{getSortLabel()}</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-secondary" onClick={() => setActiveTab("settings")}>
                        <Settings className="text-muted-foreground w-5 h-5" />
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar px-6">
                <div className="max-w-4xl mx-auto w-full pb-72 md:pb-20">
                    <h1 className="text-5xl font-extrabold tracking-tight mb-6 mt-4">{t("targets")}</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {isInfoCardVisible && (
                            <div className="bg-secondary/80 border border-border p-6 rounded-[32px] flex flex-col justify-between transition-all animate-in fade-in slide-in-from-top-4">
                                <div className="flex gap-4 mb-6">
                                    <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                                        <Target className="w-7 h-7" />
                                    </div>
                                    <p className="text-muted-foreground text-lg leading-snug">
                                        {t("targetOverview")}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        variant="ghost"
                                        className="flex-1 py-3 px-4 rounded-full bg-background border border-border text-muted-foreground font-semibold text-sm h-12"
                                        onClick={() => alert("Target tips: Set realistic goals and track your progress!")}
                                    >
                                        {t("learnMore")}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="flex-1 py-3 px-4 rounded-full bg-background border border-border text-muted-foreground font-semibold text-sm h-12"
                                        onClick={() => dismissItem("target-info-card")}
                                    >
                                        {t("dismiss")}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className={cn("hidden lg:grid grid-cols-2 gap-4", !isInfoCardVisible && "lg:col-span-2 lg:grid-cols-4")}>
                            <TargetStatCard label={t("activeTargets")} value={activeTargets.length.toString()} color="text-emerald-500" />
                            <TargetStatCard label={t("completed")} value={completedTargets.length.toString()} color="text-indigo-500" />
                            <TargetStatCard label={t("totalTarget")} value={formatCurrency(totalTargetAmount)} color="text-amber-500" small />
                            <TargetStatCard label={t("totalSaved")} value={formatCurrency(totalCurrentAmount)} color="text-cyan-500" small />
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
                                title="Export Targets"
                            >
                                <Download className="text-muted-foreground w-5 h-5" />
                            </Button>
                        </div>
                        <FilterTab label={t("all")} active={filter === "All"} onClick={() => setFilter("All")} />
                        <FilterTab label={t("active")} active={filter === "Active"} onClick={() => setFilter("Active")} />
                        <FilterTab label={t("completed")} active={filter === "Completed"} onClick={() => setFilter("Completed")} />
                        <FilterTab label={t("cancelled")} active={filter === "Cancelled"} onClick={() => setFilter("Cancelled")} />
                    </div>

                    <div className="space-y-3">
                        {sortedTargets.length > 0 ? sortedTargets.map((target) => {
                            const progress = getProgress(target);
                            const CategoryIcon = CATEGORY_ICONS[target.category] || Target;
                            const categoryColor = CATEGORY_COLORS[target.category] || "text-gray-500";

                            return (
                                <SwipeToReveal
                                    key={target.id}
                                    onDelete={() => deleteTarget(target.id)}
                                    onEdit={() => {
                                        setEditingTarget(target);
                                        setIsFormOpen(true);
                                    }}
                                >
                                    <div className="flex flex-col gap-3 group cursor-pointer bg-secondary/40 backdrop-blur-xl border border-border hover:border-foreground/20 p-5 rounded-3xl transition-all">
                                        <div className="flex items-start gap-4">
                                            <div className={cn("shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-secondary", categoryColor)}>
                                                <CategoryIcon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className={cn(
                                                        "text-lg font-semibold leading-tight truncate",
                                                        target.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"
                                                    )}>{target.name}</h3>
                                                    {target.status === "completed" && (
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 ml-2" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <span className={categoryColor}>{t(CATEGORY_TRANSLATION_KEYS[target.category] as any) || target.category}</span>
                                                    {target.deadline && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {target.deadline}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="shrink-0 hidden md:block relative">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
                                                    ref={(el) => {
                                                        if (el) menuButtonRefs.current.set(target.id, el);
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (targetMenuOpen === target.id) {
                                                            setTargetMenuOpen(null);
                                                            setMenuPosition(null);
                                                        } else {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setMenuPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                                                            setTargetMenuOpen(target.id);
                                                        }
                                                    }}>
                                                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">{formatCurrency(target.currentAmount)}</span>
                                                <span className="font-semibold text-foreground">{formatCurrency(target.targetAmount)}</span>
                                            </div>
                                            <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500",
                                                        progress >= 100 ? "bg-emerald-500" : progress >= 50 ? "bg-amber-500" : "bg-indigo-500"
                                                    )}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                                <span>{progress}% {t("completed").toLowerCase()}</span>
                                                <span>{formatCurrency(target.targetAmount - target.currentAmount)} {t("remaining")}</span>
                                            </div>
                                        </div>
                                    </div>
                                </SwipeToReveal>
                            );
                        }) : (
                            <div className="text-center py-12 px-4 bg-secondary/20 rounded-[32px] border border-dashed border-border">
                                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                                <p className="text-muted-foreground">{t("noTargets")}</p>
                            </div>
                        )}
                    </div>

                    {!isInfoCardVisible && (
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
                    <TargetForm
                        onClose={() => { setIsFormOpen(false); setEditingTarget(null); }}
                        editingTarget={editingTarget}
                    />
                </DrawerContent>
            </Drawer>

            {/* Fixed position dropdown menu */}
            {targetMenuOpen !== null && menuPosition && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={() => { setTargetMenuOpen(null); setMenuPosition(null); }} />
                    <div
                        className="fixed z-[101] bg-popover border border-border rounded-xl shadow-xl min-w-[120px] py-1 overflow-hidden"
                        style={{ top: menuPosition.top, right: menuPosition.right }}
                    >
                        <button
                            className="w-full px-4 py-2 text-sm text-left hover:bg-secondary flex items-center gap-2"
                            onClick={() => {
                                const target = targets.find(t => t.id === targetMenuOpen);
                                if (target) {
                                    setEditingTarget(target);
                                    setIsFormOpen(true);
                                }
                                setTargetMenuOpen(null);
                                setMenuPosition(null);
                            }}
                        >
                            <Pencil className="w-4 h-4" /> {t("edit")}
                        </button>
                        <button
                            className="w-full px-4 py-2 text-sm text-left hover:bg-secondary flex items-center gap-2 text-rose-500"
                            onClick={() => {
                                if (targetMenuOpen) deleteTarget(targetMenuOpen);
                                setTargetMenuOpen(null);
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

function TargetStatCard({ label, value, color, small }: { label: string, value: string, color: string, small?: boolean }) {
    return (
        <div className="bg-secondary/40 border border-border p-4 rounded-2xl">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
            <div className={cn("font-bold", color, small ? "text-lg" : "text-2xl")}>{value}</div>
        </div>
    );
}
