"use client";

import { Capacitor } from "@capacitor/core";
import { signIn, signOut } from "next-auth/react";

// Check if running in Capacitor (mobile app)
export const isCapacitor = (): boolean => {
    if (typeof window === "undefined") return false;
    return Capacitor.isNativePlatform();
};

// Handle Google Sign In
// On mobile WebView, OAuth popup might not work well
// But since app loads from production URL, cookies should persist
export const handleGoogleSignIn = async () => {
    // Use redirect mode instead of popup for better mobile compatibility
    signIn("google", {
        callbackUrl: window.location.origin + "/",
        redirect: true
    });
};

// Handle Sign Out
export const handleSignOut = async () => {
    signOut({ callbackUrl: "/" });
};
