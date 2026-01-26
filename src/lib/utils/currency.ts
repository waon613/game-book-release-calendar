/**
 * 通貨ユーティリティ（日本円対応）
 */

const LOCALE = "ja-JP";
const CURRENCY = "JPY";

/**
 * 数値を日本円形式にフォーマット
 * 例: 6980 → "¥6,980"
 */
export function formatPriceJPY(price: number | null | undefined): string {
  if (price === null || price === undefined) return "価格未定";
  
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    currencyDisplay: "symbol",
  }).format(price);
}

/**
 * 価格を短縮形式でフォーマット
 * 例: 6980 → "¥6,980", 12800 → "¥12,800"
 */
export function formatPriceShort(price: number | null | undefined): string {
  if (price === null || price === undefined) return "—";
  
  return `¥${price.toLocaleString(LOCALE)}`;
}

/**
 * 割引率を計算
 */
export function calculateDiscountPercent(
  originalPrice: number,
  currentPrice: number
): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

/**
 * 割引率をフォーマット
 * 例: 30 → "-30%"
 */
export function formatDiscount(discountPercent: number): string {
  if (discountPercent <= 0) return "";
  return `-${discountPercent}%`;
}

/**
 * 価格が最安値かどうかをチェック
 */
export function isHistoricalLow(
  currentPrice: number,
  historyLowPrice: number | null | undefined
): boolean {
  if (historyLowPrice === null || historyLowPrice === undefined) return false;
  return currentPrice <= historyLowPrice;
}

/**
 * 価格帯のラベルを取得
 */
export function getPriceRangeLabel(price: number): string {
  if (price <= 1000) return "〜1,000円";
  if (price <= 3000) return "1,001〜3,000円";
  if (price <= 5000) return "3,001〜5,000円";
  if (price <= 8000) return "5,001〜8,000円";
  return "8,001円〜";
}
