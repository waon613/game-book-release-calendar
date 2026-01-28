"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// 通知設定の型
interface NotificationSettings {
  enabled: boolean;
  daysBeforeRelease: number[];
  email: boolean;
  push: boolean;
}

// リマインダーの型
interface Reminder {
  id: string;
  itemId: string;
  itemTitle: string;
  releaseDate: string;
  notifyDates: string[];
  createdAt: string;
}

const NOTIFICATIONS_KEY = "notification_settings";
const REMINDERS_KEY = "release_reminders";

// デフォルト設定
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  daysBeforeRelease: [7, 1, 0],
  email: false,
  push: true,
};

// 通知設定を取得
function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// 通知設定を保存
function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(settings));
}

// リマインダーを取得
function getReminders(): Reminder[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(REMINDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// リマインダーを保存
function saveReminders(reminders: Reminder[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

// リマインダーが設定されているか
export function hasReminder(itemId: string): boolean {
  const reminders = getReminders();
  return reminders.some((r) => r.itemId === itemId);
}

// リマインダーを追加
export function addReminder(
  itemId: string,
  itemTitle: string,
  releaseDate: string
): void {
  const reminders = getReminders();
  const settings = getNotificationSettings();
  
  if (!reminders.some((r) => r.itemId === itemId)) {
    const release = new Date(releaseDate);
    const notifyDates = settings.daysBeforeRelease.map((days) => {
      const date = new Date(release);
      date.setDate(date.getDate() - days);
      return date.toISOString().split("T")[0];
    });

    reminders.push({
      id: `reminder-${Date.now()}`,
      itemId,
      itemTitle,
      releaseDate,
      notifyDates,
      createdAt: new Date().toISOString(),
    });
    saveReminders(reminders);
  }
}

// リマインダーを削除
export function removeReminder(itemId: string): void {
  const reminders = getReminders();
  const filtered = reminders.filter((r) => r.itemId !== itemId);
  saveReminders(filtered);
}

// 全リマインダーを取得
export function getAllReminders(): Reminder[] {
  return getReminders();
}

interface ReminderButtonProps {
  itemId: string;
  itemTitle: string;
  releaseDate: string;
  className?: string;
}

/**
 * リマインダーボタン
 */
export function ReminderButton({
  itemId,
  itemTitle,
  releaseDate,
  className,
}: ReminderButtonProps) {
  const [hasRem, setHasRem] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setHasRem(hasReminder(itemId));
  }, [itemId]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    if (hasRem) {
      removeReminder(itemId);
      setHasRem(false);
    } else {
      addReminder(itemId, itemTitle, releaseDate);
      setHasRem(true);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "transition-all duration-200",
        isAnimating && "scale-105",
        className
      )}
      onClick={handleClick}
      aria-label={hasRem ? "リマインダーを解除" : "リマインダーを設定"}
    >
      {hasRem ? (
        <Bell className="h-4 w-4 fill-yellow-500 text-yellow-500 mr-1" />
      ) : (
        <BellOff className="h-4 w-4 text-muted-foreground mr-1" />
      )}
      {hasRem ? "通知ON" : "通知OFF"}
    </Button>
  );
}

/**
 * 通知設定パネル
 */
export function NotificationSettingsPanel() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getNotificationSettings());
  }, []);

  const handleSave = useCallback(() => {
    saveNotificationSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [settings]);

  const toggleDay = (day: number) => {
    setSettings((prev) => ({
      ...prev,
      daysBeforeRelease: prev.daysBeforeRelease.includes(day)
        ? prev.daysBeforeRelease.filter((d) => d !== day)
        : [...prev.daysBeforeRelease, day].sort((a, b) => b - a),
    }));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4 mr-2" />
          通知設定
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications-enabled">通知を有効にする</Label>
            <Switch
              id="notifications-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>通知タイミング</Label>
            <div className="flex flex-wrap gap-2">
              {[7, 3, 1, 0].map((day) => (
                <Button
                  key={day}
                  variant={settings.daysBeforeRelease.includes(day) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleDay(day)}
                  disabled={!settings.enabled}
                >
                  {day === 0 ? "当日" : `${day}日前`}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>通知方法</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">プッシュ通知</span>
                <Switch
                  checked={settings.push}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, push: checked }))
                  }
                  disabled={!settings.enabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">メール通知</span>
                <Switch
                  checked={settings.email}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, email: checked }))
                  }
                  disabled={!settings.enabled}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full" size="sm">
            {saved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                保存しました
              </>
            ) : (
              "設定を保存"
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * 通知バッジ（ヘッダー表示用）
 */
export function NotificationBadge() {
  const [count, setCount] = useState(0);
  const [totalReminders, setTotalReminders] = useState(0);

  useEffect(() => {
    // 今日が通知日のリマインダーをカウント
    const today = new Date().toISOString().split("T")[0];
    const reminders = getReminders();
    const activeCount = reminders.filter((r) =>
      r.notifyDates.includes(today)
    ).length;
    setCount(activeCount);
    setTotalReminders(reminders.length);
  }, []);

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative">
        <Bell className={cn("h-5 w-5", totalReminders > 0 && "fill-yellow-500 text-yellow-500")} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px] animate-pulse">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>
    </div>
  );
}
