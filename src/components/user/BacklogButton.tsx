"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/amplify";
import { useUserInteractions } from "@/lib/amplify";

type InteractionStatus = "WANT" | "PLAYING" | "CLEARED" | "DROPPED";

interface BacklogButtonProps {
  itemId: string;
  itemType: "GAME" | "BOOK";
  currentStatus?: InteractionStatus | null;
  onStatusChange?: (status: InteractionStatus | null) => void;
  size?: "sm" | "default" | "lg";
}

// ステータスの日本語ラベル
const STATUS_LABELS: Record<InteractionStatus, { game: string; book: string }> = {
  WANT: { game: "積みゲー", book: "積読" },
  PLAYING: { game: "プレイ中", book: "読書中" },
  CLEARED: { game: "クリア済み", book: "読了" },
  DROPPED: { game: "中断", book: "中断" },
};

// ステータスのアイコン
const STATUS_ICONS: Record<InteractionStatus, string> = {
  WANT: "📚",
  PLAYING: "🎮",
  CLEARED: "✅",
  DROPPED: "⏸️",
};

// ステータスの色
const STATUS_COLORS: Record<InteractionStatus, string> = {
  WANT: "bg-yellow-500 hover:bg-yellow-600",
  PLAYING: "bg-blue-500 hover:bg-blue-600",
  CLEARED: "bg-green-500 hover:bg-green-600",
  DROPPED: "bg-gray-500 hover:bg-gray-600",
};

/**
 * 積みゲー/積読管理ボタン
 * ログイン時のみアクティブ
 */
export function BacklogButton({
  itemId,
  itemType,
  currentStatus,
  onStatusChange,
  size = "default",
}: BacklogButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const { setInteraction, removeInteraction, isLoading } = useUserInteractions();
  const [status, setStatus] = useState<InteractionStatus | null>(currentStatus || null);

  const handleStatusChange = async (newStatus: InteractionStatus) => {
    if (!isAuthenticated) return;

    try {
      await setInteraction(itemId, newStatus);
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleRemove = async () => {
    if (!isAuthenticated) return;

    try {
      await removeInteraction(itemId);
      setStatus(null);
      onStatusChange?.(null);
    } catch (error) {
      console.error("Failed to remove status:", error);
    }
  };

  // 未ログイン時
  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className="opacity-50"
        title="ログインすると積みゲー/積読を管理できます"
      >
        📚 {itemType === "GAME" ? "積みゲー" : "積読"}
      </Button>
    );
  }

  const currentLabel = status
    ? STATUS_LABELS[status][itemType === "GAME" ? "game" : "book"]
    : itemType === "GAME"
    ? "積みゲーに追加"
    : "積読に追加";

  const currentIcon = status ? STATUS_ICONS[status] : "📚";
  const buttonClass = status ? STATUS_COLORS[status] : "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={status ? "default" : "outline"}
          size={size}
          disabled={isLoading}
          className={`${buttonClass} text-white`}
        >
          {isLoading ? "⏳" : currentIcon} {currentLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {(Object.keys(STATUS_LABELS) as InteractionStatus[]).map((statusKey) => (
          <DropdownMenuItem
            key={statusKey}
            onClick={() => handleStatusChange(statusKey)}
            className={status === statusKey ? "bg-accent" : ""}
          >
            {STATUS_ICONS[statusKey]}{" "}
            {STATUS_LABELS[statusKey][itemType === "GAME" ? "game" : "book"]}
            {status === statusKey && " ✓"}
          </DropdownMenuItem>
        ))}
        {status && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleRemove} className="text-red-500">
              🗑️ リストから削除
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * 積みゲー/積読ステータスバッジ
 */
export function BacklogBadge({
  status,
  itemType,
}: {
  status: InteractionStatus;
  itemType: "GAME" | "BOOK";
}) {
  const label = STATUS_LABELS[status][itemType === "GAME" ? "game" : "book"];
  const icon = STATUS_ICONS[status];

  const colorClass = {
    WANT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    PLAYING: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    CLEARED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    DROPPED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
    >
      {icon} {label}
    </span>
  );
}
