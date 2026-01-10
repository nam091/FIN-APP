"use client";

import React from "react";
import { useAppState } from "@/context/app-state-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    Clock,
    FileText,
    Lightbulb,
    ArrowRight,
    Sparkles,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatVND, formatVNDShort } from "@/lib/currency";

export function HomeDashboard() {
    const { setActiveTab, transactions, tasks } = useAppState();

    // Calculate financial summary
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => t.date === todayStr);
    const todayIncome = todayTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const todayExpense = todayTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const balance = todayIncome - todayExpense;

    // Task summary
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = tasks.filter(t => !t.completed).length;

    return (
        <div className="flex flex-col h-full w-full bg-background text-foreground overflow-hidden relative">
            {/* Header */}
            <header className="px-6 pt-12 pb-4 z-40 shrink-0">
                <div className="max-w-4xl mx-auto w-full">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setActiveTab("settings")}
                            className="md:hidden w-10 h-10 rounded-full hover:bg-secondary"
                        >
                            <Settings className="w-5 h-5 text-muted-foreground" />
                        </Button>
                    </div>
                    <p className="text-muted-foreground text-sm">Overview of your finances, tasks, and notes</p>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-32">
                <div className="max-w-4xl mx-auto w-full space-y-8">

                    {/* Finance Overview */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-indigo-500" />
                                Today's Finance
                            </h2>
                            <Button
                                variant="ghost"
                                className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1"
                                onClick={() => setActiveTab("finance")}
                            >
                                View All <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="bg-secondary/50 border-border rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    <span className="text-muted-foreground text-xs uppercase font-bold">Income</span>
                                </div>
                                <span className="text-xl font-bold text-emerald-500">{formatVNDShort(todayIncome)}</span>
                            </Card>
                            <Card className="bg-secondary/50 border-border rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="w-4 h-4 text-rose-500" />
                                    <span className="text-muted-foreground text-xs uppercase font-bold">Expense</span>
                                </div>
                                <span className="text-xl font-bold text-rose-500">-{formatVNDShort(todayExpense)}</span>
                            </Card>
                            <Card className="bg-secondary/50 border-border rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Wallet className="w-4 h-4 text-indigo-500" />
                                    <span className="text-muted-foreground text-xs uppercase font-bold">Balance</span>
                                </div>
                                <span className={cn("text-xl font-bold", balance >= 0 ? "text-foreground" : "text-rose-500")}>
                                    {balance < 0 ? "-" : ""}{formatVNDShort(Math.abs(balance))}
                                </span>
                            </Card>
                        </div>
                    </section>

                    {/* Tasks Overview */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-violet-500" />
                                Tasks
                            </h2>
                            <Button
                                variant="ghost"
                                className="text-zinc-500 hover:text-white text-sm flex items-center gap-1"
                                onClick={() => setActiveTab("tasks")}
                            >
                                View All <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-emerald-500/10 border-emerald-500/30 rounded-2xl p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <span className="text-3xl font-bold text-emerald-500">{completedTasks}</span>
                                        <p className="text-muted-foreground text-sm">Completed</p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="bg-amber-500/10 border-amber-500/30 rounded-2xl p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <div>
                                        <span className="text-3xl font-bold text-amber-500">{pendingTasks}</span>
                                        <p className="text-muted-foreground text-sm">Pending</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </section>

                    {/* Notes Overview */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-purple-500" />
                                Notes
                            </h2>
                            <Button
                                variant="ghost"
                                className="text-zinc-500 hover:text-white text-sm flex items-center gap-1"
                                onClick={() => setActiveTab("notes")}
                            >
                                View All <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-purple-500/10 border-purple-500/30 rounded-2xl p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <div>
                                        <span className="text-3xl font-bold text-purple-500">3</span>
                                        <p className="text-zinc-500 text-sm">Total Notes</p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="bg-pink-500/10 border-pink-500/30 rounded-2xl p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                                        <Lightbulb className="w-6 h-6 text-pink-500" />
                                    </div>
                                    <div>
                                        <span className="text-3xl font-bold text-pink-500">1</span>
                                        <p className="text-muted-foreground text-sm">Ideas</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </section>

                    {/* AI Assistant Quick Access */}
                    <section>
                        <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30 rounded-3xl p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                                    <Sparkles className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-foreground">AI Assistant</h3>
                                    <p className="text-muted-foreground text-sm">Ask me anything about your finances or tasks</p>
                                </div>
                                <Button
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
                                    onClick={() => setActiveTab("ai")}
                                >
                                    Open Chat
                                </Button>
                            </div>
                        </Card>
                    </section>
                </div>
            </div>
        </div>
    );
}
