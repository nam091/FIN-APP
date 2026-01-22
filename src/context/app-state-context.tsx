"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";
import {
    Utensils,
    ShoppingBag,
    Briefcase,
    Car,
    Dumbbell,
    Heart,
    Zap,
    Coffee
} from "lucide-react";
import { useSession } from "next-auth/react";
import { getLocalDateString } from "@/lib/date-utils";
import { translations, TranslationKey } from "@/lib/translations";

type TabType = "home" | "finance" | "tasks" | "notes" | "tracking" | "ai" | "settings" | "add";

export interface Transaction {
    id: string;
    date: string; // ISO format or "2026-01-10"
    title: string;
    category: string;
    amount: number;
    type: "income" | "expense";
    iconName: string;
}

export interface Task {
    id: number;
    title: string;
    project: string;
    type: string;
    completed: boolean;
    dueDate?: string;
    dueTime?: string;
    reminder?: string;
    repeat?: string;
    googleEventId?: string;
    createdAt?: string; // Added for tracking completion history
}

export interface Note {
    id: string;
    title: string;
    content: string;
    category: string;
    date: string;
    tags: string[];
}

export interface ChatMessage {
    id: number;
    role: "user" | "assistant";
    content: string;
    action?: {
        type: "create_task" | "create_transaction" | "create_note" | "show_summary";
        data?: any;
        status?: "pending" | "completed" | "failed";
    };
}

interface NotificationHook {
    id: string;
    name: string;
    type: "discord" | "telegram" | "gmail" | "webhook";
    url: string;
    enabled: boolean;
}

interface UserSettings {
    theme: "dark" | "light" | "system";
    dismissedItems: Record<string, number>;
    notifications: {
        enabled: boolean;
        hooks: NotificationHook[];
    };
    integrations: {
        googleCalendarSync: boolean;
        lastSync?: string;
    };
    ai: {
        endpoint: string;
        apiKey: string;
        model: string;
        userAvatar?: string;
        aiAvatar?: string;
    };
    language: string;
}

