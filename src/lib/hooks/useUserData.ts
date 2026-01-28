"use client";

import { useState, useEffect, useCallback } from "react";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import type { Schema } from "@/../amplify/data/resource";
import { getAllFavoriteIds, addFavorite, removeFavorite } from "@/components/user/FavoriteButton";

const client = generateClient<Schema>();

interface SyncState {
  isSyncing: boolean;
  lastSynced: Date | null;
  error: string | null;
}

/**
 * お気に入りをクラウドと同期するフック
 */
export function useFavoritesSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSynced: null,
    error: null,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    }
  };

  /**
   * ローカルのお気に入りをクラウドにアップロード
   */
  const uploadToCloud = useCallback(async () => {
    if (!isAuthenticated) return;

    setSyncState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const user = await getCurrentUser();
      const localFavorites = getAllFavoriteIds();

      // 各お気に入りをUserInteractionとして保存
      for (const itemId of localFavorites) {
        try {
          await client.models.UserInteraction.create({
            userId: user.userId,
            itemId,
            status: "WANT",
          });
        } catch (error) {
          // 既に存在する場合はスキップ
          console.log(`Item ${itemId} already exists or error:`, error);
        }
      }

      setSyncState({
        isSyncing: false,
        lastSynced: new Date(),
        error: null,
      });
    } catch (error) {
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        error: "同期に失敗しました",
      }));
      console.error("Upload failed:", error);
    }
  }, [isAuthenticated]);

  /**
   * クラウドからお気に入りをダウンロード
   */
  const downloadFromCloud = useCallback(async () => {
    if (!isAuthenticated) return;

    setSyncState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const user = await getCurrentUser();

      // クラウドからUserInteractionを取得
      const { data: interactions } = await client.models.UserInteraction.list({
        filter: {
          userId: { eq: user.userId },
          status: { eq: "WANT" },
        },
      });

      // ローカルに保存
      for (const interaction of interactions) {
        if (interaction.itemId) {
          addFavorite(interaction.itemId);
        }
      }

      setSyncState({
        isSyncing: false,
        lastSynced: new Date(),
        error: null,
      });
    } catch (error) {
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        error: "同期に失敗しました",
      }));
      console.error("Download failed:", error);
    }
  }, [isAuthenticated]);

  /**
   * 双方向同期
   */
  const sync = useCallback(async () => {
    await downloadFromCloud();
    await uploadToCloud();
  }, [downloadFromCloud, uploadToCloud]);

  return {
    ...syncState,
    isAuthenticated,
    sync,
    uploadToCloud,
    downloadFromCloud,
  };
}

/**
 * ユーザーのバックログ（積みゲー/積読）を管理するフック
 */
export function useBacklog() {
  const [items, setItems] = useState<Schema["UserInteraction"]["type"][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBacklog = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await getCurrentUser();
      const { data } = await client.models.UserInteraction.list({
        filter: {
          userId: { eq: user.userId },
        },
      });
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch backlog:", error);
      setError("バックログの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStatus = useCallback(
    async (itemId: string, status: "WANT" | "PLAYING" | "CLEARED" | "DROPPED") => {
      try {
        const user = await getCurrentUser();
        await client.models.UserInteraction.update({
          userId: user.userId,
          itemId,
          status,
          ...(status === "CLEARED" ? { completedAt: new Date().toISOString().split("T")[0] } : {}),
        });
        await fetchBacklog();
      } catch (error) {
        console.error("Failed to update status:", error);
        throw error;
      }
    },
    [fetchBacklog]
  );

  const removeFromBacklog = useCallback(
    async (itemId: string) => {
      try {
        const user = await getCurrentUser();
        await client.models.UserInteraction.delete({
          userId: user.userId,
          itemId,
        });
        await fetchBacklog();
      } catch (error) {
        console.error("Failed to remove from backlog:", error);
        throw error;
      }
    },
    [fetchBacklog]
  );

  useEffect(() => {
    fetchBacklog();
  }, [fetchBacklog]);

  return {
    items,
    isLoading,
    error,
    refetch: fetchBacklog,
    updateStatus,
    removeFromBacklog,
    stats: {
      want: items.filter((i) => i.status === "WANT").length,
      playing: items.filter((i) => i.status === "PLAYING").length,
      cleared: items.filter((i) => i.status === "CLEARED").length,
      dropped: items.filter((i) => i.status === "DROPPED").length,
    },
  };
}

/**
 * シリーズ購読を管理するフック
 */
export function useSeriesSubscription() {
  const [subscriptions, setSubscriptions] = useState<Schema["SeriesSubscription"]["type"][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      const { data } = await client.models.SeriesSubscription.list({
        filter: {
          userId: { eq: user.userId },
        },
      });
      setSubscriptions(data);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const subscribe = useCallback(
    async (seriesId: string, options?: { notifyEmail?: boolean; notifyPush?: boolean }) => {
      try {
        const user = await getCurrentUser();
        await client.models.SeriesSubscription.create({
          userId: user.userId,
          seriesId,
          notifyEmail: options?.notifyEmail ?? true,
          notifyPush: options?.notifyPush ?? false,
        });
        await fetchSubscriptions();
      } catch (error) {
        console.error("Failed to subscribe:", error);
        throw error;
      }
    },
    [fetchSubscriptions]
  );

  const unsubscribe = useCallback(
    async (seriesId: string) => {
      try {
        const user = await getCurrentUser();
        await client.models.SeriesSubscription.delete({
          userId: user.userId,
          seriesId,
        });
        await fetchSubscriptions();
      } catch (error) {
        console.error("Failed to unsubscribe:", error);
        throw error;
      }
    },
    [fetchSubscriptions]
  );

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return {
    subscriptions,
    isLoading,
    subscribe,
    unsubscribe,
    isSubscribed: (seriesId: string) => subscriptions.some((s) => s.seriesId === seriesId),
  };
}
