import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-gradient-to-b from-[#262e41] to-[#2d1e11]`}
      >
        <Header />
        <div className="flex-1 pt-16 md:pt-24">
          {/* タイトル: PCでは3カラム、モバイルでは縦並びで表示 */}
          <div className="mb-4 md:mb-10 p-4 flex flex-col items-center gap-1 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:w-full md:max-w-5xl mx-auto md:gap-6">
            <h1 className="text-5xl font-bold font-serif md:text-7xl md:text-right whitespace-nowrap">動体視力</h1>
            <p className="text-4xl font-serif md:text-5xl md:text-center">×</p>
            <h1 className="text-5xl font-bold font-serif md:text-7xl whitespace-nowrap">タイピング</h1>
          </div>
          {children}
          <Analytics />
        </div>
        <Footer />
        {/* Google Analytics: 本番環境(NEXT_PUBLIC_GOOGLE_ANALYTICS_IDが設定されている場合)のみ有効化 */}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
