"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BackgroundDotsProps {
    className?: string;
    dotSize?: number;
    gap?: number;
    opacity?: number;
}

export function BackgroundDots({
    className,
    dotSize = 1,
    gap = 30,
    opacity = 0.1
}: BackgroundDotsProps) {
    return (
        <div
            className={cn("absolute inset-0 pointer-events-none", className)}
            style={{
                backgroundImage: `radial-gradient(circle, currentColor ${dotSize}px, transparent ${dotSize}px)`,
                backgroundSize: `${gap}px ${gap}px`,
                opacity: opacity
            }}
            aria-hidden="true"
        />
    );
}
