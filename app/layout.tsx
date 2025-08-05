import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://scan-typing.vercel.app"),
  title: {
    default: "動体視力トレーニング×タイピングゲーム",
    template: `%s | 動体視力トレーニング×タイピングゲーム`,
  },
  description: "動体視力とタイピング力を同時に鍛えられるタイピングゲーム",
  openGraph: {
    title: "動体視力トレーニング×タイピングゲーム",
    description: "動体視力とタイピング力を同時に鍛えられるタイピングゲーム",
    url: "https://scan-typing.vercel.app",
    siteName: "動体視力トレーニング×タイピングゲーム",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* タイトル */}
        <div className="min-h-screen bg-gradient-to-b from-[#262e41] to-[#2d1e11] pt-16">
          <div className="mb-8 p-4 flex justify-center gap-5">
            <h1 className="ml-15 text-7xl font-bold font-serif ">動体視力</h1>
            <p className="mt-3 text-5xl font-serif">×</p>
            <h1 className="text-7xl font-bold font-serif">タイピング</h1>
          </div>
          {children}
        </div>
        {/* 本番環境のみ解析対象とする */}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
