import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AmplifyProvider } from "@/components/providers/AmplifyProvider";

export const metadata: Metadata = {
  title: "ゲーム＆書籍リリースカレンダー | 発売日・価格・評価をチェック",
  description:
    "ゲームと書籍の発売日カレンダー。クリア時間や評価スコアでフィルタリング。Amazon・楽天での予約も簡単に。",
  keywords: [
    "ゲーム発売日",
    "新刊カレンダー",
    "マンガ発売日",
    "ライトノベル",
    "積みゲー",
    "積読",
  ],
  openGraph: {
    title: "ゲーム＆書籍リリースカレンダー",
    description:
      "ゲームと書籍の発売日を一覧表示。クリア時間や評価スコアでフィルタリング可能。",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="ja">
      <head>
        {/* Google AdSense */}
        {adsenseClientId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AmplifyProvider>
          {children}
        </AmplifyProvider>
      </body>
    </html>
  );
}
