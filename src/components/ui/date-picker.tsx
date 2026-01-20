"use client";

import React, { useState, useEffect } from "react";
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

    // Parse date string safely (avoid timezone issues)
    const parseDate = (dateStr?: string) => {
        if (!dateStr) return null;
        const [year, month, day] = dateStr.split('-').map(Number);
        return { year, month: month - 1, day }; // month is 0-indexed
    };

    const selectedParsed = parseDate(value);

    const [viewMonth, setViewMonth] = useState(selectedParsed?.month ?? today.getMonth());
    const [viewYear, setViewYear] = useState(selectedParsed?.year ?? today.getFullYear());

    // Update view when value changes
    useEffect(() => {
        if (value) {
            const parsed = parseDate(value);
            if (parsed) {
                setViewMonth(parsed.month);
                setViewYear(parsed.year);
            }
        }
    }, [value]);

    const formatDateToString = (year: number, month: number, day: number) => {
        // Format as YYYY-MM-DD
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const formatDisplayDate = (dateStr?: string) => {
        if (!dateStr) return 'Chọn ngày';
        const parsed = parseDate(dateStr);
        if (!parsed) return 'Chọn ngày';
        return `${parsed.day}/${parsed.month + 1}/${parsed.year}`;
    };

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    const handleSelectDate = (day: number) => {
        const dateString = formatDateToString(viewYear, viewMonth, day);
        onChange(dateString);
        setIsOpen(false);
    };

    const handleTodayClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const dateString = formatDateToString(today.getFullYear(), today.getMonth(), today.getDate());
        onChange(dateString);
        setIsOpen(false);
    };

    const handleTomorrowClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dateString = formatDateToString(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
        onChange(dateString);
        setIsOpen(false);
    };

    const daysInMonth = getDaysInMonth(viewMonth, viewYear);
    const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="w-9 h-9" />);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
        const isSelected = selectedParsed &&
            day === selectedParsed.day &&
            viewMonth === selectedParsed.month &&
            viewYear === selectedParsed.year;

        days.push(
            <button
                key={day}
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectDate(day);
                }}
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
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
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
                <div
                    className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-2xl p-4 shadow-xl z-50 min-w-[280px]"
                    onClick={(e) => e.stopPropagation()}
                >
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
                            onClick={handleTodayClick}
                            className="flex-1"
                        >
                            Hôm nay
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleTomorrowClick}
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
