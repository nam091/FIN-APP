"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App, URLOpenListenerEvent } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import {
    requestNotificationPermission,
    createNotificationChannels
} from "@/lib/local-notifications";

export function CapacitorDeepLinkHandler() {
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        // Initialize notifications
        const initNotifications = async () => {
            await createNotificationChannels();
            await requestNotificationPermission();
        };

        // Listen for deep links (when app is opened via URL)
        const setupDeepLinkListener = async () => {
            await App.addListener("appUrlOpen", async (event: URLOpenListenerEvent) => {
                console.log("Deep link received:", event.url);

                // Close any open browser
                try {
                    await Browser.close();
                } catch {
                    // Browser might not be open
                }

                // If the URL is from our domain, reload to pick up session
                if (event.url.includes("allforpeople.dev")) {
                    // Small delay to ensure cookies are set
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 300);
                }
            });

            // Listen for app state changes (resume from background)
            await App.addListener("appStateChange", async (state) => {
                if (state.isActive) {
                    // App became active - might be returning from OAuth
                    // Check if there's a session by reloading
                    console.log("App resumed, checking session...");
                }
            });
        };

        // Listen for browser close
        const setupBrowserListener = async () => {
            await Browser.addListener("browserFinished", () => {
                console.log("Browser closed, reloading to check session...");
                // Reload to pick up any new session
                window.location.href = "/";
            });
        };

        initNotifications();
        setupDeepLinkListener();
        setupBrowserListener();

        return () => {
            App.removeAllListeners();
            Browser.removeAllListeners();
        };
    }, []);

    return null;
}
