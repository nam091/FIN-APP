"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SwipeNavWrapperProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    tabs: string[];
}

export function SwipeNavWrapper({
    children,
    activeTab,
    onTabChange,
    tabs
}: SwipeNavWrapperProps) {
    const startXRef = useRef(0);
    const startYRef = useRef(0);
    const isHorizontalSwipe = useRef(false);

    // State to track direction for animation
    const [prevIndex, setPrevIndex] = useState(tabs.indexOf(activeTab));
    const [direction, setDirection] = useState<"left" | "right" | null>(null);

    useEffect(() => {
        const newIndex = tabs.indexOf(activeTab);
        if (newIndex > prevIndex) setDirection("left");
        else if (newIndex < prevIndex) setDirection("right");
        setPrevIndex(newIndex);
    }, [activeTab, tabs]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        // Prevent swipe on sliders or horizontal scrolling elements
        const target = e.target as HTMLElement;
        const isSwipeToReveal = target.closest('[data-swipe-to-reveal="true"]');
        const isHorizontalScroll = target.closest('.overflow-x-auto');

        if (isSwipeToReveal || isHorizontalScroll) {
            startXRef.current = 0;
            return;
        }

        startXRef.current = e.touches[0].clientX;
        startYRef.current = e.touches[0].clientY;
        isHorizontalSwipe.current = false;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (startXRef.current === 0) return;

        const deltaX = e.touches[0].clientX - startXRef.current;
        const deltaY = e.touches[0].clientY - startYRef.current;

        // Determine if it's a horizontal swipe on the first few pixels of move
        if (!isHorizontalSwipe.current && Math.abs(deltaX) > 10) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                isHorizontalSwipe.current = true;
            } else {
                // Vertical scroll, ignore swipe
                startXRef.current = 0;
            }
        }
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (startXRef.current === 0 || !isHorizontalSwipe.current) return;

        const deltaX = e.changedTouches[0].clientX - startXRef.current;
        const threshold = 100;

        if (Math.abs(deltaX) > threshold) {
            const currentIndex = tabs.indexOf(activeTab);
            if (deltaX < 0 && currentIndex < tabs.length - 1) {
                // Swipe Left -> Next Tab
                onTabChange(tabs[currentIndex + 1]);
            } else if (deltaX > 0 && currentIndex > 0) {
                // Swipe Right -> Previous Tab
                onTabChange(tabs[currentIndex - 1]);
            }
        }

        startXRef.current = 0;
    }, [activeTab, onTabChange, tabs]);

    return (
        <div
            className="flex-1 flex flex-col h-full w-full relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div
                key={activeTab}
                className={cn(
                    "flex-1 flex flex-col h-full w-full transition-all duration-500 ease-out animate-in fade-in fill-mode-both",
                    direction === "left" ? "slide-in-from-right-4" : direction === "right" ? "slide-in-from-left-4" : ""
                )}
            >
                {children}
            </div>
        </div>
    );
}
