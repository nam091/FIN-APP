"use client";

import { SessionProvider } from "next-auth/react";
import { AppStateProvider } from "@/context/app-state-context";
import { CapacitorDeepLinkHandler } from "@/components/capacitor-deep-link-handler";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AppStateProvider>
                <CapacitorDeepLinkHandler />
                {children}
            </AppStateProvider>
        </SessionProvider>
    );
}
