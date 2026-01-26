/**
 * Amazon Product Advertising API (PA-API) クライアント
 * 日本市場向けアフィリエイトリンク生成
 *
 * @see https://webservices.amazon.com/paapi5/documentation/
 */

import { createHmac } from "crypto";

const AMAZON_JP_HOST = "webservices.amazon.co.jp";
const AMAZON_JP_REGION = "us-west-2"; // PA-API 5.0は常にus-west-2
const SERVICE = "ProductAdvertisingAPI";

export interface AmazonPAAPIConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  host?: string;
  region?: string;
}

export interface AmazonSearchParams {
  keywords?: string;
  searchIndex?: AmazonSearchIndex;
  itemPage?: number;
  itemCount?: number;
  sortBy?: AmazonSortBy;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
}

export type AmazonSearchIndex =
  | "All"
  | "VideoGames"
  | "Books"
  | "KindleStore"
  | "Software"
  | "PCHardware";

export type AmazonSortBy =
  | "AvgCustomerReviews"
  | "Featured"
  | "NewestArrivals"
  | "Price:HighToLow"
  | "Price:LowToHigh"
  | "Relevance";

export interface AmazonItem {
  ASIN: string;
  DetailPageURL: string;
  ItemInfo?: {
    Title?: {
      DisplayValue: string;
    };
    ByLineInfo?: {
      Brand?: {
        DisplayValue: string;
      };
      Manufacturer?: {
        DisplayValue: string;
      };
    };
    ContentInfo?: {
      Edition?: {
        DisplayValue: string;
      };
      Languages?: {
        DisplayValues: Array<{
          DisplayValue: string;
          Type: string;
        }>;
      };
      PublicationDate?: {
        DisplayValue: string;
      };
    };
    ProductInfo?: {
      ReleaseDate?: {
        DisplayValue: string;
      };
    };
  };
  Offers?: {
    Listings?: Array<{
      Price?: {
        Amount: number;
        Currency: string;
        DisplayAmount: string;
      };
      SavingBasis?: {
        Amount: number;
        Currency: string;
        DisplayAmount: string;
      };
    }>;
  };
  Images?: {
    Primary?: {
      Small?: {
        URL: string;
        Height: number;
        Width: number;
      };
      Medium?: {
        URL: string;
        Height: number;
        Width: number;
      };
      Large?: {
        URL: string;
        Height: number;
        Width: number;
      };
    };
  };
  BrowseNodeInfo?: {
    BrowseNodes?: Array<{
      Id: string;
      DisplayName: string;
    }>;
  };
}

interface SearchItemsResponse {
  SearchResult?: {
    TotalResultCount: number;
    SearchURL: string;
    Items: AmazonItem[];
  };
  Errors?: Array<{
    Code: string;
    Message: string;
  }>;
}

interface GetItemsResponse {
  ItemsResult?: {
    Items: AmazonItem[];
  };
  Errors?: Array<{
    Code: string;
    Message: string;
  }>;
}

/**
 * Amazon PA-API クライアント
 */
export class AmazonPAAPIClient {
  private config: Required<AmazonPAAPIConfig>;

  constructor(config: AmazonPAAPIConfig) {
    this.config = {
      host: AMAZON_JP_HOST,
      region: AMAZON_JP_REGION,
      ...config,
    };
  }

