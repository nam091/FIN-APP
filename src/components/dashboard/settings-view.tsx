"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/app-state-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Moon,
    Sun,
    Monitor,
    Bell,
    Hash,
    Send,
    Mail,
    Globe,
    Plus,
    Bot,
    User,
    Trash2,
    ExternalLink,
    ChevronRight,
    ChevronLeft,
    ShieldCheck,
    Calendar,
    Cloud
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarConnectButton, CalendarSyncStatus } from "@/components/calendar/calendar-connect-button";

export function SettingsView() {
    const { activeTab, setActiveTab, userSettings, updateSettings, addNotificationHook, removeNotificationHook } = useAppState();
    const [newHookName, setNewHookName] = useState("");
    const [newHookUrl, setNewHookUrl] = useState("");
    const [newHookType, setNewHookType] = useState<"discord" | "telegram" | "gmail" | "webhook">("discord");

    const themes = [
        { id: "dark", label: "Dark", icon: Moon },
        { id: "light", label: "Light", icon: Sun },
        { id: "system", label: "System", icon: Monitor },
    ];

    const handleAddHook = () => {
        if (!newHookName || !newHookUrl) return;
        addNotificationHook({
            name: newHookName,
            type: newHookType,
            url: newHookUrl,
            enabled: true
        });
        setNewHookName("");
        setNewHookUrl("");
    };

    return (
        <div className="flex flex-col h-full bg-background text-foreground overflow-hidden relative w-full">
            <header className="px-6 py-8 md:px-12 md:py-12 shrink-0 flex flex-col gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 rounded-full bg-secondary md:hidden"
                    onClick={() => setActiveTab("home")}
                >
                    <ChevronLeft className="text-muted-foreground w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-5xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Manage your preferences and integrations.</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-12 pb-32">
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* Theme Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Sun className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Appearance</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {themes.map((theme) => {
                                const Icon = theme.icon;
                                return (
                                    <button
                                        key={theme.id}
                                        onClick={() => updateSettings({ theme: theme.id as any })}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all group",
                                            userSettings.theme === theme.id
                                                ? "bg-secondary border-indigo-600 shadow-lg shadow-indigo-500/10"
                                                : "bg-secondary/40 border-border hover:border-accent"
                                        )}
                                    >
                                        <Icon className={cn(
                                            "w-8 h-8 mb-3 transition-colors",
                                            userSettings.theme === theme.id ? "text-indigo-400" : "text-muted-foreground group-hover:text-foreground"
                                        )} />
                                        <span className={cn(
                                            "font-semibold",
                                            userSettings.theme === theme.id ? "text-foreground" : "text-muted-foreground"
                                        )}>{theme.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Notification Hooks Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Notification Channels</h2>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateSettings({
                                    notifications: { ...userSettings.notifications, enabled: !userSettings.notifications.enabled }
                                })}
                                className={cn(
                                    "rounded-full px-4 h-8 text-xs font-bold",
                                    userSettings.notifications.enabled ? "bg-indigo-600/10 text-indigo-400" : "bg-secondary text-muted-foreground"
                                )}
                            >
                                {userSettings.notifications.enabled ? "Enabled" : "Disabled"}
                            </Button>
                        </div>

                        <Card className="bg-secondary/40 border-border rounded-3xl overflow-hidden divide-y divide-border/50">
                            {userSettings.notifications.hooks.map((hook) => (
                                <div key={hook.id} className="p-4 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border">
                                            {hook.type === "discord" && <Hash className="w-5 h-5 text-[#5865F2]" />}
                                            {hook.type === "telegram" && <Send className="w-5 h-5 text-[#229ED9]" />}
                                            {hook.type === "gmail" && <Mail className="w-5 h-5 text-[#EA4335]" />}
                                            {hook.type === "webhook" && <Globe className="w-5 h-5 text-emerald-500" />}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground">{hook.name}</h4>
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{hook.url}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeNotificationHook(hook.id)}
                                            className="w-8 h-8 rounded-full hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <div className="p-6 bg-secondary/20">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Add new connection</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            placeholder="Name (e.g. My Telegram)"
                                            value={newHookName}
                                            onChange={(e) => setNewHookName(e.target.value)}
                                            className="bg-background border-border rounded-2xl h-12"
                                        />
                                        <div className="relative">
                                            <select
                                                value={newHookType}
                                                onChange={(e) => setNewHookType(e.target.value as any)}
                                                className="w-full appearance-none bg-secondary/50 border border-border rounded-2xl h-12 px-4 pr-10 text-sm text-foreground cursor-pointer hover:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                                            >
                                                <option value="discord">Discord Webhook</option>
                                                <option value="telegram">Telegram Bot</option>
                                                <option value="gmail">Gmail Address</option>
                                                <option value="webhook">Custom Webhook</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <Input
                                        placeholder="URL or Endpoint"
                                        value={newHookUrl}
                                        onChange={(e) => setNewHookUrl(e.target.value)}
                                        className="bg-background border-border rounded-2xl h-12"
                                    />
                                    <Button
                                        onClick={handleAddHook}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 rounded-2xl"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Connect Handler
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* Integrations Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Cloud className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Integrations</h2>
                        </div>

                        <Card className="bg-secondary/40 border-border rounded-3xl p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center border border-border">
                                        <Calendar className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground">Google Calendar</h3>
                                        <p className="text-sm text-muted-foreground">Sync your tasks and financial deadlines.</p>
                                    </div>
                                </div>
                                <CalendarConnectButton />
                            </div>
                            <CalendarSyncStatus />
                        </Card>
                    </section>

                    {/* AI Configuration Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Bot className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">AI Configuration</h2>
                        </div>

                        <Card className="bg-secondary/40 border-border rounded-3xl p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">API Endpoint</label>
                                    <Input
                                        placeholder="https://your-api-proxy.com/v1"
                                        value={userSettings.ai.endpoint}
                                        onChange={(e) => updateSettings({
                                            ai: { ...userSettings.ai, endpoint: e.target.value }
                                        })}
                                        className="bg-background border-border rounded-2xl h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">API Key</label>
                                    <Input
                                        type="password"
                                        placeholder="sk-..."
                                        value={userSettings.ai.apiKey}
                                        onChange={(e) => updateSettings({
                                            ai: { ...userSettings.ai, apiKey: e.target.value }
                                        })}
                                        className="bg-background border-border rounded-2xl h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Model Name</label>
                                    <Input
                                        placeholder="gpt-4 / gemini-1.5-flash"
                                        value={userSettings.ai.model}
                                        onChange={(e) => updateSettings({
                                            ai: { ...userSettings.ai, model: e.target.value }
                                        })}
                                        className="bg-background border-border rounded-2xl h-12"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">User Avatar</label>
                                        <div className="flex items-center gap-4 bg-background p-4 rounded-3xl border border-border">
                                            <div className="w-16 h-16 rounded-2xl bg-secondary border border-border overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                                {userSettings.ai.userAvatar ? (
                                                    <img src={userSettings.ai.userAvatar} className="w-full h-full object-cover" alt="User Avatar" />
                                                ) : (
                                                    <User className="w-8 h-8 text-muted-foreground/50" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    id="userAvatarInput"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                updateSettings({
                                                                    ai: { ...userSettings.ai, userAvatar: reader.result as string }
                                                                });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full rounded-xl bg-secondary border-border hover:bg-accent text-xs font-bold"
                                                    onClick={() => document.getElementById('userAvatarInput')?.click()}
                                                >
                                                    Upload Photo
                                                </Button>
                                                {userSettings.ai.userAvatar && (
                                                    <button
                                                        onClick={() => updateSettings({ ai: { ...userSettings.ai, userAvatar: "" } })}
                                                        className="text-[10px] text-muted-foreground hover:text-rose-500 mt-2 font-bold uppercase tracking-tighter"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">AI Avatar</label>
                                        <div className="flex items-center gap-4 bg-background p-4 rounded-3xl border border-border">
                                            <div className="w-16 h-16 rounded-2xl bg-secondary border border-border overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                                {userSettings.ai.aiAvatar ? (
                                                    <img src={userSettings.ai.aiAvatar} className="w-full h-full object-cover" alt="AI Avatar" />
                                                ) : (
                                                    <Bot className="w-8 h-8 text-muted-foreground/50" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    id="aiAvatarInput"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                updateSettings({
                                                                    ai: { ...userSettings.ai, aiAvatar: reader.result as string }
                                                                });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full rounded-xl bg-secondary border-border hover:bg-accent text-xs font-bold"
                                                    onClick={() => document.getElementById('aiAvatarInput')?.click()}
                                                >
                                                    Upload Photo
                                                </Button>
                                                {userSettings.ai.aiAvatar && (
                                                    <button
                                                        onClick={() => updateSettings({ ai: { ...userSettings.ai, aiAvatar: "" } })}
                                                        className="text-[10px] text-muted-foreground hover:text-rose-500 mt-2 font-bold uppercase tracking-tighter"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="text-xs text-muted-foreground leading-relaxed italic">
                                    Configure your own OpenAI-compatible endpoint. These settings are used for the AI Assistant chat.
                                </p>
                            </div>
                        </Card>
                    </section>

                    {/* Account Security Placeholder */}
                    <Card className="bg-secondary/40 border-border border-dashed rounded-3xl p-8 flex flex-col items-center text-center">
                        <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <h3 className="font-bold text-lg text-muted-foreground">Premium Security</h3>
                        <p className="text-sm text-muted-foreground/50 max-w-xs mt-1">End-to-end encryption for all hooks and exported data is coming soon.</p>
                    </Card>

                </div>
            </div>
        </div>
    );
}
