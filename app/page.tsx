"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, Link2, Play, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

interface FormatInfo {
    format_id: string;
    ext: string;
    resolution: string;
    filesize: number | null;
    filesize_approx: number | null;
    url: string;
    has_audio: boolean;
    has_video: boolean;
}

interface VideoInfo {
    title: string;
    thumbnail: string | null;
    platform: string;
    duration: number | null;
    formats: FormatInfo[];
}

export default function DownloaderPage() {
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    const [selectedFormat, setSelectedFormat] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const detectPlatform = (inputUrl: string): string => {
        if (inputUrl.includes("tiktok.com")) return "TikTok";
        if (inputUrl.includes("instagram.com")) return "Instagram";
        if (inputUrl.includes("facebook.com") || inputUrl.includes("fb.watch")) return "Facebook";
        if (inputUrl.includes("twitter.com") || inputUrl.includes("x.com")) return "Twitter/X";
        return "Unknown";
    };

    const getPlatformColor = (platform: string): string => {
        switch (platform) {
            case "TikTok": return "from-pink-500 to-cyan-500";
            case "Instagram": return "from-purple-500 via-pink-500 to-orange-400";
            case "Facebook": return "from-blue-600 to-blue-400";
            case "Twitter/X": return "from-slate-800 to-slate-600";
            default: return "from-violet-600 to-indigo-600";
        }
    };

    const formatFileSize = (bytes: number | null): string => {
        if (!bytes) return "";
        const mb = bytes / (1024 * 1024);
        if (mb >= 1) return `${mb.toFixed(1)} MB`;
        const kb = bytes / 1024;
        return `${kb.toFixed(0)} KB`;
    };

    const formatDuration = (seconds: number | null): string => {
        if (!seconds) return "";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setVideoInfo(null);
        setSelectedFormat("");

        if (!url.trim()) {
            setError("Please paste a valid video link.");
            return;
        }

        const platform = detectPlatform(url);
        if (platform === "Unknown") {
            setError("Unsupported platform. Please use TikTok, Instagram, Facebook, or Twitter.");
            return;
        }

        setIsLoading(true);

        try {
            // Call the backend API to get video info with formats
            const response = await fetch("/api/info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to process video");
            }

            const data = await response.json();
            setVideoInfo({
                title: data.title,
                thumbnail: data.thumbnail,
                platform: platform,
                duration: data.duration,
                formats: data.formats || [],
            });

            // Auto-select the first format with audio
            if (data.formats && data.formats.length > 0) {
                const withAudio = data.formats.find((f: FormatInfo) => f.has_audio);
                setSelectedFormat(withAudio?.format_id || data.formats[0].format_id);
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!videoInfo || !selectedFormat) return;

        setIsDownloading(true);
        setError(null);

        try {
            const response = await fetch("/api/download", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, format_id: selectedFormat }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get video URL");
            }

            const data = await response.json();

            if (!data.download_url) {
                throw new Error("No download URL received");
            }

            const filename = data.filename || `${videoInfo.title}.mp4`;

            try {
                // Attempt 1: Fetch as Blob to force download (Client-side, no Vercel bandwidth)
                const videoResponse = await fetch(data.download_url);
                if (!videoResponse.ok) throw new Error("Network response was not ok");

                const blob = await videoResponse.blob();
                const blobUrl = window.URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(blobUrl);
            } catch (blobError) {
                console.warn("Blob download failed (likely CORS), falling back to direct link:", blobError);

                // Attempt 2: Fallback to Direct Link (Browser might auto-play)
                const a = document.createElement("a");
                a.href = data.download_url;
                a.download = filename;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (err: any) {
            setError(err.message || "Download failed. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 md:p-8">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8 md:mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 mb-6">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        <span className="text-sm text-slate-300">Universal Video Downloader</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Download Videos{" "}
                        <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                            Instantly
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base md:text-lg max-w-md mx-auto">
                        Paste a link from TikTok, Instagram, Facebook, YouTube, or Twitter to download videos in high quality.
                    </p>
                </motion.div>

                {/* Input Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="mb-8"
                >
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 md:pl-5 flex items-center pointer-events-none">
                            <Link2 className="w-5 h-5 md:w-6 md:h-6 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste video link here..."
                            className="w-full pl-12 md:pl-14 pr-4 py-4 md:py-5 text-base md:text-lg bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-4 py-4 md:py-5 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-base md:text-lg rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5 md:w-6 md:h-6" />
                                Get Video
                            </>
                        )}
                    </button>
                </motion.form>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-300 text-sm md:text-base">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Video Preview Card */}
                <AnimatePresence>
                    {videoInfo && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-slate-800">
                                {videoInfo.thumbnail && (
                                    <img
                                        src={videoInfo.thumbnail}
                                        alt={videoInfo.title}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                {/* Platform Badge */}
                                <div
                                    className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getPlatformColor(videoInfo.platform)}`}
                                >
                                    {videoInfo.platform}
                                </div>
                                {/* Duration Badge */}
                                {videoInfo.duration && (
                                    <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white font-medium">
                                        {formatDuration(videoInfo.duration)}
                                    </div>
                                )}
                            </div>

                            {/* Info & Download */}
                            <div className="p-5 md:p-6">
                                <div className="flex items-start gap-3 mb-5">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-xs text-emerald-400 font-medium mb-1">Ready to Download</p>
                                        <h3 className="text-white font-semibold text-base md:text-lg line-clamp-2">
                                            {videoInfo.title}
                                        </h3>
                                    </div>
                                </div>

                                {/* Resolution Selector */}
                                {videoInfo.formats && videoInfo.formats.length > 0 && (
                                    <div className="mb-5">
                                        <label className="block text-sm text-slate-400 mb-2">
                                            Select Quality / Resolution
                                        </label>
                                        <select
                                            value={selectedFormat}
                                            onChange={(e) => setSelectedFormat(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                                        >
                                            {videoInfo.formats.map((format) => (
                                                <option key={format.format_id} value={format.format_id}>
                                                    {format.resolution} ({format.ext.toUpperCase()})
                                                    {format.has_audio ? " - with audio" : " - no audio"}
                                                    {format.filesize || format.filesize_approx
                                                        ? ` - ${formatFileSize(format.filesize || format.filesize_approx)}`
                                                        : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading || !selectedFormat}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold text-base md:text-lg rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isDownloading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                                            Preparing Download...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-5 h-5 md:w-6 md:h-6" />
                                            Download Video
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-slate-500 text-center mt-3">
                                    *Attempting auto-download. If video opens in new tab, please right-click and "Save Video As".
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Supported Platforms */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 text-center"
                >
                    <p className="text-slate-500 text-xs md:text-sm mb-4">Supported Platforms</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {["TikTok", "Instagram", "Facebook", "YouTube", "Twitter"].map((platform) => (
                            <span
                                key={platform}
                                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400"
                            >
                                {platform}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
