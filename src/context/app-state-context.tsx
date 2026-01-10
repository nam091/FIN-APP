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

type TabType = "home" | "finance" | "tasks" | "notes" | "ai" | "settings" | "add";

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
        endpoint: "http://proxy.allforpeople.ninja/v1/chat/completions",
        apiKey: "proxypal-local",
        model: "gemini-3-flash-preview",
        userAvatar: "",
        aiAvatar: ""
    }
};

export function AppStateProvider({ children }: { children: ReactNode }) {
    const [activeTab, setActiveTab] = useState<TabType>("finance");
    const [financeFilter, setFinanceFilter] = useState("All");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [dismissedItems, setDismissedItems] = useState<string[]>([]);
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [userSettings, setUserSettings] = useState<UserSettings>(initialSettings);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>(initialChatHistory);

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
        setDismissedItems((prev) => [...prev, id]);
    };

    const toggleTask = (id: number) => {
        setTasks((prev) => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const { data: session } = useSession();

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
                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, googleEventId: data.event.id } : t));
                }
            }
        } catch (error) {
            console.error("Failed to sync to calendar:", error);
        }
    };

    const addTask = (task: Omit<Task, "id">) => {
        const newTask = { ...task, id: Date.now() };
        setTasks(prev => [newTask, ...prev]);
        syncToGoogleCalendar(newTask);
    };

    const updateTask = (id: number, task: Partial<Task>) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...task } : t));
        // Simple fire-and-forget sync for updates for now - ideally we'd update the specific event
        // But for MVP, if we have the full task content, we could try to sync.
        // Getting the full task is tricky here without finding it first.
        // Let's defer "update existing event" logic for a cleaner implementation later needed.
    };

    const deleteTask = (id: number) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const addTransaction = (tx: Omit<Transaction, "id">) => {
        const newTx = { ...tx, id: Date.now().toString() };
        setTransactions(prev => [newTx, ...prev]);
    };

    const addNote = (note: Omit<Note, "id">) => {
        const newNote = { ...note, id: Date.now().toString() };
        setNotes(prev => [newNote, ...prev]);
    };

    const updateNote = (id: string, note: Partial<Note>) => {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, ...note } : n));
    };

    const deleteNote = (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id));
    };

    const updateTransaction = (id: string, tx: Partial<Transaction>) => {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...tx } : t));
    };

    const deleteTransaction = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const updateSettings = (settings: Partial<UserSettings>) => {
        setUserSettings(prev => ({ ...prev, ...settings }));
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
        const now = new Date("2026-01-10"); // Reference current time from metadata
        const todayStr = "2026-01-10";

        // Simple week logic: last 7 days from reference
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);

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
            dismissedItems,
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
            setChatHistory
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
