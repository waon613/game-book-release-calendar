import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

// DynamoDB クライアント初期化
const ddbClient = new DynamoDBClient({ region: "ap-northeast-1" });
const docClient = DynamoDBDocumentClient.from(ddbClient);

// テーブル名（Amplifyが生成する形式）
const TABLE_NAME = process.env.ITEM_TABLE_NAME || "Item-dev";

// ========================================
// 楽天API関連
// ========================================
interface RakutenBookItem {
  isbn?: string;
  title: string;
  author?: string;
  publisherName?: string;
  salesDate?: string;
  itemPrice?: number;
  largeImageUrl?: string;
  itemUrl?: string;
  booksGenreId?: string;
}

interface RakutenGameItem {
  jan?: string;
  title: string;
  hardware?: string;
  salesDate?: string;
  itemPrice?: number;
  largeImageUrl?: string;
  itemUrl?: string;
  label?: string;
}

async function fetchRakutenBooks(): Promise<RakutenBookItem[]> {
  const appId = process.env.RAKUTEN_APP_ID;
  if (!appId) {
    console.warn("RAKUTEN_APP_ID not configured");
    return [];
  }

  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setMonth(futureDate.getMonth() + 3);

  const items: RakutenBookItem[] = [];

  // 複数ジャンルを取得
  const genres = [
    "001004008", // ライトノベル
    "001001",    // 小説
    "001005",    // コミック
  ];

  for (const genreId of genres) {
    try {
      const params = new URLSearchParams({
        format: "json",
        applicationId: appId,
        booksGenreId: genreId,
        sort: "sales",
        hits: "30",
      });

      const response = await fetch(
        `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?${params}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.Items) {
          items.push(...data.Items.map((item: { Item: RakutenBookItem }) => item.Item));
        }
      }

      // レート制限対策
      await sleep(1000);
    } catch (error) {
      console.error(`Error fetching Rakuten books genre ${genreId}:`, error);
    }
  }

  return items;
}

async function fetchRakutenGames(): Promise<RakutenGameItem[]> {
  const appId = process.env.RAKUTEN_APP_ID;
  if (!appId) {
    console.warn("RAKUTEN_APP_ID not configured");
    return [];
  }

  const items: RakutenGameItem[] = [];

  // ゲームハードウェア別
  const hardwareList = [
    "Nintendo Switch",
    "PlayStation 5",
    "PlayStation 4",
    "Xbox Series X",
  ];

  for (const hardware of hardwareList) {
    try {
      const params = new URLSearchParams({
        format: "json",
        applicationId: appId,
        hardware,
        sort: "sales",
        hits: "30",
      });

      const response = await fetch(
        `https://app.rakuten.co.jp/services/api/BooksGame/Search/20170404?${params}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.Items) {
          items.push(...data.Items.map((item: { Item: RakutenGameItem }) => item.Item));
        }
      }

      // レート制限対策
      await sleep(1000);
    } catch (error) {
      console.error(`Error fetching Rakuten games for ${hardware}:`, error);
    }
  }

  return items;
}

// ========================================
// IGDB API関連
// ========================================
interface IGDBGame {
  id: number;
  name: string;
  summary?: string;
  cover?: { url: string };
  genres?: { name: string }[];
  platforms?: { name: string }[];
  release_dates?: {
    date: number;
    region: number;
    platform: { name: string };
  }[];
  rating?: number;
  aggregated_rating?: number;
  total_rating?: number;
  game_modes?: { name: string }[];
}

let twitchToken: string | null = null;
let tokenExpiry: number = 0;

async function getTwitchToken(): Promise<string | null> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("Twitch credentials not configured");
    return null;
  }

  if (twitchToken && Date.now() < tokenExpiry) {
    return twitchToken;
  }

  try {
    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: "POST" }
    );

    if (response.ok) {
      const data = await response.json();
      twitchToken = data.access_token;
      tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
      return twitchToken;
    }
  } catch (error) {
    console.error("Error getting Twitch token:", error);
  }

  return null;
}

async function fetchIGDBGames(): Promise<IGDBGame[]> {
  const token = await getTwitchToken();
  const clientId = process.env.TWITCH_CLIENT_ID;

  if (!token || !clientId) {
    return [];
  }

  const now = Math.floor(Date.now() / 1000);
  const threeMonthsLater = now + 90 * 24 * 60 * 60;

  try {
    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `
        fields name, summary, cover.url, genres.name, platforms.name, 
               release_dates.date, release_dates.region, release_dates.platform.name,
               rating, aggregated_rating, total_rating, game_modes.name;
        where release_dates.date >= ${now} 
          & release_dates.date <= ${threeMonthsLater}
          & release_dates.region = (1, 2, 5);
        sort release_dates.date asc;
        limit 100;
      `,
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Error fetching IGDB games:", error);
  }

  return [];
}

// ========================================
// データ変換・保存
// ========================================
interface ItemData {
  id: string;
  type: "GAME" | "BOOK";
  title: string;
  description?: string;
  releaseDate: string;
  platform?: string;
  genre?: string;
  developer?: string;
  publisher?: string;
  price?: number;
  currency: string;
  imageUrl?: string;
  amazonUrl?: string;
  rakutenUrl?: string;
  criticScore?: number;
  userScore?: number;
  clearTimeMain?: number;
  clearTimeExtra?: number;
  clearTimeCompletionist?: number;
  isbn?: string;
  janCode?: string;
  createdAt: string;
  updatedAt: string;
}

function parseJapaneseDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;

  // "2024年12月15日" 形式
  const match1 = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (match1) {
    const [, year, month, day] = match1;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // "2024年12月" 形式
  const match2 = dateStr.match(/(\d{4})年(\d{1,2})月/);
  if (match2) {
    const [, year, month] = match2;
    return `${year}-${month.padStart(2, "0")}-01`;
  }

  // "2024/12/15" or "2024-12-15" 形式
  const match3 = dateStr.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (match3) {
    const [, year, month, day] = match3;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return null;
}

function mapRakutenGenre(genreId: string | undefined): string {
  if (!genreId) return "その他";

  const genreMap: Record<string, string> = {
    "001004008": "ライトノベル",
    "001001": "小説",
    "001005": "コミック",
    "001004": "文芸",
    "001006": "絵本・児童書",
  };

  for (const [key, value] of Object.entries(genreMap)) {
    if (genreId.startsWith(key)) return value;
  }

  return "その他";
}

function convertRakutenBookToItem(book: RakutenBookItem): ItemData | null {
  const releaseDate = parseJapaneseDate(book.salesDate);
  if (!releaseDate) return null;

  const id = book.isbn || `rakuten-book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  return {
    id,
    type: "BOOK",
    title: book.title,
    releaseDate,
    publisher: book.publisherName,
    developer: book.author,
    genre: mapRakutenGenre(book.booksGenreId),
    price: book.itemPrice,
    currency: "JPY",
    imageUrl: book.largeImageUrl?.replace("http://", "https://"),
    rakutenUrl: book.itemUrl,
    isbn: book.isbn,
    createdAt: now,
    updatedAt: now,
  };
}

function convertRakutenGameToItem(game: RakutenGameItem): ItemData | null {
  const releaseDate = parseJapaneseDate(game.salesDate);
  if (!releaseDate) return null;

  const id = game.jan || `rakuten-game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  return {
    id,
    type: "GAME",
    title: game.title,
    releaseDate,
    platform: game.hardware,
    publisher: game.label,
    price: game.itemPrice,
    currency: "JPY",
    imageUrl: game.largeImageUrl?.replace("http://", "https://"),
    rakutenUrl: game.itemUrl,
    janCode: game.jan,
    createdAt: now,
    updatedAt: now,
  };
}

function convertIGDBGameToItem(game: IGDBGame): ItemData | null {
  // 日本の発売日を取得（region: 2 = Japan, 1 = Europe, 5 = North America）
  const japanRelease = game.release_dates?.find((rd) => rd.region === 2);
  const releaseDate = japanRelease?.date
    ? new Date(japanRelease.date * 1000).toISOString().split("T")[0]
    : null;

  if (!releaseDate) return null;

  const id = `igdb-${game.id}`;
  const now = new Date().toISOString();

  return {
    id,
    type: "GAME",
    title: game.name,
    description: game.summary,
    releaseDate,
    platform: game.platforms?.map((p) => p.name).join(", "),
    genre: game.genres?.[0]?.name,
    criticScore: game.aggregated_rating
      ? Math.round(game.aggregated_rating)
      : undefined,
    userScore: game.rating ? Math.round(game.rating) : undefined,
    currency: "JPY",
    imageUrl: game.cover?.url?.replace("t_thumb", "t_cover_big"),
    createdAt: now,
    updatedAt: now,
  };
}

async function saveItem(item: ItemData): Promise<void> {
  try {
    // 既存アイテムをチェック
    const existingItem = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": item.id,
        },
      })
    );

    // 既存アイテムがあれば更新日時のみ更新
    if (existingItem.Items && existingItem.Items.length > 0) {
      const existing = existingItem.Items[0];
      item.createdAt = existing.createdAt as string;
    }

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    console.log(`Saved item: ${item.title}`);
  } catch (error) {
    console.error(`Error saving item ${item.id}:`, error);
  }
}

// ========================================
// ユーティリティ
// ========================================
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ========================================
// メインハンドラー
// ========================================
export const handler = async (event: unknown): Promise<void> => {
  console.log("Daily sync started:", new Date().toISOString());
  console.log("Event:", JSON.stringify(event));

  let totalSaved = 0;

  try {
    // 1. 楽天から書籍を取得
    console.log("Fetching Rakuten books...");
    const rakutenBooks = await fetchRakutenBooks();
    console.log(`Found ${rakutenBooks.length} books from Rakuten`);

    for (const book of rakutenBooks) {
      const item = convertRakutenBookToItem(book);
      if (item) {
        await saveItem(item);
        totalSaved++;
      }
    }

    // 2. 楽天からゲームを取得
    console.log("Fetching Rakuten games...");
    const rakutenGames = await fetchRakutenGames();
    console.log(`Found ${rakutenGames.length} games from Rakuten`);

    for (const game of rakutenGames) {
      const item = convertRakutenGameToItem(game);
      if (item) {
        await saveItem(item);
        totalSaved++;
      }
    }

    // 3. IGDBからグローバルゲーム情報を取得
    console.log("Fetching IGDB games...");
    const igdbGames = await fetchIGDBGames();
    console.log(`Found ${igdbGames.length} games from IGDB`);

    for (const game of igdbGames) {
      const item = convertIGDBGameToItem(game);
      if (item) {
        await saveItem(item);
        totalSaved++;
      }
    }

    console.log(`Daily sync completed. Total items saved: ${totalSaved}`);
  } catch (error) {
    console.error("Daily sync failed:", error);
    throw error;
  }
};
