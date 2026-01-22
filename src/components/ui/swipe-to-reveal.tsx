"use client";

import React, { useState, useRef, useCallback } from "react";
import { Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeToRevealProps {
    children: React.ReactNode;
    onDelete: () => void;
    onEdit?: () => void;
    className?: string;
}

const SWIPE_THRESHOLD = 50;
const DELETE_ZONE_WIDTH = 80;
const EDIT_DELETE_ZONE_WIDTH = 140; // Wider when both buttons
const VELOCITY_THRESHOLD = 0.3;

export function SwipeToReveal({ children, onDelete, onEdit, className }: SwipeToRevealProps) {
    const [translateX, setTranslateX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const startXRef = useRef(0);
    const startTimeRef = useRef(0);
    const lastXRef = useRef(0);
    const velocityRef = useRef(0);

    const actionZoneWidth = onEdit ? EDIT_DELETE_ZONE_WIDTH : DELETE_ZONE_WIDTH;

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        startXRef.current = e.touches[0].clientX;
        lastXRef.current = e.touches[0].clientX;
        startTimeRef.current = Date.now();
        velocityRef.current = 0;
        setIsSwiping(true);
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isSwiping) return;

        const currentX = e.touches[0].clientX;
        const diff = startXRef.current - currentX;

        const timeDelta = Date.now() - startTimeRef.current;
        if (timeDelta > 0) {
            velocityRef.current = (lastXRef.current - currentX) / timeDelta;
        }
        lastXRef.current = currentX;
        startTimeRef.current = Date.now();

        if (diff > 0) {
            if (diff > actionZoneWidth) {
                const overSwipe = diff - actionZoneWidth;
                const resistance = actionZoneWidth + (overSwipe * 0.2);
                setTranslateX(Math.min(resistance, actionZoneWidth + 20));
            } else {
                setTranslateX(diff);
            }
        } else {
            const currentTranslate = translateX + diff * 0.5;
            setTranslateX(Math.max(0, currentTranslate));
        }
    }, [isSwiping, translateX, actionZoneWidth]);

    const handleTouchEnd = useCallback(() => {
        setIsSwiping(false);
        const diff = startXRef.current - lastXRef.current;
        const velocity = velocityRef.current;

        if (diff >= SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
            setTranslateX(actionZoneWidth);
        } else {
            setTranslateX(0);
        }
    }, [actionZoneWidth]);

    const handleDelete = useCallback(() => {
        setIsDeleting(true);
        setTranslateX(window.innerWidth);
        setTimeout(() => {
            onDelete();
        }, 300);
    }, [onDelete]);

    const handleEdit = useCallback(() => {
        setTranslateX(0);
        setTimeout(() => {
            onEdit?.();
        }, 100);
    }, [onEdit]);

    const handleClose = useCallback(() => {
        if (translateX > 0 && !isDeleting) {
            setTranslateX(0);
        }
    }, [translateX, isDeleting]);

    const buttonScale = Math.min(1, translateX / actionZoneWidth);
    const buttonOpacity = Math.min(1, translateX / (actionZoneWidth * 0.5));

    return (
        <div className={cn("relative overflow-hidden rounded-3xl", className)} data-swipe-to-reveal="true">
            {/* Action Buttons Background */}
            <div
                className="absolute inset-y-0 right-0 flex items-center justify-end gap-2 pr-2"
                style={{
                    width: actionZoneWidth + 16,
                    opacity: buttonOpacity,
                }}
            >
                {onEdit && (
                    <button
                        onClick={handleEdit}
                        className="h-[calc(100%-16px)] flex items-center justify-center active:scale-95 transition-all bg-blue-500 hover:bg-blue-400 text-white rounded-2xl shadow-lg"
                        aria-label="Edit"
                        style={{
                            width: 56,
                            transform: `scale(${0.7 + buttonScale * 0.3})`,
                            opacity: buttonScale,
                        }}
                    >
                        <Pencil className="w-5 h-5" />
                    </button>
                )}
                <button
                    onClick={handleDelete}
                    className="h-[calc(100%-16px)] flex items-center justify-center active:scale-95 transition-all bg-rose-500 hover:bg-rose-400 text-white rounded-2xl shadow-lg"
                    aria-label="Delete"
                    style={{
                        width: 56,
                        transform: `scale(${0.7 + buttonScale * 0.3})`,
                        opacity: buttonScale,
                    }}
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Swipeable Content */}
            <div
                className={cn(
                    "relative z-10 bg-background",
                    !isSwiping && "transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
                    isDeleting && "transition-all duration-300 ease-out opacity-0 scale-95"
                )}
                style={{ transform: `translateX(-${translateX}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleClose}
            >
                {children}
            </div>
        </div>
    );
}
