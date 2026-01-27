/**
 * 楽天ブックスAPI クライアント
 * 日本市場向け書籍情報取得
 *
 * @see https://webservice.rakuten.co.jp/documentation/books-book-search
 */

const RAKUTEN_API_BASE = "https://app.rakuten.co.jp/services/api";
const BOOKS_SEARCH_ENDPOINT = "/BooksBook/Search/20170404";
const BOOKS_GAME_ENDPOINT = "/BooksGame/Search/20120927";
// Note: BooksComic/Search doesn't exist, use BooksBook/Search with booksGenreId instead

// 楽天ブックスのジャンルID
export const RAKUTEN_GENRE_IDS = {
  // 書籍
  MANGA: "001001", // コミック
  LIGHT_NOVEL: "001004", // ライトノベル
  NOVEL: "001003", // 文庫
  GAME_GUIDE: "001006", // ゲーム攻略本

  // ゲーム
  GAME_PS5: "006513", // PlayStation 5
  GAME_PS4: "006510", // PlayStation 4
  GAME_SWITCH: "006514", // Nintendo Switch
  GAME_XBOX: "006512", // Xbox
  GAME_PC: "006509", // PCゲーム
} as const;

export interface RakutenBookItem {
  title: string;
  titleKana: string;
  author: string;
  authorKana: string;
  publisherName: string;
  isbn: string;
  itemCaption: string;
  salesDate: string; // "2026年02月15日" 形式
  itemPrice: number;
  listPrice: number;
  discountRate: number;
  discountPrice: number;
  itemUrl: string;
  affiliateUrl: string;
  smallImageUrl: string;
  mediumImageUrl: string;
  largeImageUrl: string;
  availability: string;
  booksGenreId: string;
  reviewCount: number;
  reviewAverage: string;
}

export interface RakutenGameItem {
  title: string;
  titleKana: string;
  hardware: string;
  label: string;
  jan: string;
  makerCode: string;
  itemCaption: string;
  salesDate: string;
  itemPrice: number;
  listPrice: number;
  discountRate: number;
  discountPrice: number;
  itemUrl: string;
  affiliateUrl: string;
  smallImageUrl: string;
  mediumImageUrl: string;
  largeImageUrl: string;
  availability: string;
  reviewCount: number;
  reviewAverage: string;
}

export interface RakutenSearchParams {
  keyword?: string;
  booksGenreId?: string;
  sort?: "standard" | "sales" | "releaseDate" | "-releaseDate" | "reviewCount" | "reviewAverage";
  page?: number;
  hits?: number; // 1-30
  availability?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  outOfStockFlag?: 0 | 1;
}

interface RakutenAPIResponse<T> {
  count: number;
  page: number;
  first: number;
  last: number;
  hits: number;
  carrier: number;
  pageCount: number;
  Items: Array<{ Item: T }>;
}

/**
 * 楽天ブックスAPIクライアント
 */
export class RakutenBooksClient {
  private appId: string;
  private affiliateId?: string;

  constructor(appId: string, affiliateId?: string) {
    this.appId = appId;
    this.affiliateId = affiliateId;
  }

  /**
   * 書籍を検索
   */
  async searchBooks(params: RakutenSearchParams): Promise<RakutenBookItem[]> {
    const url = this.buildUrl(BOOKS_SEARCH_ENDPOINT, params);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`楽天API エラー: ${response.status}`);
    }

    const data: RakutenAPIResponse<RakutenBookItem> = await response.json();
    return data.Items.map((item) => item.Item);
  }

  /**
   * ゲームを検索
   */
  async searchGames(params: RakutenSearchParams): Promise<RakutenGameItem[]> {
    const url = this.buildUrl(BOOKS_GAME_ENDPOINT, params);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`楽天API エラー: ${response.status}`);
    }

    const data: RakutenAPIResponse<RakutenGameItem> = await response.json();
    return data.Items.map((item) => item.Item);
  }

  /**
   * コミックを検索（BooksBook APIを使用し、コミックジャンルを指定）
   */
  async searchComics(params: RakutenSearchParams): Promise<RakutenBookItem[]> {
    // BooksComic/Search は存在しないため、BooksBook/Search を使用
    const comicParams = {
      ...params,
      booksGenreId: params.booksGenreId || "001001", // デフォルトでコミックジャンル
    };
    const url = this.buildUrl(BOOKS_SEARCH_ENDPOINT, comicParams);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`楽天API エラー: ${response.status}`);
    }

    const data: RakutenAPIResponse<RakutenBookItem> = await response.json();
    return data.Items.map((item) => item.Item);
  }
    return data.Items.map((item) => item.Item);
  }

  /**
   * 新刊を取得（発売日順）
   */
  async getNewReleases(
    type: "book" | "game" | "comic",
    genreId?: string,
    limit: number = 30
  ): Promise<(RakutenBookItem | RakutenGameItem)[]> {
    const params: RakutenSearchParams = {
      booksGenreId: genreId,
      sort: "-releaseDate",
      hits: Math.min(limit, 30),
      availability: 1, // 在庫あり
    };

    switch (type) {
      case "book":
        return this.searchBooks(params);
      case "game":
        return this.searchGames(params);
      case "comic":
        return this.searchComics(params);
    }
  }

  /**
   * 発売予定を取得
   */
  async getUpcoming(
    type: "book" | "game" | "comic",
    genreId?: string,
    limit: number = 30
  ): Promise<(RakutenBookItem | RakutenGameItem)[]> {
    const params: RakutenSearchParams = {
      booksGenreId: genreId,
      sort: "releaseDate",
      hits: Math.min(limit, 30),
      availability: 2, // 通常は入手可能（予約含む）
    };

    switch (type) {
      case "book":
        return this.searchBooks(params);
      case "game":
        return this.searchGames(params);
      case "comic":
        return this.searchComics(params);
    }
  }

  /**
   * URLを構築
   */
  private buildUrl(endpoint: string, params: RakutenSearchParams): string {
    const searchParams = new URLSearchParams({
      format: "json",
      applicationId: this.appId,
      ...(this.affiliateId && { affiliateId: this.affiliateId }),
      ...(params.keyword && { keyword: params.keyword }),
      ...(params.booksGenreId && { booksGenreId: params.booksGenreId }),
      ...(params.sort && { sort: params.sort }),
      ...(params.page && { page: String(params.page) }),
      ...(params.hits && { hits: String(params.hits) }),
      ...(params.availability !== undefined && {
        availability: String(params.availability),
      }),
      ...(params.outOfStockFlag !== undefined && {
        outOfStockFlag: String(params.outOfStockFlag),
      }),
    });

    return `${RAKUTEN_API_BASE}${endpoint}?${searchParams.toString()}`;
  }
}

