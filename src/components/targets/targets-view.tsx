"use client";

import React from "react";
import { useAppState } from "@/context/app-state-context";
import { Target, TrendingUp, CheckCircle2, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function TargetsView() {
    const { targets, setActiveTab, t } = useAppState();

    const activeTargets = targets.filter(t => t.status === "active");
    const completedCount = targets.filter(t => t.status === "completed").length;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getProgress = (target: { currentAmount: number; targetAmount: number }) => {
        if (target.targetAmount <= 0) return 0;
        return Math.min(100, Math.round((target.currentAmount / target.targetAmount) * 100));
    };

    // Get top 3 active targets by progress
    const topTargets = [...activeTargets]
        .sort((a, b) => getProgress(b) - getProgress(a))
        .slice(0, 3);

    const totalTargetAmount = activeTargets.reduce((sum, t) => sum + t.targetAmount, 0);
    const totalCurrentAmount = activeTargets.reduce((sum, t) => sum + t.currentAmount, 0);
    const overallProgress = totalTargetAmount > 0 ? Math.round((totalCurrentAmount / totalTargetAmount) * 100) : 0;

    return (
        <div className="bg-secondary/40 border border-border rounded-[28px] p-6 hover:border-foreground/10 transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">{t("targets")}</h3>
                        <p className="text-xs text-muted-foreground">
                            {activeTargets.length} {t("active").toLowerCase()} • {completedCount} {t("completed").toLowerCase()}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setActiveTab("targets")}
                >
                    {t("viewAll")}
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>

            {/* Overall progress */}
            {activeTargets.length > 0 && (
                <div className="mb-4 p-4 bg-background/50 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">{t("overallProgress")}</span>
                        <span className="text-sm font-semibold text-foreground">{overallProgress}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-500",
                                overallProgress >= 100 ? "bg-emerald-500" : overallProgress >= 50 ? "bg-amber-500" : "bg-indigo-500"
                            )}
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                        <span>{formatCurrency(totalCurrentAmount)}</span>
                        <span>{formatCurrency(totalTargetAmount)}</span>
                    </div>
                </div>
            )}

            {/* Top targets */}
            <div className="space-y-3">
                {topTargets.length > 0 ? topTargets.map((target) => {
                    const progress = getProgress(target);
                    return (
                        <div
                            key={target.id}
                            className="flex items-center gap-3 p-3 bg-background/50 rounded-xl cursor-pointer hover:bg-background/80 transition-all"
                            onClick={() => setActiveTab("targets")}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold",
                                progress >= 100 ? "bg-emerald-500/20 text-emerald-500" :
                                    progress >= 50 ? "bg-amber-500/20 text-amber-500" :
                                        "bg-indigo-500/20 text-indigo-500"
                            )}>
                                {progress}%
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground text-sm truncate">{target.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{formatCurrency(target.currentAmount)}</span>
                                    <span>/</span>
                                    <span>{formatCurrency(target.targetAmount)}</span>
                                </div>
                            </div>
                            {target.deadline && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    {target.deadline}
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>{t("noTargets")}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-emerald-500 hover:text-emerald-400"
                            onClick={() => setActiveTab("targets")}
                        >
                            {t("addTarget")}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
