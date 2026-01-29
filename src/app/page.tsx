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

// Fallback sample data
const FALLBACK_ITEMS: Item[] = [
  {
    id: "1",
    type: "GAME",
    title: "Project Fantasy XVII",
    releaseDate: "2026-02-15",
    coverUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=300&h=400",
    criticScore: 92,
    estimatedClearTime: 2400,
    currentPrice: 9680,
    listPrice: 9680,
    platform: ["PS5", "Steam"],
    genre: ["RPG"],
    affiliateLinks: {
      amazon_jp: "https://www.amazon.co.jp",
      rakuten: "https://item.rakuten.co.jp",
    },
  },
  {
    id: "2",
    type: "BOOK",
    title: "Tech Design Patterns 2026",
    releaseDate: "2026-02-20",
    coverUrl: "",
    currentPrice: 3200,
    genre: ["Tech"],
    publisher: "OReilly"
  },
];

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
}

function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  if (!item) return null;

  const isGame = item.type === "GAME";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-card rounded-lg border border-border overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image Area */}
        <div className="relative h-64 bg-muted flex-shrink-0">
          {item.coverUrl ? (
            <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-muted">
               {isGame ? "🎮" : "📚"}
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>

        {/* Content Area */}
        <div className="p-8 flex flex-col overflow-y-auto space-y-6">
           {/* Metadata Badges */}
           <div className="flex flex-wrap items-center gap-2">
             <span
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-accent/10 text-accent rounded"
             >
               {isGame ? "GAME" : "BOOK"}
             </span>
             {item.releaseDate && (
               <span className="text-sm text-muted-foreground">
                  {formatDateJST(item.releaseDate)}
               </span>
             )}
             {item.genre && item.genre.map(g => (
                <span key={g} className="text-xs text-muted-foreground border border-border px-2 py-1 rounded">{g}</span>
             ))}
           </div>

           <div>
             <h2 className="text-3xl font-semibold">{item.title}</h2>
           </div>

           <div className="grid grid-cols-2 gap-4">
              {item.currentPrice && (
                 <div className="p-4 border border-border rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Price</div>
                    <div className="text-2xl font-semibold">{formatPriceJPY(item.currentPrice)}</div>
                 </div>
              )}

              {(item.criticScore || item.estimatedClearTime) && (
                 <div className="p-4 border border-border rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">{isGame ? "Playtime / Score" : "Score"}</div>
                    <div className="flex items-center gap-4 font-medium">
                       {item.estimatedClearTime && (
                         <span className="flex items-center gap-1.5">
                            ⏱️ {Math.round(item.estimatedClearTime / 60)}h
                         </span>
                       )}
                       {item.criticScore && (
                         <span className="flex items-center gap-1.5">
                            ⭐ {item.criticScore}
                         </span>
                       )}
                    </div>
                 </div>
              )}
           </div>

           <div>
             <h3 className="text-sm font-medium mb-2">About</h3>
             <p className="text-muted-foreground leading-relaxed">
               {item.description || "No description available for this title yet. Check back closer to the release date for more information."}
             </p>
           </div>

           <div className="flex gap-3">
             {item.affiliateLinks?.amazon_jp && (
                <AmazonButton url={item.affiliateLinks.amazon_jp} className="flex-1" />
             )}
             {item.affiliateLinks?.rakuten && (
                <RakutenButton url={item.affiliateLinks.rakuten} className="flex-1" />
             )}
           </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    // In a real app, fetch from API
    setItems(FALLBACK_ITEMS);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-8">
          <h1 className="text-xl font-semibold">Release Calendar</h1>

          <div className="flex items-center gap-4">
             <nav className="hidden md:flex items-center gap-1">
                <Button variant="ghost" size="sm">Games</Button>
                <Button variant="ghost" size="sm">Books</Button>
             </nav>
             <div className="h-4 w-px bg-border"></div>
             <AuthButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          {/* Main Calendar Area */}
          <div className="space-y-8">
             <CalendarView
               items={items}
               onItemClick={(item) => setSelectedItem(item)}
             />
          </div>

          {/* Sidebar / Filters */}
          <aside className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <GenreSelector
                      selectedGenres={[]}
                      selectedPlatforms={[]}
                      itemType="ALL"
                      onGenreChange={() => {}}
                      onPlatformChange={() => {}}
                      onTypeChange={() => {}}
                    />
                    <ScoreFilter selectedScores={[0]} onChange={() => {}} />
                    <ClearTimeSlider value={[0, 6000]} onChange={() => {}} />
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                   <Card className="hover:border-accent transition-colors cursor-pointer">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                         <FavoriteBadge />
                         <span className="text-xs font-medium">Favorites</span>
                      </CardContent>
                   </Card>

                   <Card className="hover:border-accent transition-colors cursor-pointer">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                         <NotificationBadge />
                         <span className="text-xs font-medium">Reminders</span>
                      </CardContent>
                   </Card>
                </div>
          </aside>
        </div>
      </div>

      <ItemDetailModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </main>
  );
}

