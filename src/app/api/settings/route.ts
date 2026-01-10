import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        // body matches UserSettings interface

        const user = await db.user.findUnique({
            where: { email: session.user.email },
            include: { settings: true }
        });

        if (!user) return new NextResponse("User not found", { status: 404 });

        // Upsert settings
        const settings = await db.settings.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                theme: body.theme || "dark",
                data: JSON.stringify(body),
            },
            update: {
                theme: body.theme,
                data: JSON.stringify(body),
            },
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
