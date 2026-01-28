/**
 * 書籍・ゲームリリース情報取得API
 * 楽天API・IGDB APIから実際のデータを取得
 */
import { NextResponse } from "next/server";
import { RakutenBooksClient } from "@/lib/api/rakuten";
import { IGDBClient } from "@/lib/api/igdb";
import { getApiSecrets } from "@/lib/secrets";
import type { Item } from "@/types";

// キャッシュ設定（1時間）
export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // YYYY-MM形式
  const type = searchParams.get("type"); // "game" | "book" | "all"

  try {
    const secrets = await getApiSecrets();
    const items: Item[] = [];
    const errors: string[] = [];

    // 書籍データ取得（楽天API）
    if (!type || type === "all" || type === "book") {
      try {
        const rakutenClient = new RakutenBooksClient(
          secrets.RAKUTEN_APP_ID,
          secrets.RAKUTEN_AFFILIATE_ID
        );

        // 人気コミック・ライトノベルの新刊を取得
        const [comics, lightNovels] = await Promise.all([
          rakutenClient.searchComics({ 
            sort: "sales", 
            hits: 10 
          }),
          rakutenClient.searchBooks({ 
            booksGenreId: "001004", // ライトノベル
            sort: "sales", 
            hits: 10 
          }),
        ]);

        // 楽天データをItem形式に変換
        comics.forEach((book, index) => {
          if (book.salesDate) {
            items.push({
              id: `rakuten-comic-${index}`,
              type: "BOOK",
              title: book.title,
              releaseDate: parseRakutenDate(book.salesDate),
              coverUrl: book.largeImageUrl || book.mediumImageUrl || "",
              currentPrice: book.itemPrice,
              listPrice: book.itemPrice,
            genre: ["マンガ"],
            affiliateLinks: {
              rakuten: book.affiliateUrl || book.itemUrl,
            },
          });
        }
      });

      lightNovels.forEach((book, index) => {
        if (book.salesDate) {
          items.push({
            id: `rakuten-ln-${index}`,
            type: "BOOK",
            title: book.title,
            releaseDate: parseRakutenDate(book.salesDate),
            coverUrl: book.largeImageUrl || book.mediumImageUrl || "",
            currentPrice: book.itemPrice,
            listPrice: book.itemPrice,
            genre: ["ライトノベル"],
            affiliateLinks: {
              rakuten: book.affiliateUrl || book.itemUrl,
            },
          });
        }
      });
      } catch (rakutenError) {
        console.error("Rakuten API Error:", rakutenError);
        errors.push(`Rakuten: ${rakutenError instanceof Error ? rakutenError.message : "Unknown error"}`);
      }
    }

    // ゲームデータ取得（楽天ゲームAPI）
    if (!type || type === "all" || type === "game") {
      try {
        const rakutenClient = new RakutenBooksClient(
          secrets.RAKUTEN_APP_ID,
          secrets.RAKUTEN_AFFILIATE_ID
        );

        // Nintendo Switchゲームを取得
        const switchGames = await rakutenClient.searchGames({ 
          hardware: "Nintendo Switch",
          sort: "-releaseDate", 
          hits: 10 
        });

        // 楽天ゲームデータをItem形式に変換
        switchGames.forEach((game, index) => {
          if (game.salesDate) {
            items.push({
              id: `rakuten-game-${index}`,
              type: "GAME",
              title: game.title,
              releaseDate: parseRakutenDate(game.salesDate),
              coverUrl: game.largeImageUrl || game.mediumImageUrl || "",
              currentPrice: game.itemPrice,
              listPrice: game.itemPrice,
              platform: [game.hardware || "Nintendo Switch"],
              genre: [],
              affiliateLinks: {
                rakuten: game.affiliateUrl || game.itemUrl,
              },
            });
          }
        });
      } catch (rakutenGameError) {
        console.error("Rakuten Game API Error:", rakutenGameError);
        errors.push(`Rakuten Game: ${rakutenGameError instanceof Error ? rakutenGameError.message : "Unknown error"}`);
      }
    }

    // ゲームデータ取得（IGDB API - 補助）
    if (!type || type === "all" || type === "game") {
      try {
        const igdbClient = new IGDBClient(
          secrets.IGDB_CLIENT_ID,
          secrets.IGDB_CLIENT_SECRET
        );

        // 今後発売予定のゲームと最近リリースされたゲームを取得
        const [upcomingGames, recentGames] = await Promise.all([
          igdbClient.getUpcomingGames(undefined, 10),
          igdbClient.getRecentReleases(undefined, 10),
        ]);

        // 重複を除去して結合
        const allGames = [...upcomingGames, ...recentGames];
        const seenIds = new Set<number>();

        // IGDBデータをItem形式に変換
      allGames.forEach((game) => {
        // 重複チェック
        if (seenIds.has(game.id)) return;
        seenIds.add(game.id);

        if (game.first_release_date) {
          const releaseDate = new Date(game.first_release_date * 1000);
          items.push({
            id: `igdb-${game.id}`,
            type: "GAME",
            title: game.name,
            releaseDate: releaseDate.toISOString().split("T")[0],
            coverUrl: game.cover?.url
              ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`
              : "",
            criticScore: game.aggregated_rating
              ? Math.round(game.aggregated_rating)
              : undefined,
            platform: game.platforms?.map((p) => p.name) || [],
            genre: game.genres?.map((g) => g.name) || [],
            // IGDBにはアフィリエイトリンクがないため、後で楽天/Amazonで検索
          });
        }
      });
      } catch (igdbError) {
        console.error("IGDB API Error:", igdbError);
        errors.push(`IGDB: ${igdbError instanceof Error ? igdbError.message : "Unknown error"}`);
      }
    }

    // 日付でソート（releaseDateがある項目のみ）
    items.sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return dateA - dateB;
    });

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        items: [],
      },
      { status: 500 }
    );
  }
}

/**
 * 楽天の日付文字列をISO形式に変換
 * 例: "2026年03月23日" → "2026-03-23"
 */
function parseRakutenDate(dateStr: string): string {
  const match = dateStr.match(/(\d{4})年(\d{2})月(\d{2})日/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  // "2026年03月23日頃" のような場合
  const matchApprox = dateStr.match(/(\d{4})年(\d{2})月(\d{2})日頃?/);
  if (matchApprox) {
    return `${matchApprox[1]}-${matchApprox[2]}-${matchApprox[3]}`;
  }
  // パースできない場合は現在日付
  return new Date().toISOString().split("T")[0];
}
