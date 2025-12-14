import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
    title: 'Universal Video Downloader | TikTok, Instagram, YouTube',
    description: 'Download videos from TikTok, Instagram, YouTube, Facebook, and Twitter in high quality. No watermark.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className={`${inter.variable} font-sans antialiased text-slate-800 bg-slate-50 relative`}>
                {children}
            </body>
        </html>
    )
}
