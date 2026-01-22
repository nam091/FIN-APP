"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
    label: string;
    value: string;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function CustomSelect({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    className,
    disabled = false
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(opt => opt.value === value);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between bg-background border border-border rounded-2xl h-12 px-5 text-sm transition-all duration-300",
                    isOpen ? "ring-2 ring-primary/20 border-primary shadow-lg shadow-primary/5" : "hover:border-primary/50",
                    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                )}
            >
                <span className={cn("truncate font-medium", !selectedOption && "text-muted-foreground")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            {/* Dropdown Menu */}
            <div
                className={cn(
                    "absolute top-full left-0 right-0 mt-2 z-[100] bg-background/80 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-top",
                    isOpen ? "opacity-100 scale-y-100 translate-y-0" : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
                    , "no-scrollbar"
                )}
                style={{ maxHeight: "250px", overflowY: "auto" }}
            >
                <div className="p-1.5 flex flex-col gap-1">
                    {options.length > 0 ? (
                        options.map((option) => {
                            const isActive = option.value === value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-foreground hover:bg-secondary/80"
                                    )}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {isActive && <Check className="w-4 h-4 shrink-0" />}
                                </button>
                            );
                        })
                    ) : (
                        <div className="px-4 py-3 text-center text-xs text-muted-foreground italic">
                            No options available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
