"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Calendar,
  Grid3X3,
  List,
  Gamepad2,
  BookOpen,
  Star,
  Clock,
  ExternalLink,
  X,
  Heart,
  Bell,
  Filter,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPriceJPY } from "@/lib/utils/currency";
import { formatDateJST } from "@/lib/utils/date";
import type { Item } from "@/types";

// Sample data
const SAMPLE_ITEMS: Item[] = [
  {
    id: "1",
    type: "GAME",
    title: "Final Fantasy XVII",
    releaseDate: "2026-02-15",
    coverUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=600&fit=crop",
    criticScore: 92,
    estimatedClearTime: 2400,
    currentPrice: 9680,
    platform: ["PS5", "Steam"],
    genre: ["RPG", "Action"],
    description: "The next chapter in the legendary Final Fantasy series. Experience an epic adventure across vast landscapes with revolutionary real-time combat.",
    affiliateLinks: { amazon_jp: "https://amazon.co.jp", rakuten: "https://rakuten.co.jp" },
  },
  {
    id: "2",
    type: "GAME",
    title: "Elden Ring: Shadow of the Erdtree",
    releaseDate: "2026-02-20",
    coverUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop",
    criticScore: 96,
    estimatedClearTime: 3600,
    currentPrice: 4980,
    platform: ["PS5", "Xbox", "Steam"],
    genre: ["Action", "RPG"],
    description: "Expand your journey in the Lands Between with the massive expansion.",
    affiliateLinks: { amazon_jp: "https://amazon.co.jp" },
  },
  {
    id: "3",
    type: "BOOK",
    title: "System Design Interview Vol.3",
    releaseDate: "2026-02-25",
    coverUrl: "",
    currentPrice: 4200,
    genre: ["Tech", "Programming"],
    publisher: "O'Reilly",
    description: "Master the art of designing scalable systems with real-world examples.",
    affiliateLinks: { amazon_jp: "https://amazon.co.jp", rakuten: "https://rakuten.co.jp" },
  },
  {
    id: "4",
    type: "GAME",
    title: "Monster Hunter Wilds",
    releaseDate: "2026-03-05",
    coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop",
    criticScore: 89,
    estimatedClearTime: 1800,
    currentPrice: 8980,
    platform: ["PS5", "Xbox", "Steam"],
    genre: ["Action", "Co-op"],
    affiliateLinks: { amazon_jp: "https://amazon.co.jp" },
  },
];

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
      const key = item.releaseDate;
      const existing = map.get(key) || [];
      existing.push(item);
      map.set(key, existing);
    }
  });
  return map;
}

