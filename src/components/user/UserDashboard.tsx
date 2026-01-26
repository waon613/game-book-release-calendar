"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, useUserInteractions, useSeriesSubscription } from "@/lib/amplify";
import { BacklogBadge } from "./BacklogButton";

type InteractionStatus = "WANT" | "PLAYING" | "CLEARED" | "DROPPED";

interface InteractionItem {
  userId: string;
  itemId: string;
  status: InteractionStatus;
  personalRating?: number | null;
  personalNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionItem {
  userId: string;
  seriesId: string;
  notifyEmail?: boolean | null;
  notifyPush?: boolean | null;
  createdAt: string;
  updatedAt: string;
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
    backlog: interactions.filter((i) => i.status === "WANT").length,
    playing: interactions.filter((i) => i.status === "PLAYING").length,
    completed: interactions.filter((i) => i.status === "CLEARED").length,
    wishlist: interactions.filter((i) => i.status === "DROPPED").length,
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
            items={interactions.filter((i) => i.status === "WANT")}
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
            items={interactions.filter((i) => i.status === "CLEARED")}
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
            <li key={`${item.userId}-${item.itemId}`} className="p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">アイテムID: {item.itemId}</p>
                  {item.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      追加日: {new Date(item.createdAt).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                </div>
                <BacklogBadge status={item.status} itemType="GAME" />
              </div>
              {item.personalNote && (
                <p className="mt-2 text-sm text-muted-foreground">{item.personalNote}</p>
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
            <li key={`${item.userId}-${item.seriesId}`} className="p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">シリーズID: {item.seriesId}</p>
                  {item.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      購読開始: {new Date(item.createdAt).toLocaleDateString("ja-JP")}
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {item.notifyPush ? "🔔 通知ON" : "🔕 通知OFF"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
