"use client";

import { Button } from "@/components/ui/button";
import { GAME_GENRES, BOOK_GENRES, PLATFORMS } from "@/types";

interface GenreSelectorProps {
  selectedGenres: string[];
  selectedPlatforms: string[];
  itemType: "ALL" | "GAME" | "BOOK";
  onGenreChange: (genres: string[]) => void;
  onPlatformChange: (platforms: string[]) => void;
  onTypeChange: (type: "ALL" | "GAME" | "BOOK") => void;
}

export function GenreSelector({
  selectedGenres,
  selectedPlatforms,
  itemType,
  onGenreChange,
  onPlatformChange,
  onTypeChange,
}: GenreSelectorProps) {
  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      onGenreChange(selectedGenres.filter((g) => g !== genre));
    } else {
      onGenreChange([...selectedGenres, genre]);
    }
  };

  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      onPlatformChange(selectedPlatforms.filter((p) => p !== platform));
    } else {
      onPlatformChange([...selectedPlatforms, platform]);
    }
  };

  const genres = itemType === "BOOK" ? BOOK_GENRES : itemType === "GAME" ? GAME_GENRES : [...GAME_GENRES, ...BOOK_GENRES];

  return (
    <div className="space-y-4">
      {/* タイプ選択 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">種類</label>
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "GAME", "BOOK"] as const).map((type) => (
            <Button
              key={type}
              variant={itemType === type ? "default" : "outline"}
              size="sm"
              onClick={() => onTypeChange(type)}
            >
              {type === "ALL" ? "すべて" : type === "GAME" ? "🎮 ゲーム" : "📚 書籍"}
            </Button>
          ))}
        </div>
      </div>

      {/* ジャンル選択 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">ジャンル</label>
          {selectedGenres.length > 0 && (
            <button
              onClick={() => onGenreChange([])}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              クリア
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {genres.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenres.includes(genre) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleGenre(genre)}
              className="text-xs"
            >
              {genre}
            </Button>
          ))}
        </div>
      </div>

      {/* プラットフォーム選択（ゲームの場合のみ） */}
      {itemType !== "BOOK" && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">プラットフォーム</label>
            {selectedPlatforms.length > 0 && (
              <button
                onClick={() => onPlatformChange([])}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                クリア
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {PLATFORMS.map((platform) => (
              <Button
                key={platform}
                variant={
                  selectedPlatforms.includes(platform) ? "default" : "outline"
                }
                size="sm"
                onClick={() => togglePlatform(platform)}
                className="text-xs"
              >
                {platform}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
