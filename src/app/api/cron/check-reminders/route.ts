import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// This endpoint is called by Vercel Cron every minute
// It checks for tasks with reminders that are due and sends notifications

function parseReminderMinutes(reminder: string): number {
    switch (reminder) {
        case "5min": return 5;
        case "15min": return 15;
        case "30min": return 30;
        case "1hour": return 60;
        case "1day": return 60 * 24;
        default: return 0;
    }
}

function getTaskDueDateTime(dueDate: string, dueTime?: string): Date | null {
    if (!dueDate) return null;

    try {
        const [year, month, day] = dueDate.split("-").map(Number);
        let hours = 9, minutes = 0; // Default to 9 AM

        if (dueTime) {
            const [h, m] = dueTime.split(":").map(Number);
            hours = h || 9;
            minutes = m || 0;
        }

        return new Date(year, month - 1, day, hours, minutes);
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    // Verify cron secret for security (optional but recommended)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        // Allow without auth in development
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    try {
        const now = new Date();
        console.log(`[CRON] Checking reminders at ${now.toISOString()}`);

        // Get all tasks with reminders that haven't been completed
        const tasks = await db.task.findMany({
            where: {
                completed: false,
                reminder: { not: "none" },
                dueDate: { not: null },
            },
            include: {
                user: {
                    include: {
                        settings: true,
                    },
                },
                reminders: true,
            },
        });

        console.log(`[CRON] Found ${tasks.length} tasks with reminders`);

        let sentCount = 0;

        for (const task of tasks) {
            const dueDateTime = getTaskDueDateTime(task.dueDate!, task.dueTime ?? undefined);
            if (!dueDateTime) continue;

            const reminderMinutes = parseReminderMinutes(task.reminder || "");
            if (reminderMinutes === 0) continue;

            // Calculate when the reminder should be sent
            const reminderTime = new Date(dueDateTime.getTime() - reminderMinutes * 60 * 1000);

            // Check if we're within the reminder window (within 1 minute)
            const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
            const isInWindow = timeDiff < 60 * 1000; // 1 minute window

            if (!isInWindow) continue;

            // Get user's notification settings
            const settingsData = task.user.settings?.data as any;
            const notifications = settingsData?.notifications;

            if (!notifications?.enabled || !notifications?.hooks?.length) continue;

            // Send to each configured hook
            for (const hook of notifications.hooks) {
                if (!hook.enabled) continue;

                // Check if we already sent this reminder
                const alreadySent = task.reminders.some(r => r.channel === hook.type);
                if (alreadySent) continue;

                // Send the notification
                try {
                    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/notifications/send`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            taskId: task.id,
                            taskTitle: task.title,
                            dueDate: task.dueDate,
                            dueTime: task.dueTime,
                            reminder: task.reminder,
                            channel: hook.type,
                            webhookUrl: hook.url,
                            channelName: hook.name,
                        }),
                    });

                    if (response.ok) {
                        sentCount++;
                        console.log(`[CRON] Sent reminder for task "${task.title}" to ${hook.type}`);
                    } else {
                        console.error(`[CRON] Failed to send to ${hook.type}:`, await response.text());
                    }
                } catch (error) {
                    console.error(`[CRON] Error sending to ${hook.type}:`, error);
                }
            }
        }

        return NextResponse.json({
            success: true,
            checked: tasks.length,
            sent: sentCount,
            timestamp: now.toISOString(),
        });
    } catch (error) {
        console.error("[CRON] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