// Item Detail Modal
function ItemModal({ item, onClose }: { item: Item | null; onClose: () => void }) {
  if (!item) return null;

  const isGame = item.type === "GAME";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Image */}
        <div className="relative h-48 bg-muted">
          {item.coverUrl ? (
            <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {isGame ? <Gamepad2 className="w-16 h-16 text-muted-foreground/30" /> : <BookOpen className="w-16 h-16 text-muted-foreground/30" />}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                isGame ? "bg-violet-500/10 text-violet-500" : "bg-amber-500/10 text-amber-500"
              }`}>
                {isGame ? <Gamepad2 className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                {item.type}
              </span>
              {item.releaseDate && (
                <span className="text-xs text-muted-foreground">
                  {formatDateJST(item.releaseDate)}
                </span>
              )}
            </div>
            <h2 className="text-xl font-semibold tracking-tight">{item.title}</h2>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            {item.criticScore && (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">{item.criticScore}</span>
              </div>
            )}
            {item.estimatedClearTime && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{Math.round(item.estimatedClearTime / 60)}h</span>
              </div>
            )}
            {item.platform && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {item.platform.slice(0, 2).map(p => (
                  <span key={p} className="px-1.5 py-0.5 text-xs bg-muted rounded">{p}</span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Price & Actions */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {item.currentPrice && (
                <div className="text-2xl font-semibold">{formatPriceJPY(item.currentPrice)}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="rounded-full">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Bell className="w-4 h-4" />
              </Button>
              {item.affiliateLinks?.amazon_jp && (
                <Button asChild className="rounded-full gap-2">
                  <a href={item.affiliateLinks.amazon_jp} target="_blank" rel="noopener noreferrer">
                    Buy <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Item Card Component
function ItemCard({ item, onClick }: { item: Item; onClick: () => void }) {
  const isGame = item.type === "GAME";

  return (
    <div 
      onClick={onClick}
      className="group relative bg-card border border-border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-foreground/20 hover:shadow-lg"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        {item.coverUrl ? (
          <img 
            src={item.coverUrl} 
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isGame ? <Gamepad2 className="w-12 h-12 text-muted-foreground/20" /> : <BookOpen className="w-12 h-12 text-muted-foreground/20" />}
          </div>
        )}
        
        {/* Type Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 text-[10px] font-semibold tracking-wider rounded-full ${
          isGame ? "bg-violet-500 text-white" : "bg-amber-500 text-white"
        }`}>
          {item.type}
        </div>

        {/* Score Badge */}
        {item.criticScore && (
          <div className="absolute top-3 right-3 px-2 py-1 text-xs font-bold bg-black/70 text-white rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400" />
            {item.criticScore}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-medium text-sm line-clamp-2 leading-snug">{item.title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {item.releaseDate ? formatDateJST(item.releaseDate) : "TBA"}
          </span>
          {item.currentPrice && (
            <span className="text-sm font-semibold">{formatPriceJPY(item.currentPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Calendar Day Cell
function CalendarDay({ 
  date, 
  items, 
  isCurrentMonth, 
  isToday,
  onItemClick 
}: { 
  date: Date; 
  items: Item[]; 
  isCurrentMonth: boolean;
  isToday: boolean;
  onItemClick: (item: Item) => void;
}) {
  return (
    <div className={`min-h-[100px] p-2 border-b border-r border-border transition-colors ${
      !isCurrentMonth ? "bg-muted/30" : "hover:bg-muted/50"
    }`}>
      <div className={`w-7 h-7 flex items-center justify-center text-sm mb-1 ${
        isToday 
          ? "bg-foreground text-background font-semibold rounded-full" 
          : isCurrentMonth 
            ? "text-foreground" 
            : "text-muted-foreground"
      }`}>
        {date.getDate()}
      </div>
      
      <div className="space-y-1">
        {items.slice(0, 2).map((item) => (
          <div
            key={item.id}
            onClick={(e) => { e.stopPropagation(); onItemClick(item); }}
            className={`text-[11px] px-2 py-1 rounded-md truncate cursor-pointer transition-colors ${
              item.type === "GAME" 
                ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20" 
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
            }`}
          >
            {item.title}
          </div>
        ))}
        {items.length > 2 && (
          <div className="text-[10px] text-muted-foreground px-2">
            +{items.length - 2} more
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const today = new Date();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "grid" | "list">("grid");
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [filterType, setFilterType] = useState<"ALL" | "GAME" | "BOOK">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setItems(SAMPLE_ITEMS);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filterType !== "ALL" && item.type !== filterType) return false;
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [items, filterType, searchQuery]);

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

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <Calendar className="w-4 h-4 text-background" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Releases</span>
            </div>

            {/* Search */}
            <div className="hidden sm:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search releases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 text-sm bg-muted border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          {/* Type Filter */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            {(["ALL", "GAME", "BOOK"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filterType === type 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {type === "ALL" ? "All" : type === "GAME" ? "Games" : "Books"}
              </button>
            ))}
          </div>

          {/* View Toggle & Date Navigation */}
          <div className="flex items-center gap-4">
            {viewMode === "calendar" && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-[100px] text-center">
                  {currentYear} / {currentMonth.toString().padStart(2, "0")}
                </span>
                <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "calendar" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
            ))}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === "calendar" && (
          <div className="border border-border rounded-xl overflow-hidden">
            {/* Week Header */}
            <div className="grid grid-cols-7 bg-muted">
              {weekDays.map((day) => (
                <div key={day} className="py-3 text-center text-xs font-medium text-muted-foreground border-r border-border last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7">
              {monthDays.map((date, i) => {
                const dateKey = date.toISOString().split("T")[0];
                const dayItems = itemsByDate.get(dateKey) || [];
                const isCurrentMonth = date.getMonth() + 1 === currentMonth;
                const isToday = date.toDateString() === today.toDateString();

                return (
                  <CalendarDay
                    key={i}
                    date={date}
                    items={dayItems}
                    isCurrentMonth={isCurrentMonth}
                    isToday={isToday}
                    onItemClick={setSelectedItem}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl cursor-pointer transition-all hover:border-foreground/20 hover:shadow-md"
              >
                {/* Cover */}
                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {item.coverUrl ? (
                    <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.type === "GAME" ? <Gamepad2 className="w-6 h-6 text-muted-foreground/30" /> : <BookOpen className="w-6 h-6 text-muted-foreground/30" />}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.type === "GAME" ? "bg-violet-500/10 text-violet-500" : "bg-amber-500/10 text-amber-500"
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.releaseDate ? formatDateJST(item.releaseDate) : "TBA"}
                    </span>
                  </div>
                  <h3 className="font-medium truncate">{item.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    {item.criticScore && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {item.criticScore}
                      </span>
                    )}
                    {item.platform && (
                      <span>{item.platform.slice(0, 2).join(" / ")}</span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  {item.currentPrice && (
                    <div className="font-semibold">{formatPriceJPY(item.currentPrice)}</div>
                  )}
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No releases found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
          </div>
        )}
      </main>

      {/* Item Modal */}
      <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}

