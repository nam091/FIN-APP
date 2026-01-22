import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Notification sender functions
async function sendDiscordNotification(webhookUrl: string, message: string, taskTitle: string) {
    try {
        const payload = {
            embeds: [{
                title: "⏰ Task Reminder",
                description: message,
                color: 0x5865F2, // Discord blurple
                fields: [
                    { name: "Task", value: taskTitle, inline: true },
                ],
                timestamp: new Date().toISOString(),
                footer: { text: "FinApp Reminder" }
            }]
        };

        const res = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        return res.ok;
    } catch (error) {
        console.error("Discord notification error:", error);
        return false;
    }
}

async function sendTelegramNotification(botToken: string, chatId: string, message: string, taskTitle: string) {
    try {
        const text = `⏰ *Task Reminder*\n\n📝 *${taskTitle}*\n${message}`;
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: "Markdown",
            }),
        });

        return res.ok;
    } catch (error) {
        console.error("Telegram notification error:", error);
        return false;
    }
}

async function sendWebhookNotification(webhookUrl: string, message: string, taskTitle: string, taskData: any) {
    try {
        const payload = {
            type: "task_reminder",
            task: {
                id: taskData.id,
                title: taskTitle,
                dueDate: taskData.dueDate,
                dueTime: taskData.dueTime,
            },
            message: message,
            timestamp: new Date().toISOString(),
        };

        const res = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        return res.ok;
    } catch (error) {
        console.error("Webhook notification error:", error);
        return false;
    }
}

// Parse reminder string to minutes before
function parseReminderToMinutes(reminder: string): number {
    switch (reminder) {
        case "5min": return 5;
        case "15min": return 15;
        case "30min": return 30;
        case "1hour": return 60;
        case "1day": return 1440;
        default: return 0;
    }
}

export async function GET(request: Request) {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

        // Get all tasks with reminders that are due today
        const tasksWithReminders = await db.task.findMany({
            where: {
                completed: false,
                dueDate: currentDate,
                reminder: { not: "none" },
                dueTime: { not: null },
            },
            include: {
                user: {
                    include: {
                        settings: true,
                    },
                },
            },
        });

        const notificationsSent: string[] = [];

        for (const task of tasksWithReminders) {
            if (!task.dueTime || !task.reminder) continue;

            // Parse due time
            const [hours, minutes] = task.dueTime.split(':').map(Number);
            const dueDateTime = new Date(now);
            dueDateTime.setHours(hours, minutes, 0, 0);

            // Calculate reminder time
            const reminderMinutes = parseReminderToMinutes(task.reminder);
            const reminderTime = new Date(dueDateTime.getTime() - reminderMinutes * 60 * 1000);

            // Check if it's time to send reminder (within 1 minute window)
            const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
            if (timeDiff > 60000) continue; // Skip if not within 1 minute window

            // Get user notification settings
            const settingsData = task.user.settings?.data as any;
            const notifications = settingsData?.notifications;

            if (!notifications?.enabled || !notifications?.hooks?.length) continue;

            const message = `Your task "${task.title}" is due in ${reminderMinutes} minutes!`;

            // Send to all enabled hooks
            for (const hook of notifications.hooks) {
                if (!hook.enabled) continue;

                let success = false;

                switch (hook.type) {
                    case "discord":
                        success = await sendDiscordNotification(hook.url, message, task.title);
                        break;
                    case "telegram":
                        // URL format: botToken:chatId
                        const [botToken, chatId] = hook.url.split(':');
                        if (botToken && chatId) {
                            success = await sendTelegramNotification(botToken, chatId, message, task.title);
                        }
                        break;
                    case "webhook":
                        success = await sendWebhookNotification(hook.url, message, task.title, task);
                        break;
                }

                if (success) {
                    notificationsSent.push(`${hook.type}: ${task.title}`);
                }
            }
        }

        return NextResponse.json({
            success: true,
            checked: tasksWithReminders.length,
            notificationsSent: notificationsSent.length,
            details: notificationsSent,
        });
    } catch (error) {
        console.error("Check reminders error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
