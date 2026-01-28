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
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 border-b">
            {weekDayLabels.map((day, i) => (
              <div
                key={day}
                className={`p-2 text-center text-sm font-medium ${
                  i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : ""
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7">
            {monthDays.map((date, i) => {
              const dateKey = date.toISOString().split("T")[0];
              const dayItems = itemsByDate.get(dateKey) || [];
              const isCurrentMonth = date.getMonth() + 1 === currentMonth;
              const isToday = date.toDateString() === today.toDateString();
              const dayOfWeek = date.getDay();

              return (
                <div
                  key={i}
                  className={`min-h-[80px] md:min-h-[100px] p-1 border-b border-r ${
                    !isCurrentMonth ? "bg-muted/50" : ""
                  }`}
                >
                  <div
                    className={`text-xs md:text-sm mb-1 ${
                      !isCurrentMonth
                        ? "text-muted-foreground"
                        : dayOfWeek === 0
                        ? "text-red-500"
                        : dayOfWeek === 6
                        ? "text-blue-500"
                        : ""
                    } ${
                      isToday
                        ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                        : ""
                    }`}
                  >
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onItemClick?.(item)}
                        className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${
                          item.type === "GAME"
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                            : "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                        }`}
                      >
                        {item.title}
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="text-xs text-muted-foreground pl-1">
                        +{dayItems.length - 3}件
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
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          {/* 曜日＋日付ヘッダー */}
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((date, i) => {
              const isToday = date.toDateString() === today.toDateString();
              return (
                <div
                  key={i}
                  className={`p-2 text-center ${
                    i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : ""
                  }`}
                >
                  <div className="text-xs font-medium">{weekDayLabels[i]}</div>
                  <div
                    className={`text-lg font-bold ${
                      isToday
                        ? "bg-primary text-primary-foreground rounded-full w-8 h-8 mx-auto flex items-center justify-center"
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
          <div className="grid grid-cols-7 min-h-[300px]">
            {weekDays.map((date, i) => {
              const dateKey = date.toISOString().split("T")[0];
              const dayItems = itemsByDate.get(dateKey) || [];
              return (
                <div
                  key={i}
                  className={`p-2 border-r min-h-[200px] ${
                    i === 0 ? "bg-red-50/30 dark:bg-red-900/10" : 
                    i === 6 ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                  }`}
                >
                  <div className="space-y-2">
                    {dayItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onItemClick?.(item)}
                        className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 ${
                          item.type === "GAME"
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                            : "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                        }`}
                      >
                        <div className="font-medium truncate">{item.title}</div>
                        {item.currentPrice && (
                          <div className="text-xs mt-1 opacity-75">
                            {formatPriceJPY(item.currentPrice)}
                          </div>
                        )}
                      </div>
                    ))}
                    {dayItems.length === 0 && (
                      <div className="text-xs text-muted-foreground text-center py-4">
                        -
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
      {viewMode === "list" && (
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          {monthItems.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              この月のリリース予定はありません
            </div>
          ) : (
            <div className="divide-y">
              {monthItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-muted/50 flex gap-4"
                >
                  {/* カバー画像 */}
                  <div 
                    onClick={() => onItemClick?.(item)}
                    className="w-16 h-20 bg-muted rounded overflow-hidden flex-shrink-0 cursor-pointer"
                  >
                    {item.coverUrl ? (
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        {item.type === "GAME" ? "🎮" : "📚"}
                      </div>
                    )}
                  </div>

                  {/* 情報 */}
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onItemClick?.(item)}
                  >
                    <div className="flex items-center gap-2 mb-1">
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
                        <span className="text-xs text-muted-foreground">
                          {formatDateJST(item.releaseDate)} (
                          {getDayOfWeekJP(item.releaseDate)})
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium truncate">{item.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {item.criticScore && (
                        <span>評価: {item.criticScore}点</span>
                      )}
                      {item.estimatedClearTime && (
                        <span>
                          クリア時間: 約{Math.round(item.estimatedClearTime / 60)}
                          時間
                        </span>
                      )}
                      {item.currentPrice && (
                        <span className="font-medium text-foreground">
                          {formatPriceJPY(item.currentPrice)}
                        </span>
                      )}
                    </div>
                    {item.platform && item.platform.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {item.platform.map((p) => (
                          <span
                            key={p}
                            className="text-xs bg-muted px-2 py-0.5 rounded"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* お気に入りボタン */}
                  <div className="flex-shrink-0 self-center">
                    <FavoriteButton 
                      itemId={item.id} 
                      itemTitle={item.title} 
                      variant="icon"
                    />
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
