import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { endpoint, apiKey } = await req.json();

        if (!endpoint || !apiKey) {
            return NextResponse.json({ error: "Missing endpoint or apiKey" }, { status: 400 });
        }

        let baseUrl = endpoint;
        if (baseUrl.endsWith("/chat/completions")) {
            baseUrl = baseUrl.replace("/chat/completions", "");
        }

        // Standard OpenAI-compatible models endpoint
        const modelsEndpoint = baseUrl.endsWith("/v1") ? `${baseUrl}/models` : `${baseUrl}/v1/models`;

        console.log(`Proxying request to: ${modelsEndpoint}`);

        const response = await fetch(modelsEndpoint, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Proxy error: ${response.status} ${errorText}`);
            return NextResponse.json({ error: `Provider error: ${response.status}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Proxy internal error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
