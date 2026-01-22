"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/context/app-state-context";

interface TrackerCalendarProps {
    entries: any[];
    month?: number;
    year?: number;
}

export function TrackerCalendar({ entries, month, year }: TrackerCalendarProps) {
    const { t, userSettings } = useAppState();
    const today = new Date();
    const currentMonth = month !== undefined ? month : today.getMonth();
    const currentYear = year !== undefined ? year : today.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

    const days = [...Array(daysInMonth)].map((_, i) => i + 1);
    const blanks = [...Array(firstDayOfMonth)].map((_, i) => i);

    return (
        <div className="p-4 bg-card rounded-xl border border-border w-full max-w-sm">
            <h3 className="text-center font-bold mb-4">
                {new Date(currentYear, currentMonth).toLocaleString(userSettings.language === "vi" ? 'vi-VN' : 'en-US', { month: 'long' })} {currentYear}
            </h3>
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-muted-foreground">
                <div>{t("sun")}</div><div>{t("mon")}</div><div>{t("tue")}</div><div>{t("wed")}</div><div>{t("thu")}</div><div>{t("fri")}</div><div>{t("sat")}</div>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {blanks.map(i => <div key={`blank-${i}`} />)}
                {days.map(day => {
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const hasEntry = entries.some(e => e.date === dateStr && e.value > 0);
                    const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;

                    return (
                        <div
                            key={day}
                            className={cn(
                                "aspect-square flex items-center justify-center rounded-lg text-sm transition-all",
                                hasEntry
                                    ? "bg-green-500 text-white font-bold"
                                    : "bg-secondary/50 text-muted-foreground",
                                isToday && !hasEntry && "border border-primary text-primary"
                            )}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
