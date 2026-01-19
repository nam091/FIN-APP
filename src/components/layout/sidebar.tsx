"use client";

import React from "react";
import {
    Home,
    ListTodo,
    BookOpen,
    MessageSquare,
    Settings,
    Bell,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    Wallet,
    Activity
} from "lucide-react";
import { useAppState } from "@/context/app-state-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const { activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen } = useAppState();

    const navItems = [
        { id: "home", label: "Home", icon: Home },
        { id: "finance", label: "Finance", icon: Wallet },
        { id: "tasks", label: "Tasks", icon: ListTodo },
        { id: "notes", label: "Notes", icon: BookOpen },
        { id: "tracking", label: "Tracking", icon: Activity },
        { id: "ai", label: "AI Assistant", icon: MessageSquare },
    ];

    return (
        <aside className={cn(
            "hidden md:flex flex-col h-screen bg-card border-r transition-all duration-300 relative z-50",
            isSidebarOpen ? "w-64" : "w-20"
        )}>
            <div className="p-6 flex items-center justify-between">
                {isSidebarOpen && <h1 className="text-xl font-bold tracking-tight text-foreground">FinApp</h1>}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="text-muted-foreground hover:text-foreground"
                >
                    {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </Button>
            </div>

            <div className="flex-1 px-3 space-y-2 py-4">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={cn(
                            "flex items-center w-full p-3 rounded-xl transition-all group",
                            activeTab === item.id
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn(
                            "w-6 h-6 shrink-0 transition-transform group-active:scale-90",
                            activeTab === item.id ? "text-indigo-500" : ""
                        )} />
                        {isSidebarOpen && <span className="ml-4 font-medium">{item.label}</span>}
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-border/50">
                <div className="space-y-2">
                    <button className={cn(
                        "flex items-center w-full p-3 rounded-xl text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all",
                        !isSidebarOpen && "justify-center text-center"
                    )}>
                        <Bell className="w-5 h-5 shrink-0" />
                        {isSidebarOpen && <span className="ml-4 text-sm font-medium">Notifications</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab("settings")}
                        className={cn(
                            "flex items-center w-full p-3 rounded-xl transition-all",
                            activeTab === "settings"
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                            !isSidebarOpen && "justify-center text-center"
                        )}
                    >
                        <Settings className="w-5 h-5 shrink-0" />
                        {isSidebarOpen && <span className="ml-4 text-sm font-medium">Settings</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
}
