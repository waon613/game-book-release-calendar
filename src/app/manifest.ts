import type { MetadataRoute } from "next";

/**
 * PWA Web App Manifest
 * ホーム画面に追加可能なアプリ設定
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ゲーム＆書籍リリースカレンダー",
    short_name: "リリースカレンダー",
    description:
      "ゲームと書籍の発売日カレンダー。クリア時間や評価スコアでフィルタリング。",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    orientation: "portrait-primary",
    scope: "/",
    lang: "ja",
    categories: ["games", "books", "entertainment", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/desktop.png",
        sizes: "1280x720",
        type: "image/png",
        // @ts-expect-error - form_factor is valid but not in types
        form_factor: "wide",
        label: "デスクトップ版カレンダー表示",
      },
      {
        src: "/screenshots/mobile.png",
        sizes: "750x1334",
        type: "image/png",
        // @ts-expect-error - form_factor is valid but not in types
        form_factor: "narrow",
        label: "モバイル版リスト表示",
      },
    ],
    shortcuts: [
      {
        name: "今月のゲーム",
        short_name: "ゲーム",
        description: "今月発売のゲーム一覧",
        url: "/games",
        icons: [{ src: "/icons/game-shortcut.png", sizes: "96x96" }],
      },
      {
        name: "今月の書籍",
        short_name: "書籍",
        description: "今月発売の書籍一覧",
        url: "/books",
        icons: [{ src: "/icons/book-shortcut.png", sizes: "96x96" }],
      },
      {
        name: "マイページ",
        short_name: "マイページ",
        description: "積みゲー・積読管理",
        url: "/mypage",
        icons: [{ src: "/icons/mypage-shortcut.png", sizes: "96x96" }],
      },
    ],
  };
}
