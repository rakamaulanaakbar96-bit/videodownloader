import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url, format_id } = body;

        if (!url || !format_id) {
            return NextResponse.json(
                { error: "URL and format_id are required" },
                { status: 400 }
            );
        }

        // Proxy request to Python backend - get direct video URL
        const backendUrl = "https://grouprk-video-downloader-api.hf.space/api/download";

        try {
            const backendResponse = await fetch(backendUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url, format_id }),
            });

            if (!backendResponse.ok) {
                const errorText = await backendResponse.text();
                console.error("Backend Error:", errorText);
                let errorMessage = "Failed to get video URL";
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.detail || errorMessage;
                } catch (e) { }

                return NextResponse.json(
                    { error: errorMessage },
                    { status: backendResponse.status }
                );
            }

            // Return JSON with direct URL - no file streaming needed!
            const data = await backendResponse.json();
            return NextResponse.json(data);

        } catch (fetchError) {
            console.error("Connection Error:", fetchError);
            return NextResponse.json(
                { error: "Could not connect to the backend server. Is it running?" },
                { status: 503 }
            );
        }

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
