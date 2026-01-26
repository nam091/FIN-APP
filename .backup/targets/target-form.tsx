"use client";

import React, { useState, useEffect } from "react";
import { useAppState, Target } from "@/context/app-state-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
    X,
    Target as TargetIcon,
    PiggyBank,
    ShoppingBag,
    Car,
    Home,
    GraduationCap,
    Plane,
    Gift,
    Sparkles,
    Calendar,
    TrendingUp,
    CheckCircle2,
    XCircle,
    ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TargetFormProps {
    onClose: () => void;
    editingTarget?: Target | null;
}

const TARGET_CATEGORIES = [
    { id: "savings", labelKey: "savings", icon: PiggyBank, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500" },
    { id: "shopping", labelKey: "shopping", icon: ShoppingBag, color: "text-pink-500 bg-pink-500/10 border-pink-500" },
    { id: "car", labelKey: "car", icon: Car, color: "text-blue-500 bg-blue-500/10 border-blue-500" },
    { id: "home", labelKey: "homeCategory", icon: Home, color: "text-amber-500 bg-amber-500/10 border-amber-500" },
    { id: "education", labelKey: "education", icon: GraduationCap, color: "text-violet-500 bg-violet-500/10 border-violet-500" },
    { id: "travel", labelKey: "travel", icon: Plane, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500" },
    { id: "gift", labelKey: "gift", icon: Gift, color: "text-rose-500 bg-rose-500/10 border-rose-500" },
    { id: "other", labelKey: "other", icon: Sparkles, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500" },
] as const;

const TARGET_STATUS = [
    { id: "active", labelKey: "active", icon: TrendingUp, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500" },
    { id: "completed", labelKey: "completed", icon: CheckCircle2, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500" },
    { id: "cancelled", labelKey: "cancelled", icon: XCircle, color: "text-rose-500 bg-rose-500/10 border-rose-500" },
] as const;

export function TargetForm({ onClose, editingTarget }: TargetFormProps) {
    const { addTarget, updateTarget, t } = useAppState();

    const [name, setName] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [currentAmount, setCurrentAmount] = useState("");
    const [deadline, setDeadline] = useState("");
    const [category, setCategory] = useState("savings");
    const [status, setStatus] = useState("active");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [openPicker, setOpenPicker] = useState<"date" | null>(null);

    // Pre-fill form when editing
    useEffect(() => {
        if (editingTarget) {
            setName(editingTarget.name);
            setTargetAmount(editingTarget.targetAmount.toString());
            setCurrentAmount(editingTarget.currentAmount.toString());
            setDeadline(editingTarget.deadline || "");
            setCategory(editingTarget.category);
            setStatus(editingTarget.status);
            setShowAdvanced(true);
        }
    }, [editingTarget]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !targetAmount) return;

        const targetData = {
            name,
            targetAmount: parseFloat(targetAmount) || 0,
            currentAmount: parseFloat(currentAmount) || 0,
            deadline: deadline || undefined,
            category,
            status,
        };

        if (editingTarget) {
            updateTarget(editingTarget.id, targetData);
        } else {
            addTarget(targetData);
        }

        onClose();
    };

    const formatCurrencyInput = (value: string) => {
        // Remove non-numeric characters except decimal point
        const numericValue = value.replace(/[^0-9]/g, '');
        return numericValue;
    };

    const isEditing = !!editingTarget;

    return (
        <div className="flex flex-col h-[85vh] md:h-full bg-background rounded-t-[32px] md:rounded-3xl border border-border overflow-hidden">
            {/* Fixed Header */}
            <div className="flex justify-between items-center p-6 pb-4 border-b border-border/50">
                <h2 className="text-2xl font-bold text-foreground">{isEditing ? t("editTarget") : t("newTarget")}</h2>
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
                {/* Name */}
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">{t("targetName")}</label>
                    <Input
                        placeholder={t("targetNamePlaceholder")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-secondary/50 border-border rounded-2xl h-16 px-5 focus-visible:ring-primary/30 text-lg"
                        autoFocus
                    />
                </div>

                {/* Target Amount */}
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">{t("targetAmount")}</label>
                    <div className="relative">
                        <Input
                            placeholder="0"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(formatCurrencyInput(e.target.value))}
                            className="bg-secondary/50 border-border rounded-2xl h-14 px-5 pr-16 focus-visible:ring-primary/30 text-base"
                            type="text"
                            inputMode="numeric"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">VND</span>
                    </div>
                </div>

                {/* Current Amount */}
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">{t("currentAmount")}</label>
                    <div className="relative">
                        <Input
                            placeholder="0"
                            value={currentAmount}
                            onChange={(e) => setCurrentAmount(formatCurrencyInput(e.target.value))}
                            className="bg-secondary/50 border-border rounded-2xl h-14 px-5 pr-16 focus-visible:ring-primary/30 text-base"
                            type="text"
                            inputMode="numeric"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">VND</span>
                    </div>
                </div>

                {/* Category */}
                <div className="space-y-3">
                    <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">{t("category")}</label>
                    <div className="grid grid-cols-4 gap-3">
                        {TARGET_CATEGORIES.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setCategory(item.id)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                                    category === item.id
                                        ? item.color + " scale-105"
                                        : "bg-secondary border-border text-muted-foreground hover:border-accent hover:scale-105"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-xs font-semibold truncate w-full text-center">{t(item.labelKey as any)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {t("deadline")}
                    </label>
                    <DatePicker
                        value={deadline}
                        onChange={setDeadline}
                        isOpen={openPicker === "date"}
                        onOpenChange={(open) => {
                            if (open) setOpenPicker("date");
                            else if (openPicker === "date") setOpenPicker(null);
                        }}
                    />
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
                        {/* Status */}
                        <div className="space-y-3">
                            <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">{t("status")}</label>
                            <div className="grid grid-cols-3 gap-3">
                                {TARGET_STATUS.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setStatus(item.id)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                                            status === item.id
                                                ? item.color + " scale-105"
                                                : "bg-secondary border-border text-muted-foreground hover:border-accent hover:scale-105"
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="text-xs font-semibold">{t(item.labelKey as any)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-4 pb-2">
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold h-16 rounded-2xl text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isEditing ? t("saveChanges") : t("addTarget")}
                    </Button>
                </div>
            </form>
        </div>
    );
}
