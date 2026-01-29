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
  const primaryColor = isGame ? "var(--game-primary)" : "var(--book-primary)";

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#09090b] rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image Area */}
        <div className="relative h-48 bg-muted flex-shrink-0 group">
          {item.coverUrl ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center blur-xl opacity-40 transition-opacity duration-700"
                style={{ backgroundImage: `url(${item.coverUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#09090b]" />
              <div className="absolute top-8 left-8 bottom-[-2rem] w-32 shadow-2xl rounded-lg overflow-hidden border border-white/10 z-10 hidden md:block transform group-hover:scale-105 transition-transform duration-500">
                 <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center md:hidden">
                 <img src={item.coverUrl} alt={item.title} className="h-40 w-auto object-contain shadow-lg rounded" />
              </div>
            </>
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-4xl ${isGame ? "bg-purple-900/20" : "bg-orange-900/20"}`}>
               {isGame ? "🎮" : "📚"}
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>

        {/* Content Area */}
        <div className="p-8 md:pl-48 pt-6 md:pt-4 flex flex-col overflow-y-auto no-scrollbar">
           {/* Metadata Badges */}
           <div className="flex flex-wrap items-center gap-2 mb-3">
             <span
                className="px-2.5 py-0.5 text-[10px] font-bold text-white rounded-full uppercase tracking-wider shadow-lg shadow-purple-900/20"
                style={{ backgroundColor: primaryColor }}
             >
               {isGame ? "GAME" : "BOOK"}
             </span>
             {item.releaseDate && (
               <span className="text-xs font-medium px-2 py-0.5 bg-white/5 border border-white/10 rounded text-muted-foreground flex items-center gap-1">
                  {formatDateJST(item.releaseDate)}
               </span>
             )}
             {item.genre && item.genre.map(g => (
                <span key={g} className="text-xs text-muted-foreground border border-white/10 px-2 py-0.5 rounded-full bg-white/5">{g}</span>
             ))}
           </div>

           <h2 className="text-3xl font-bold leading-tight mb-6 tracking-tight">{item.title}</h2> 

           <div className="grid grid-cols-2 gap-4 mb-8">
              {item.currentPrice && (
                 <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Price</div>
                    <div className="text-xl font-bold font-mono tracking-tight">{formatPriceJPY(item.currentPrice)}</div>
                 </div>
              )}
              
              {(item.criticScore || item.estimatedClearTime) && (
                 <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{isGame ? "Playtime / Score" : "Score"}</div>
                    <div className="flex items-center gap-4 font-medium">
                       {item.estimatedClearTime && (
                         <span className="flex items-center gap-1.5" title="Estimated Time">
                            <span className="text-muted-foreground">⏱️</span> {Math.round(item.estimatedClearTime / 60)}h
                         </span>
                       )}
                       {item.criticScore && (
                         <span className="flex items-center gap-1.5" title="Score">
                            <span className="text-muted-foreground">⭐</span> {item.criticScore}
                         </span>
                       )}
                    </div>
                 </div>
              )}
           </div>

           <div className="space-y-6">
             <div>
               <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide opacity-70">About</h3>
               <p className="text-muted-foreground leading-relaxed">
                 {item.description || "No description available for this title yet. Check back closer to the release date for more information."}
               </p>
             </div>

             <div className="flex flex-col gap-3">
               {item.affiliateLinks?.amazon_jp && (
                  <AmazonButton url={item.affiliateLinks.amazon_jp} price={item.currentPrice} className="w-full h-12 text-base font-bold shadow-xl shadow-orange-900/10" />
               )}
               {item.affiliateLinks?.rakuten && (
                  <RakutenButton url={item.affiliateLinks.rakuten} price={item.currentPrice} className="w-full h-12 text-base font-bold shadow-xl shadow-red-900/10" />
               )}
             </div>
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
    <main className="min-h-screen bg-[#050505] text-foreground pb-20 relative selection:bg-white/20">
      {/* Background Ambient Grahpic */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/5 blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/5 blur-[120px]"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050505]/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/60">
              Release Calendar
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center bg-white/5 rounded-full p-1 border border-white/5">
                <Button variant="ghost" size="sm" className="h-7 rounded-full text-xs font-medium hover:bg-white/10">Games</Button>
                <Button variant="ghost" size="sm" className="h-7 rounded-full text-xs font-medium hover:bg-white/10">Books</Button>
             </div>
             <div className="w-px h-4 bg-white/10 mx-1"></div>
             <AuthButton />
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 pt-24 z-10 relative">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Calendar Area */}
          <div className="flex-1 min-w-0">
             <CalendarView 
               items={items} 
               onItemClick={(item) => setSelectedItem(item)}
             />
          </div>
          
          {/* Sidebar / Filters (Floating on Desktop) */}
          <div className="w-full lg:w-80 space-y-6">
             <div className="sticky top-24 space-y-6">
                <Card className="bg-[#09090b] border-white/10 shadow-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <GenreSelector selectedGenres={[]} onChange={() => {}} />
                    <ScoreFilter minScore={0} onChange={() => {}} />
                    <ClearTimeSlider maxTime={100} onChange={() => {}} />
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                   <Card className="bg-gradient-to-br from-purple-900/20 to-transparent border-purple-500/20 hover:border-purple-500/30 transition-colors cursor-pointer group">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                         <div className="p-2 bg-purple-500/10 rounded-full group-hover:scale-110 transition-transform">
                           <FavoriteBadge count={3} />
                         </div>
                         <span className="text-xs font-bold text-purple-200">Favorites</span>
                      </CardContent>
                   </Card>
                   
                   <Card className="bg-gradient-to-br from-blue-900/20 to-transparent border-blue-500/20 hover:border-blue-500/30 transition-colors cursor-pointer group">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                         <div className="p-2 bg-blue-500/10 rounded-full group-hover:scale-110 transition-transform">
                           <NotificationBadge count={1} />
                         </div>
                         <span className="text-xs font-bold text-blue-200">Reminders</span>
                      </CardContent>
                   </Card>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Floating Toolbar (Mobile) */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 lg:hidden">
        <div className="flex items-center gap-1 p-1.5 bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl ring-1 ring-black/50">
           <Button size="icon" variant="ghost" className="rounded-full w-10 h-10 hover:bg-white/10">
             <span className="text-xl">🏠</span>
           </Button>
           <Button size="icon" variant="ghost" className="rounded-full w-10 h-10 hover:bg-white/10">
             <span className="text-xl">📅</span>
           </Button>
           <div className="w-px h-4 bg-white/10 mx-1"></div>
           <Button size="icon" variant="ghost" className="rounded-full w-10 h-10 hover:bg-white/10">
             <span className="text-xl">🔍</span>
           </Button>
        </div>
      </div>

      <ItemDetailModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </main>
  );
}

