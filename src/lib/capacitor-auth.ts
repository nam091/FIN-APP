"use client";

import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { signIn, signOut } from "next-auth/react";

// Check if running in Capacitor (mobile app)
export const isCapacitor = (): boolean => {
    if (typeof window === "undefined") return false;
    return Capacitor.isNativePlatform();
};

// Handle Google Sign In
export const handleGoogleSignIn = async () => {
    if (isCapacitor()) {
        // On mobile: Use Chrome Custom Tab for OAuth
        // This is required because Google blocks OAuth from WebView
        const baseUrl = "https://www.allforpeople.dev";

        // Open the signin page in Chrome Custom Tab
        // After OAuth completes, deep link will bring user back to app
        await Browser.open({
            url: `${baseUrl}/api/auth/signin/google`,
            windowName: "_blank",
            presentationStyle: "popover"
        });
    } else {
        // On web: Use normal NextAuth signIn
        signIn("google", { callbackUrl: "/" });
    }
};

// Handle Sign Out
export const handleSignOut = async () => {
    if (isCapacitor()) {
        await Browser.open({
            url: "https://www.allforpeople.dev/api/auth/signout",
            windowName: "_blank"
        });
    } else {
        signOut({ callbackUrl: "/" });
    }
};
