
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

// フォールバック用サンプルデータ
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
        {/* ヘッダー画像エリア */}
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
               {isGame ? "" : ""}
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10"
            onClick={onClose}
          >
            
          </Button>
        </div>

        {/* コンテンツエリア */}
        <div className="p-8 md:pl-48 pt-6 md:pt-4 flex flex-col overflow-y-auto no-scrollbar">
           {/* メタ情報バッジ */}
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
                            <span className="text-muted-foreground"></span> {Math.round(item.estimatedClearTime / 60)}h
                         </span>
                       )}
                       {item.criticScore && (
                         <span className="flex items-center gap-1.5" title="Score">
                            <span className="text-yellow-500"></span> {item.criticScore}
                         </span>
                       )}
                    </div>
                 </div>
              )}
           </div>
           
           {item.platform && item.platform.length > 0 && (
              <div className="mb-8">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Available On</div>
                <div className="flex flex-wrap gap-2">
                  {item.platform.map(p => (
                    <span key={p} className="px-3 py-1.5 bg-black border border-white/10 shadow-sm rounded-lg text-sm font-medium hover:bg-white/5 transition-colors cursor-default">{p}</span>
                  ))}
                </div>
              </div>
           )}
           
           <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
              <div className="grid grid-cols-2 gap-4">
                {item.affiliateLinks?.amazon_jp && (
                  <AmazonButton url={item.affiliateLinks.amazon_jp} className="w-full h-11" />
                )}
                {item.affiliateLinks?.rakuten && (
                  <RakutenButton url={item.affiliateLinks.rakuten} className="w-full h-11" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <FavoriteButton itemId={item.id} itemTitle={item.title} itemType={item.type} className="w-full justify-center h-10 border-white/10 hover:bg-white/5" showLabel />
                 {item.releaseDate && (
                    <ReminderButton 
                       itemId={item.id} 
                       itemTitle={item.title} 
                       releaseDate={item.releaseDate} 
                       className="w-full justify-center h-10 border-white/10 hover:bg-white/5" 
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
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clearTimeRange, setClearTimeRange] = useState<[number, number]>([0, 6000]);
  const [selectedScores, setSelectedScores] = useState<number[]>([0]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [itemType, setItemType] = useState<"ALL" | "GAME" | "BOOK">("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

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
          console.warn("API returned empty results, using fallback data");
          setItems(FALLBACK_ITEMS);
        }
      } catch (err) {
        console.error("Failed to fetch releases:", err);
        setError("Failed to load data");
        setItems(FALLBACK_ITEMS);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReleases();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (itemType !== "ALL" && item.type !== itemType) return false;
      if (item.type === "GAME" && item.estimatedClearTime) {
        if (
          item.estimatedClearTime < clearTimeRange[0] ||
          item.estimatedClearTime > clearTimeRange[1]
        ) {
          return false;
        }
      }
      if (!selectedScores.includes(0)) {
        const minScore = Math.min(...selectedScores);
        if (!item.criticScore || item.criticScore < minScore) return false;
      }
      if (selectedGenres.length > 0) {
        if (!item.genre || !item.genre.some((g) => selectedGenres.includes(g))) {
          return false;
        }
      }
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
    <main className="min-h-screen bg-background relative overflow-hidden text-foreground selection:bg-purple-500/30">
      {/* Background Ambience (Mesh Gradient) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(100,50,255,0.08)_0%,transparent_70%)] blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(50,100,255,0.05)_0%,transparent_70%)] blur-[80px]"></div>
      </div>

      {/* Modern Header */}
      <header className="fixed top-0 inset-x-0 glass z-50 h-16 flex items-center border-b border-white/5">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_15px_rgba(124,58,237,0.3)]">RC</div>
              <span className="text-secondary-foreground hidden md:inline-block font-medium tracking-tight">Release Calendar</span>
            </h1>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground/80">
              <button onClick={() => setItemType("ALL")} className={`hover:text-foreground transition-colors ${itemType === "ALL" ? "text-foreground" : ""}`}>Overview</button>
              <button onClick={() => setItemType("GAME")} className={`hover:text-foreground transition-colors ${itemType === "GAME" ? "text-foreground" : ""}`}>Games</button>
              <button onClick={() => setItemType("BOOK")} className={`hover:text-foreground transition-colors ${itemType === "BOOK" ? "text-foreground" : ""}`}>Books</button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-black/20 rounded-full px-3 py-1.5 border border-white/5 hover:border-white/10 transition-colors w-64">
                <span className="text-xs text-muted-foreground mr-2"></span>
                <input placeholder="Search release..." className="bg-transparent border-none text-sm outline-none w-full focus:ring-0 text-foreground placeholder:text-muted-foreground/50"/>
             </div>
             <div className="flex items-center gap-2 border-l border-white/5 pl-4 ml-2">
               <FavoriteBadge />
               <NotificationBadge />
               <AuthButton />
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 pt-32 pb-12 relative z-10 max-w-7xl">
        
        {/* Page Hero Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="max-w-2xl">
             <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-gradient leading-tight">
               Upcoming Releases
             </h2>
             <p className="text-lg text-muted-foreground leading-relaxed">
               Discover your next adventure. Track highly anticipated games and books in one unified timeline.
             </p>
           </div>
           
           {/* Quick Stats or Actions */}
           <div className="hidden md:flex gap-4">
              <div className="glass-card px-5 py-3 rounded-xl border border-white/5 flex flex-col items-center min-w-[100px]">
                 <span className="text-2xl font-bold">{items.filter(i => i.type === "GAME").length}</span>
                 <span className="text-xs text-muted-foreground uppercase tracking-wider">Games</span>
              </div>
              <div className="glass-card px-5 py-3 rounded-xl border border-white/5 flex flex-col items-center min-w-[100px]">
                 <span className="text-2xl font-bold">{items.filter(i => i.type === "BOOK").length}</span>
                 <span className="text-xs text-muted-foreground uppercase tracking-wider">Books</span>
              </div>
           </div>
        </div>

        {/* Filter Toolbar (Floating) */}
        <div className="mb-8 sticky top-20 z-40 transition-all duration-300">
           <div className="glass-card rounded-2xl p-2 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 no-scrollbar">
                {(["ALL", "GAME", "BOOK"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setItemType(type)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        itemType === type 
                        ? "bg-white text-black shadow-lg scale-105" 
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      }`}
                    >
                      {type === "ALL" ? "All View" : type === "GAME" ? "Games" : "Books"}
                    </button>
                ))}
                <div className="h-6 w-px bg-white/10 mx-3"></div>
                <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => setShowFilters(!showFilters)}
                   className={`text-sm transition-colors ${showFilters ? "bg-white/10 text-white" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Filters {selectedGenres.length > 0 ? `(${selectedGenres.length})` : "+"}
                </Button>
              </div>

              <div className="flex items-center gap-3 px-3 w-full md:w-auto justify-end">
                 <span className="text-xs text-muted-foreground font-mono bg-white/5 px-2 py-1 rounded">
                    {filteredItems.length} ITEMS
                 </span>
              </div>
           </div>
           
           {/* Detailed Filter Panel (Collapsible) */}
           {showFilters && (
             <div className="mt-2 glass-card rounded-2xl p-6 animate-in slide-in-from-top-2 fade-in duration-200 border border-white/10">
                <div className="mb-6">
                   <div className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider text-xs">Genres</div>
                   <GenreSelector
                     selectedGenres={selectedGenres}
                     selectedPlatforms={selectedPlatforms}
                     itemType={itemType}
                     onGenreChange={setSelectedGenres}
                     onPlatformChange={setSelectedPlatforms}
                     onTypeChange={setItemType}
                   />
                </div>
                
                {itemType !== "BOOK" && (
                   <div className="pt-6 border-t border-white/5 grid md:grid-cols-2 gap-8">
                      <div>
                         <div className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider text-xs">Clear Time</div>
                         <ClearTimeSlider value={clearTimeRange} onChange={setClearTimeRange} />
                      </div>
                      <div>
                         <div className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider text-xs">Critic Score</div>
                         <ScoreFilter selectedScores={selectedScores} onChange={setSelectedScores} />
                      </div>
                   </div>
                )}
             </div>
           )}
        </div>

        {/* Content Content */}
        <div className="min-h-[600px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <div className="relative w-16 h-16">
                 <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary animate-spin"></div>
                 <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-purple-500 animate-spin reverse"></div>
              </div>
              <p className="text-muted-foreground text-sm tracking-widest animate-pulse">LOADING DATA...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-destructive/5 rounded-3xl border border-destructive/20">
               <div className="text-destructive mb-2 text-xl font-bold">Failed to load</div>
               <div className="text-muted-foreground">{error}</div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
               <CalendarView items={filteredItems} onItemClick={setSelectedItem} />
            </div>
          )}
        </div>
      </div>

      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </main>
  );
}

