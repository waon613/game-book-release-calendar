"use client";

import { useCallback, useState } from "react";
import { client, type Schema } from "./client";
import { useAuth } from "./auth";

// 型定義
type Item = Schema["Item"]["type"];
type UserInteraction = Schema["UserInteraction"]["type"];
type Series = Schema["Series"]["type"];
type SeriesSubscription = Schema["SeriesSubscription"]["type"];

// ========================================
// アイテム取得フック
// ========================================
export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 発売日でアイテムを取得
  const fetchByReleaseDate = useCallback(
    async (startDate: string, endDate: string, type?: "GAME" | "BOOK") => {
      setIsLoading(true);
      setError(null);

      try {
        const filter: Record<string, unknown> = {
          releaseDate: { between: [startDate, endDate] },
        };

        if (type) {
          filter.type = { eq: type };
        }

        const response = await client.models.Item.list({
          filter,
        });

        setItems(response.data);
        return response.data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to fetch items");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 単一アイテムを取得
  const fetchById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await client.models.Item.get({ id });
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch item");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // フィルタ付き検索
  const searchItems = useCallback(
    async (params: {
      type?: "GAME" | "BOOK";
      genre?: string;
      minScore?: number;
      maxClearTime?: number;
      startDate?: string;
      endDate?: string;
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const filter: Record<string, unknown> = {};

        if (params.type) {
          filter.type = { eq: params.type };
        }

        if (params.genre) {
          filter.genre = { eq: params.genre };
        }

        if (params.minScore !== undefined) {
          filter.criticScore = { ge: params.minScore };
        }

        if (params.maxClearTime !== undefined) {
          filter.clearTimeMain = { le: params.maxClearTime };
        }

        if (params.startDate && params.endDate) {
          filter.releaseDate = { between: [params.startDate, params.endDate] };
        }

        const response = await client.models.Item.list({ filter });
        setItems(response.data);
        return response.data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to search items");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    items,
    isLoading,
    error,
    fetchByReleaseDate,
    fetchById,
    searchItems,
  };
}

// ========================================
// ユーザーインタラクションフック（積みゲー/積読）
// ========================================
export function useUserInteractions() {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ユーザーのインタラクション一覧を取得
  const fetchUserInteractions = useCallback(
    async (status?: "BACKLOG" | "PLAYING" | "COMPLETED" | "DROPPED" | "WISHLIST") => {
      if (!user) return [];

      setIsLoading(true);
      setError(null);

      try {
        const filter: Record<string, unknown> = {
          userId: { eq: user.userId },
        };

        if (status) {
          filter.status = { eq: status };
        }

        const response = await client.models.UserInteraction.list({ filter });
        setInteractions(response.data);
        return response.data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to fetch interactions");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // アイテムのインタラクション状態を取得
  const getInteractionForItem = useCallback(
    async (itemId: string): Promise<UserInteraction | null> => {
      if (!user) return null;

      try {
        const response = await client.models.UserInteraction.list({
          filter: {
            userId: { eq: user.userId },
            itemId: { eq: itemId },
          },
        });

        return response.data[0] || null;
      } catch {
        return null;
      }
    },
    [user]
  );

  // インタラクションを作成/更新
  const setInteraction = useCallback(
    async (
      itemId: string,
      status: "WANT" | "PLAYING" | "CLEARED" | "DROPPED",
      personalRating?: number,
      personalNote?: string
    ) => {
      if (!user) throw new Error("User not authenticated");

      setIsLoading(true);
      setError(null);

      try {
        // 既存のインタラクションをチェック
        const existing = await getInteractionForItem(itemId);

        if (existing) {
          // 更新
          const response = await client.models.UserInteraction.update({
            userId: user.userId,
            itemId,
            status,
            personalRating,
            personalNote,
          });
          return response.data;
        } else {
          // 新規作成
          const response = await client.models.UserInteraction.create({
            userId: user.userId,
            itemId,
            status,
            personalRating,
            personalNote,
          });
          return response.data;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to set interaction");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, getInteractionForItem]
  );

  // インタラクションを削除
  const removeInteraction = useCallback(
    async (itemId: string) => {
      if (!user) throw new Error("User not authenticated");

      setIsLoading(true);
      setError(null);

      try {
        const existing = await getInteractionForItem(itemId);
        if (existing) {
          await client.models.UserInteraction.delete({ 
            userId: user.userId,
            itemId,
          });
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to remove interaction");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, getInteractionForItem]
  );

  return {
    interactions,
    isLoading,
    error,
    fetchUserInteractions,
    getInteractionForItem,
    setInteraction,
    removeInteraction,
  };
}

// ========================================
// シリーズ購読フック
// ========================================
export function useSeriesSubscription() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SeriesSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ユーザーの購読一覧を取得
  const fetchSubscriptions = useCallback(async () => {
    if (!user) return [];

    setIsLoading(true);
    setError(null);

    try {
      const response = await client.models.SeriesSubscription.list({
        filter: {
          userId: { eq: user.userId },
        },
      });
      setSubscriptions(response.data);
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch subscriptions");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // シリーズを購読
  const subscribe = useCallback(
    async (seriesId: string, notifyPush = true) => {
      if (!user) throw new Error("User not authenticated");

      setIsLoading(true);
      setError(null);

      try {
        const response = await client.models.SeriesSubscription.create({
          userId: user.userId,
          seriesId,
          notifyPush,
          notifyEmail: false,
        });
        return response.data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to subscribe");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // 購読を解除
  const unsubscribe = useCallback(
    async (seriesId: string) => {
      if (!user) throw new Error("User not authenticated");

      setIsLoading(true);
      setError(null);

      try {
        await client.models.SeriesSubscription.delete({
          userId: user.userId,
          seriesId,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to unsubscribe");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // 購読状態をチェック
  const isSubscribed = useCallback(
    async (seriesId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const response = await client.models.SeriesSubscription.list({
          filter: {
            userId: { eq: user.userId },
            seriesId: { eq: seriesId },
          },
        });
        return response.data.length > 0;
      } catch {
        return false;
      }
    },
    [user]
  );

  return {
    subscriptions,
    isLoading,
    error,
    fetchSubscriptions,
    subscribe,
    unsubscribe,
    isSubscribed,
  };
}

// ========================================
// シリーズ取得フック
// ========================================
export function useSeries() {
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // シリーズ一覧を取得
  const fetchSeries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await client.models.Series.list();
      setSeries(response.data);
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch series");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // シリーズの詳細を取得
  const fetchSeriesById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await client.models.Series.get({ id });
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch series");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    series,
    isLoading,
    error,
    fetchSeries,
    fetchSeriesById,
  };
}
