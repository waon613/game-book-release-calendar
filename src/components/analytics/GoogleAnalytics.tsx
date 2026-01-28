"use client";

import Script from "next/script";

interface GoogleAnalyticsProps {
  measurementId: string;
}

/**
 * Google Analytics 4 (GA4) コンポーネント
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  );
}

/**
 * カスタムイベントを送信
 */
export function sendGAEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

/**
 * ページビューを送信
 */
export function sendPageView(url: string, title?: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "page_view", {
      page_location: url,
      page_title: title,
    });
  }
}

/**
 * アフィリエイトクリックをトラッキング
 */
export function trackAffiliateClick(
  platform: "amazon" | "rakuten" | "google_books",
  itemId: string,
  itemTitle: string
) {
  sendGAEvent("affiliate_click", platform, itemTitle);
}

/**
 * お気に入り追加をトラッキング
 */
export function trackFavoriteAdd(itemId: string, itemType: "GAME" | "BOOK") {
  sendGAEvent("favorite_add", itemType.toLowerCase(), itemId);
}

/**
 * 検索をトラッキング
 */
export function trackSearch(query: string, resultsCount: number) {
  sendGAEvent("search", "site_search", query, resultsCount);
}

/**
 * フィルター使用をトラッキング
 */
export function trackFilterUse(filterType: string, filterValue: string) {
  sendGAEvent("filter_use", filterType, filterValue);
}

// TypeScript用のグローバル型定義
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}
