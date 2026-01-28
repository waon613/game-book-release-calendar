"use client";

import { useState, useMemo, useEffect } from "react";
import { CalendarView } from "@/components/calendar/CalendarView";
import {
  ClearTimeSlider,
  ScoreFilter,
  GenreSelector,
} from "@/components/filters";
import { AmazonButton, RakutenButton } from "@/components/affiliate";
import { AuthButton } from "@/components/auth/AuthButton";
import { FavoriteButton, FavoriteBadge } from "@/components/user/FavoriteButton";
import { ReminderButton, NotificationBadge } from "@/components/user/NotificationButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPriceJPY } from "@/lib/utils/currency";
import { formatDateJST, getDayOfWeekJP } from "@/lib/utils/date";
import type { Item } from "@/types";

// フォールバック用サンプルデータ（APIが失敗した場合）
const FALLBACK_ITEMS: Item[] = [
  {
    id: "1",
    type: "GAME",
    title: "ファイナルファンタジーXVII",
    releaseDate: "2026-02-15",
    coverUrl: "",
    criticScore: 92,
    estimatedClearTime: 2400,
    currentPrice: 9680,
    listPrice: 9680,
    platform: ["PlayStation 5", "PC (Steam)"],
    genre: ["RPG"],
    affiliateLinks: {
      amazon_jp: "https://www.amazon.co.jp/dp/BXXXXXXXX?tag=example-22",
      rakuten: "https://item.rakuten.co.jp/example/game001/",
    },
  },
];

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
}

