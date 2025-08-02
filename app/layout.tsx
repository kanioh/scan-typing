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
    default: "動体視力×タイピング",
    template: `%s | 動体視力×タイピング`,
  },
  description: "動体視力とタイピング力を同時に鍛えられるタイピングゲーム",
  openGraph: {
    title: "動体視力×タイピング",
    description: "動体視力とタイピング力を同時に鍛えられるタイピングゲーム",
    url: "https://scan-typing.vercel.app",
    siteName: "動体視力×タイピング",
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
        {children}
        {/* 本番環境のみ解析対象とする */}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