  /**
   * 商品を検索
   */
  async searchItems(params: AmazonSearchParams): Promise<AmazonItem[]> {
    const payload = {
      Keywords: params.keywords,
      SearchIndex: params.searchIndex || "All",
      ItemPage: params.itemPage || 1,
      ItemCount: params.itemCount || 10,
      PartnerTag: this.config.partnerTag,
      PartnerType: "Associates",
      Marketplace: "www.amazon.co.jp",
      Resources: [
        "ItemInfo.Title",
        "ItemInfo.ByLineInfo",
        "ItemInfo.ContentInfo",
        "ItemInfo.ProductInfo",
        "Offers.Listings.Price",
        "Offers.Listings.SavingBasis",
        "Images.Primary.Small",
        "Images.Primary.Medium",
        "Images.Primary.Large",
        "BrowseNodeInfo.BrowseNodes",
      ],
      ...(params.sortBy && { SortBy: params.sortBy }),
      ...(params.minPrice && { MinPrice: params.minPrice }),
      ...(params.maxPrice && { MaxPrice: params.maxPrice }),
      ...(params.brand && { Brand: params.brand }),
    };

    const response = await this.signedRequest<SearchItemsResponse>(
      "SearchItems",
      payload
    );

    if (response.Errors && response.Errors.length > 0) {
      throw new Error(
        `Amazon PA-API エラー: ${response.Errors[0].Code} - ${response.Errors[0].Message}`
      );
    }

    return response.SearchResult?.Items || [];
  }

  /**
   * ASINで商品を取得
   */
  async getItems(asins: string[]): Promise<AmazonItem[]> {
    if (asins.length === 0) return [];
    if (asins.length > 10) {
      throw new Error("一度に取得できるASINは10件までです");
    }

    const payload = {
      ItemIds: asins,
      ItemIdType: "ASIN",
      PartnerTag: this.config.partnerTag,
      PartnerType: "Associates",
      Marketplace: "www.amazon.co.jp",
      Resources: [
        "ItemInfo.Title",
        "ItemInfo.ByLineInfo",
        "ItemInfo.ContentInfo",
        "ItemInfo.ProductInfo",
        "Offers.Listings.Price",
        "Offers.Listings.SavingBasis",
        "Images.Primary.Small",
        "Images.Primary.Medium",
        "Images.Primary.Large",
        "BrowseNodeInfo.BrowseNodes",
      ],
    };

    const response = await this.signedRequest<GetItemsResponse>(
      "GetItems",
      payload
    );

    if (response.Errors && response.Errors.length > 0) {
      throw new Error(
        `Amazon PA-API エラー: ${response.Errors[0].Code} - ${response.Errors[0].Message}`
      );
    }

    return response.ItemsResult?.Items || [];
  }

  /**
   * ゲームを検索
   */
  async searchGames(keywords: string, itemCount: number = 10): Promise<AmazonItem[]> {
    return this.searchItems({
      keywords,
      searchIndex: "VideoGames",
      sortBy: "Relevance",
      itemCount,
    });
  }

  /**
   * 書籍を検索
   */
  async searchBooks(keywords: string, itemCount: number = 10): Promise<AmazonItem[]> {
    return this.searchItems({
      keywords,
      searchIndex: "Books",
      sortBy: "Relevance",
      itemCount,
    });
  }

