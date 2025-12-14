import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json(
                { error: "URL is required" },
                { status: 400 }
            );
        }

        // Proxy request to Python backend - get video info with formats
        const backendUrl = "http://127.0.0.1:8000/api/info";

        try {
            const backendResponse = await fetch(backendUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });

            if (!backendResponse.ok) {
                const errorText = await backendResponse.text();
                console.error("Backend Error:", errorText);
                let errorMessage = "Failed to process video";
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.detail || errorMessage;
                } catch (e) { }

                return NextResponse.json(
                    { error: errorMessage },
                    { status: backendResponse.status }
                );
            }

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
