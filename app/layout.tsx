import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
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
                {/* Adsterra Ads */}
                <Script
                    src="https://pl28531032.effectivegatecpm.com/f9/16/a8/f916a81bcf4eaa91c6ac792532135103.js"
                    strategy="afterInteractive"
                />
            </body>
        </html>
    )
}

