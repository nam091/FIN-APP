"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    MoreHorizontal,
    Wallet,
    Search,
    Utensils,
    ShoppingBag,
    Briefcase,
    Car,
    Dumbbell,
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    Coffee,
    Heart,
    Zap,
    Trash2,
    Edit2
} from "lucide-react";
import { useAppState, Transaction } from "@/context/app-state-context";
import { cn } from "@/lib/utils";
import { getLocalDateString } from "@/lib/date-utils";
import {
    Drawer,
    DrawerContent,
} from "@/components/ui/drawer";
import { FinanceForm } from "./finance-form";
import { formatVND } from "@/lib/currency";
import { SwipeToReveal } from "@/components/ui/swipe-to-reveal";

const IconMap: Record<string, any> = {
    Utensils,
    ShoppingBag,
    Briefcase,
    Car,
    Dumbbell,
    Heart,
    Zap,
    Coffee
};

export function FinanceDashboard() {
    const {
        financeFilter,
        setFinanceFilter,
        setActiveTab,
        transactions,
        financeSummary,
        deleteTransaction
    } = useAppState();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);

    const handleEdit = (tx: Transaction) => {
        setEditingTx(tx);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setEditingTx(null);
        setIsFormOpen(true);
    };

    const filteredTransactions = transactions.filter(item => {
        if (financeFilter === "All") return true;
        if (financeFilter === "Income") return item.type === "income";
        if (financeFilter === "Savings") return item.type === "expense" && item.amount > 100;
        return true;
    });

    // Group by date
    const groupedTransactions: Record<string, Transaction[]> = {};
    filteredTransactions.forEach(tx => {
        if (!groupedTransactions[tx.date]) groupedTransactions[tx.date] = [];
        groupedTransactions[tx.date].push(tx);
    });

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));
    const todayStr = getLocalDateString();

    return (
        <div className="flex flex-col h-full bg-background text-foreground overflow-hidden relative w-full">
            <header className="px-6 py-4 flex justify-between items-center shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 rounded-full bg-secondary md:hidden"
                    onClick={() => setActiveTab("home")}
                >
                    <ChevronLeft className="text-muted-foreground w-5 h-5" />
                </Button>
                <div className="md:flex-1" />
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleAdd}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full px-5 h-10 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> New
                    </Button>
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-secondary" onClick={() => setActiveTab("settings")}>
                        <MoreHorizontal className="text-muted-foreground w-5 h-5" />
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar px-6">
                <div className="max-w-4xl mx-auto w-full pb-64 md:pb-32">
                    <div className="flex flex-col mt-2 mb-8">
                        <h1 className="text-5xl font-bold tracking-tight text-foreground">Today</h1>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Income</span>
                                <span className="text-emerald-500 text-xl font-bold">{formatVND(financeSummary.today.income)}</span>
                            </div>
                            <div className="w-px h-8 bg-border" />
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Expense</span>
                                <span className="text-rose-500 text-xl font-bold">-{formatVND(financeSummary.today.expense)}</span>
                            </div>
                            <div className="w-px h-8 bg-border ml-auto" />
                            <div className="flex flex-col items-end">
                                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Balance</span>
                                <span className={cn("text-xl font-bold", financeSummary.today.balance >= 0 ? "text-foreground" : "text-rose-500")}>
                                    {financeSummary.today.balance < 0 ? "-" : ""}{formatVND(Math.abs(financeSummary.today.balance))}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <AggregationCard
                            title="This Week"
                            inflow={financeSummary.week.income}
                            outflow={financeSummary.week.expense}
                            balance={financeSummary.week.balance}
                            accent="indigo"
                        />
                        <AggregationCard
                            title="This Month"
                            inflow={financeSummary.month.income}
                            outflow={financeSummary.month.expense}
                            balance={financeSummary.month.balance}
                            accent="purple"
                        />
                    </div>

                    <div className="flex space-x-2 mb-8 overflow-x-auto no-scrollbar pb-2">
                        <Button variant="ghost" size="icon" className="shrink-0 w-10 h-10 bg-secondary rounded-full">
                            <Search className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <FilterButton
                            label="All transactions"
                            active={financeFilter === "All"}
                            onClick={() => setFinanceFilter("All")}
                        />
                        <FilterButton
                            label="Income"
                            active={financeFilter === "Income"}
                            onClick={() => setFinanceFilter("Income")}
                        />
                        <FilterButton
                            label="Savings"
                            active={financeFilter === "Savings"}
                            onClick={() => setFinanceFilter("Savings")}
                        />
                    </div>

                    <div className="space-y-10">
                        {sortedDates.map((date) => (
                            <div key={date}>
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                                        {date === todayStr ? "Today" : date}
                                    </h3>
                                    <span className="text-[10px] text-muted-foreground/40 font-medium">
                                        {groupedTransactions[date].length} activities
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {groupedTransactions[date].map((item) => (
                                        <SwipeToReveal key={item.id} onDelete={() => deleteTransaction(item.id)}>
                                            <TransactionItem
                                                item={item}
                                                onEdit={() => handleEdit(item)}
                                                onDelete={() => deleteTransaction(item.id)}
                                            />
                                        </SwipeToReveal>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Drawer open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DrawerContent className="bg-transparent border-none p-0 max-w-2xl mx-auto max-h-[90vh]">
                    <FinanceForm
                        editingTransaction={editingTx}
                        onClose={() => setIsFormOpen(false)}
                    />
                </DrawerContent>
            </Drawer>
        </div>
    );
}

function AggregationCard({ title, inflow, outflow, balance, accent }: any) {
    const accentColor = accent === "indigo" ? "text-indigo-400" : "text-purple-400";
    const bgAccent = accent === "indigo" ? "bg-indigo-500/10" : "bg-purple-500/10";

    return (
        <Card className="bg-secondary/40 border border-border rounded-3xl p-5 group hover:border-accent/40 transition-all">
            <div className="flex justify-between items-center mb-4">
                <span className={cn("text-[10px] uppercase font-bold tracking-[0.2em]", accentColor)}>{title}</span>
                <div className={cn("p-1.5 rounded-lg", bgAccent)}>
                    <Wallet className={cn("w-3.5 h-3.5", accentColor)} />
                </div>
            </div>
            <div className="text-3xl font-bold mb-4 tracking-tight">
                {balance < 0 ? "-" : ""}{formatVND(Math.abs(balance))}
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">{formatVND(inflow)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <ArrowDownLeft className="w-3 h-3 text-rose-500" />
                    <span className="text-xs text-muted-foreground">{formatVND(outflow)}</span>
                </div>
            </div>
        </Card>
    );
}

function FilterButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <Button
            variant="ghost"
            onClick={onClick}
            className={cn(
                "shrink-0 px-5 py-2 rounded-full text-sm font-medium h-10 transition-all",
                active ? "bg-secondary-foreground text-secondary" : "bg-secondary/40 text-muted-foreground"
            )}
        >
            {label}
        </Button>
    );
}

function TransactionItem({ item, onEdit, onDelete }: {
    item: Transaction,
    onEdit: () => void,
    onDelete: () => void
}) {
    const Icon = IconMap[item.iconName] || ShoppingBag;
    const isIncome = item.type === "income";

    return (
        <div className="flex items-center group cursor-pointer hover:bg-secondary/40 p-2 py-3 rounded-2xl transition-all relative">
            <div className="w-11 h-11 rounded-full border border-border flex items-center justify-center mr-4 shrink-0 transition-transform group-active:scale-95 bg-secondary/40">
                <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0" onClick={onEdit}>
                <h4 className="text-base font-medium leading-tight truncate">{item.title}</h4>
                <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-1">{item.category}</p>
            </div>
            <div className="flex items-center gap-4">
                <span className={cn(
                    "text-base font-semibold shrink-0 transition-opacity group-hover:opacity-0",
                    isIncome ? "text-emerald-500" : "text-foreground"
                )}>
                    {isIncome ? "+" : "-"}{formatVND(Math.abs(item.amount))}
                </span>
                <div className="absolute right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                    <Button variant="ghost" size="icon" onClick={onEdit} className="w-9 h-9 rounded-full bg-secondary hover:bg-accent text-muted-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-9 h-9 rounded-full bg-secondary hover:bg-rose-500/20 text-rose-500">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
