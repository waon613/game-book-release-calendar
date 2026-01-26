"use client";

import { useState, useMemo } from "react";
import { CalendarView } from "@/components/calendar/CalendarView";
import {
  ClearTimeSlider,
  ScoreFilter,
  GenreSelector,
} from "@/components/filters";
import { AmazonButton, RakutenButton } from "@/components/affiliate";
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

// サンプルデータ（開発用）
const SAMPLE_ITEMS: Item[] = [
  {
    id: "1",
    type: "GAME",
    title: "ファイナルファンタジーXVII",
    releaseDate: "2026-02-15",
    coverUrl: "",
    criticScore: 92,
    estimatedClearTime: 2400, // 40時間
    currentPrice: 9680,
    listPrice: 9680,
    platform: ["PlayStation 5", "PC (Steam)"],
    genre: ["RPG"],
    affiliateLinks: {
      amazon_jp: "https://www.amazon.co.jp/dp/BXXXXXXXX?tag=example-22",
      rakuten: "https://item.rakuten.co.jp/example/game001/",
    },
  },
  {
    id: "2",
    type: "GAME",
    title: "ゼルダの伝説 新作",
    releaseDate: "2026-02-20",
    coverUrl: "",
    criticScore: 95,
    estimatedClearTime: 3000, // 50時間
    currentPrice: 7920,
    listPrice: 7920,
    platform: ["Nintendo Switch"],
    genre: ["アクション", "アドベンチャー"],
    affiliateLinks: {
      amazon_jp: "https://www.amazon.co.jp/dp/BXXXXXXXX?tag=example-22",
      rakuten: "https://item.rakuten.co.jp/example/game002/",
    },
  },
  {
    id: "3",
    type: "BOOK",
    title: "呪術廻戦 30巻",
    releaseDate: "2026-01-30",
    coverUrl: "",
    currentPrice: 528,
    listPrice: 528,
    genre: ["マンガ"],
    affiliateLinks: {
      amazon_jp: "https://www.amazon.co.jp/dp/BXXXXXXXX?tag=example-22",
      rakuten: "https://books.rakuten.co.jp/rb/example/",
    },
  },
  {
    id: "4",
    type: "BOOK",
    title: "ソードアート・オンライン 30巻",
    releaseDate: "2026-02-10",
    coverUrl: "",
    currentPrice: 715,
    listPrice: 715,
    genre: ["ライトノベル"],
    affiliateLinks: {
      amazon_jp: "https://www.amazon.co.jp/dp/BXXXXXXXX?tag=example-22",
      rakuten: "https://books.rakuten.co.jp/rb/example/",
    },
  },
  {
    id: "5",
    type: "GAME",
    title: "モンスターハンター ワイルズ",
    releaseDate: "2026-02-28",
    coverUrl: "",
    criticScore: 88,
    estimatedClearTime: 1800, // 30時間
    currentPrice: 8990,
    listPrice: 8990,
    platform: ["PlayStation 5", "Xbox Series X|S", "PC (Steam)"],
    genre: ["アクション"],
    affiliateLinks: {
      amazon_jp: "https://www.amazon.co.jp/dp/BXXXXXXXX?tag=example-22",
      rakuten: "https://item.rakuten.co.jp/example/game003/",
    },
  },
];

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
}

function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-lg max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                item.type === "GAME"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  : "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
              }`}
            >
              {item.type === "GAME" ? "ゲーム" : "書籍"}
            </span>
            {item.releaseDate && (
              <span className="text-sm text-muted-foreground">
                {formatDateJST(item.releaseDate)} ({getDayOfWeekJP(item.releaseDate)})
              </span>
            )}
          </div>
          <CardTitle>{item.title}</CardTitle>
          {item.genre && item.genre.length > 0 && (
            <CardDescription>{item.genre.join(" / ")}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 詳細情報 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {item.criticScore && (
              <div>
                <span className="text-muted-foreground">評価スコア</span>
                <div className="font-bold text-lg">{item.criticScore}点</div>
              </div>
            )}
            {item.estimatedClearTime && (
              <div>
                <span className="text-muted-foreground">クリア時間</span>
                <div className="font-bold text-lg">
                  約{Math.round(item.estimatedClearTime / 60)}時間
                </div>
              </div>
            )}
            {item.currentPrice && (
              <div>
                <span className="text-muted-foreground">価格</span>
                <div className="font-bold text-lg text-green-600">
                  {formatPriceJPY(item.currentPrice)}
                </div>
              </div>
            )}
          </div>

          {/* プラットフォーム */}
          {item.platform && item.platform.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">対応機種</span>
              <div className="flex gap-2 flex-wrap mt-1">
                {item.platform.map((p) => (
                  <span
                    key={p}
                    className="text-xs bg-muted px-2 py-1 rounded"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* アフィリエイトボタン */}
          <div className="flex gap-3 pt-4">
            {item.affiliateLinks?.amazon_jp && (
              <AmazonButton url={item.affiliateLinks.amazon_jp} className="flex-1" />
            )}
            {item.affiliateLinks?.rakuten && (
              <RakutenButton url={item.affiliateLinks.rakuten} className="flex-1" />
            )}
          </div>

          <Button variant="outline" className="w-full" onClick={onClose}>
            閉じる
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HomePage() {
  // フィルター状態
  const [clearTimeRange, setClearTimeRange] = useState<[number, number]>([0, 6000]);
  const [selectedScores, setSelectedScores] = useState<number[]>([0]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [itemType, setItemType] = useState<"ALL" | "GAME" | "BOOK">("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // フィルタリングされたアイテム
  const filteredItems = useMemo(() => {
    return SAMPLE_ITEMS.filter((item) => {
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
  }, [clearTimeRange, selectedScores, selectedGenres, selectedPlatforms, itemType]);

  return (
    <main className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold">
              📅 ゲーム＆書籍リリースカレンダー
            </h1>
            <Button variant="outline" size="sm">
              ログイン
            </Button>
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
            <CalendarView
              items={filteredItems}
              onItemClick={(item) => setSelectedItem(item)}
            />

            {/* 結果サマリー */}
            <div className="mt-4 text-sm text-muted-foreground text-center">
              {filteredItems.length}件のリリース予定
            </div>
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
