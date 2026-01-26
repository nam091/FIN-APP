"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState, Target } from "@/context/app-state-context";
import { X, Save, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TargetUpdateDrawerProps {
    target: Target;
    onClose: () => void;
}

export function TargetUpdateDrawer({ target, onClose }: TargetUpdateDrawerProps) {
    const { updateTarget, t } = useAppState();
    const [currentAmount, setCurrentAmount] = useState(target.currentAmount.toString());
    const [status, setStatus] = useState(target.status);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateTarget(target.id, {
            currentAmount: parseFloat(currentAmount) || 0,
            status: status
        });
        onClose();
    };

    const STATUS_OPTIONS = [
        { id: "active", icon: TrendingUp, color: "text-emerald-500", label: t("active") },
        { id: "completed", icon: CheckCircle2, color: "text-indigo-500", label: t("completed") },
        { id: "cancelled", icon: XCircle, color: "text-rose-500", label: t("cancelled") },
    ];

    return (
        <div className="flex flex-col bg-background rounded-t-[32px] border-t border-border p-6 pb-10 space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold">{t("updateTarget")}</h2>
                    <p className="text-muted-foreground">{target.name}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                    <X className="w-6 h-6" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">{t("currentAmount")}</label>
                    <div className="relative">
                        <Input
                            value={currentAmount}
                            onChange={(e) => setCurrentAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                            className="bg-secondary/50 border-border rounded-2xl h-16 px-5 text-xl font-bold"
                            inputMode="decimal"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">VND</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">{t("status")}</label>
                    <div className="grid grid-cols-3 gap-3">
                        {STATUS_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setStatus(opt.id)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                                    status === opt.id
                                        ? "bg-secondary border-primary scale-105"
                                        : "bg-secondary/40 border-border text-muted-foreground"
                                )}
                            >
                                <opt.icon className={cn("w-6 h-6", status === opt.id ? opt.color : "")} />
                                <span className="text-xs font-bold">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <Button type="submit" className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                    <Save className="w-5 h-5 mr-2" /> {t("saveChanges")}
                </Button>
            </form>
        </div>
    );
}
