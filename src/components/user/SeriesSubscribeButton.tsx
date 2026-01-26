"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/amplify";
import { useSeriesSubscription } from "@/lib/amplify";

interface SeriesSubscribeButtonProps {
  seriesId: string;
  seriesName: string;
  size?: "sm" | "default" | "lg";
  onSubscriptionChange?: (isSubscribed: boolean) => void;
}

/**
 * シリーズ購読ボタン
 * - 新刊/新作リリース時に通知を受け取る
 */
export function SeriesSubscribeButton({
  seriesId,
  seriesName,
  size = "default",
  onSubscriptionChange,
}: SeriesSubscribeButtonProps) {
  const { isAuthenticated } = useAuth();
  const { subscribe, unsubscribe, isSubscribed: checkIsSubscribed, isLoading } = useSeriesSubscription();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // 購読状態をチェック
  useEffect(() => {
    const checkSubscription = async () => {
      if (isAuthenticated) {
        const subscribed = await checkIsSubscribed(seriesId);
        setIsSubscribed(subscribed);
      }
      setIsChecking(false);
    };

    checkSubscription();
  }, [isAuthenticated, seriesId, checkIsSubscribed]);

  const handleToggle = async () => {
    if (!isAuthenticated) return;

    try {
      if (isSubscribed) {
        await unsubscribe(seriesId);
        setIsSubscribed(false);
        onSubscriptionChange?.(false);
      } else {
        await subscribe(seriesId, true);
        setIsSubscribed(true);
        onSubscriptionChange?.(true);
      }
    } catch (error) {
      console.error("Failed to toggle subscription:", error);
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
        title="ログインするとシリーズを購読できます"
      >
        🔔 購読する
      </Button>
    );
  }

  return (
    <Button
      variant={isSubscribed ? "default" : "outline"}
      size={size}
      onClick={handleToggle}
      disabled={isLoading || isChecking}
      className={isSubscribed ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
    >
      {isLoading || isChecking ? (
        "⏳"
      ) : isSubscribed ? (
        <>🔔 購読中</>
      ) : (
        <>🔕 購読する</>
      )}
    </Button>
  );
}

/**
 * シリーズ購読バッジ
 */
export function SubscriptionBadge({ isSubscribed }: { isSubscribed: boolean }) {
  if (!isSubscribed) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
      🔔 購読中
    </span>
  );
}
