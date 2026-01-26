import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
const siteName = "ゲーム＆書籍リリースカレンダー";

/**
 * 共通メタデータを生成
 */
export function generateCommonMetadata(params: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const {
    title,
    description = "ゲームと書籍の発売日カレンダー。クリア時間や評価スコアでフィルタリング。Amazon・楽天での予約も簡単に。",
    path = "",
    image = "/og-image.png",
    type = "website",
    publishedTime,
    modifiedTime,
  } = params;

  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const url = `${baseUrl}${path}`;
  const imageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName,
      locale: "ja_JP",
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/**
 * ゲーム詳細ページ用メタデータ
 */
export function generateGameMetadata(game: {
  title: string;
  description?: string;
  platform?: string;
  releaseDate: string;
  imageUrl?: string;
  criticScore?: number;
}): Metadata {
  const description =
    game.description ||
    `${game.title}の発売日・価格・評価情報。${game.platform || ""}で${game.releaseDate}発売予定。${
      game.criticScore ? `評価スコア: ${game.criticScore}点` : ""
    }`;

  return generateCommonMetadata({
    title: `${game.title}${game.platform ? ` (${game.platform})` : ""} - 発売日・価格・評価`,
    description,
    path: `/games/${encodeURIComponent(game.title)}`,
    image: game.imageUrl,
    type: "article",
  });
}

/**
 * 書籍詳細ページ用メタデータ
 */
export function generateBookMetadata(book: {
  title: string;
  author?: string;
  publisher?: string;
  releaseDate: string;
  imageUrl?: string;
  genre?: string;
}): Metadata {
  const description = `${book.title}${book.author ? ` (${book.author})` : ""} - ${book.releaseDate}発売予定。${
    book.publisher ? `出版社: ${book.publisher}` : ""
  }${book.genre ? ` ジャンル: ${book.genre}` : ""}`;

  return generateCommonMetadata({
    title: `${book.title} - 発売日・価格`,
    description,
    path: `/books/${encodeURIComponent(book.title)}`,
    image: book.imageUrl,
    type: "article",
  });
}

/**
 * JSON-LD 構造化データ（ゲーム用）
 */
export function generateGameJsonLd(game: {
  title: string;
  description?: string;
  platform?: string;
  releaseDate: string;
  imageUrl?: string;
  criticScore?: number;
  price?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: game.description,
    gamePlatform: game.platform,
    datePublished: game.releaseDate,
    image: game.imageUrl,
    ...(game.criticScore && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: game.criticScore,
        bestRating: 100,
        worstRating: 0,
      },
    }),
    ...(game.price && {
      offers: {
        "@type": "Offer",
        price: game.price,
        priceCurrency: "JPY",
        availability: "https://schema.org/PreOrder",
      },
    }),
  };
}

/**
 * JSON-LD 構造化データ（書籍用）
 */
export function generateBookJsonLd(book: {
  title: string;
  author?: string;
  publisher?: string;
  releaseDate: string;
  imageUrl?: string;
  isbn?: string;
  price?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: book.author && {
      "@type": "Person",
      name: book.author,
    },
    publisher: book.publisher && {
      "@type": "Organization",
      name: book.publisher,
    },
    datePublished: book.releaseDate,
    image: book.imageUrl,
    isbn: book.isbn,
    ...(book.price && {
      offers: {
        "@type": "Offer",
        price: book.price,
        priceCurrency: "JPY",
        availability: "https://schema.org/PreOrder",
      },
    }),
  };
}