function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  if (!item) return null;

  const isGame = item.type === "GAME";
  const primaryColor = isGame ? "var(--game-primary)" : "var(--book-primary)";

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー画像エリア */}
        <div className="relative h-48 bg-muted flex-shrink-0">
          {item.coverUrl ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center blur-xl opacity-50"
                style={{ backgroundImage: `url(${item.coverUrl})` }}
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-6 left-6 bottom-[-2rem] w-32 shadow-xl rounded-lg overflow-hidden border-2 border-background z-10 hidden md:block">
                 <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center md:hidden">
                 <img src={item.coverUrl} alt={item.title} className="h-40 w-auto object-contain shadow-lg rounded" />
              </div>
            </>
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-4xl ${isGame ? "bg-blue-900/20" : "bg-orange-900/20"}`}>
               {isGame ? "🎮" : "📚"}
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 rounded-full bg-background/50 hover:bg-background text-foreground backdrop-blur-sm"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>

        {/* コンテンツエリア */}
        <div className="p-6 md:pl-44 pt-4 md:pt-4 flex flex-col overflow-y-auto no-scrollbar">
           {/* メタ情報バッジ */}
           <div className="flex flex-wrap items-center gap-2 mb-2">
             <span
                className="px-2.5 py-0.5 text-[10px] font-bold text-white rounded-full uppercase tracking-wider"
                style={{ backgroundColor: primaryColor }}
             >
               {isGame ? "GAME" : "BOOK"}
             </span>
             {item.releaseDate && (
               <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded text-muted-foreground flex items-center gap-1">
                 📅 {formatDateJST(item.releaseDate)} ({getDayOfWeekJP(item.releaseDate)})
               </span>
             )}
             {item.genre && item.genre.map(g => (
                <span key={g} className="text-xs text-muted-foreground border px-2 py-0.5 rounded-full">{g}</span>
             ))}
           </div>

           <h2 className="text-2xl font-bold leading-tight mb-4">{item.title}</h2> 

           <div className="grid grid-cols-2 gap-4 mb-6">
              {item.currentPrice && (
                 <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">参考価格</div>
                    <div className="text-xl font-bold font-mono text-primary">{formatPriceJPY(item.currentPrice)}</div>
                 </div>
              )}
              
              {(item.criticScore || item.estimatedClearTime) && (
                 <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">{isGame ? "クリア時間 / 評価" : "評価"}</div>
                    <div className="flex items-center gap-3 font-medium">
                       {item.estimatedClearTime && (
                         <span className="flex items-center gap-1" title="推定クリア時間">⏱️ {Math.round(item.estimatedClearTime / 60)}h</span>
                       )}
                       {item.criticScore && (
                         <span className="flex items-center gap-1" title="メタスコア">⭐ {item.criticScore}</span>
                       )}
                    </div>
                 </div>
              )}
           </div>
           
           <div className="mb-6 p-4 bg-muted/20 rounded-xl text-sm leading-relaxed text-muted-foreground">
             {/* ダミー説明文（APIから説明文が来るようになったらここに入れる） */}
             <p>{item.type === "GAME" ? "このゲームの詳細情報はまだありません。" : "この書籍の詳細情報はまだありますん。"}</p>
           </div>

           {item.platform && item.platform.length > 0 && (
              <div className="mb-6">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Platform</div>
                <div className="flex flex-wrap gap-2">
                  {item.platform.map(p => (
                    <span key={p} className="px-3 py-1 bg-background border shadow-sm rounded-lg text-sm font-medium">{p}</span>
                  ))}
                </div>
              </div>
           )}
           
           <div className="mt-auto space-y-3 pt-4 border-t border-border/50">
              <div className="grid grid-cols-2 gap-3">
                {item.affiliateLinks?.amazon_jp && (
                  <AmazonButton url={item.affiliateLinks.amazon_jp} className="w-full" />
                )}
                {item.affiliateLinks?.rakuten && (
                  <RakutenButton url={item.affiliateLinks.rakuten} className="w-full" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <FavoriteButton itemId={item.id} itemTitle={item.title} itemType={item.type} className="w-full justify-center" showLabel />
                 {item.releaseDate && (
                    <ReminderButton 
                       itemId={item.id} 
                       itemTitle={item.title} 
                       releaseDate={item.releaseDate} 
                       className="w-full justify-center" 
                    />
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  // データ取得状態
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // フィルター状態
  const [clearTimeRange, setClearTimeRange] = useState<[number, number]>([0, 6000]);
  const [selectedScores, setSelectedScores] = useState<number[]>([0]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [itemType, setItemType] = useState<"ALL" | "GAME" | "BOOK">("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // APIからデータを取得
  useEffect(() => {
    async function fetchReleases() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/releases");
        const data = await response.json();
        
        if (data.success && data.items.length > 0) {
          setItems(data.items);
        } else {
          // APIが空の結果を返した場合、フォールバック
          console.warn("API returned empty results, using fallback data");
          setItems(FALLBACK_ITEMS);
        }
      } catch (err) {
        console.error("Failed to fetch releases:", err);
        setError("データの取得に失敗しました");
        setItems(FALLBACK_ITEMS);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReleases();
  }, []);

  // フィルタリングされたアイテム
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // タイプフィルター
      if (itemType !== "ALL" && item.type !== itemType) return false;

      // クリア時間フィルター（ゲームのみ）
      if (item.type === "GAME" && item.estimatedClearTime) {
        if (
          item.estimatedClearTime < clearTimeRange[0] ||
          item.estimatedClearTime > clearTimeRange[1]
        ) {
          return false;
        }
      }

      // スコアフィルター
      if (!selectedScores.includes(0)) {
        const minScore = Math.min(...selectedScores);
        if (!item.criticScore || item.criticScore < minScore) return false;
      }

      // ジャンルフィルター
      if (selectedGenres.length > 0) {
        if (!item.genre || !item.genre.some((g) => selectedGenres.includes(g))) {
          return false;
        }
      }

      // プラットフォームフィルター
      if (selectedPlatforms.length > 0) {
        if (
          !item.platform ||
          !item.platform.some((p) => selectedPlatforms.includes(p))
        ) {
          return false;
        }
      }

      return true;
    });
  }, [items, clearTimeRange, selectedScores, selectedGenres, selectedPlatforms, itemType]);

  return (
    <main className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold">
              📅 ゲーム＆書籍リリースカレンダー
            </h1>
            <div className="flex items-center gap-3">
              <FavoriteBadge />
              <NotificationBadge />
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* フィルター切り替えボタン（モバイル） */}
        <div className="md:hidden mb-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowFilters(!showFilters)}
          >
            🔍 フィルター {showFilters ? "を閉じる" : "を開く"}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* フィルターサイドバー */}
          <aside
            className={`w-full md:w-80 space-y-6 ${
              showFilters ? "block" : "hidden md:block"
            }`}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">🔍 フィルター</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <GenreSelector
                  selectedGenres={selectedGenres}
                  selectedPlatforms={selectedPlatforms}
                  itemType={itemType}
                  onGenreChange={setSelectedGenres}
                  onPlatformChange={setSelectedPlatforms}
                  onTypeChange={setItemType}
                />

                <hr />

                <ClearTimeSlider
                  value={clearTimeRange}
                  onChange={setClearTimeRange}
                />

                <hr />

                <ScoreFilter
                  selectedScores={selectedScores}
                  onChange={setSelectedScores}
                />
              </CardContent>
            </Card>
          </aside>

          {/* メインコンテンツ */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">リリース情報を取得中...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
                <p className="text-sm text-muted-foreground mt-2">サンプルデータを表示しています</p>
              </div>
            ) : (
              <>
                <CalendarView
                  items={filteredItems}
                  onItemClick={(item) => setSelectedItem(item)}
                />

                {/* 結果サマリー */}
                <div className="mt-4 text-sm text-muted-foreground text-center">
                  {filteredItems.length}件のリリース予定
                  {items !== FALLBACK_ITEMS && (
                    <span className="ml-2 text-xs text-green-600">（APIから取得）</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>
            Amazon.co.jpアソシエイト / 楽天アフィリエイトプログラム参加サイト
          </p>
          <p className="mt-2">© 2026 ゲーム＆書籍リリースカレンダー</p>
        </div>
      </footer>

      {/* アイテム詳細モーダル */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </main>
  );
}
