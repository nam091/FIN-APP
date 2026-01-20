import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

// Log a completion for a task on a specific date
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { taskId, date, completed } = body;

        if (!taskId || !date) {
            return new NextResponse("taskId and date are required", { status: 400 });
        }

        const user = await db.user.findUnique({ where: { email: session.user.email } });
        if (!user) return new NextResponse("User not found", { status: 404 });

        // Verify task ownership
        const task = await db.task.findUnique({ where: { id: taskId } });
        if (!task || task.userId !== user.id) {
            return new NextResponse("Task not found or unauthorized", { status: 403 });
        }

        // Upsert completion log
        const log = await db.taskCompletionLog.upsert({
            where: {
                taskId_date: { taskId, date }
            },
            update: {
                completed: completed ?? true
            },
            create: {
                taskId,
                date,
                completed: completed ?? true
            }
        });

        return NextResponse.json(log);
    } catch (error: any) {
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
}

// Get completion history for daily tasks
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const taskId = searchParams.get("taskId");
        const days = parseInt(searchParams.get("days") || "14");

        const user = await db.user.findUnique({ where: { email: session.user.email } });
        if (!user) return new NextResponse("User not found", { status: 404 });

        // Calculate date range
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - days + 1);
        const startDateStr = startDate.toISOString().split('T')[0];

        if (taskId) {
            // Get history for specific task
            const task = await db.task.findUnique({ where: { id: parseInt(taskId) } });
            if (!task || task.userId !== user.id) {
                return new NextResponse("Task not found", { status: 404 });
            }

            const logs = await db.taskCompletionLog.findMany({
                where: {
                    taskId: parseInt(taskId),
                    date: { gte: startDateStr }
                },
                orderBy: { date: 'asc' }
            });

            return NextResponse.json({ taskId: parseInt(taskId), logs, createdAt: task.createdAt });
        } else {
            // Get history for all daily tasks
            const dailyTasks = await db.task.findMany({
                where: {
                    userId: user.id,
                    repeat: { in: ['daily', 'Daily', 'everyday', 'Everyday', 'hằng ngày'] }
                },
                include: {
                    completionLogs: {
                        where: { date: { gte: startDateStr } },
                        orderBy: { date: 'asc' }
                    }
                }
            });

            return NextResponse.json(dailyTasks);
        }
    } catch (error: any) {
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
}
