import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { video_url, filename } = body;

        if (!video_url) {
            return NextResponse.json(
                { error: "video_url is required" },
                { status: 400 }
            );
        }

        // Fetch video from CDN with proper headers
        const videoResponse = await fetch(video_url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://www.tiktok.com/",
            },
        });

        if (!videoResponse.ok) {
            return NextResponse.json(
                { error: "Failed to fetch video from source" },
                { status: videoResponse.status }
            );
        }

        const contentType = videoResponse.headers.get("content-type") || "video/mp4";
        const blob = await videoResponse.blob();

        // Return video with download headers
        return new NextResponse(blob, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${filename || 'video.mp4'}"`,
            },
        });

    } catch (error) {
        console.error("Proxy Download Error:", error);
        return NextResponse.json(
            { error: "Failed to proxy download" },
            { status: 500 }
        );
    }
}
