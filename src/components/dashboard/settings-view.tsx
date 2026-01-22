"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
    ChevronLeft,
    ShieldCheck,
    Calendar,
    Cloud,
    Save,
    CheckCircle2,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarConnectButton, CalendarSyncStatus } from "@/components/calendar/calendar-connect-button";
import { CustomSelect } from "@/components/ui/select-custom";
import { BackgroundDots } from "@/components/ui/background-dots";

export function SettingsView() {
    const { setActiveTab, userSettings, updateSettings, addNotificationHook, removeNotificationHook } = useAppState();
    const [newHookName, setNewHookName] = useState("");
    const [newHookUrl, setNewHookUrl] = useState("");
    const [newHookType, setNewHookType] = useState<"discord" | "telegram" | "gmail" | "webhook">("discord");

    // Local state for AI config to buffer changes
    const [localAiConfig, setLocalAiConfig] = useState({
        endpoint: userSettings.ai.endpoint,
        apiKey: userSettings.ai.apiKey,
        model: userSettings.ai.model,
        userAvatar: userSettings.ai.userAvatar,
        aiAvatar: userSettings.ai.aiAvatar,
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [isFetchingModels, setIsFetchingModels] = useState(false);

    // Timer ref for debounced fetching
    const fetchTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Sync local state when userSettings changes
    useEffect(() => {
        setLocalAiConfig({
            endpoint: userSettings.ai.endpoint,
            apiKey: userSettings.ai.apiKey,
            model: userSettings.ai.model,
            userAvatar: userSettings.ai.userAvatar,
            aiAvatar: userSettings.ai.aiAvatar,
        });
    }, [userSettings.ai]);

    const fetchModels = useCallback(async (endpoint: string, apiKey: string) => {
        if (!endpoint || !apiKey) return;
        setIsFetchingModels(true);
        try {
            let baseUrl = endpoint;
            if (baseUrl.endsWith("/chat/completions")) {
                baseUrl = baseUrl.replace("/chat/completions", "");
            }

            // Standard OpenAI-compatible models endpoint
            const modelsEndpoint = baseUrl.endsWith("/v1") ? `${baseUrl}/models` : `${baseUrl}/v1/models`;

            const res = await fetch(modelsEndpoint, {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.data && Array.isArray(data.data)) {
                    const modelIds = data.data.map((m: any) => m.id);
                    setAvailableModels(modelIds);

                    // If current model is not specified or dummy, select the first available one
                    if (!localAiConfig.model || localAiConfig.model === "gpt-4o") {
                        if (modelIds.length > 0) {
                            setLocalAiConfig(prev => ({ ...prev, model: modelIds[0] }));
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching models:", error);
        } finally {
            setIsFetchingModels(false);
        }
    }, [localAiConfig.model]);

    // Automatic fetching with debounce
    useEffect(() => {
        if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);

        fetchTimerRef.current = setTimeout(() => {
            if (localAiConfig.endpoint && localAiConfig.apiKey) {
                fetchModels(localAiConfig.endpoint, localAiConfig.apiKey);
            }
        }, 1000); // 1s debounce

        return () => {
            if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
        };
    }, [localAiConfig.endpoint, localAiConfig.apiKey, fetchModels]);

    const themes = [
        { id: "light", label: "Light", icon: Sun },
        { id: "dark", label: "Dark", icon: Moon },
        { id: "system", label: "System", icon: Monitor },
    ];

    const handleSaveAiConfig = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        updateSettings({
            ai: { ...userSettings.ai, ...localAiConfig }
        });

        setIsSaving(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

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
        <div className="flex flex-col h-full bg-background text-foreground overflow-hidden relative cursor-default w-full">
            <BackgroundDots />
            <header className="px-6 py-6 md:px-12 md:py-10 shrink-0 flex flex-col gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 rounded-full bg-secondary md:hidden"
                    onClick={() => setActiveTab("home")}
                >
                    <ChevronLeft className="text-muted-foreground w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Settings</h1>
                    <p className="text-muted-foreground mt-1 text-base md:text-lg">Manage your preferences and integrations.</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar px-6 md:px-12 pb-32">
                <div className="max-w-4xl mx-auto space-y-10">

                    {/* Compact Theme Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Appearance</h2>
                        </div>
                        <div className="bg-secondary/30 p-1.5 rounded-2xl border border-border inline-flex w-full sm:w-auto min-w-[300px] shadow-inner">
                            {themes.map((theme) => {
                                const Icon = theme.icon;
                                const isActive = userSettings.theme === theme.id;
                                return (
                                    <button
                                        key={theme.id}
                                        onClick={() => updateSettings({ theme: theme.id as any })}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl transition-all duration-300 relative",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-md scale-[1.02] z-10"
                                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="text-xs font-bold">{theme.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* AI Configuration Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bot className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">AI Assistant</h2>
                            </div>
                            <Button
                                onClick={handleSaveAiConfig}
                                disabled={isSaving}
                                className={cn(
                                    "rounded-full h-9 px-5 text-xs font-bold transition-all gap-2",
                                    showSuccess ? "bg-green-600 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
                                )}
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : showSuccess ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {showSuccess ? "Saved" : "Save Changes"}
                            </Button>
                        </div>

                        <Card className="bg-secondary/40 border-border rounded-3xl p-6 md:p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">API Endpoint</label>
                                    <Input
                                        placeholder="https://your-api-proxy.com/v1"
                                        value={localAiConfig.endpoint}
                                        onChange={(e) => setLocalAiConfig({ ...localAiConfig, endpoint: e.target.value })}
                                        className="bg-background border-border rounded-2xl h-12 text-sm"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">API Key</label>
                                    <Input
                                        type="password"
                                        placeholder="sk-..."
                                        value={localAiConfig.apiKey}
                                        onChange={(e) => setLocalAiConfig({ ...localAiConfig, apiKey: e.target.value })}
                                        className="bg-background border-border rounded-2xl h-12 text-sm"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Model Name</label>
                                        <div className="flex items-center gap-2">
                                            {isFetchingModels && <RefreshCw className="w-3 h-3 animate-spin text-primary" />}
                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                {availableModels.length > 0 ? `${availableModels.length} models found` : "Auto-fetching..."}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        {availableModels.length > 0 ? (
                                            <CustomSelect
                                                options={availableModels.map(m => ({ label: m, value: m }))}
                                                value={localAiConfig.model}
                                                onChange={(val) => setLocalAiConfig({ ...localAiConfig, model: val })}
                                                placeholder="Select AI Model"
                                            />
                                        ) : (
                                            <Input
                                                placeholder="Model (e.g. gpt-4o)"
                                                value={localAiConfig.model}
                                                onChange={(e) => setLocalAiConfig({ ...localAiConfig, model: e.target.value })}
                                                className="bg-background border-border rounded-2xl h-12 text-sm"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">User Avatar</label>
                                    <div className="flex items-center gap-4 bg-background/50 p-4 rounded-3xl border border-border group">
                                        <div className="w-16 h-16 rounded-2xl bg-secondary border border-border overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                            {localAiConfig.userAvatar ? (
                                                <img src={localAiConfig.userAvatar} className="w-full h-full object-cover" alt="User Avatar" />
                                            ) : (
                                                <User className="w-8 h-8 text-muted-foreground/50" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
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
                                                            setLocalAiConfig({ ...localAiConfig, userAvatar: reader.result as string });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="w-full rounded-xl bg-secondary border-border hover:bg-accent text-xs font-bold h-9"
                                                onClick={() => document.getElementById('userAvatarInput')?.click()}
                                            >
                                                Upload
                                            </Button>
                                            {localAiConfig.userAvatar && (
                                                <button
                                                    onClick={() => setLocalAiConfig({ ...localAiConfig, userAvatar: "" })}
                                                    className="text-[10px] text-muted-foreground hover:text-rose-500 w-full font-bold uppercase tracking-tighter"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">AI Avatar</label>
                                    <div className="flex items-center gap-4 bg-background/50 p-4 rounded-3xl border border-border group">
                                        <div className="w-16 h-16 rounded-2xl bg-secondary border border-border overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                            {localAiConfig.aiAvatar ? (
                                                <img src={localAiConfig.aiAvatar} className="w-full h-full object-cover" alt="AI Avatar" />
                                            ) : (
                                                <Bot className="w-8 h-8 text-muted-foreground/50" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
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
                                                            setLocalAiConfig({ ...localAiConfig, aiAvatar: reader.result as string });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="w-full rounded-xl bg-secondary border-border hover:bg-accent text-xs font-bold h-9"
                                                onClick={() => document.getElementById('aiAvatarInput')?.click()}
                                            >
                                                Upload
                                            </Button>
                                            {localAiConfig.aiAvatar && (
                                                <button
                                                    onClick={() => setLocalAiConfig({ ...localAiConfig, aiAvatar: "" })}
                                                    className="text-[10px] text-muted-foreground hover:text-rose-500 w-full font-bold uppercase tracking-tighter"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* Notification Hooks Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Notifications</h2>
                            </div>
                            <button
                                onClick={() => updateSettings({
                                    notifications: { ...userSettings.notifications, enabled: !userSettings.notifications.enabled }
                                })}
                                className={cn(
                                    "w-12 h-6 rounded-full p-1 transition-colors relative",
                                    userSettings.notifications.enabled ? "bg-primary" : "bg-secondary"
                                )}
                            >
                                <div className={cn(
                                    "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300",
                                    userSettings.notifications.enabled ? "translate-x-6" : "translate-x-0"
                                )} />
                            </button>
                        </div>

                        <Card className="bg-secondary/40 border-border rounded-3xl overflow-hidden divide-y divide-border/30 shadow-sm">
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
                                            <h4 className="font-semibold text-foreground text-sm">{hook.name}</h4>
                                            <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{hook.url}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeNotificationHook(hook.id)}
                                        className="w-8 h-8 rounded-full hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}

                            <div className="p-6 bg-secondary/15 space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Connect New Handler</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        placeholder="Channel Name"
                                        value={newHookName}
                                        onChange={(e) => setNewHookName(e.target.value)}
                                        className="bg-background border-border rounded-2xl h-12 text-sm text-center"
                                    />

                                    <CustomSelect
                                        options={[
                                            { label: "Discord Webhook", value: "discord" },
                                            { label: "Telegram Bot", value: "telegram" },
                                            { label: "Gmail Address", value: "gmail" },
                                            { label: "Custom Webhook", value: "webhook" },
                                        ]}
                                        value={newHookType}
                                        onChange={(val) => setNewHookType(val as any)}
                                        placeholder="Select Channel Type"
                                    />
                                </div>
                                <Input
                                    placeholder="Connection URL"
                                    value={newHookUrl}
                                    onChange={(e) => setNewHookUrl(e.target.value)}
                                    className="bg-background border-border rounded-2xl h-12 text-sm text-center"
                                />
                                <Button
                                    onClick={handleAddHook}
                                    className="w-full bg-secondary hover:bg-accent text-foreground font-bold h-12 rounded-2xl border border-border"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Connect
                                </Button>
                            </div>
                        </Card>
                    </section>

                    {/* Integrations Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Cloud className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Integrations</h2>
                        </div>

                        <Card className="bg-secondary/40 border-border rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 text-center sm:text-left">
                                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center border border-border shrink-0">
                                    <Calendar className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground text-sm md:text-base">Google Calendar</h3>
                                    <p className="text-xs text-muted-foreground">Sync your tasks and financial deadlines.</p>
                                </div>
                            </div>
                            <div className="shrink-0 scale-90 md:scale-100">
                                <CalendarConnectButton />
                            </div>
                        </Card>
                        <div className="px-2">
                            <CalendarSyncStatus />
                        </div>
                    </section>

                    {/* Security Footer */}
                    <section className="pt-6 pb-20">
                        <Card className="bg-secondary/20 border-border border-dashed rounded-3xl p-8 flex flex-col items-center text-center">
                            <ShieldCheck className="w-10 h-10 text-muted-foreground/30 mb-4" />
                            <h3 className="font-bold text-base text-muted-foreground italic tracking-widest">PREMIUM SECURITY</h3>
                            <p className="text-[11px] text-muted-foreground/50 max-w-xs mt-1 leading-relaxed">
                                End-to-end encryption for all webhooks and data exports is currently in development.
                            </p>
                        </Card>
                    </section>

                </div>
            </div>
        </div>
    );
}
