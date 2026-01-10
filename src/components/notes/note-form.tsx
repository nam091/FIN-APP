"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, FileText, Pin, Lightbulb, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Note {
    id: string;
    title: string;
    content: string;
    category: string;
    date: string;
    tags: string[];
}

interface NoteFormProps {
    onClose: () => void;
    onSave: (note: { title: string; content: string; category: string; date: string; tags: string[] }) => void;
    editingNote?: Note | null;
}

const NOTE_TYPES = [
    { id: "Note", label: "Note", icon: FileText },
    { id: "Idea", label: "Idea", icon: Lightbulb },
    { id: "Pinned", label: "Pinned", icon: Pin },
    { id: "Study", label: "Study", icon: BookOpen },
];

export function NoteForm({ onClose, onSave, editingNote }: NoteFormProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("Note");

    // Pre-fill form when editing
    useEffect(() => {
        if (editingNote) {
            setTitle(editingNote.title);
            setContent(editingNote.content || "");
            setCategory(editingNote.category || "Note");
        }
    }, [editingNote]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        onSave({
            title,
            content,
            category,
            date: editingNote?.date || new Date().toISOString().split('T')[0],
            tags: editingNote?.tags || []
        });
        onClose();
    };

    const isEditing = !!editingNote;

    return (
        <div className="flex flex-col h-[85vh] md:h-full bg-background rounded-t-[32px] md:rounded-3xl border border-border overflow-hidden">
            {/* Fixed Header */}
            <div className="flex justify-between items-center p-6 pb-4 border-b border-border/50">
                <h2 className="text-2xl font-bold text-foreground">{isEditing ? "Edit Note" : "New Note"}</h2>
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
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">Title</label>
                    <Input
                        placeholder="Note title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-secondary/50 border-border rounded-2xl h-16 px-5 focus-visible:ring-primary/30 text-lg"
                        autoFocus
                    />
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">Content</label>
                    <textarea
                        placeholder="Write your note..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full min-h-[200px] bg-secondary/50 border border-border rounded-2xl px-5 py-4 focus:ring-1 focus:ring-primary/30 focus:outline-none resize-none text-foreground placeholder:text-muted-foreground/50 text-base leading-relaxed"
                    />
                </div>

                {/* Note Type */}
                <div className="space-y-3">
                    <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">Type</label>
                    <div className="grid grid-cols-4 gap-3">
                        {NOTE_TYPES.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setCategory(item.id)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                                    category === item.id
                                        ? "bg-purple-600/20 border-purple-500 text-purple-400 scale-105"
                                        : "bg-secondary border-border text-muted-foreground hover:border-accent hover:scale-105"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-xs font-semibold">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 pb-2">
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold h-16 rounded-2xl text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isEditing ? "Save Changes" : "Create Note"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
