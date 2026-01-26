import type { MetadataRoute } from "next";

/**
 * サイトマップ生成
 * Google Search Console用
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const currentDate = new Date();

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/mypage`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // 月別カレンダーページ（過去3ヶ月〜未来6ヶ月）
  const calendarPages: MetadataRoute.Sitemap = [];
  for (let i = -3; i <= 6; i++) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    calendarPages.push({
      url: `${baseUrl}/calendar/${year}/${month}`,
      lastModified: currentDate,
      changeFrequency: i <= 0 ? "monthly" : "weekly",
      priority: i === 0 ? 0.9 : 0.6,
    });
  }

  // カテゴリページ
  const categoryPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/games`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/books`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  return [...staticPages, ...calendarPages, ...categoryPages];
}
