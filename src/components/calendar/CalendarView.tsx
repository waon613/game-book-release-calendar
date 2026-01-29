"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, List, CalendarDays } from "lucide-react";
import {
  getFirstDayOfMonthJST,
  getLastDayOfMonthJST,
  formatDateJST,
} from "@/lib/utils/date";
import { formatPriceJPY } from "@/lib/utils/currency";
import type { Item } from "@/types";

interface CalendarViewProps {
  items: Item[];
  onItemClick?: (item: Item) => void;
}

function generateMonthDays(year: number, month: number) {
  const firstDay = getFirstDayOfMonthJST(year, month);
  const lastDay = getLastDayOfMonthJST(year, month);
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

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay()); 
    return d;
  });

  const monthDays = useMemo(
    () => generateMonthDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentWeekStart]);

  const itemsByDate = useMemo(() => groupItemsByDate(items), [items]);

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

  const weekDayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 pl-1">
        <div className="flex items-center gap-1">
           <div className="flex items-center rounded-md border border-border/50 bg-background/50 p-0.5">
             <Button variant="ghost" size="icon" onClick={goToPrevMonth} className="h-8 w-8 hover:bg-muted text-muted-foreground">
               <ChevronLeft className="w-4 h-4" />
             </Button>
             <span className="text-sm font-mono font-medium min-w-[120px] text-center px-2 py-1">
               {currentYear} / {currentMonth.toString().padStart(2, "0")}
             </span>
             <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-8 w-8 hover:bg-muted text-muted-foreground">
               <ChevronRight className="w-4 h-4" />
             </Button>
           </div>
           
           <Button variant="outline" size="sm" onClick={goToToday} className="h-9 px-3 text-xs font-medium bg-transparent border-border/50 text-muted-foreground hover:text-foreground">
             Today
           </Button>
        </div>

        <div className="flex gap-1 p-1 bg-muted/20 border border-white/5 rounded-lg backdrop-blur-sm">
          <Button
            variant={viewMode === "calendar" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("calendar")}
            className={`h-7 px-3 text-xs gap-1.5 transition-all ${viewMode === "calendar" ? "bg-muted text-foreground ring-1 ring-white/10" : "text-muted-foreground hover:text-foreground hover:bg-transparent"}`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Month</span>
          </Button>
          <Button
            variant={viewMode === "week" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("week")}
            className={`h-7 px-3 text-xs gap-1.5 transition-all ${viewMode === "week" ? "bg-muted text-foreground ring-1 ring-white/10" : "text-muted-foreground hover:text-foreground hover:bg-transparent"}`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Week</span>
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={`h-7 px-3 text-xs gap-1.5 transition-all ${viewMode === "list" ? "bg-muted text-foreground ring-1 ring-white/10" : "text-muted-foreground hover:text-foreground hover:bg-transparent"}`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List</span>
          </Button>
        </div>
      </div>

      <div className="relative min-h-[600px] w-full bg-[#050505] rounded-xl border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5">
        <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIiBmaWxsPSJub25lIiBzdHJva2U9InJnYigyNTUgMjU1IDI1NSAvIDAuMDUpIj48cGF0aCBkPSJNMCAuNUgzMS41VjMyIi8+PC9zdmc+')] opacity-[1] bg-center [mask-image:linear-gradient(180deg,white,transparent)]"></div>

        {viewMode === "calendar" && (
          <div className="relative z-10">
            <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
              {weekDayLabels.map((day, i) => (
                <div
                  key={day}
                  className={`py-3 text-center text-[10px] font-medium tracking-widest ${
                    i === 0 || i === 6 ? "text-muted-foreground/60" : "text-muted-foreground/40"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-y divide-white/5">
              {monthDays.map((date, i) => {
                const dateKey = date.toISOString().split("T")[0];
                const dayItems = itemsByDate.get(dateKey) || [];
                const isCurrentMonth = date.getMonth() + 1 === currentMonth;
                const isToday = date.toDateString() === today.toDateString();

                return (
                  <div
                    key={i}
                    className={`min-h-[120px] p-2 transition-colors relative group ${
                      !isCurrentMonth ? "bg-white/[0.01] opacity-50" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span
                        className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                          isToday
                            ? "bg-white text-black font-bold shadow-glow-sm"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      {dayItems.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          onClick={(e) => { e.stopPropagation(); onItemClick?.(item); }}
                          className={`
                            text-[10px] px-2 py-1 rounded truncate cursor-pointer 
                            transition-all duration-200 border
                            flex items-center gap-1.5
                            ${
                              item.type === "GAME"
                                ? "bg-[var(--game-background)]/10 border-[var(--game-primary)]/20 text-[var(--game-primary)] hover:border-[var(--game-primary)]/40 hover:bg-[var(--game-background)]/20"
                                : "bg-[var(--book-background)]/10 border-[var(--book-primary)]/20 text-[var(--book-primary)] hover:border-[var(--book-primary)]/40 hover:bg-[var(--book-background)]/20"
                            }
                          `}
                        >
                          <span className={`w-1 h-1 rounded-full ${item.type === "GAME" ? "bg-[var(--game-primary)]" : "bg-[var(--book-primary)]"}`}></span>
                          {item.title}
                        </div>
                      ))}
                      {dayItems.length > 4 && (
                        <div className="text-[9px] text-muted-foreground pl-1.5 pt-0.5 opacity-60">
                          +{dayItems.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === "week" && (
          <div className="relative z-10 flex flex-col h-full min-h-[600px]">
            <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
              {weekDays.map((date, i) => {
                const isToday = date.toDateString() === today.toDateString();
                return (
                  <div
                    key={i}
                    className="py-4 px-2 text-center border-r border-white/5 last:border-r-0 flex flex-col items-center gap-1"
                  >
                    <div className="text-[10px] tracking-widest text-muted-foreground/50">{weekDayLabels[i]}</div>
                    <div
                      className={`text-base font-medium flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                        isToday
                          ? "bg-white text-black font-bold shadow-lg scale-110"
                          : "text-foreground"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-7 flex-1 divide-x divide-white/5">
              {weekDays.map((date, i) => {
                const dateKey = date.toISOString().split("T")[0];
                const dayItems = itemsByDate.get(dateKey) || [];
                return (
                  <div
                    key={i}
                    className="p-2 transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="space-y-2">
                      {dayItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={(e) => { e.stopPropagation(); onItemClick?.(item); }}
                          className={`
                            group relative p-2.5 rounded-lg cursor-pointer 
                            transition-all duration-200 border border-white/5 
                            hover:border-white/10 hover:translate-y-[-1px] hover:shadow-xl
                            bg-[#0A0A0A]/50 backdrop-blur-md
                          `}
                        >
                          <div className={`
                             text-[9px] font-bold mb-1.5 uppercase tracking-wider px-1.5 py-0.5 rounded-sm w-fit
                             ${item.type === "GAME" 
                               ? "bg-[var(--game-background)]/20 text-[var(--game-primary)]" 
                               : "bg-[var(--book-background)]/20 text-[var(--book-primary)]"
                             }
                          `}>
                            {item.type}
                          </div>
                          
                          <div className="text-xs font-medium leading-snug line-clamp-3 text-gray-200 mb-1.5 group-hover:text-white transition-colors">
                             {item.title}
                          </div>
                          
                          {item.currentPrice && (
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {formatPriceJPY(item.currentPrice)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === "list" && (
          <div className="relative z-10 p-6">
            {monthItems.length === 0 ? (
              <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Calendar className="w-6 h-6 opacity-40" />
                </div>
                <p>No releases scheduled</p>
              </div>
            ) : (
              <div className="space-y-2">
                {monthItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onItemClick?.(item)}
                    className="group flex gap-4 p-3 rounded-lg border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer items-center"
                  >
                    <div className="w-16 h-16 rounded bg-muted/20 flex-shrink-0 overflow-hidden relative border border-white/5">
                      {item.coverUrl ? (
                         <img src={item.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">{item.type === "GAME" ? "🎮" : "📚"}</div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                             item.type === "GAME" 
                               ? "border-[var(--game-primary)]/30 text-[var(--game-primary)]" 
                               : "border-[var(--book-primary)]/30 text-[var(--book-primary)]"
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                              {item.releaseDate ? formatDateJST(item.releaseDate) : "TBD"}
                          </span>
                       </div>
                       <h3 className="font-medium text-sm text-foreground/90 truncate group-hover:text-white transition-colors">
                          {item.title}
                       </h3>
                       <div className="flex items-center gap-3 mt-1.5">
                          {item.publisher && (
                             <span className="text-xs text-muted-foreground/60">{item.publisher}</span>
                          )}
                          {item.currentPrice && (
                             <span className="text-xs text-muted-foreground/60 font-mono border-l border-white/10 pl-3">
                                {formatPriceJPY(item.currentPrice)}
                             </span>
                          )}
                       </div>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
