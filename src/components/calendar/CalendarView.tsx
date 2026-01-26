"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, List } from "lucide-react";
import {
  formatDateJST,
  getDayOfWeekJP,
  getFirstDayOfMonthJST,
  getLastDayOfMonthJST,
  formatRelativeDateJST,
} from "@/lib/utils/date";
import { formatPriceJPY } from "@/lib/utils/currency";
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
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const monthDays = useMemo(
    () => generateMonthDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

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
  };

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

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
            月表示
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

      {/* カレンダー表示 */}
      {viewMode === "calendar" && (
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day, i) => (
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
                  onClick={() => onItemClick?.(item)}
                  className="p-4 hover:bg-muted/50 cursor-pointer flex gap-4"
                >
                  {/* カバー画像 */}
                  <div className="w-16 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
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
                  <div className="flex-1 min-w-0">
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
