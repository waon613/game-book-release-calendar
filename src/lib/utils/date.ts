/**
 * 日付ユーティリティ（JST対応）
 * タイムゾーン: Asia/Tokyo (UTC+9)
 */

const JST_OFFSET = 9 * 60; // 分単位
const TIMEZONE = "Asia/Tokyo";
const LOCALE = "ja-JP";

/**
 * 現在のJST日時を取得
 */
export function getNowJST(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: TIMEZONE })
  );
}

/**
 * DateをJSTのYYYY/MM/DD形式にフォーマット
 */
export function formatDateJST(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(LOCALE, {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/-/g, "/");
}

/**
 * DateをJSTのYYYY/MM/DD HH:mm形式にフォーマット
 */
export function formatDateTimeJST(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(LOCALE, {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(/-/g, "/");
}

/**
 * 日付を相対表示（○日前、明日など）
 */
export function formatRelativeDateJST(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = getNowJST();
  
  // 日付のみで比較
  const targetDate = new Date(d.toLocaleDateString("en-US", { timeZone: TIMEZONE }));
  const todayDate = new Date(now.toLocaleDateString("en-US", { timeZone: TIMEZONE }));
  
  const diffTime = targetDate.getTime() - todayDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "今日";
  if (diffDays === 1) return "明日";
  if (diffDays === -1) return "昨日";
  if (diffDays > 1 && diffDays <= 7) return `${diffDays}日後`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)}日前`;
  
  return formatDateJST(d);
}

/**
 * 月の最初の日を取得（JST）
 */
export function getFirstDayOfMonthJST(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 1, -9, 0, 0));
}

/**
 * 月の最後の日を取得（JST）
 */
export function getLastDayOfMonthJST(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 0, -9, 0, 0));
}

/**
 * 曜日を日本語で取得
 */
export function getDayOfWeekJP(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const dayIndex = d.toLocaleDateString("en-US", { 
    timeZone: TIMEZONE, 
    weekday: "short" 
  });
  
  const mapping: Record<string, string> = {
    Sun: "日",
    Mon: "月",
    Tue: "火",
    Wed: "水",
    Thu: "木",
    Fri: "金",
    Sat: "土",
  };
  
  return mapping[dayIndex] || dayIndex;
}

/**
 * ISO形式の日付文字列をAWSDate形式に変換
 * AWS AppSync AWSDate形式: YYYY-MM-DD
 */
export function toAWSDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-CA", { timeZone: TIMEZONE }); // en-CA gives YYYY-MM-DD
}

/**
 * 時間（分）を「○時間○分」形式に変換
 */
export function formatMinutesToHoursJP(minutes: number): string {
  if (minutes < 60) return `${minutes}分`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) return `${hours}時間`;
  return `${hours}時間${mins}分`;
}

/**
 * クリア時間のカテゴリを取得
 */
export function getClearTimeCategory(minutes: number): string {
  if (minutes <= 600) return "〜10時間";
  if (minutes <= 1800) return "10〜30時間";
  if (minutes <= 3600) return "30〜60時間";
  return "60時間〜";
}
