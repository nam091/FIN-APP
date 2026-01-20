"use client";

import React, { useState, useEffect } from "react";
import { Transaction, useAppState } from "@/context/app-state-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
    Utensils,
    ShoppingBag,
    Briefcase,
    Car,
    Dumbbell,
    Heart,
    Zap,
    Coffee,
    X,
    Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = [
    { name: "Utensils", icon: Utensils },
    { name: "ShoppingBag", icon: ShoppingBag },
    { name: "Briefcase", icon: Briefcase },
    { name: "Car", icon: Car },
    { name: "Dumbbell", icon: Dumbbell },
    { name: "Coffee", icon: Coffee },
    { name: "Heart", icon: Heart },
    { name: "Zap", icon: Zap },
];

interface FinanceFormProps {
    editingTransaction?: Transaction | null;
    onClose: () => void;
}

export function FinanceForm({ editingTransaction, onClose }: FinanceFormProps) {
    const { addTransaction, updateTransaction } = useAppState();

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState<"income" | "expense">("expense");
    const [iconName, setIconName] = useState("ShoppingBag");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (editingTransaction) {
            setTitle(editingTransaction.title);
            setAmount(Math.abs(editingTransaction.amount).toString());
            setCategory(editingTransaction.category);
            setType(editingTransaction.type);
            setIconName(editingTransaction.iconName);
            setDate(editingTransaction.date);
        }
    }, [editingTransaction]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount) return;

        const txData = {
            title,
            amount: parseFloat(amount),
            category: category || (type === "income" ? "Income" : "General"),
            type,
            iconName,
            date
        };

        if (editingTransaction) {
            updateTransaction(editingTransaction.id, txData);
        } else {
            addTransaction(txData);
        }
        onClose();
    };

    return (
        <div className="flex flex-col h-[85vh] md:h-full bg-background rounded-t-[32px] md:rounded-3xl border border-border overflow-hidden">
            {/* Fixed Header */}
            <div className="flex justify-between items-center p-6 pb-4 border-b border-border/50">
                <h2 className="text-2xl font-bold text-foreground">{editingTransaction ? "Edit Transaction" : "New Transaction"}</h2>
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
                <div className="flex gap-2 p-1.5 bg-secondary rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setType("expense")}
                        className={cn(
                            "flex-1 py-3.5 rounded-xl text-sm font-bold transition-all",
                            type === "expense" ? "bg-background text-rose-500 shadow-lg" : "text-muted-foreground"
                        )}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => setType("income")}
                        className={cn(
                            "flex-1 py-3.5 rounded-xl text-sm font-bold transition-all",
                            type === "income" ? "bg-background text-emerald-500 shadow-lg" : "text-muted-foreground"
                        )}
                    >
                        Income
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">Amount</label>
                        <div className="relative">
                            <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                value={amount ? Number(amount).toLocaleString('vi-VN') : ''}
                                onChange={(e) => {
                                    // Remove all non-numeric characters and parse
                                    const rawValue = e.target.value.replace(/[^\d]/g, '');
                                    setAmount(rawValue);
                                }}
                                className="bg-secondary/50 border-border rounded-2xl h-14 px-5 pr-12 focus-visible:ring-indigo-500/30 text-xl font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">đ</span>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">Title</label>
                        <Input
                            placeholder="What was this for?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-secondary/50 border-border rounded-2xl h-14 px-5 focus-visible:ring-indigo-500/30 text-base"
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">Category</label>
                        <Input
                            placeholder="e.g. Food, Transport, Rent"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="bg-secondary/50 border-border rounded-2xl h-14 px-5 focus-visible:ring-indigo-500/30 text-base"
                        />
                    </div>

                    {/* Icon Selection */}
                    <div className="space-y-3">
                        <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">Icon</label>
                        <div className="flex flex-wrap gap-3">
                            {ICONS.map((item) => (
                                <button
                                    key={item.name}
                                    type="button"
                                    onClick={() => setIconName(item.name)}
                                    className={cn(
                                        "w-14 h-14 rounded-2xl border flex items-center justify-center transition-all",
                                        iconName === item.name
                                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105"
                                            : "bg-secondary border-border text-muted-foreground hover:border-accent hover:scale-105"
                                    )}
                                >
                                    <item.icon className="w-6 h-6" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date - Custom DatePicker */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> Date
                        </label>
                        <DatePicker value={date} onChange={setDate} />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 pb-2">
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold h-16 rounded-2xl text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {editingTransaction ? "Save Changes" : "Create Transaction"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
