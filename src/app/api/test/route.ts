/**
 * API テストエンドポイント
 * 楽天API・IGDB APIの動作確認用
 */
import { NextResponse } from "next/server";
import { RakutenBooksClient } from "@/lib/api/rakuten";
import { IGDBClient } from "@/lib/api/igdb";

export async function GET() {
  const results: {
    rakuten: { status: string; data?: unknown; error?: string };
    igdb: { status: string; data?: unknown; error?: string };
    envCheck: Record<string, boolean>;
  } = {
    rakuten: { status: "pending" },
    igdb: { status: "pending" },
    envCheck: {
      RAKUTEN_APP_ID: !!process.env.RAKUTEN_APP_ID,
      RAKUTEN_AFFILIATE_ID: !!process.env.RAKUTEN_AFFILIATE_ID,
      IGDB_CLIENT_ID: !!process.env.IGDB_CLIENT_ID,
      IGDB_CLIENT_SECRET: !!process.env.IGDB_CLIENT_SECRET,
    },
  };

  // 楽天APIテスト
  try {
    const rakutenClient = new RakutenBooksClient(
      process.env.RAKUTEN_APP_ID || "",
      process.env.RAKUTEN_AFFILIATE_ID || ""
    );
    const books = await rakutenClient.searchBooks({
      keyword: "呪術廻戦",
      hits: 3,
    });
    results.rakuten = {
      status: "success",
      data: books.slice(0, 3).map((b) => ({
        title: b.title,
        author: b.author,
        salesDate: b.salesDate,
      })),
    };
  } catch (error) {
    results.rakuten = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // IGDB APIテスト
  try {
    const igdbClient = new IGDBClient(
      process.env.IGDB_CLIENT_ID || "",
      process.env.IGDB_CLIENT_SECRET || ""
    );
    const games = await igdbClient.searchGames({
      search: "Zelda",
      limit: 3,
    });
    results.igdb = {
      status: "success",
      data: games.slice(0, 3).map((g) => ({
        name: g.name,
        releaseDate: g.first_release_date
          ? new Date(g.first_release_date * 1000).toISOString()
          : null,
      })),
    };
  } catch (error) {
    results.igdb = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  return NextResponse.json(results);
}
