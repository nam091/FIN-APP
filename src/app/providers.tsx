"use client";

import { SessionProvider } from "next-auth/react";
import { AppStateProvider } from "@/context/app-state-context";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AppStateProvider>
                {children}
            </AppStateProvider>
        </SessionProvider>
    );
}
