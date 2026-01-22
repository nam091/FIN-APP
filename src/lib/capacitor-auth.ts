"use client";

import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { signIn } from "next-auth/react";

// Check if running in Capacitor (mobile app)
export const isCapacitor = (): boolean => {
    if (typeof window === "undefined") return false;
    return Capacitor.isNativePlatform();
};

// Handle Google Sign In for both web and mobile
export const handleGoogleSignIn = async () => {
    if (isCapacitor()) {
        // On mobile: Open OAuth in system browser
        // The deep link will bring user back to the app
        const authUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://www.allforpeople.dev"}/api/auth/signin/google?callbackUrl=${encodeURIComponent("https://www.allforpeople.dev/")}`;

        await Browser.open({
            url: authUrl,
            presentationStyle: "popover"
        });

        // Listen for app resume to close browser
        Browser.addListener("browserFinished", () => {
            // Browser closed, reload to check session
            window.location.reload();
        });
    } else {
        // On web: Use normal NextAuth signIn
        signIn("google");
    }
};

// Handle Sign Out
export const handleSignOut = async () => {
    if (isCapacitor()) {
        const signOutUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://www.allforpeople.dev"}/api/auth/signout`;
        await Browser.open({ url: signOutUrl });
    } else {
        const { signOut } = await import("next-auth/react");
        signOut();
    }
};
