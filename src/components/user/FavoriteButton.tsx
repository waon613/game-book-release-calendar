"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  itemId: string;
  itemTitle?: string;
  itemType?: "GAME" | "BOOK";
  className?: string;
  showLabel?: boolean;
  variant?: "default" | "icon";
  onToggle?: (isFavorite: boolean) => void;
}

// ローカルストレージキー
const FAVORITES_KEY = "user_favorites";

interface FavoriteItem {
  id: string;
  type: "GAME" | "BOOK";
  addedAt: string;
}

// お気に入りを取得
function getFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// お気に入りを保存
function saveFavorites(favorites: FavoriteItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

// お気に入りかどうかチェック
export function isFavorite(itemId: string): boolean {
  const favorites = getFavorites();
  return favorites.some((f) => f.id === itemId);
}

// お気に入りを追加
export function addFavorite(itemId: string, itemType?: "GAME" | "BOOK", itemTitle?: string): void {
  const favorites = getFavorites();
  if (!favorites.some((f) => f.id === itemId)) {
    favorites.push({
      id: itemId,
      type: itemType || "BOOK",
      addedAt: new Date().toISOString(),
    });
    saveFavorites(favorites);
    // カスタムイベントを発火
    window.dispatchEvent(new Event("favoritesChanged"));
  }
}

// お気に入りを削除
export function removeFavorite(itemId: string): void {
  const favorites = getFavorites();
  const filtered = favorites.filter((f) => f.id !== itemId);
  saveFavorites(filtered);
  // カスタムイベントを発火
  window.dispatchEvent(new Event("favoritesChanged"));
}

// 全てのお気に入りIDを取得
export function getAllFavoriteIds(): string[] {
  return getFavorites().map((f) => f.id);
}

/**
 * お気に入りボタン
 */
export function FavoriteButton({
  itemId,
  itemTitle,
  itemType,
  className,
  showLabel = false,
  variant = "default",
  onToggle,
}: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsFav(isFavorite(itemId));
  }, [itemId]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    if (isFav) {
      removeFavorite(itemId);
      setIsFav(false);
      onToggle?.(false);
    } else {
      addFavorite(itemId, itemType, itemTitle);
      setIsFav(true);
      onToggle?.(true);
    }
  };

  const isIconOnly = variant === "icon" || (!showLabel && variant === "default");

  return (
    <Button
      variant={variant === "icon" ? "ghost" : "outline"}
      size={isIconOnly ? "icon" : "sm"}
      className={cn(
        "transition-all duration-200",
        isAnimating && "scale-110",
        className
      )}
      onClick={handleClick}
      aria-label={isFav ? "お気に入りから削除" : "お気に入りに追加"}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-colors",
          isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"
        )}
      />
      {!isIconOnly && (
        <span className="ml-1">
          {isFav ? "お気に入り済み" : "お気に入り"}
        </span>
      )}
    </Button>
  );
}

/**
 * お気に入りバッジ（ヘッダー表示用）
 */
export function FavoriteBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setCount(getFavorites().length);
    };
    
    updateCount();
    
    // ストレージの変更を監視
    const handleStorage = () => updateCount();
    window.addEventListener("storage", handleStorage);
    
    // カスタムイベントも監視
    window.addEventListener("favoritesChanged", handleStorage);
    
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("favoritesChanged", handleStorage);
    };
  }, []);

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative">
        <Heart className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>
    </div>
  );
}
