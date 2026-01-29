"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Calendar,
  Gamepad2,
  BookOpen,
  Star,
  Clock,
  ExternalLink,
  X,
  Heart,
  Bell,
  ShoppingCart,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPriceJPY } from "@/lib/utils/currency";
import type { Item } from "@/types";

// サンプルデータ
const SAMPLE_ITEMS: Item[] = [
  {
    id: "1",
    type: "GAME",
    title: "ファイナルファンタジー XVII",
    releaseDate: "2026-02-15",
    coverUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=600&fit=crop",
    criticScore: 92,
    estimatedClearTime: 2400,
    currentPrice: 9680,
    platform: ["PS5", "Steam"],
    genre: ["RPG", "アクション"],
    description: "シリーズ最新作。広大な世界を舞台に、革新的なリアルタイム戦闘システムで壮大な冒険を体験。",
    affiliateLinks: { amazon_jp: "https://amazon.co.jp", rakuten: "https://rakuten.co.jp" },
  },
  {
    id: "2",
    type: "GAME",
    title: "エルデンリング DLC",
    releaseDate: "2026-02-15",
    coverUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop",
    criticScore: 96,
    estimatedClearTime: 3600,
    currentPrice: 4980,
    platform: ["PS5", "Xbox", "Steam"],
    genre: ["アクション", "RPG"],
    description: "狭間の地を更に拡張する大型拡張コンテンツ。",
    affiliateLinks: { amazon_jp: "https://amazon.co.jp" },
  },
  {
    id: "3",
    type: "BOOK",
    title: "システム設計の面接対策 Vol.3",
    releaseDate: "2026-02-20",
    coverUrl: "",
    currentPrice: 4200,
    genre: ["技術書", "プログラミング"],
    publisher: "オライリー",
    description: "実践的なシステム設計をマスターするための決定版。",
    affiliateLinks: { amazon_jp: "https://amazon.co.jp", rakuten: "https://rakuten.co.jp" },
  },
  {
    id: "4",
    type: "GAME",
    title: "モンスターハンター ワイルズ",
    releaseDate: "2026-02-28",
    coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop",
    criticScore: 89,
    estimatedClearTime: 1800,
    currentPrice: 8980,
    platform: ["PS5", "Xbox", "Steam"],
    genre: ["アクション", "協力プレイ"],
    affiliateLinks: { amazon_jp: "https://amazon.co.jp" },
  },
  {
    id: "5",
    type: "BOOK",
    title: "React実践入門 2026年版",
    releaseDate: "2026-03-01",
    coverUrl: "",
    currentPrice: 3800,
    genre: ["技術書"],
    publisher: "技術評論社",
    affiliateLinks: { amazon_jp: "https://amazon.co.jp" },
  },
];