  /**
   * 署名付きリクエストを実行
   */
  private async signedRequest<T>(
    operation: string,
    payload: Record<string, unknown>
  ): Promise<T> {
    const path = "/paapi5/" + operation.toLowerCase();
    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
    const date = timestamp.slice(0, 8);

    const headers: Record<string, string> = {
      host: this.config.host,
      "content-type": "application/json; charset=utf-8",
      "x-amz-date": timestamp,
      "x-amz-target": `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`,
      "content-encoding": "amz-1.0",
    };

    const body = JSON.stringify(payload);

    // 署名を計算
    const signature = this.calculateSignature(
      "POST",
      path,
      headers,
      body,
      timestamp,
      date
    );

    headers["Authorization"] = this.buildAuthHeader(signature, date);

    const response = await fetch(`https://${this.config.host}${path}`, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Amazon PA-API HTTPエラー: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * AWS Signature Version 4を計算
   */
  private calculateSignature(
    method: string,
    path: string,
    headers: Record<string, string>,
    body: string,
    timestamp: string,
    date: string
  ): string {
    // 1. Create canonical request
    const sortedHeaders = Object.keys(headers)
      .sort()
      .map((key) => `${key.toLowerCase()}:${headers[key]}`)
      .join("\n");

    const signedHeaders = Object.keys(headers)
      .sort()
      .map((key) => key.toLowerCase())
      .join(";");

    const payloadHash = this.sha256(body);

    const canonicalRequest = [
      method,
      path,
      "", // query string
      sortedHeaders + "\n",
      signedHeaders,
      payloadHash,
    ].join("\n");

    // 2. Create string to sign
    const credentialScope = `${date}/${this.config.region}/${SERVICE}/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      timestamp,
      credentialScope,
      this.sha256(canonicalRequest),
    ].join("\n");

    // 3. Calculate signature
    const kDate = this.hmacSha256(`AWS4${this.config.secretKey}`, date);
    const kRegion = this.hmacSha256(kDate, this.config.region);
    const kService = this.hmacSha256(kRegion, SERVICE);
    const kSigning = this.hmacSha256(kService, "aws4_request");

    return this.hmacSha256Hex(kSigning, stringToSign);
  }

  /**
   * Authorizationヘッダーを構築
   */
  private buildAuthHeader(signature: string, date: string): string {
    const credential = `${this.config.accessKey}/${date}/${this.config.region}/${SERVICE}/aws4_request`;
    const signedHeaders = "content-encoding;content-type;host;x-amz-date;x-amz-target";

    return `AWS4-HMAC-SHA256 Credential=${credential}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  }

  private sha256(data: string): string {
    return createHmac("sha256", "")
      .update(data)
      .digest("hex");
  }

  private hmacSha256(key: string | Buffer, data: string): Buffer {
    return createHmac("sha256", key).update(data).digest();
  }

  private hmacSha256Hex(key: Buffer, data: string): string {
    return createHmac("sha256", key).update(data).digest("hex");
  }
}

/**
 * AmazonアイテムをItem形式に変換
 */
export function convertAmazonItemToPartial(
  item: AmazonItem,
  partnerTag: string
): {
  amazonAsin: string;
  affiliateLinks: { amazon_jp: string };
  currentPrice: number | null;
  listPrice: number | null;
  coverUrl: string | null;
  title: string | null;
  publisher: string | null;
} {
  const listing = item.Offers?.Listings?.[0];

  return {
    amazonAsin: item.ASIN,
    affiliateLinks: {
      amazon_jp: `https://www.amazon.co.jp/dp/${item.ASIN}?tag=${partnerTag}`,
    },
    currentPrice: listing?.Price?.Amount || null,
    listPrice: listing?.SavingBasis?.Amount || listing?.Price?.Amount || null,
    coverUrl:
      item.Images?.Primary?.Large?.URL ||
      item.Images?.Primary?.Medium?.URL ||
      null,
    title: item.ItemInfo?.Title?.DisplayValue || null,
    publisher:
      item.ItemInfo?.ByLineInfo?.Manufacturer?.DisplayValue ||
      item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue ||
      null,
  };
}

/**
 * アフィリエイトリンクを生成（シンプル版）
 */
export function generateAmazonAffiliateLink(
  asin: string,
  partnerTag: string
): string {
  return `https://www.amazon.co.jp/dp/${asin}?tag=${partnerTag}`;
}

/**
 * 検索結果へのアフィリエイトリンクを生成
 */
export function generateAmazonSearchLink(
  keywords: string,
  partnerTag: string,
  searchIndex: AmazonSearchIndex = "All"
): string {
  const encodedKeywords = encodeURIComponent(keywords);
  const nodeMapping: Record<AmazonSearchIndex, string> = {
    All: "",
    VideoGames: "&i=videogames",
    Books: "&i=stripbooks",
    KindleStore: "&i=digital-text",
    Software: "&i=software",
    PCHardware: "&i=computers",
  };

  return `https://www.amazon.co.jp/s?k=${encodedKeywords}${nodeMapping[searchIndex]}&tag=${partnerTag}`;
}
