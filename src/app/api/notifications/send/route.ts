import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Test notification endpoint
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { type, url, testMessage } = await request.json();

        if (!type || !url) {
            return NextResponse.json({ error: "Missing type or url" }, { status: 400 });
        }

        const message = testMessage || "This is a test notification from FinApp!";
        let success = false;
        let errorMessage = "";

        switch (type) {
            case "discord":
                try {
                    const discordPayload = {
                        embeds: [{
                            title: "🔔 Test Notification",
                            description: message,
                            color: 0x5865F2,
                            timestamp: new Date().toISOString(),
                            footer: { text: "FinApp Notification System" }
                        }]
                    };

                    const discordRes = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(discordPayload),
                    });

                    success = discordRes.ok;
                    if (!success) {
                        errorMessage = `Discord returned status ${discordRes.status}`;
                    }
                } catch (e: any) {
                    errorMessage = e.message;
                }
                break;

            case "telegram":
                try {
                    // URL format: botToken:chatId
                    const [botToken, chatId] = url.split(':');
                    if (!botToken || !chatId) {
                        errorMessage = "Invalid Telegram format. Use: botToken:chatId";
                        break;
                    }

                    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
                    const telegramRes = await fetch(telegramUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: `🔔 *Test Notification*\n\n${message}`,
                            parse_mode: "Markdown",
                        }),
                    });

                    const telegramData = await telegramRes.json();
                    success = telegramData.ok;
                    if (!success) {
                        errorMessage = telegramData.description || "Telegram API error";
                    }
                } catch (e: any) {
                    errorMessage = e.message;
                }
                break;

            case "webhook":
                try {
                    const webhookPayload = {
                        type: "test",
                        message: message,
                        timestamp: new Date().toISOString(),
                        source: "FinApp",
                    };

                    const webhookRes = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(webhookPayload),
                    });

                    success = webhookRes.ok;
                    if (!success) {
                        errorMessage = `Webhook returned status ${webhookRes.status}`;
                    }
                } catch (e: any) {
                    errorMessage = e.message;
                }
                break;

            default:
                return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
        }

        return NextResponse.json({
            success,
            message: success ? "Notification sent successfully!" : `Failed: ${errorMessage}`,
        });
    } catch (error: any) {
        console.error("Send notification error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