// 日付フォーマット
function formatJapaneseDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日（${weekday}）`;
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 日付までの日数計算
function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// 日付ラベル
function getRelativeLabel(dateStr: string): string {
  const days = getDaysUntil(dateStr);
  if (days < 0) return "発売済み";
  if (days === 0) return "本日発売";
  if (days === 1) return "明日発売";
  if (days <= 7) return `${days}日後`;
  if (days <= 14) return "来週";
  if (days <= 30) return "今月中";
  return `${Math.ceil(days / 7)}週間後`;
}

// カレンダー生成
function generateMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const days: Date[] = [];
  const startDayOfWeek = firstDay.getDay();

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(firstDay);
    prevDate.setDate(prevDate.getDate() - i - 1);
    days.push(prevDate);
  }

  const current = new Date(firstDay);
  while (current <= lastDay) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  while (days.length < 42) {
    const nextDate = new Date(days[days.length - 1]);
    nextDate.setDate(nextDate.getDate() + 1);
    days.push(nextDate);
  }
  return days;
}

function groupItemsByDate(items: Item[]): Map<string, Item[]> {
  const map = new Map<string, Item[]>();
  items.forEach((item) => {
    if (item.releaseDate) {
      const existing = map.get(item.releaseDate) || [];
      existing.push(item);
      map.set(item.releaseDate, existing);
    }
  });
  return map;
}

// アイテム詳細モーダル
function ItemModal({ item, onClose }: { item: Item | null; onClose: () => void }) {
  if (!item) return null;
  const isGame = item.type === "GAME";
  const daysUntil = getDaysUntil(item.releaseDate || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="relative h-40 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
          {item.coverUrl && (
            <img src={item.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-900" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 発売日バッジ */}
          <div className="absolute bottom-4 left-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
              daysUntil <= 7 
                ? "bg-red-500 text-white" 
                : daysUntil <= 30 
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-700 text-white"
            }`}>
              <Calendar className="w-4 h-4" />
              {item.releaseDate && formatJapaneseDate(item.releaseDate)}
              <span className="opacity-80">（{getRelativeLabel(item.releaseDate || "")}）</span>
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* タイトル */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded ${
                isGame ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
              }`}>
                {isGame ? <Gamepad2 className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                {isGame ? "ゲーム" : "書籍"}
              </span>
              {item.platform?.map(p => (
                <span key={p} className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 rounded">{p}</span>
              ))}
            </div>
            <h2 className="text-2xl font-bold">{item.title}</h2>
            {item.publisher && <p className="text-sm text-zinc-500 mt-1">{item.publisher}</p>}
          </div>

          {/* スペック */}
          <div className="grid grid-cols-3 gap-4">
            {item.currentPrice && (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="text-xs text-zinc-500 mb-1">価格</div>
                <div className="text-xl font-bold text-red-600 dark:text-red-400">{formatPriceJPY(item.currentPrice)}</div>
              </div>
            )}
            {item.criticScore && (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="text-xs text-zinc-500 mb-1">評価スコア</div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-xl font-bold">{item.criticScore}</span>
                </div>
              </div>
            )}
            {item.estimatedClearTime && (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="text-xs text-zinc-500 mb-1">プレイ時間</div>
                <div className="flex items-center gap-1">
                  <Clock className="w-5 h-5 text-zinc-400" />
                  <span className="text-xl font-bold">{Math.round(item.estimatedClearTime / 60)}時間</span>
                </div>
              </div>
            )}
          </div>

          {/* 説明 */}
          {item.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.description}</p>
          )}

          {/* アクション */}
          <div className="flex items-center gap-3 pt-2">
            {item.affiliateLinks?.amazon_jp && (
              <Button asChild className="flex-1 h-12 bg-[#FF9900] hover:bg-[#e88b00] text-black font-bold">
                <a href={item.affiliateLinks.amazon_jp} target="_blank" rel="noopener noreferrer">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Amazonで予約
                </a>
              </Button>
            )}
            {item.affiliateLinks?.rakuten && (
              <Button asChild variant="outline" className="flex-1 h-12 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 font-bold">
                <a href={item.affiliateLinks.rakuten} target="_blank" rel="noopener noreferrer">
                  楽天で予約
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// タイムラインアイテム
function TimelineItem({ item, onClick }: { item: Item; onClick: () => void }) {
  const isGame = item.type === "GAME";
  const daysUntil = getDaysUntil(item.releaseDate || "");
  
  return (
    <div 
      onClick={onClick}
      className="group flex gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700"
    >
      {/* カバー */}
      <div className="w-20 h-28 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
        {item.coverUrl ? (
          <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isGame ? <Gamepad2 className="w-8 h-8 text-zinc-300" /> : <BookOpen className="w-8 h-8 text-zinc-300" />}
          </div>
        )}
      </div>

      {/* 情報 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
            isGame ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400" : "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
          }`}>
            {isGame ? "ゲーム" : "書籍"}
          </span>
          {item.platform?.slice(0, 2).map(p => (
            <span key={p} className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{p}</span>
          ))}
        </div>
        
        <h3 className="font-bold text-lg truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {item.title}
        </h3>
        
        <div className="flex items-center gap-4 mt-2 text-sm">
          {item.criticScore && (
            <span className="flex items-center gap-1 text-yellow-600">
              <Star className="w-4 h-4" fill="currentColor" />
              {item.criticScore}
            </span>
          )}
          {item.estimatedClearTime && (
            <span className="flex items-center gap-1 text-zinc-500">
              <Clock className="w-4 h-4" />
              {Math.round(item.estimatedClearTime / 60)}h
            </span>
          )}
        </div>
      </div>

      {/* 価格・発売日 */}
      <div className="text-right flex-shrink-0">
        {item.currentPrice && (
          <div className="text-lg font-bold text-red-600 dark:text-red-400">
            {formatPriceJPY(item.currentPrice)}
          </div>
        )}
        <div className={`mt-1 text-sm font-medium ${
          daysUntil <= 7 ? "text-red-500" : daysUntil <= 30 ? "text-orange-500" : "text-zinc-500"
        }`}>
          {getRelativeLabel(item.releaseDate || "")}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const today = new Date();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [filterType, setFilterType] = useState<"ALL" | "GAME" | "BOOK">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/releases');
        const data = await response.json();
        
        if (data.success && data.items) {
          setItems(data.items);
        } else {
          // APIエラーの場合はサンプルデータを使用
          console.warn('API failed, using sample data:', data.error);
          setItems(SAMPLE_ITEMS);
        }
      } catch (error) {
        console.error('Failed to fetch releases:', error);
        // ネットワークエラーの場合もサンプルデータを使用
        setItems(SAMPLE_ITEMS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => filterType === "ALL" || item.type === filterType);
  }, [items, filterType]);

  // 発売日でソート
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (!a.releaseDate) return 1;
      if (!b.releaseDate) return -1;
      return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
    });
  }, [filteredItems]);

  // 日付でグループ化
  const groupedByDate = useMemo(() => {
    const groups: { date: string; items: Item[] }[] = [];
    const map = new Map<string, Item[]>();
    
    sortedItems.forEach(item => {
      if (item.releaseDate) {
        const existing = map.get(item.releaseDate) || [];
        existing.push(item);
        map.set(item.releaseDate, existing);
      }
    });
    
    map.forEach((items, date) => {
      groups.push({ date, items });
    });
    
    return groups.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sortedItems]);

  const monthDays = useMemo(() => generateMonthDays(currentYear, currentMonth), [currentYear, currentMonth]);
  const itemsByDate = useMemo(() => groupItemsByDate(filteredItems), [filteredItems]);

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* ロゴ */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">発売カレンダー</h1>
                <p className="text-xs text-zinc-500">ゲーム・書籍の新着情報</p>
              </div>
            </div>

            {/* ナビゲーション */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">お気に入り</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">通知</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 左側：タイムライン */}
          <div className="lg:col-span-2 space-y-6">
            {/* フィルター */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                発売予定
              </h2>
              <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                {(["ALL", "GAME", "BOOK"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      filterType === type 
                        ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm" 
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    {type === "ALL" ? "すべて" : type === "GAME" ? "ゲーム" : "書籍"}
                  </button>
                ))}
              </div>
            </div>

            {/* タイムライン */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-zinc-500">発売情報を取得中...</p>
                </div>
              ) : groupedByDate.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Calendar className="w-16 h-16 text-zinc-300 mb-4" />
                  <h3 className="text-lg font-medium mb-1">発売予定がありません</h3>
                  <p className="text-sm text-zinc-500">フィルターを変更するか、後ほどお試しください</p>
                </div>
              ) : (
                groupedByDate.map(({ date, items }) => {
                const daysUntil = getDaysUntil(date);
                return (
                  <div key={date}>
                    {/* 日付ヘッダー */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`flex-shrink-0 w-24 h-24 rounded-2xl flex flex-col items-center justify-center shadow-lg ${
                        daysUntil <= 0 
                          ? "bg-green-500 text-white"
                          : daysUntil <= 7 
                            ? "bg-red-500 text-white" 
                            : daysUntil <= 14 
                              ? "bg-orange-500 text-white"
                              : "bg-zinc-700 text-white"
                      }`}>
                        <div className="text-3xl font-bold">{new Date(date).getDate()}</div>
                        <div className="text-sm opacity-90">{new Date(date).getMonth() + 1}月</div>
                        <div className="text-xs opacity-75">{weekDays[new Date(date).getDay()]}曜日</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{formatJapaneseDate(date)}</div>
                        <div className={`text-sm font-medium ${
                          daysUntil <= 0 ? "text-green-600" : daysUntil <= 7 ? "text-red-500" : "text-zinc-500"
                        }`}>
                          {getRelativeLabel(date)}
                        </div>
                        <div className="text-xs text-zinc-400 mt-1">{items.length}件の発売</div>
                      </div>
                    </div>

                    {/* アイテム */}
                    <div className="space-y-3 ml-0 sm:ml-28">
                      {items.map(item => (
                        <TimelineItem 
                          key={item.id} 
                          item={item} 
                          onClick={() => setSelectedItem(item)} 
                        />
                      ))}
                    </div>
                  </div>
                );
              })
              )}
            </div>
          </div>

          {/* 右側：ミニカレンダー */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sticky top-24">
              {/* カレンダーヘッダー */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">{currentYear}年{currentMonth}月</h3>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="w-8 h-8" onClick={goToPrevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8" onClick={goToNextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* 曜日 */}
              <div className="grid grid-cols-7 mb-2">
                {weekDays.map((day, i) => (
                  <div 
                    key={day} 
                    className={`text-center text-xs font-medium py-2 ${
                      i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-zinc-500"
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 日付グリッド */}
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((date, i) => {
                  const dateKey = date.toISOString().split("T")[0];
                  const dayItems = itemsByDate.get(dateKey) || [];
                  const isCurrentMonth = date.getMonth() + 1 === currentMonth;
                  const isToday = date.toDateString() === today.toDateString();
                  const dayOfWeek = date.getDay();
                  const hasItems = dayItems.length > 0;

                  return (
                    <div
                      key={i}
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                        !isCurrentMonth 
                          ? "text-zinc-300 dark:text-zinc-700" 
                          : isToday 
                            ? "bg-indigo-500 text-white font-bold"
                            : hasItems
                              ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900"
                              : dayOfWeek === 0
                                ? "text-red-500"
                                : dayOfWeek === 6
                                  ? "text-blue-500"
                                  : ""
                      }`}
                      onClick={() => {
                        if (hasItems && dayItems[0]) {
                          setSelectedItem(dayItems[0]);
                        }
                      }}
                    >
                      {date.getDate()}
                      {hasItems && (
                        <div className="absolute bottom-1 flex gap-0.5">
                          {dayItems.slice(0, 3).map((item, j) => (
                            <div 
                              key={j}
                              className={`w-1 h-1 rounded-full ${
                                item.type === "GAME" ? "bg-indigo-500" : "bg-amber-500"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 凡例 */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-xs text-zinc-500">ゲーム</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-xs text-zinc-500">書籍</span>
                </div>
              </div>
            </div>

            {/* 統計 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
              <h3 className="font-bold mb-4">今月の発売予定</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">ゲーム</span>
                  <span className="font-bold text-indigo-600">{filteredItems.filter(i => i.type === "GAME").length}本</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">書籍</span>
                  <span className="font-bold text-amber-600">{filteredItems.filter(i => i.type === "BOOK").length}冊</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* モーダル */}
      <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}

