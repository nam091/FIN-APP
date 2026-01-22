"use client";

import { Capacitor } from "@capacitor/core";
import { LocalNotifications, ScheduleOptions } from "@capacitor/local-notifications";

// Check if running in Capacitor
export const isCapacitor = (): boolean => {
    if (typeof window === "undefined") return false;
    return Capacitor.isNativePlatform();
};

// Request notification permissions
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!isCapacitor()) return false;

    try {
        const permission = await LocalNotifications.requestPermissions();
        return permission.display === "granted";
    } catch (error) {
        console.error("Error requesting notification permission:", error);
        return false;
    }
};

// Check if notifications are enabled
export const checkNotificationPermission = async (): Promise<boolean> => {
    if (!isCapacitor()) return false;

    try {
        const permission = await LocalNotifications.checkPermissions();
        return permission.display === "granted";
    } catch (error) {
        console.error("Error checking notification permission:", error);
        return false;
    }
};

// Schedule a notification for a task reminder
export const scheduleTaskReminder = async (
    taskId: string,
    title: string,
    body: string,
    scheduledTime: Date
): Promise<boolean> => {
    if (!isCapacitor()) return false;

    // Don't schedule if time is in the past
    if (scheduledTime <= new Date()) {
        console.log("Scheduled time is in the past, skipping notification");
        return false;
    }

    try {
        const notificationId = hashStringToNumber(taskId);

        const options: ScheduleOptions = {
            notifications: [
                {
                    id: notificationId,
                    title: title,
                    body: body,
                    schedule: {
                        at: scheduledTime,
                        allowWhileIdle: true,
                    },
                    sound: "default",
                    smallIcon: "ic_notification",
                    largeIcon: "ic_launcher",
                    channelId: "task-reminders",
                    extra: {
                        taskId: taskId,
                    },
                },
            ],
        };

        await LocalNotifications.schedule(options);
        console.log(`Scheduled notification for task ${taskId} at ${scheduledTime}`);
        return true;
    } catch (error) {
        console.error("Error scheduling notification:", error);
        return false;
    }
};

// Schedule a daily tracker reminder
export const scheduleTrackerReminder = async (
    trackerId: string,
    trackerName: string,
    hour: number = 20, // Default 8 PM
    minute: number = 0
): Promise<boolean> => {
    if (!isCapacitor()) return false;

    try {
        const notificationId = hashStringToNumber(`tracker-${trackerId}`);

        // Schedule daily at specified time
        const options: ScheduleOptions = {
            notifications: [
                {
                    id: notificationId,
                    title: `Tracker: ${trackerName}`,
                    body: `Don't forget to log your ${trackerName} today!`,
                    schedule: {
                        on: {
                            hour: hour,
                            minute: minute,
                        },
                        allowWhileIdle: true,
                    },
                    sound: "default",
                    smallIcon: "ic_notification",
                    largeIcon: "ic_launcher",
                    channelId: "tracker-reminders",
                    extra: {
                        trackerId: trackerId,
                    },
                },
            ],
        };

        await LocalNotifications.schedule(options);
        console.log(`Scheduled daily tracker reminder for ${trackerName} at ${hour}:${minute}`);
        return true;
    } catch (error) {
        console.error("Error scheduling tracker reminder:", error);
        return false;
    }
};

// Cancel a scheduled notification
export const cancelNotification = async (id: string): Promise<boolean> => {
    if (!isCapacitor()) return false;

    try {
        const notificationId = hashStringToNumber(id);
        await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
        console.log(`Cancelled notification for ${id}`);
        return true;
    } catch (error) {
        console.error("Error cancelling notification:", error);
        return false;
    }
};

// Cancel all pending notifications
export const cancelAllNotifications = async (): Promise<boolean> => {
    if (!isCapacitor()) return false;

    try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
            await LocalNotifications.cancel({ notifications: pending.notifications });
        }
        console.log("Cancelled all notifications");
        return true;
    } catch (error) {
        console.error("Error cancelling all notifications:", error);
        return false;
    }
};

// Get all pending notifications
export const getPendingNotifications = async () => {
    if (!isCapacitor()) return [];

    try {
        const pending = await LocalNotifications.getPending();
        return pending.notifications;
    } catch (error) {
        console.error("Error getting pending notifications:", error);
        return [];
    }
};

// Create notification channels for Android
export const createNotificationChannels = async (): Promise<void> => {
    if (!isCapacitor()) return;

    try {
        await LocalNotifications.createChannel({
            id: "task-reminders",
            name: "Task Reminders",
            description: "Notifications for task reminders",
            importance: 4, // High
            visibility: 1, // Public
            sound: "default",
            vibration: true,
        });

        await LocalNotifications.createChannel({
            id: "tracker-reminders",
            name: "Tracker Reminders",
            description: "Daily reminders for trackers",
            importance: 3, // Default
            visibility: 1,
            sound: "default",
            vibration: true,
        });

        console.log("Notification channels created");
    } catch (error) {
        console.error("Error creating notification channels:", error);
    }
};

// Helper: Convert string to a stable number for notification ID
function hashStringToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}
