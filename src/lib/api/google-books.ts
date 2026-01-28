/**
 * Google Books API クライアント
 * 書籍情報の追加データソース
 */

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";

interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
    };
    language?: string;
    previewLink?: string;
    infoLink?: string;
  };
  saleInfo?: {
    country: string;
    saleability: string;
    isEbook: boolean;
    listPrice?: {
      amount: number;
      currencyCode: string;
    };
    retailPrice?: {
      amount: number;
      currencyCode: string;
    };
    buyLink?: string;
  };
}

interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBooksVolume[];
}

/**
 * Google Books APIで書籍を検索
 */
export async function searchGoogleBooks(
  query: string,
  options: {
    maxResults?: number;
    startIndex?: number;
    langRestrict?: string;
    orderBy?: "relevance" | "newest";
    printType?: "all" | "books" | "magazines";
  } = {}
): Promise<GoogleBooksResponse> {
  const {
    maxResults = 20,
    startIndex = 0,
    langRestrict = "ja",
    orderBy = "newest",
    printType = "books",
  } = options;

  const params = new URLSearchParams({
    q: query,
    maxResults: maxResults.toString(),
    startIndex: startIndex.toString(),
    langRestrict,
    orderBy,
    printType,
    country: "JP",
  });

  const response = await fetch(`${GOOGLE_BOOKS_API}?${params}`);
  
  if (!response.ok) {
    throw new Error(`Google Books API error: ${response.status}`);
  }

  return response.json();
}

/**
 * 新刊書籍を検索（日本語）
 */
export async function searchNewReleases(
  genre: string,
  year: number = new Date().getFullYear(),
  month?: number
): Promise<GoogleBooksVolume[]> {
  // ジャンルごとの検索クエリ
  const genreQueries: Record<string, string> = {
    manga: "subject:コミック OR subject:漫画",
    lightnovel: "subject:ライトノベル OR subject:文庫",
    novel: "subject:小説 OR subject:文芸",
    business: "subject:ビジネス OR subject:経済",
    tech: "subject:コンピュータ OR subject:プログラミング",
  };

  const baseQuery = genreQueries[genre] || `subject:${genre}`;
  const dateFilter = month 
    ? `inpublisher:${year}-${month.toString().padStart(2, "0")}`
    : `inpublisher:${year}`;

  try {
    const result = await searchGoogleBooks(`${baseQuery} ${dateFilter}`, {
      maxResults: 40,
      orderBy: "newest",
    });

    return result.items || [];
  } catch (error) {
    console.error("Google Books search failed:", error);
    return [];
  }
}

/**
 * ISBNで書籍を検索
 */
export async function getBookByISBN(isbn: string): Promise<GoogleBooksVolume | null> {
  try {
    const result = await searchGoogleBooks(`isbn:${isbn}`, { maxResults: 1 });
    return result.items?.[0] || null;
  } catch (error) {
    console.error("ISBN search failed:", error);
    return null;
  }
}

/**
 * Google Books の結果を共通フォーマットに変換
 */
export function convertGoogleBooksToItem(volume: GoogleBooksVolume) {
  const { volumeInfo, saleInfo } = volume;
  
  return {
    id: `gbooks-${volume.id}`,
    type: "BOOK" as const,
    title: volumeInfo.title + (volumeInfo.subtitle ? ` ${volumeInfo.subtitle}` : ""),
    releaseDate: volumeInfo.publishedDate || null,
    coverUrl: volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:") || null,
    author: volumeInfo.authors?.join(", ") || null,
    publisher: volumeInfo.publisher || null,
    description: volumeInfo.description || null,
    pageCount: volumeInfo.pageCount || null,
    genre: volumeInfo.categories || [],
    currentPrice: saleInfo?.retailPrice?.amount || saleInfo?.listPrice?.amount || null,
    listPrice: saleInfo?.listPrice?.amount || null,
    affiliateLinks: {
      google_books: volumeInfo.infoLink || null,
    },
    isbn: volumeInfo.industryIdentifiers?.find(
      (id) => id.type === "ISBN_13" || id.type === "ISBN_10"
    )?.identifier || null,
  };
}
