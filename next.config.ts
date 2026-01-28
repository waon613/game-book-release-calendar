import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 日本市場向け設定
  i18n: undefined, // App Routerでは不要（ミドルウェアで対応）

  // 画像最適化
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
      },
      {
        protocol: "https",
        hostname: "thumbnail.image.rakuten.co.jp",
      },
      {
        protocol: "https",
        hostname: "images.igdb.com",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 環境変数
  env: {
    NEXT_PUBLIC_REGION: "ap-northeast-1",
    NEXT_PUBLIC_TIMEZONE: "Asia/Tokyo",
    NEXT_PUBLIC_LOCALE: "ja-JP",
    NEXT_PUBLIC_CURRENCY: "JPY",
    // API Keys (ビルド時に環境変数から取得)
    RAKUTEN_APP_ID: process.env.RAKUTEN_APP_ID,
    RAKUTEN_AFFILIATE_ID: process.env.RAKUTEN_AFFILIATE_ID,
    IGDB_CLIENT_ID: process.env.IGDB_CLIENT_ID,
    IGDB_CLIENT_SECRET: process.env.IGDB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  },

  // パフォーマンス最適化
  experimental: {
    optimizeCss: true,
  },

  // 圧縮
  compress: true,

  // TypeScriptビルド最適化
  typescript: {
    // CIで別途型チェックを実行する場合はtrueに
    ignoreBuildErrors: false,
  },

  // ESLintビルド最適化（ビルド時間短縮）
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ヘッダー設定
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        // 静的アセットの長期キャッシュ
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // 画像の長期キャッシュ
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },

  // リダイレクト設定
  async redirects() {
    return [
      {
        source: "/calendar",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
