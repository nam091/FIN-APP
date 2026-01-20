"use client";

import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DatePickerProps {
    value?: string; // YYYY-MM-DD format
    onChange: (date: string) => void;
    className?: string;
}

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

export function DatePicker({ value, onChange, className }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const today = new Date();
    const selectedDate = value ? new Date(value) : null;

    const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? today.getMonth());
    const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear());

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const formatDisplayDate = (dateStr?: string) => {
        if (!dateStr) return 'Chọn ngày';
        const date = new Date(dateStr);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    const handleSelectDate = (day: number) => {
        const date = new Date(viewYear, viewMonth, day);
        onChange(formatDate(date));
        setIsOpen(false);
    };

    const daysInMonth = getDaysInMonth(viewMonth, viewYear);
    const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} />);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
        const isSelected = selectedDate && day === selectedDate.getDate() && viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear();

        days.push(
            <button
                key={day}
                type="button"
                onClick={() => handleSelectDate(day)}
                className={cn(
                    "w-9 h-9 rounded-lg text-sm font-medium transition-all",
                    isSelected
                        ? "bg-primary text-primary-foreground"
                        : isToday
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-secondary text-foreground"
                )}
            >
                {day}
            </button>
        );
    }

    return (
        <div className={cn("relative", className)}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border border-border rounded-2xl hover:border-primary/50 transition-all w-full h-14"
            >
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className={cn(
                    "font-medium",
                    value ? "text-foreground" : "text-muted-foreground"
                )}>
                    {formatDisplayDate(value)}
                </span>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-2xl p-4 shadow-xl z-50 min-w-[280px]">
                    {/* Month/Year Header */}
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handlePrevMonth}
                            className="h-8 w-8"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="font-semibold">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleNextMonth}
                            className="h-8 w-8"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map(day => (
                            <div key={day} className="w-9 h-9 flex items-center justify-center text-xs font-medium text-muted-foreground">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {days}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                onChange(formatDate(today));
                                setIsOpen(false);
                            }}
                            className="flex-1"
                        >
                            Hôm nay
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const tomorrow = new Date(today);
                                tomorrow.setDate(today.getDate() + 1);
                                onChange(formatDate(tomorrow));
                                setIsOpen(false);
                            }}
                            className="flex-1"
                        >
                            Ngày mai
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
