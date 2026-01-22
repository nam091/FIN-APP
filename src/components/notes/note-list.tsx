"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Search,
    ArrowLeft,
    Filter,
    MoreHorizontal,
    CheckCircle,
    Wallet,
    Pin,
    FileText,
    Sparkles,
    LayoutGrid,
    Trello,
    ChevronLeft
} from "lucide-react";
import { useAppState, Note } from "@/context/app-state-context";
import {
    Drawer,
    DrawerContent,
} from "@/components/ui/drawer";
import { NoteForm } from "./note-form";
import { SwipeToReveal } from "@/components/ui/swipe-to-reveal";
import { BackgroundDots } from "@/components/ui/background-dots";

export function NoteList() {
    const { setActiveTab, dismissedItems, dismissItem, notes, addNote, updateNote, deleteNote } = useAppState();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [sortBy, setSortBy] = useState<"date" | "title">("date");

    const isTodayInfoVisible = !dismissedItems.includes("note-today-hub");

    // Sort notes
    const sortedNotes = [...notes].sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return b.date.localeCompare(a.date); // date: newest first
    });

    const cycleSortBy = () => {
        setSortBy(sortBy === "date" ? "title" : "date");
    };

    const getSortLabel = () => {
        return sortBy === "title" ? "Title" : "Date";
    };

    const handleOpenCreate = () => {
        setEditingNote(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (note: Note) => {
        setEditingNote(note);
        setIsFormOpen(true);
    };

    const handleSave = (noteData: Omit<Note, "id">) => {
        if (editingNote) {
            updateNote(editingNote.id, noteData);
        } else {
            addNote(noteData);
        }
        setIsFormOpen(false);
        setEditingNote(null);
    };


    return (
        <div className="flex flex-col h-full bg-background text-foreground overflow-hidden relative cursor-default w-full">
            <BackgroundDots />

            <header className="px-6 py-4 flex justify-between items-center shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 rounded-full bg-secondary md:hidden"
                    onClick={() => setActiveTab("home")}
                >
                    <ChevronLeft className="text-muted-foreground w-5 h-5" />
                </Button>
                <div className="hidden md:block flex-1" />
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleOpenCreate}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full px-5 h-10 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> New Note
                    </Button>
                    <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-muted-foreground h-10" onClick={cycleSortBy}>
                        <Filter className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium hidden md:inline">{getSortLabel()}</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-secondary" onClick={() => setActiveTab("settings")}>
                        <MoreHorizontal className="text-muted-foreground w-5 h-5" />
                    </Button>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 z-10">
                <div className="max-w-6xl mx-auto w-full pb-72 md:pb-20">
                    <div className="mb-8 ml-2 mt-8">
                        <h2 className="text-5xl font-bold mb-6">Today</h2>

                        {isTodayInfoVisible && (
                            <div className="border-2 border-dashed border-border rounded-3xl p-6 mb-8 max-w-md transition-all animate-in fade-in zoom-in-95">
                                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                                    Transform your Today view into a meeting hub: see your schedule, join video calls, and take notes for any meeting.
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-4 py-2.5 rounded-2xl text-sm font-medium h-10 border-none"
                                        onClick={() => alert("Connecting calendar...")}
                                    >
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                        Add my calendar
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="px-4 py-2.5 rounded-2xl text-sm font-medium border border-border text-muted-foreground h-10"
                                        onClick={() => dismissItem("note-today-hub")}
                                    >
                                        No thanks
                                    </Button>
                                </div>
                            </div>
                        )}

                        {!isTodayInfoVisible && (
                            <div className="mb-8 ml-2">
                                <Button variant="ghost" size="sm" className="text-zinc-700 hover:text-zinc-500 p-0" onClick={() => window.location.reload()}>
                                    Reveal hidden hub
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Active Tasks Panel */}
                        <div className="bg-secondary/40 backdrop-blur-xl border border-border p-5 rounded-3xl group hover:border-blue-500/30 transition-all cursor-move">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                    Active Tasks
                                </h3>
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Today</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full border-2 border-border"></div>
                                    <div className="h-4 bg-secondary rounded w-3/4 animate-pulse"></div>
                                </div>
                                <div className="flex items-center gap-3 opacity-60">
                                    <div className="w-5 h-5 rounded-full border-2 border-border"></div>
                                    <div className="h-4 bg-secondary rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>


                        {/* Sticky Note */}
                        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-xl rotate-1 shadow-lg hover:rotate-0 transition-all cursor-move">
                            <div className="flex items-center gap-2 mb-2 text-amber-500/50">
                                <Pin className="w-3 h-3" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Brainstorm</span>
                            </div>
                            <p className="text-amber-100/90 text-base font-medium leading-relaxed italic">
                                "The best way to predict the future is to create it." - Note: Remember to finalize the UI/UX workshop notes by Friday morning.
                            </p>
                        </div>

                        {/* Recent Notes Panel */}
                        <div className="bg-secondary/40 backdrop-blur-xl border border-border p-5 rounded-3xl group hover:border-purple-500/30 transition-all md:col-span-2 lg:col-span-3">
                            <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                                <FileText className="w-4 h-4 text-purple-500" />
                                Recent Notes
                                <span className="text-xs text-muted-foreground ml-auto">{sortedNotes.length} notes</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {sortedNotes.length === 0 ? (
                                    <div className="col-span-full text-center py-8 text-muted-foreground">
                                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No notes yet. Create your first note!</p>
                                    </div>
                                ) : (
                                    sortedNotes.map(note => {
                                        // Format relative date
                                        const noteDate = new Date(note.date);
                                        const today = new Date();
                                        const diffDays = Math.floor((today.getTime() - noteDate.getTime()) / (1000 * 60 * 60 * 24));
                                        let dateLabel = note.date;
                                        if (diffDays === 0) dateLabel = "Today";
                                        else if (diffDays === 1) dateLabel = "Yesterday";
                                        else if (diffDays < 7) dateLabel = `${diffDays} days ago`;

                                        // Category colors
                                        const categoryColors: Record<string, string> = {
                                            "Work": "bg-blue-500/20 text-blue-400",
                                            "Personal": "bg-green-500/20 text-green-400",
                                            "Ideas": "bg-yellow-500/20 text-yellow-400",
                                            "Study": "bg-purple-500/20 text-purple-400",
                                            "default": "bg-zinc-500/20 text-zinc-400"
                                        };
                                        const categoryClass = categoryColors[note.category] || categoryColors["default"];

                                        return (
                                            <SwipeToReveal key={note.id} onDelete={() => deleteNote(note.id)}>
                                                <div
                                                    className="p-4 bg-background/50 rounded-2xl hover:bg-background/80 transition-all cursor-pointer border border-border/50 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 group/note"
                                                    onClick={() => handleOpenEdit(note)}
                                                >
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h4 className="font-semibold text-foreground truncate flex-1 group-hover/note:text-purple-400 transition-colors">
                                                            {note.title}
                                                        </h4>
                                                        {note.category && (
                                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${categoryClass}`}>
                                                                {note.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                                                        {note.content || "No content"}
                                                    </p>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground/60">
                                                        <span>{dateLabel}</span>
                                                        {note.tags && note.tags.length > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                <Sparkles className="w-3 h-3" />
                                                                {note.tags.length} tags
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </SwipeToReveal>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            <Drawer open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DrawerContent className="bg-transparent border-none p-0 max-w-2xl mx-auto max-h-[90vh]">
                    <NoteForm
                        onClose={() => { setIsFormOpen(false); setEditingNote(null); }}
                        onSave={handleSave}
                        editingNote={editingNote}
                    />
                </DrawerContent>
            </Drawer>
        </div >
    );
}
