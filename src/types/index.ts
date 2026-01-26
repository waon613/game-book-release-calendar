/**
 * 型定義ファイル
 * ゲーム＆書籍リリースカレンダー
 */

// アイテムタイプ
export type ItemType = "GAME" | "BOOK";

// ユーザーステータス
export type UserStatus = "WANT" | "PLAYING" | "CLEARED" | "DROPPED";

// アフィリエイトリンク構造
export interface AffiliateLinks {
  amazon_jp?: string;
  rakuten?: string;
}

// アイテム（ゲーム/書籍）
export interface Item {
  id: string;
  type: ItemType;
  title: string;
  titleOriginal?: string;
  releaseDate?: string; // YYYY-MM-DD
  coverUrl?: string;

  // 評価・プレイ時間
  criticScore?: number;
  userScore?: number;
  estimatedClearTime?: number;
  estimatedClearTimeMin?: number;
  estimatedClearTimeMax?: number;

  // 価格情報
  affiliateLinks?: AffiliateLinks;
  currentPrice?: number;
  historyLowPrice?: number;
  listPrice?: number;

  // カテゴリ・シリーズ
  genre?: string[];
  platform?: string[];
  seriesId?: string;
  publisher?: string;
  developer?: string;

  // 外部API ID
  igdbId?: number;
  rakutenIsbn?: string;
  amazonAsin?: string;

  // メタデータ
  description?: string;
  lastSyncedAt?: string;
}

// ユーザーインタラクション（積みゲー/積読）
export interface UserInteraction {
  userId: string;
  itemId: string;
  status: UserStatus;
  isSpoiler: boolean;
  personalRating?: number;
  personalNote?: string;
  startedAt?: string;
  completedAt?: string;
  playTimeMinutes?: number;
}

// シリーズ
export interface Series {
  id: string;
  title: string;
  titleOriginal?: string;
  coverUrl?: string;
  description?: string;
  totalItems?: number;
}

// シリーズ購読
export interface SeriesSubscription {
  userId: string;
  seriesId: string;
  notifyEmail: boolean;
  notifyPush: boolean;
}

// 価格履歴
export interface PriceHistory {
  id: string;
  itemId: string;
  price: number;
  source: "amazon_jp" | "rakuten";
  recordedAt: string;
}

// カレンダー表示用アイテム
export interface CalendarItem extends Item {
  relativeDate: string;
  dayOfWeek: string;
}

// フィルター設定
export interface FilterSettings {
  types: ItemType[];
  genres: string[];
  platforms: string[];
  clearTimeRange: {
    min: number;
    max: number;
  };
  scoreRange: {
    min: number;
    max: number;
  };
  priceRange: {
    min: number;
    max: number;
  };
}

// ジャンル定義（日本語）
export const GAME_GENRES = [
  "RPG",
  "アクション",
  "アドベンチャー",
  "シミュレーション",
  "パズル",
  "スポーツ",
  "レース",
  "格闘",
  "シューティング",
  "ホラー",
  "音楽",
  "その他",
] as const;

export const BOOK_GENRES = [
  "マンガ",
  "ライトノベル",
  "小説",
  "攻略本",
  "設定資料集",
  "画集",
  "その他",
] as const;

// プラットフォーム定義
export const PLATFORMS = [
  "PlayStation 5",
  "PlayStation 4",
  "Nintendo Switch",
  "Xbox Series X|S",
  "PC (Steam)",
  "PC (Epic)",
  "iOS",
  "Android",
] as const;

// ステータスラベル（日本語）
export const STATUS_LABELS: Record<UserStatus, string> = {
  WANT: "気になる",
  PLAYING: "プレイ中",
  CLEARED: "クリア済み",
  DROPPED: "積みゲー",
};

// ステータス絵文字
export const STATUS_EMOJIS: Record<UserStatus, string> = {
  WANT: "👀",
  PLAYING: "🎮",
  CLEARED: "✅",
  DROPPED: "📚",
};
