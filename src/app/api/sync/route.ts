import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Find or create user
        let user = await db.user.findUnique({
            where: { email: session.user.email },
            include: {
                tasks: {
                    include: { completionLogs: true }
                },
                transactions: true,
                notes: true,
                settings: true,
                trackers: {
                    include: { entries: true }
                },
            },
        });

        if (!user) {
            user = await db.user.create({
                data: {
                    email: session.user.email,
                    name: session.user.name,
                    image: session.user.image,
                    settings: {
                        create: {
                            theme: "dark",
                        },
                    },
                },
                include: {
                    tasks: {
                        include: { completionLogs: true }
                    },
                    transactions: true,
                    notes: true,
                    settings: true,
                    trackers: {
                        include: { entries: true }
                    },
                },
            });
        }

        return NextResponse.json({
            tasks: user.tasks,
            transactions: user.transactions,
            notes: user.notes,
            settings: user.settings,
            trackers: user.trackers,
        });
    } catch (error) {
        console.error("Sync API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
