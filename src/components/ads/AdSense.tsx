"use client";

import { useEffect, useRef } from "react";

interface AdSenseProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical";
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * Google AdSense 広告コンポーネント
 * - モバイルファーストで最適化
 * - 日本市場向け設定
 */
export function AdSense({
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
  style,
  className = "",
}: AdSenseProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    // 開発環境ではスキップ
    if (process.env.NODE_ENV === "development") {
      return;
    }

    // 既に読み込み済みならスキップ
    if (isLoaded.current) {
      return;
    }

    try {
      // adsbygoogle の初期化
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      isLoaded.current = true;
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  // 開発環境ではプレースホルダーを表示
  if (process.env.NODE_ENV === "development") {
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm ${className}`}
        style={{ minHeight: 100, ...style }}
      >
        [AdSense 広告プレースホルダー]
      </div>
    );
  }

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          ...style,
        }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </div>
  );
}

/**
 * インフィード広告（リスト内に表示）
 */
export function InFeedAd({
  adSlot,
  className = "",
}: {
  adSlot: string;
  className?: string;
}) {
  return (
    <AdSense
      adSlot={adSlot}
      adFormat="rectangle"
      className={`my-4 ${className}`}
      style={{ minHeight: 250 }}
    />
  );
}

/**
 * バナー広告（ページ上部/下部）
 */
export function BannerAd({
  adSlot,
  position = "bottom",
  className = "",
}: {
  adSlot: string;
  position?: "top" | "bottom";
  className?: string;
}) {
  const positionClass = position === "top" ? "mb-4" : "mt-4";

  return (
    <AdSense
      adSlot={adSlot}
      adFormat="horizontal"
      className={`${positionClass} ${className}`}
      style={{ minHeight: 90 }}
    />
  );
}

/**
 * サイドバー広告（デスクトップ用）
 */
export function SidebarAd({
  adSlot,
  className = "",
}: {
  adSlot: string;
  className?: string;
}) {
  return (
    <AdSense
      adSlot={adSlot}
      adFormat="vertical"
      className={`hidden lg:block ${className}`}
      style={{ minHeight: 600, maxWidth: 300 }}
    />
  );
}

/**
 * 記事内広告（詳細ページ用）
 */
export function ArticleAd({
  adSlot,
  className = "",
}: {
  adSlot: string;
  className?: string;
}) {
  return (
    <AdSense
      adSlot={adSlot}
      adFormat="auto"
      fullWidthResponsive={true}
      className={`my-6 ${className}`}
      style={{ minHeight: 250 }}
    />
  );
}
