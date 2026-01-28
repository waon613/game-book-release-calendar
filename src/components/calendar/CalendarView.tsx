"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, List, CalendarDays } from "lucide-react";
import {
  formatDateJST,
  getDayOfWeekJP,
  getFirstDayOfMonthJST,
  getLastDayOfMonthJST,
  formatRelativeDateJST,
} from "@/lib/utils/date";
import { formatPriceJPY } from "@/lib/utils/currency";
import { FavoriteButton } from "@/components/user/FavoriteButton";
import type { Item } from "@/types";

interface CalendarViewProps {
  items: Item[];
  onItemClick?: (item: Item) => void;
}

// 月の日付配列を生成
function generateMonthDays(year: number, month: number) {
  const firstDay = getFirstDayOfMonthJST(year, month);
  const lastDay = getLastDayOfMonthJST(year, month);

  const days: Date[] = [];

  // 月初の曜日を取得（0=日曜）
  const startDayOfWeek = firstDay.getDay();

  // 前月の日を埋める
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(firstDay);
    prevDate.setDate(prevDate.getDate() - i - 1);
    days.push(prevDate);
  }

  // 当月の日を追加
  const current = new Date(firstDay);
  while (current <= lastDay) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // 次月の日を埋める（6週間分になるように）
  while (days.length < 42) {
    const nextDate = new Date(days[days.length - 1]);
    nextDate.setDate(nextDate.getDate() + 1);
    days.push(nextDate);
  }

  return days;
}

// アイテムを日付でグループ化
function groupItemsByDate(items: Item[]): Map<string, Item[]> {
  const map = new Map<string, Item[]>();
  items.forEach((item) => {
    if (item.releaseDate) {
      const key = item.releaseDate;
      const existing = map.get(key) || [];
      existing.push(item);
      map.set(key, existing);
    }
  });
  return map;
}

