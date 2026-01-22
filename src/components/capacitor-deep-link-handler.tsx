"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App, URLOpenListenerEvent } from "@capacitor/app";
import { Browser } from "@capacitor/browser";

export function CapacitorDeepLinkHandler() {
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        // Listen for deep links
        const setupDeepLinkListener = async () => {
            await App.addListener("appUrlOpen", async (event: URLOpenListenerEvent) => {
                // Close any open browser
                try {
                    await Browser.close();
                } catch {
                    // Browser might not be open
                }

                // If the URL contains auth callback, reload to pick up session
                if (event.url.includes("/api/auth/callback") || event.url.includes("allforpeople.dev")) {
                    // Small delay to ensure session is set
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                }
            });
        };

        setupDeepLinkListener();

        return () => {
            App.removeAllListeners();
        };
    }, []);

    return null;
}
