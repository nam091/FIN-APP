"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAppState } from "@/context/app-state-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Activity,
    Zap,
    BookOpen,
    Dumbbell,
    Droplets,
    Moon,
    Sun,
    Coffee,
    Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NewTrackerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (tracker: any) => void;
    editingTracker?: any;
}

const ICONS = [
    { name: "Activity", icon: Activity },
    { name: "Zap", icon: Zap },
    { name: "BookOpen", icon: BookOpen },
    { name: "Dumbbell", icon: Dumbbell },
    { name: "Droplets", icon: Droplets },
    { name: "Moon", icon: Moon },
    { name: "Sun", icon: Sun },
    { name: "Coffee", icon: Coffee },
    { name: "Heart", icon: Heart },
];

const COLORS = [
    { name: "blue", class: "bg-blue-500" },
    { name: "green", class: "bg-green-500" },
    { name: "red", class: "bg-red-500" },
    { name: "purple", class: "bg-purple-500" },
    { name: "orange", class: "bg-orange-500" },
];

export function NewTrackerModal({ open, onOpenChange, onSave, editingTracker }: NewTrackerModalProps) {
    const { t } = useAppState();
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [selectedIcon, setSelectedIcon] = React.useState("Activity");
    const [selectedColor, setSelectedColor] = React.useState("blue");
    const [goal, setGoal] = React.useState(1);

    React.useEffect(() => {
        if (editingTracker) {
            setTitle(editingTracker.title || "");
            setDescription(editingTracker.description || "");
            setSelectedIcon(editingTracker.icon || "Activity");
            setSelectedColor(editingTracker.color || "blue");
            setGoal(editingTracker.goal || 1);
        } else {
            setTitle("");
            setDescription("");
            setSelectedIcon("Activity");
            setSelectedColor("blue");
            setGoal(1);
        }
    }, [editingTracker, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: editingTracker?.id,
            title,
            description,
            icon: selectedIcon,
            color: selectedColor,
            goal: Number(goal),
            type: "habit" // Default for now
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-card border-border">
                <DialogHeader>
                    <DialogTitle>{editingTracker ? t("editHabit") : t("newHabit")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">{t("habitName")}</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t("habitPlaceholder")}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">{t("descriptionOptional")}</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t("descriptionPlaceholder")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t("icon")}</Label>
                        <div className="flex flex-wrap gap-2">
                            {ICONS.map((item) => (
                                <button
                                    key={item.name}
                                    type="button"
                                    onClick={() => setSelectedIcon(item.name)}
                                    className={cn(
                                        "p-2 rounded-lg border transition-all",
                                        selectedIcon === item.name
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border bg-secondary hover:bg-secondary/80 text-muted-foreground"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t("color")}</Label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((item) => (
                                <button
                                    key={item.name}
                                    type="button"
                                    onClick={() => setSelectedColor(item.name)}
                                    className={cn(
                                        "w-8 h-8 rounded-full border-2 transition-all",
                                        item.class,
                                        selectedColor === item.name
                                            ? "border-foreground scale-110"
                                            : "border-transparent opacity-70 hover:opacity-100"
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={!title}>
                            {editingTracker ? t("saveChanges") : t("createHabit")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