interface AppState {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
    financeFilter: string;
    setFinanceFilter: (filter: string) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    dismissedItems: string[];
    dismissItem: (id: string) => void;
    tasks: Task[];
    toggleTask: (id: number) => void;
    addTask: (task: Omit<Task, "id">) => void;
    updateTask: (id: number, task: Partial<Task>) => void;
    deleteTask: (id: number) => void;
    transactions: Transaction[];
    addTransaction: (tx: Omit<Transaction, "id">) => void;
    updateTransaction: (id: string, tx: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;
    financeSummary: {
        today: { income: number; expense: number; balance: number };
        week: { income: number; expense: number; balance: number };
        month: { income: number; expense: number; balance: number };
    };
    userSettings: UserSettings;
    notes: Note[];
    addNote: (note: Omit<Note, "id">) => void;
    updateNote: (id: string, note: Partial<Note>) => void;
    deleteNote: (id: string) => void;
    updateSettings: (settings: Partial<UserSettings>) => void;
    addNotificationHook: (hook: Omit<NotificationHook, "id">) => void;
    removeNotificationHook: (id: string) => void;
    chatHistory: ChatMessage[];
    setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    t: (key: TranslationKey) => string;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

const initialTasks: Task[] = [
    { id: 1, title: "Try Talk: add tasks via voice.", project: "Getting Started", type: "me", completed: false },
    { id: 2, title: "Create your first list in the homescreen", project: "Getting Started", type: "me", completed: false },
    { id: 3, title: "Tap and hold this task, then drag", project: "Getting Started", type: "others", completed: false },
    { id: 4, title: "Swipe left on this task to add subtasks & more", project: "Getting Started", type: "upcoming", completed: false },
    { id: 5, title: "Add due dates by typing phrases like 'Tomorrow' or 'Monday at 10am'", project: "Getting Started", type: "upcoming", completed: false },
    { id: 6, title: "Tap anywhere and just start typing", project: "Getting Started", type: "me", completed: false },
    { id: 7, title: "Tap the checkmark to complete this task", project: "Getting Started", type: "me", completed: false },
];

const initialTransactions: Transaction[] = [
    { id: "1", date: "2026-01-10", title: "Dinner at Sotto Sotto", category: "Dining & Drinks", amount: 84.20, type: "expense", iconName: "Utensils" },
    { id: "2", date: "2026-01-10", title: "Apple Store", category: "Electronics", amount: 129.00, type: "expense", iconName: "ShoppingBag" },
    { id: "3", date: "2026-01-09", title: "Payroll Deposit", category: "Income", amount: 3250.00, type: "income", iconName: "Briefcase" },
    { id: "4", date: "2026-01-09", title: "Uber Trip", category: "Transportation", amount: 14.50, type: "expense", iconName: "Car" },
    { id: "5", date: "2026-01-09", title: "Equinox Membership", category: "Health & Fitness", amount: 225.00, type: "expense", iconName: "Dumbbell" },
    { id: "6", date: "2026-01-08", title: "Starbucks", category: "Dining & Drinks", amount: 6.50, type: "expense", iconName: "Coffee" },
    { id: "7", date: "2026-01-07", title: "Weekly Groceries", category: "Shopping", amount: 156.00, type: "expense", iconName: "ShoppingBag" },
];

const initialNotes: Note[] = [
    {
        id: "1",
        title: "Project Ideas",
        content: "Build a personal finance app with AI assistant and premium design.",
        category: "Ideas",
        date: "2026-01-10",
        tags: ["Project", "AI", "Finance"]
    },
    {
        id: "2",
        title: "Grocery List",
        content: "Milk, Eggs, Bread, Coffee beans, Spinach.",
        category: "Personal",
        date: "2026-01-09",
        tags: ["Food", "Daily"]
    }
];

const initialChatHistory: ChatMessage[] = [
    {
        id: 1,
        role: "assistant",
        content: "Xin chào! Tôi là **Trợ lý Tài chính & Năng suất** của bạn. Tôi có thể giúp bạn:\n\n• Xem tổng quan tài chính\n• Tạo giao dịch mới\n• Quản lý công việc\n\nTôi có thể giúp gì cho bạn hôm nay?"
    }
];

const initialSettings: UserSettings = {
    theme: "dark",
    dismissedItems: {},
    notifications: {
        enabled: true,
        hooks: [
            { id: "1", name: "Discord Server", type: "discord", url: "https://discord.com/api/webhooks/...", enabled: true },
        ]
    },
    integrations: {
        googleCalendarSync: false
    },
    ai: {
        endpoint: "http://159.223.33.155:8317/v1",
        apiKey: "proxypal-apikey",
        model: "gemini-3-flash-preview",
        userAvatar: "",
        aiAvatar: ""
    },
    language: "en"
};

export function AppStateProvider({ children }: { children: ReactNode }) {
    const [activeTab, setActiveTab] = useState<TabType>("finance");
    const [financeFilter, setFinanceFilter] = useState("All");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [userSettings, setUserSettings] = useState<UserSettings>(initialSettings);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>(initialChatHistory);

    const { data: session } = useSession();

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user?.email) return;
            try {
                console.log("AppStateContext: Fetching data from /api/sync...");
                const res = await fetch("/api/sync");
                if (res.ok) {
                    const data = await res.json();
                    console.log("AppStateContext: Sync success, data received.");
                    setTasks(data.tasks || []);
                    setTransactions(data.transactions || []);
                    setNotes(data.notes || []);
                    // Load from localStorage as fallback/priority
                    const localLang = localStorage.getItem("finapp_language");
                    if (localLang) {
                        setUserSettings(prev => ({ ...prev, language: localLang }));
                        document.documentElement.lang = localLang;
                    }

                    if (data.settings) {
                        const parsedData = typeof data.settings.data === 'string'
                            ? JSON.parse(data.settings.data)
                            : (data.settings.data || {});

                        // Migration: If dismissedItems is array, convert to object
                        if (Array.isArray(parsedData.dismissedItems)) {
                            const migrated: Record<string, number> = {};
                            parsedData.dismissedItems.forEach((id: string) => {
                                migrated[id] = Date.now();
                            });
                            parsedData.dismissedItems = migrated;
                        }

                        setUserSettings(prev => ({
                            ...prev,
                            ...parsedData, // Merge saved settings
                            theme: data.settings.theme
                        }));
                    }
                }
            } catch (error) {
                console.error("Failed to sync data", error);
            }
        };
        fetchData();
    }, [session]);

    // Persistence for Chat History
    useEffect(() => {
        const savedChat = localStorage.getItem("finapp_chat_history");
        if (savedChat) {
            try {
                setChatHistory(JSON.parse(savedChat));
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("finapp_chat_history", JSON.stringify(chatHistory));
    }, [chatHistory]);

    // Theme application
    useEffect(() => {
        const root = window.document.documentElement;
        if (userSettings.theme === "dark") {
            root.classList.add("dark");
        } else if (userSettings.theme === "light") {
            root.classList.remove("dark");
        } else {
            // System theme logic
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            if (systemTheme === "dark") root.classList.add("dark");
            else root.classList.remove("dark");
        }
    }, [userSettings.theme]);

    const dismissItem = (id: string) => {
        const newDismissed = { ...userSettings.dismissedItems, [id]: Date.now() };
        updateSettings({ dismissedItems: newDismissed });
    };

    const toggleTask = async (id: number) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        // Optimistic update
        setTasks((prev) => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

        try {
            await fetch("/api/tasks", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, completed: !task.completed }),
            });
        } catch (error) {
            console.error("Failed to toggle task", error);
            // Rollback
            setTasks((prev) => prev.map(t => t.id === id ? { ...t, completed: task.completed } : t));
        }
    };

    // session already retrieved above

    const syncToGoogleCalendar = async (task: Task) => {
        if (!session || !userSettings.integrations.googleCalendarSync || !task.dueDate) return;

        try {
            const startTime = task.dueTime
                ? new Date(`${task.dueDate}T${task.dueTime}`).toISOString()
                : new Date(`${task.dueDate}T09:00:00`).toISOString();

            // Default 1 hour duration
            const endDate = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();

            const response = await fetch("/api/calendar/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: task.title,
                    description: `Project: ${task.project}\n${task.repeat ? `Repeat: ${task.repeat}` : ""}`,
                    startTime,
                    endTime: endDate,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.event?.id) {
                    await fetch("/api/tasks", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: task.id, googleEventId: data.event.id }),
                    });
                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, googleEventId: data.event.id } : t));
                }
            }
        } catch (error) {
            console.error("Failed to sync to calendar:", error);
        }
    };

    const addTask = async (task: Omit<Task, "id">) => {
        console.log("AppStateContext: addTask called with", task);
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(task),
            });
            if (res.ok) {
                const newTask = await res.json();
                console.log("AppStateContext: addTask success, new task:", newTask);
                setTasks(prev => [newTask, ...prev]);
                syncToGoogleCalendar(newTask);
            } else {
                console.error("AppStateContext: addTask failed with status", res.status);
                const errorText = await res.text();
                console.error("Error details:", errorText);
            }
        } catch (error) {
            console.error("AppStateContext: Failed to add task", error);
        }
    };

    const updateTask = async (id: number, task: Partial<Task>) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...task } : t));
        try {
            await fetch("/api/tasks", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...task }),
            });
        } catch (error) {
            console.error("Failed to update task", error);
        }
    };

    const deleteTask = async (id: number) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        try {
            await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
        } catch (error) {
            console.error("Failed to delete task", error);
        }
    };

    const addTransaction = async (tx: Omit<Transaction, "id">) => {
        try {
            const res = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tx),
            });
            if (res.ok) {
                const newTx = await res.json();
                setTransactions(prev => [newTx, ...prev]);
            }
        } catch (error) {
            console.error("Failed to add transaction", error);
        }
    };

    const addNote = async (note: Omit<Note, "id">) => {
        try {
            const res = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(note),
            });
            if (res.ok) {
                const newNote = await res.json();
                setNotes(prev => [newNote, ...prev]);
            }
        } catch (error) {
            console.error("Failed to add note", error);
        }
    };

    const updateNote = async (id: string, note: Partial<Note>) => {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, ...note } : n));
        try {
            await fetch("/api/notes", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...note }),
            });
        } catch (error) {
            console.error("Failed to update note", error);
        }
    };

    const deleteNote = async (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id));
        try {
            await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
        } catch (error) {
            console.error("Failed to delete note", error);
        }
    };

    const updateTransaction = async (id: string, tx: Partial<Transaction>) => {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...tx } : t));
        try {
            await fetch("/api/transactions", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...tx }),
            });
        } catch (error) {
            console.error("Failed to update transaction", error);
        }
    };

    const deleteTransaction = async (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
        try {
            await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
        } catch (error) {
            console.error("Failed to delete transaction", error);
        }
    };

    const updateSettings = async (settings: Partial<UserSettings>) => {
        setUserSettings(prev => ({ ...prev, ...settings }));
        try {
            await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...userSettings, ...settings }),
            });
        } catch (error) {
            console.error("Failed to update settings", error);
        }
    };

    const addNotificationHook = (hook: Omit<NotificationHook, "id">) => {
        const newHook = { ...hook, id: Date.now().toString() };
        setUserSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                hooks: [...prev.notifications.hooks, newHook]
            }
        }));
    };

    const removeNotificationHook = (id: string) => {
        setUserSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                hooks: prev.notifications.hooks.filter(h => h.id !== id)
            }
        }));
    };

    const financeSummary = useMemo(() => {
        const now = new Date();
        const todayStr = getLocalDateString(now);

        // Simple week logic: last 7 days from now
        const weekAgoStr = getLocalDateString(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
        const weekAgo = new Date(weekAgoStr);

        // Simple month logic: current month
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const summary = {
            today: { income: 0, expense: 0, balance: 0 },
            week: { income: 0, expense: 0, balance: 0 },
            month: { income: 0, expense: 0, balance: 0 },
        };

        transactions.forEach(tx => {
            const txDate = new Date(tx.date);
            const isToday = tx.date === todayStr;
            const isThisWeek = txDate >= weekAgo;
            const isThisMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;

            if (isToday) {
                if (tx.type === "income") summary.today.income += tx.amount;
                else summary.today.expense += tx.amount;
            }

            if (isThisWeek) {
                if (tx.type === "income") summary.week.income += tx.amount;
                else summary.week.expense += tx.amount;
            }

            if (isThisMonth) {
                if (tx.type === "income") summary.month.income += tx.amount;
                else summary.month.expense += tx.amount;
            }
        });

        summary.today.balance = summary.today.income - summary.today.expense;
        summary.week.balance = summary.week.income - summary.week.expense;
        summary.month.balance = summary.month.income - summary.month.expense;

        return summary;
    }, [transactions]);

    return (
        <AppStateContext.Provider value={{
            activeTab,
            setActiveTab,
            financeFilter,
            setFinanceFilter,
            isSidebarOpen,
            setIsSidebarOpen,
            dismissedItems: useMemo(() => {
                const now = Date.now();
                const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
                const items = userSettings.dismissedItems || {};
                return Object.keys(items).filter(key => {
                    const timestamp = items[key];
                    return (now - timestamp) < sevenDaysMs;
                });
            }, [userSettings.dismissedItems]),
            dismissItem,
            tasks,
            toggleTask,
            addTask,
            updateTask,
            deleteTask,
            transactions,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            financeSummary,
            notes,
            addNote,
            updateNote,
            deleteNote,
            userSettings,
            updateSettings,
            addNotificationHook,
            removeNotificationHook,
            chatHistory,
            setChatHistory,
            t: (key: TranslationKey) => {
                const lang = (userSettings.language as "en" | "vi") || "en";
                return translations[lang][key] || translations.en[key] || key;
            }
        }}>
            {children}
        </AppStateContext.Provider>
    );
}

export function useAppState() {
    const context = useContext(AppStateContext);
    if (context === undefined) {
        throw new Error("useAppState must be used within an AppStateProvider");
    }
    return context;
}
