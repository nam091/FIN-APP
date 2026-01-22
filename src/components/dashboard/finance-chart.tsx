"use client";

import React, { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import { useAppState, Transaction } from "@/context/app-state-context";
import { format, subDays, subWeeks, subMonths, startOfWeek, startOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatVND } from "@/lib/currency";

type PeriodType = "day" | "week" | "month";
type DisplayType = "all" | "income" | "expense";

interface FinanceChartProps {
    transactions: Transaction[];
}

export function FinanceChart({ transactions }: FinanceChartProps) {
    const { userSettings, t } = useAppState();
    const [period, setPeriod] = useState<PeriodType>("day");
    const [displayType, setDisplayType] = useState<DisplayType>("all");

    const isDark = userSettings.theme === "dark" || (userSettings.theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    const data = useMemo(() => {
        const now = new Date();
        let intervals: { start: Date; end: Date; label: string }[] = [];

        if (period === "day") {
            // Last 7 days
            const days = Array.from({ length: 7 }, (_, i) => {
                const d = subDays(now, 6 - i);
                return {
                    start: new Date(d.setHours(0, 0, 0, 0)),
                    end: new Date(new Date(d).setHours(23, 59, 59, 999)),
                    label: format(d, "EEE"),
                };
            });
            intervals = days;
        } else if (period === "week") {
            // Last 4 weeks
            const weeks = Array.from({ length: 4 }, (_, i) => {
                const weekStart = startOfWeek(subWeeks(now, 3 - i), { weekStartsOn: 1 });
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);
                return {
                    start: weekStart,
                    end: weekEnd,
                    label: `W${format(weekStart, "w")}`,
                };
            });
            intervals = weeks;
        } else {
            // Last 6 months
            const months = Array.from({ length: 6 }, (_, i) => {
                const monthStart = startOfMonth(subMonths(now, 5 - i));
                const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999);
                return {
                    start: monthStart,
                    end: monthEnd,
                    label: format(monthStart, "MMM"),
                };
            });
            intervals = months;
        }

        return intervals.map((interval) => {
            let income = 0;
            let expense = 0;

            transactions.forEach((tx) => {
                const txDate = new Date(tx.date);
                if (txDate >= interval.start && txDate <= interval.end) {
                    if (tx.type === "income") {
                        income += tx.amount;
                    } else {
                        expense += Math.abs(tx.amount);
                    }
                }
            });

            return {
                name: interval.label,
                income: income,
                expense: expense,
            };
        });
    }, [transactions, period]);

    const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
    const totalExpense = data.reduce((sum, d) => sum + d.expense, 0);

    return (
        <Card className="p-6 rounded-3xl bg-secondary/20 border-border backdrop-blur-xl">
            {/* Header with filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-primary" />
                        {t("financeOverview") || "Finance Overview"}
                    </h3>
                    <p className="text-xs text-muted-foreground">{t("incomeExpenseChart") || "Income & Expense over time"}</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    {/* Period Filter */}
                    <div className="flex bg-secondary rounded-full p-1">
                        {(["day", "week", "month"] as PeriodType[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${period === p
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {p === "day" ? "7D" : p === "week" ? "4W" : "6M"}
                            </button>
                        ))}
                    </div>

                    {/* Display Type Filter */}
                    <div className="flex bg-secondary rounded-full p-1">
                        <button
                            onClick={() => setDisplayType("all")}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${displayType === "all"
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setDisplayType("income")}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1 ${displayType === "income"
                                ? "bg-emerald-500 text-white"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <TrendingUp className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => setDisplayType("expense")}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1 ${displayType === "expense"
                                ? "bg-rose-500 text-white"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <TrendingDown className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-emerald-500 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase">{t("income") || "Income"}</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-500">+{formatVND(totalIncome)}</p>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-rose-500 mb-1">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase">{t("expense") || "Expense"}</span>
                    </div>
                    <p className="text-xl font-bold text-rose-500">-{formatVND(totalExpense)}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#e5e5e5"} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 10 }}
                            tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? "#1f2937" : "#fff",
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            }}
                            formatter={(value: any, name: any) => [formatVND(Number(value) || 0), name === "income" ? "Income" : "Expense"]}
                        />
                        {(displayType === "all" || displayType === "income") && (
                            <Bar
                                dataKey="income"
                                name="Income"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                            />
                        )}
                        {(displayType === "all" || displayType === "expense") && (
                            <Bar
                                dataKey="expense"
                                name="Expense"
                                fill="#f43f5e"
                                radius={[4, 4, 0, 0]}
                            />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
