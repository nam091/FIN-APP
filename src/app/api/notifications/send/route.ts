"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

interface NotificationPayload {
    taskId: number;
    taskTitle: string;
    dueDate: string;
    dueTime?: string;
    reminder: string;
    channel: "discord" | "telegram" | "webhook" | "gmail";
    webhookUrl: string;
    channelName: string;
}

// Send notification to Discord webhook
async function sendDiscord(url: string, taskTitle: string, dueDate: string, dueTime?: string) {
    const timeStr = dueTime ? ` at ${dueTime}` : "";
    const embed = {
        embeds: [{
            title: "⏰ Task Reminder",
            description: `**${taskTitle}**`,
            color: 0x5865F2, // Discord blurple
            fields: [
                { name: "Due", value: `${dueDate}${timeStr}`, inline: true },
            ],
            footer: { text: "FinApp Reminder" },
            timestamp: new Date().toISOString(),
        }]
    };

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(embed),
    });

    return res.ok;
}

// Send notification to Telegram bot
async function sendTelegram(botTokenAndChatId: string, taskTitle: string, dueDate: string, dueTime?: string) {
    // Format: BOT_TOKEN:CHAT_ID
    const [botToken, chatId] = botTokenAndChatId.split(":");
    if (!botToken || !chatId) {
        console.error("Invalid Telegram config. Expected format: BOT_TOKEN:CHAT_ID");
        return false;
    }

    const timeStr = dueTime ? ` at ${dueTime}` : "";
    const message = `⏰ *Task Reminder*\n\n📝 *${taskTitle}*\n📅 Due: ${dueDate}${timeStr}`;

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "Markdown",
        }),
    });

    return res.ok;
}

// Send notification to custom webhook
async function sendWebhook(url: string, taskTitle: string, dueDate: string, dueTime?: string) {
    const payload = {
        type: "task_reminder",
        task: {
            title: taskTitle,
            dueDate,
            dueTime,
        },
        timestamp: new Date().toISOString(),
    };

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    return res.ok;
}

export async function POST(request: NextRequest) {
    try {
        const body: NotificationPayload = await request.json();
        const { taskId, taskTitle, dueDate, dueTime, channel, webhookUrl, channelName } = body;

        if (!taskId || !taskTitle || !channel || !webhookUrl) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let success = false;

        switch (channel) {
            case "discord":
                success = await sendDiscord(webhookUrl, taskTitle, dueDate, dueTime);
                break;
            case "telegram":
                success = await sendTelegram(webhookUrl, taskTitle, dueDate, dueTime);
                break;
            case "webhook":
                success = await sendWebhook(webhookUrl, taskTitle, dueDate, dueTime);
                break;
            case "gmail":
                // TODO: Implement email sending via SMTP or API
                console.log("Gmail notifications not yet implemented");
                success = false;
                break;
            default:
                return NextResponse.json({ error: "Unknown channel type" }, { status: 400 });
        }

        if (success) {
            // Record that we sent this notification
            await db.taskReminder.upsert({
                where: {
                    taskId_channel: { taskId, channel },
                },
                update: { sentAt: new Date() },
                create: { taskId, channel },
            });

            return NextResponse.json({ success: true, channel, channelName });
        } else {
            return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
        }
    } catch (error) {
        console.error("Notification send error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
