"use client";

import React, { useState } from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TimePickerProps {
    value?: string; // HH:mm format
    onChange: (time: string) => void;
    className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Parse initial values
    const parseTime = (timeStr?: string) => {
        if (!timeStr) return { hours: 9, minutes: 0 };
        const [h, m] = timeStr.split(':').map(Number);
        return { hours: h || 9, minutes: m || 0 };
    };

    const [hours, setHours] = useState(parseTime(value).hours);
    const [minutes, setMinutes] = useState(parseTime(value).minutes);

    const formatTime = (h: number, m: number) => {
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const adjustHours = (delta: number) => {
        const newHours = (hours + delta + 24) % 24;
        setHours(newHours);
        onChange(formatTime(newHours, minutes));
    };

    const adjustMinutes = (delta: number) => {
        const newMinutes = (minutes + delta + 60) % 60;
        setMinutes(newMinutes);
        onChange(formatTime(hours, newMinutes));
    };

    const displayTime = formatTime(hours, minutes);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return (
        <div className={cn("relative", className)}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border border-border rounded-2xl hover:border-primary/50 transition-all w-full"
            >
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground font-medium">{displayHours}:{minutes.toString().padStart(2, '0')} {period}</span>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-2xl p-4 shadow-xl z-50">
                    <div className="flex items-center justify-center gap-4">
                        {/* Hours */}
                        <div className="flex flex-col items-center">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => adjustHours(1)}
                                className="h-8 w-8"
                            >
                                <ChevronUp className="w-4 h-4" />
                            </Button>
                            <span className="text-3xl font-bold w-14 text-center">{displayHours.toString().padStart(2, '0')}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => adjustHours(-1)}
                                className="h-8 w-8"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </div>

                        <span className="text-2xl font-bold text-muted-foreground">:</span>

                        {/* Minutes */}
                        <div className="flex flex-col items-center">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => adjustMinutes(5)}
                                className="h-8 w-8"
                            >
                                <ChevronUp className="w-4 h-4" />
                            </Button>
                            <span className="text-3xl font-bold w-14 text-center">{minutes.toString().padStart(2, '0')}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => adjustMinutes(-5)}
                                className="h-8 w-8"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* AM/PM */}
                        <div className="flex flex-col items-center gap-1">
                            <button
                                type="button"
                                onClick={() => {
                                    if (hours >= 12) {
                                        const newHours = hours - 12;
                                        setHours(newHours);
                                        onChange(formatTime(newHours, minutes));
                                    }
                                }}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-sm font-medium transition-all",
                                    hours < 12 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                )}
                            >
                                AM
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (hours < 12) {
                                        const newHours = hours + 12;
                                        setHours(newHours);
                                        onChange(formatTime(newHours, minutes));
                                    }
                                }}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-sm font-medium transition-all",
                                    hours >= 12 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                )}
                            >
                                PM
                            </button>
                        </div>
                    </div>

                    <Button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="w-full mt-4 bg-primary hover:bg-primary/90"
                    >
                        Done
                    </Button>
                </div>
            )}
        </div>
    );
}
