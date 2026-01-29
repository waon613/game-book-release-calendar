import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google"; 
import Script from "next/script";
import "@aws-amplify/ui-react/styles.css";
import "./globals.css";
import { AmplifyProvider } from "@/components/providers/AmplifyProvider";
import { GoogleAnalytics } from "@/components/analytics";
import { OfflineIndicator, PWAInstallPrompt } from "@/components/pwa";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Release Calendar | Game & Book", 
  description:
    "Explore upcoming games and books. Track releases, check scores, and manage your backlog.",
  keywords: [
    "Game Release",
    "Book Release",
    "Calendar",
    "Schedule",
    "Backlog",
  ],
  openGraph: {
    title: "Release Calendar Platform",
    description:
      "A modern platform to track game and book releases.",
    locale: "ja_JP",
    type: "website",
    siteName: "Release Calendar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Release Calendar",
    description: "Modern release tracking for games and books.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="ja" className="dark"> 
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground min-h-screen selection:bg-primary/20`}>
        {/* Google Analytics */}
        {gaMeasurementId && <GoogleAnalytics measurementId={gaMeasurementId} />}
        
        {/* オフラインインジケーター */}
        <OfflineIndicator />
        
        <AmplifyProvider>
          {children}
        </AmplifyProvider>
        
        {/* PWAインストールプロンプト */}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