/**
 * 楽天の発売日文字列をDate形式に変換
 * "2026年02月15日" → "2026-02-15"
 */
export function parseRakutenSalesDate(salesDate: string): string | null {
  const match = salesDate.match(/(\d{4})年(\d{2})月(\d{2})日/);
  if (!match) {
    // "2026年02月" 形式の場合
    const monthMatch = salesDate.match(/(\d{4})年(\d{2})月/);
    if (monthMatch) {
      return `${monthMatch[1]}-${monthMatch[2]}-01`;
    }
    return null;
  }
  return `${match[1]}-${match[2]}-${match[3]}`;
}

/**
 * 楽天商品をItem形式に変換
 */
export function convertRakutenBookToItem(
  book: RakutenBookItem,
  affiliateId?: string
): {
  type: "BOOK";
  title: string;
  releaseDate: string | null;
  coverUrl: string;
  currentPrice: number;
  listPrice: number;
  genre: string[];
  rakutenIsbn: string;
  affiliateLinks: { rakuten: string };
  publisher: string;
} {
  // アフィリエイトリンク生成
  const rakutenUrl = affiliateId
    ? book.affiliateUrl
    : book.itemUrl;

  return {
    type: "BOOK",
    title: book.title,
    releaseDate: parseRakutenSalesDate(book.salesDate),
    coverUrl: book.largeImageUrl || book.mediumImageUrl || book.smallImageUrl,
    currentPrice: book.itemPrice,
    listPrice: book.listPrice,
    genre: [getGenreFromId(book.booksGenreId)],
    rakutenIsbn: book.isbn,
    affiliateLinks: { rakuten: rakutenUrl },
    publisher: book.publisherName,
  };
}

/**
 * 楽天ゲームをItem形式に変換
 */
export function convertRakutenGameToItem(
  game: RakutenGameItem,
  affiliateId?: string
): {
  type: "GAME";
  title: string;
  releaseDate: string | null;
  coverUrl: string;
  currentPrice: number;
  listPrice: number;
  platform: string[];
  affiliateLinks: { rakuten: string };
  publisher: string;
} {
  const rakutenUrl = affiliateId
    ? game.affiliateUrl
    : game.itemUrl;

  return {
    type: "GAME",
    title: game.title,
    releaseDate: parseRakutenSalesDate(game.salesDate),
    coverUrl: game.largeImageUrl || game.mediumImageUrl || game.smallImageUrl,
    currentPrice: game.itemPrice,
    listPrice: game.listPrice,
    platform: [convertHardwareToPlatform(game.hardware)],
    affiliateLinks: { rakuten: rakutenUrl },
    publisher: game.label,
  };
}

/**
 * 楽天ジャンルIDからジャンル名を取得
 */
function getGenreFromId(genreId: string): string {
  if (genreId.startsWith("001001")) return "マンガ";
  if (genreId.startsWith("001004")) return "ライトノベル";
  if (genreId.startsWith("001003")) return "小説";
  if (genreId.startsWith("001006")) return "攻略本";
  return "その他";
}

/**
 * 楽天のhardware名をプラットフォーム名に変換
 */
function convertHardwareToPlatform(hardware: string): string {
  const mapping: Record<string, string> = {
    "PlayStation 5": "PlayStation 5",
    "PlayStation5": "PlayStation 5",
    "PS5": "PlayStation 5",
    "PlayStation 4": "PlayStation 4",
    "PlayStation4": "PlayStation 4",
    "PS4": "PlayStation 4",
    "Nintendo Switch": "Nintendo Switch",
    "Switch": "Nintendo Switch",
    "Xbox Series X": "Xbox Series X|S",
    "Xbox One": "Xbox Series X|S",
    "PC": "PC (Steam)",
  };

  return mapping[hardware] || hardware;
}