export function CalendarView({ items, onItemClick }: CalendarViewProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [viewMode, setViewMode] = useState<"calendar" | "week" | "list">("calendar");

  // 週表示用の状態
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay()); // 週の開始日（日曜日）
    return d;
  });

  const monthDays = useMemo(
    () => generateMonthDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  // 週表示用の日付配列
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentWeekStart]);

  // 週表示用のアイテム
  const weekItems = useMemo(() => {
    return items.filter((item) => {
      if (!item.releaseDate) return false;
      const date = new Date(item.releaseDate);
      return weekDays.some(
        (d) => d.toISOString().split("T")[0] === item.releaseDate
      );
    });
  }, [items, weekDays]);

  const itemsByDate = useMemo(() => groupItemsByDate(items), [items]);

  // リスト表示用：当月のアイテムをフィルタ
  const monthItems = useMemo(() => {
    return items
      .filter((item) => {
        if (!item.releaseDate) return false;
        const date = new Date(item.releaseDate);
        return (
          date.getFullYear() === currentYear &&
          date.getMonth() + 1 === currentMonth
        );
      })
      .sort(
        (a, b) =>
          new Date(a.releaseDate!).getTime() -
          new Date(b.releaseDate!).getTime()
      );
  }, [items, currentYear, currentMonth]);

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

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay());
    setCurrentWeekStart(d);
  };

  const goToPrevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const goToNextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const weekDayLabels = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="w-full">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold min-w-[140px] text-center">
            {currentYear}年{currentMonth}月
          </h2>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            今日
          </Button>
        </div>

        {/* 表示切替 */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          <Button
            variant={viewMode === "calendar" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("calendar")}
            className="flex items-center gap-1"
          >
            <Calendar className="w-4 h-4" />
            月
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("week")}
            className="flex items-center gap-1"
          >
            <CalendarDays className="w-4 h-4" />
            週
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="flex items-center gap-1"
          >
            <List className="w-4 h-4" />
            リスト
          </Button>
        </div>
      </div>

      {/* 週表示ナビゲーション（週表示の場合） */}
      {viewMode === "week" && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <Button variant="outline" size="icon" onClick={goToPrevWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[200px] text-center">
            {weekDays[0].getFullYear()}年{weekDays[0].getMonth() + 1}月{weekDays[0].getDate()}日 〜 {weekDays[6].getMonth() + 1}月{weekDays[6].getDate()}日
          </span>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* カレンダー表示 */}
      {viewMode === "calendar" && (
        <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 border-b border-border/50 bg-muted/30">
            {weekDayLabels.map((day, i) => (
              <div
                key={day}
                className={`py-3 text-center text-xs font-bold ${
                  i === 0 ? "text-rose-500" : i === 6 ? "text-blue-500" : "text-muted-foreground"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7 divide-x divide-y divide-border/50">
            {monthDays.map((date, i) => {
              const dateKey = date.toISOString().split("T")[0];
              const dayItems = itemsByDate.get(dateKey) || [];
              const isCurrentMonth = date.getMonth() + 1 === currentMonth;
              const isToday = date.toDateString() === today.toDateString();
              const dayOfWeek = date.getDay();

              return (
                <div
                  key={i}
                  className={`min-h-[100px] md:min-h-[120px] p-2 transition-colors hover:bg-muted/30 ${
                    !isCurrentMonth ? "bg-muted/20" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                        isToday
                          ? "bg-primary text-primary-foreground shadow-md"
                          : dayOfWeek === 0
                          ? "text-rose-500"
                          : dayOfWeek === 6
                          ? "text-blue-500"
                          : "text-foreground/80"
                      } ${!isCurrentMonth ? "opacity-30" : ""}`}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 mt-1">
                    {dayItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        onClick={(e) => { e.stopPropagation(); onItemClick?.(item); }}
                        className={`text-[10px] px-2 py-1 rounded-md truncate cursor-pointer transition-all hover:scale-[1.02] shadow-sm font-medium border ${
                          item.type === "GAME"
                            ? "bg-[var(--game-background)] text-[var(--game-primary)] border-[var(--game-primary)]/20"
                            : "bg-[var(--book-background)] text-[var(--book-primary)] border-[var(--book-primary)]/20"
                        }`}
                      >
                        {item.title}
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="text-[10px] text-muted-foreground pl-1 font-medium">
                        +{dayItems.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 週表示 */}
      {viewMode === "week" && (
        <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
          {/* 曜日＋日付ヘッダー */}
          <div className="grid grid-cols-7 border-b border-border/50 bg-muted/30">
            {weekDays.map((date, i) => {
              const isToday = date.toDateString() === today.toDateString();
              return (
                <div
                  key={i}
                  className={`py-3 px-2 text-center border-r border-border/50 last:border-r-0 ${
                    i === 0 ? "text-rose-500" : i === 6 ? "text-blue-500" : "text-foreground"
                  }`}
                >
                  <div className="text-xs font-medium text-muted-foreground mb-1">{weekDayLabels[i]}</div>
                  <div
                    className={`text-xl font-bold w-10 h-10 mx-auto flex items-center justify-center rounded-full ${
                      isToday
                        ? "bg-primary text-primary-foreground shadow-lg scale-110"
                        : ""
                    }`}
                  >
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 日ごとのアイテム */}
          <div className="grid grid-cols-7 min-h-[400px] divide-x divide-border/50">
            {weekDays.map((date, i) => {
              const dateKey = date.toISOString().split("T")[0];
              const dayItems = itemsByDate.get(dateKey) || [];
              return (
                <div
                  key={i}
                  className={`p-2 transition-colors hover:bg-muted/20 ${
                    i === 0 ? "bg-rose-50/30 dark:bg-rose-900/10" : 
                    i === 6 ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                  }`}
                >
                  <div className="space-y-3">
                    {dayItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={(e) => { e.stopPropagation(); onItemClick?.(item); }}
                        className={`group relative p-3 rounded-lg cursor-pointer transition-all hover:shadow-md border ${
                          item.type === "GAME"
                            ? "bg-[var(--game-background)] border-[var(--game-primary)]/20 hover:border-[var(--game-primary)]/50"
                            : "bg-[var(--book-background)] border-[var(--book-primary)]/20 hover:border-[var(--book-primary)]/50"
                        }`}
                      >
                        <div className={`text-[10px] font-bold mb-1 uppercase tracking-wider ${
                           item.type === "GAME" ? "text-[var(--game-primary)]" : "text-[var(--book-primary)]"
                        }`}>
                          {item.type === "GAME" ? "GAME" : "BOOK"}
                        </div>
                        <div className="text-xs font-bold leading-snug line-clamp-3 mb-2">{item.title}</div>
                        {item.currentPrice && (
                          <div className="text-xs font-medium opacity-75">
                            {formatPriceJPY(item.currentPrice)}
                          </div>
                        )}
                        {item.coverUrl && (
                          <div className="mt-2 text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 bg-black/60 flex items-center justify-center text-white rounded-lg font-bold backdrop-blur-sm">
                            詳細を見る
                          </div>
                        )}
                      </div>
                    ))}
                    {dayItems.length === 0 && (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-xs text-muted-foreground/50 font-medium">No schedule</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* リスト表示 */}
      {/* リスト表示（リッチカードデザイン） */}
      {viewMode === "list" && (
        <div className="pb-8">
          {monthItems.length === 0 ? (
            <div className="p-16 text-center bg-card rounded-2xl border border-dashed flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-3xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-1">リリース予定がありません</h3>
              <p className="text-muted-foreground">今のところ、この月に発売されるゲームや書籍の予定はないようです。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {monthItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onItemClick?.(item)}
                  className="group bg-card hover:bg-muted/30 rounded-2xl border shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden flex flex-col md:flex-row h-full md:h-48"
                >
                  {/* カバー画像セクション */}
                  <div className="w-full md:w-48 h-48 md:h-full bg-muted flex-shrink-0 relative overflow-hidden">
                    {item.coverUrl ? (
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                        <span className="text-4xl mb-2">{item.type === "GAME" ? "🎮" : "📚"}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/10 opacity-60"></div>
                    
                    {/* タイプバッジ（画像上） */}
                    <div className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase font-bold text-white shadow-lg rounded-full backdrop-blur-md ${
                       item.type === "GAME" ? "bg-[var(--game-primary)]" : "bg-[var(--book-primary)]"
                    } ring-1 ring-white/20`}>
                      {item.type === "GAME" ? "Game" : "Book"}
                    </div>
                  </div>

                  {/* 情報セクション */}
                  <div className="flex-1 p-5 flex flex-col min-w-0 relative">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <span className="flex items-center gap-1">
                             📅 {item.releaseDate ? `${formatDateJST(item.releaseDate)} (${getDayOfWeekJP(item.releaseDate)})` : "発売日未定"}
                          </span>
                          <span>•</span>
                          <span className={`${item.type === "GAME" ? "text-[var(--game-primary)]" : "text-[var(--book-primary)]"}`}>
                            {item.publisher || "Publisher"}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg md:text-xl leading-snug line-clamp-2 md:line-clamp-1 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <FavoriteButton 
                          itemId={item.id} 
                          itemTitle={item.title} 
                          itemType={item.type}
                          variant="icon" 
                          className="hover:bg-muted rounded-full w-10 h-10"
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                       <div className="flex flex-wrap gap-2 text-xs mb-3">
                          {item.platform && item.platform.length > 0 && item.platform.map((p) => (
                             <span key={p} className="px-2 py-1 bg-muted/50 border rounded-md font-medium text-muted-foreground">{p}</span>
                          ))}
                          {item.estimatedClearTime && (
                            <span className="px-2 py-1 bg-muted/50 border rounded-md text-muted-foreground flex items-center gap-1">
                              ⏱️ 約{Math.round(item.estimatedClearTime / 60)}時間
                            </span>
                          )}
                       </div>
                       
                       <div className="text-sm text-muted-foreground line-clamp-2">
                         {item.description || "No description available."}
                       </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                       <div className="flex items-baseline gap-1">
                         <span className="text-xs text-muted-foreground">参考価格</span>
                         <span className="text-xl font-bold font-mono tracking-tight">
                           {item.currentPrice ? formatPriceJPY(item.currentPrice) : "--"}
                         </span>
                       </div>
                       <button className="text-sm font-medium text-primary hover:underline underline-offset-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         詳細を見る
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
