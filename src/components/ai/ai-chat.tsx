"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    Plus,
    Send,
    Sparkles,
    User,
    Bot,
    Settings,
    ChevronLeft,
    CheckCircle2,
    Wallet,
    ListTodo,
    TrendingUp,
    TrendingDown,
    Calendar,
    Clock,
    Zap
} from "lucide-react";
import { useAppState, Transaction } from "@/context/app-state-context";
import { cn } from "@/lib/utils";
import { formatVND } from "@/lib/currency";
import { BackgroundDots } from "@/components/ui/background-dots";

interface ChatMessage {
    id: number;
    role: "user" | "assistant";
    content: string;
    action?: {
        type: "create_task" | "create_transaction" | "create_note" | "show_summary";
        data?: any;
        status?: "pending" | "completed" | "failed";
    };
}

export function AIChat() {
    const {
        setActiveTab,
        tasks,
        transactions,
        financeSummary,
        addTransaction,
        addTask,
        addNote,
        notes,
        userSettings,
        chatHistory,
        setChatHistory,
        t
    } = useAppState();

    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Auto-scroll to bottom when chat updates
    useEffect(() => {
        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        };
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
            setTimeout(scrollToBottom, 50);
        });
    }, [chatHistory, isLoading]);

    if (!isMounted) return <div className="flex-1 bg-background" />;

    const parseMarkdown = (text: string) => {
        // Enhanced markdown parsing for bold, italics, lists, and code
        let html = text
            .replace(/```([\s\S]*?)```/g, '<pre class="bg-black/20 p-3 rounded-xl my-2 overflow-x-auto border border-white/5 font-mono text-xs"><code>$1</code></pre>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-bold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic text-foreground/90">$1</em>')
            .replace(/• (.*?)$/gm, '<li class="ml-4 list-disc mb-1">$1</li>')
            .replace(/\n\n/g, '<div class="h-2"></div>')
            .replace(/\n/g, '<br/>');
        return html;
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = { id: Date.now(), role: "user", content: input };
        const updatedMessages = [...chatHistory, userMsg];
        setChatHistory(updatedMessages);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
                    context: {
                        transactions,
                        tasks,
                        notes,
                        financeSummary
                    },
                    aiSettings: userSettings.ai
                })
            });

            if (!response.ok) throw new Error("API call failed");

            const data = await response.json();
            const botMsg: ChatMessage = {
                id: Date.now(),
                role: "assistant",
                content: data.content,
                action: data.action ? { ...data.action, status: "pending" } : undefined
            };

            setChatHistory(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat Error:", error);
            setChatHistory(prev => [...prev, {
                id: Date.now(),
                role: "assistant",
                content: t("chatError")
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleActionConfirm = (messageId: number) => {
        setChatHistory(prev => prev.map(msg => {
            if (msg.id === messageId && msg.action) {
                if (msg.action.type === "create_transaction" && msg.action.data) {
                    addTransaction(msg.action.data);
                }
                if (msg.action.type === "create_task" && msg.action.data) {
                    addTask(msg.action.data);
                }
                if (msg.action.type === "create_note" && msg.action.data) {
                    addNote(msg.action.data);
                }
                return { ...msg, action: { ...msg.action, status: "completed" as const } };
            }
            return msg;
        }));

        // Add confirmation message
        const confirmMsg: ChatMessage = {
            id: Date.now(),
            role: "assistant",
            content: t("addedSuccessfully")
        };
        setChatHistory(prev => [...prev, confirmMsg]);
    };

    const handleClearChat = () => {
        if (confirm(t("clearHistoryConfirm"))) {
            setChatHistory([
                {
                    id: Date.now(),
                    role: "assistant",
                    content: t("historyCleared")
                }
            ]);
            setShowMoreMenu(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background text-foreground overflow-hidden relative w-full">
            <BackgroundDots />
            <header className="px-6 py-4 flex justify-between items-center shrink-0 border-b z-30">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 rounded-full bg-secondary md:hidden"
                        onClick={() => setActiveTab("home")}
                    >
                        <ChevronLeft className="text-muted-foreground w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            {t("finAppAi")}
                        </h1>
                    </div>
                </div>
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 rounded-full bg-secondary"
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                    >
                        <Settings className="text-muted-foreground w-5 h-5" />
                    </Button>

                    {showMoreMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-40 bg-transparent"
                                onClick={() => setShowMoreMenu(false)}
                            />
                            <Card className="absolute top-12 right-0 w-48 bg-popover border-border p-2 shadow-2xl z-50 rounded-2xl animate-in fade-in zoom-in-95 duration-150">
                                <button
                                    className="w-full text-left p-3 text-sm font-medium text-popover-foreground hover:bg-accent rounded-xl transition-colors"
                                    onClick={handleClearChat}
                                >
                                    {t("clearHistory")}
                                </button>
                                <button
                                    className="w-full text-left p-3 text-sm font-medium text-popover-foreground hover:bg-accent rounded-xl transition-colors"
                                    onClick={() => {
                                        setActiveTab("settings");
                                        setShowMoreMenu(false);
                                    }}
                                >
                                    {t("aiSettings")}
                                </button>
                            </Card>
                        </>
                    )}
                </div>
            </header>

            <div
                className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4"
            >
                {chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[88%] md:max-w-[70%] flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                            <div className={cn(
                                "w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-md border border-background overflow-hidden",
                                msg.role === "user"
                                    ? "bg-gradient-to-br from-zinc-700 to-zinc-800"
                                    : "bg-gradient-to-br from-indigo-500 to-purple-600"
                            )}>
                                {msg.role === "user" ? (
                                    userSettings.ai.userAvatar ? <img src={userSettings.ai.userAvatar} className="w-full h-full object-cover" alt={t("user")} /> : <User className="w-4 h-4 text-white" />
                                ) : (
                                    userSettings.ai.aiAvatar ? <img src={userSettings.ai.aiAvatar} className="w-full h-full object-cover" alt={t("ai")} /> : <Zap className="w-4 h-4 text-white" />
                                )}
                            </div>
                            <div className="space-y-2">
                                <div className={cn(
                                    "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg",
                                    msg.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-br-sm font-medium"
                                        : "bg-card text-card-foreground rounded-bl-lg border border-border/50"
                                )}>
                                    <div dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
                                </div>

                                {/* Transaction Action Card */}
                                {msg.action && msg.action.type === "create_transaction" && msg.action.status === "pending" && (
                                    <Card className="bg-card/80 border-border rounded-2xl p-4 backdrop-blur-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                                    msg.action.data.type === "income" ? "bg-emerald-500/20" : "bg-rose-500/20"
                                                )}>
                                                    {msg.action.data.type === "income"
                                                        ? <TrendingUp className="w-5 h-5 text-emerald-400" />
                                                        : <TrendingDown className="w-5 h-5 text-rose-400" />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{msg.action.data.title}</p>
                                                    <p className="text-xs text-zinc-500">{formatVND(msg.action.data.amount)}</p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => handleActionConfirm(msg.id)}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full px-5 h-9"
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> {t("confirm")}
                                            </Button>
                                        </div>
                                    </Card>
                                )}

                                {/* Task Action Card */}
                                {msg.action && msg.action.type === "create_task" && msg.action.status === "pending" && (
                                    <Card className="bg-card/80 border-border rounded-2xl p-4 backdrop-blur-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500/20">
                                                    <ListTodo className="w-5 h-5 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{msg.action.data.title}</p>
                                                    <p className="text-xs text-zinc-500">{t("addTask")}</p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => handleActionConfirm(msg.id)}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full px-5 h-9"
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> {t("new")}
                                            </Button>
                                        </div>
                                    </Card>
                                )}

                                {msg.action && msg.action.status === "completed" && (
                                    <div className="flex items-center gap-2 text-emerald-500 text-xs font-medium">
                                        <CheckCircle2 className="w-4 h-4" /> {t("addedSuccessfully")}
                                    </div>
                                )}

                                {/* Summary Card */}
                                {msg.action && msg.action.type === "show_summary" && (
                                    <Card className="bg-card/80 border-border rounded-2xl p-4 backdrop-blur-sm grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-1">{t("today")}</p>
                                            <p className={cn("text-lg font-bold", financeSummary.today.balance >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                                {financeSummary.today.balance >= 0 ? "+" : ""}{formatVND(financeSummary.today.balance)}
                                            </p>
                                        </div>
                                        <div className="text-center border-x border-zinc-800">
                                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-1">{t("thisWeek")}</p>
                                            <p className={cn("text-lg font-bold", financeSummary.week.balance >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                                {financeSummary.week.balance >= 0 ? "+" : ""}{formatVND(financeSummary.week.balance)}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-1">{t("thisMonth")}</p>
                                            <p className={cn("text-lg font-bold", financeSummary.month.balance >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                                {financeSummary.month.balance >= 0 ? "+" : ""}{formatVND(financeSummary.month.balance)}
                                            </p>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-[85%] flex gap-3">
                            <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                                <Zap className="w-4 h-4" />
                            </div>
                            <div className="p-4 rounded-2xl rounded-bl-sm bg-card border border-border/50 flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
                <div className="h-28 md:h-20" />
            </div>

            <div className="absolute bottom-8 left-0 right-0 px-6 z-20 md:bottom-8">
                <div className="max-w-4xl mx-auto flex items-end gap-3 bg-secondary/90 backdrop-blur-2xl p-3 px-5 rounded-3xl border border-border/50 shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20">
                    <textarea
                        className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-[15px] py-2 px-0 placeholder:text-zinc-600 font-medium text-foreground w-full resize-none min-h-[40px] max-h-[120px] overflow-y-auto no-scrollbar"
                        placeholder={t("chatPlaceholder")}
                        value={input}
                        rows={1}
                        onChange={(e) => {
                            setInput(e.target.value);
                            // Auto-resize
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <Button
                        size="icon"
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shrink-0 shadow-lg shadow-indigo-500/20 mb-0.5"
                        onClick={handleSend}
                        disabled={isLoading}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
