"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function CalendarConnectButton() {
    const { data: session, status } = useSession();
    const isLoading = status === "loading";
    const isConnected = !!session;

    if (isLoading) {
        return (
            <Button disabled className="rounded-2xl px-6 h-11 bg-secondary text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading...
            </Button>
        );
    }

    if (isConnected) {
        return (
            <Button
                onClick={() => signOut()}
                className="rounded-2xl px-6 h-11 font-bold bg-emerald-600/20 text-emerald-400 shadow-lg shadow-emerald-500/10 hover:bg-emerald-600/30"
            >
                Connected
            </Button>
        );
    }

    return (
        <Button
            onClick={() => signIn("google")}
            className="rounded-2xl px-6 h-11 font-bold bg-white text-black hover:bg-zinc-200"
        >
            Connect
        </Button>
    );
}

export function CalendarSyncStatus() {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <span>Connected as {session.user?.email}</span>
            <div className="flex items-center gap-1 text-indigo-400 cursor-pointer hover:underline">
                Synced
            </div>
        </div>
    );
}
