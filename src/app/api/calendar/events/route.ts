import { google } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: (session as any).accessToken });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: "startTime",
        });

        return NextResponse.json({ events: response.data.items });
    } catch (error) {
        console.error("Calendar API Error:", error);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !(session as any).accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, description, startTime, endTime } = body;

        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: (session as any).accessToken });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        const event = {
            summary: title,
            description: description,
            start: {
                dateTime: startTime, // ISO string
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
                dateTime: endTime, // ISO string
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
        };

        const response = await calendar.events.insert({
            calendarId: "primary",
            requestBody: event,
        });

        return NextResponse.json({ event: response.data });
    } catch (error) {
        console.error("Calendar Insert Error:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
