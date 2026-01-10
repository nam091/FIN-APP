"use client";

import React from "react";
import { Home, ListTodo, Plus, BookOpen, MessageSquare, Wallet, Settings } from "lucide-react";
import { useAppState } from "@/context/app-state-context";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const { activeTab, setActiveTab } = useAppState();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-sm z-50">
            <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
                <NavButton
                    active={activeTab === "finance"}
                    onClick={() => setActiveTab("finance")}
                    icon={<Wallet className="w-7 h-7" />}
                />
                <NavButton
                    active={activeTab === "tasks"}
                    onClick={() => setActiveTab("tasks")}
                    icon={<ListTodo className="w-7 h-7" />}
                />

                <button
                    className={cn(
                        "w-20 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-black/20",
                        activeTab === "home" ? "bg-indigo-600" : "bg-secondary hover:bg-accent"
                    )}
                    onClick={() => setActiveTab("home")}
                >
                    <Home className={cn("w-7 h-7", activeTab === "home" ? "text-white" : "text-muted-foreground")} />
                </button>

                <NavButton
                    active={activeTab === "notes"}
                    onClick={() => setActiveTab("notes")}
                    icon={<BookOpen className="w-7 h-7" />}
                />
                <NavButton
                    active={activeTab === "ai"}
                    onClick={() => setActiveTab("ai")}
                    icon={<MessageSquare className="w-7 h-7" />}
                />
            </div>
        </div>
    );
}

function NavButton({ active, icon, onClick }: { active: boolean, icon: React.ReactNode, onClick: () => void }) {
    return (
        <button
            className={cn(
                "flex-1 flex justify-center py-2 transition-all duration-200",
                active ? "text-foreground scale-110" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={onClick}
        >
            <div className="active:scale-90 transition-transform">
                {icon}
            </div>
        </button>
    );
}
