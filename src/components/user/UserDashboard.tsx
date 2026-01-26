"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, useUserInteractions, useSeriesSubscription } from "@/lib/amplify";
import { BacklogBadge } from "./BacklogButton";

type InteractionStatus = "BACKLOG" | "PLAYING" | "COMPLETED" | "DROPPED" | "WISHLIST";

interface InteractionItem {
  id: string;
  itemId: string;
  status: InteractionStatus;
  userRating?: number | null;
  notes?: string | null;
  addedAt?: string | null;
  completedAt?: string | null;
}

interface SubscriptionItem {
  id: string;
  seriesId: string;
  notifyOnRelease?: boolean | null;
  subscribedAt?: string | null;
}

/**
 * ユーザーダッシュボード
 * - 積みゲー/積読の管理
 * - シリーズ購読一覧
 * - 統計情報
 */
export function UserDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { fetchUserInteractions, isLoading: interactionsLoading } = useUserInteractions();
  const { fetchSubscriptions, isLoading: subscriptionsLoading } = useSeriesSubscription();
  
  const [interactions, setInteractions] = useState<InteractionItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [interactionData, subscriptionData] = await Promise.all([
        fetchUserInteractions(),
        fetchSubscriptions(),
      ]);
      setInteractions(interactionData as InteractionItem[]);
      setSubscriptions(subscriptionData as SubscriptionItem[]);
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">
            ログインすると、積みゲー/積読の管理やシリーズ購読ができます。
          </p>
        </CardContent>
      </Card>
    );
  }

  // 統計計算
  const stats = {
    backlog: interactions.filter((i) => i.status === "BACKLOG").length,
    playing: interactions.filter((i) => i.status === "PLAYING").length,
    completed: interactions.filter((i) => i.status === "COMPLETED").length,
    wishlist: interactions.filter((i) => i.status === "WISHLIST").length,
    subscriptions: subscriptions.length,
  };

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="積みゲー/積読" value={stats.backlog} icon="📚" color="yellow" />
        <StatCard title="プレイ中/読書中" value={stats.playing} icon="🎮" color="blue" />
        <StatCard title="クリア/読了" value={stats.completed} icon="✅" color="green" />
        <StatCard title="欲しいもの" value={stats.wishlist} icon="💫" color="purple" />
        <StatCard title="購読シリーズ" value={stats.subscriptions} icon="🔔" color="indigo" />
      </div>

      {/* タブコンテンツ */}
      <Tabs defaultValue="backlog" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="backlog">📚 積みゲー/積読</TabsTrigger>
          <TabsTrigger value="playing">🎮 プレイ中</TabsTrigger>
          <TabsTrigger value="completed">✅ クリア済み</TabsTrigger>
          <TabsTrigger value="subscriptions">🔔 購読</TabsTrigger>
        </TabsList>

        <TabsContent value="backlog">
          <InteractionList
            items={interactions.filter((i) => i.status === "BACKLOG")}
            loading={interactionsLoading}
            emptyMessage="積みゲー/積読はありません"
          />
        </TabsContent>

        <TabsContent value="playing">
          <InteractionList
            items={interactions.filter((i) => i.status === "PLAYING")}
            loading={interactionsLoading}
            emptyMessage="プレイ中/読書中のアイテムはありません"
          />
        </TabsContent>

        <TabsContent value="completed">
          <InteractionList
            items={interactions.filter((i) => i.status === "COMPLETED")}
            loading={interactionsLoading}
            emptyMessage="クリア/読了したアイテムはありません"
          />
        </TabsContent>

        <TabsContent value="subscriptions">
          <SubscriptionList
            items={subscriptions}
            loading={subscriptionsLoading}
            emptyMessage="購読しているシリーズはありません"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 統計カード
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    yellow: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
    blue: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
    green: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
    purple: "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800",
    indigo: "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800",
  };

  return (
    <Card className={`${colorClasses[color]} border`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// インタラクションリスト
function InteractionList({
  items,
  loading,
  emptyMessage,
}: {
  items: InteractionItem[];
  loading: boolean;
  emptyMessage: string;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">アイテムID: {item.itemId}</p>
                  {item.addedAt && (
                    <p className="text-xs text-muted-foreground">
                      追加日: {new Date(item.addedAt).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                </div>
                <BacklogBadge status={item.status} itemType="GAME" />
              </div>
              {item.notes && (
                <p className="mt-2 text-sm text-muted-foreground">{item.notes}</p>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// 購読リスト
function SubscriptionList({
  items,
  loading,
  emptyMessage,
}: {
  items: SubscriptionItem[];
  loading: boolean;
  emptyMessage: string;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">シリーズID: {item.seriesId}</p>
                  {item.subscribedAt && (
                    <p className="text-xs text-muted-foreground">
                      購読開始: {new Date(item.subscribedAt).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {item.notifyOnRelease ? "🔔 通知ON" : "🔕 通知OFF"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
