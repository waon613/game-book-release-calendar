/**
 * CloudWatch監視・アラート設定
 * AWS CDK/CloudFormation用の設定ファイル
 */

// 監視設定の型定義
interface MonitoringConfig {
  alarms: AlarmConfig[];
  dashboards: DashboardConfig[];
  notifications: NotificationConfig;
}

interface AlarmConfig {
  name: string;
  metric: string;
  namespace: string;
  threshold: number;
  comparisonOperator: "GreaterThanThreshold" | "LessThanThreshold";
  evaluationPeriods: number;
  period: number;
  statistic: "Average" | "Sum" | "Maximum" | "Minimum";
  dimensions?: Record<string, string>;
}

interface DashboardConfig {
  name: string;
  widgets: WidgetConfig[];
}

interface WidgetConfig {
  type: "metric" | "text" | "log";
  title: string;
  metrics?: string[][];
  logGroupName?: string;
  query?: string;
}

interface NotificationConfig {
  slack?: {
    webhookUrl: string;
    channel: string;
  };
  discord?: {
    webhookUrl: string;
  };
  email?: string[];
}

/**
 * 推奨されるCloudWatch監視設定
 */
export const monitoringConfig: MonitoringConfig = {
  alarms: [
    // API レスポンスタイム
    {
      name: "HighAPILatency",
      metric: "Duration",
      namespace: "AWS/Lambda",
      threshold: 3000, // 3秒
      comparisonOperator: "GreaterThanThreshold",
      evaluationPeriods: 3,
      period: 300,
      statistic: "Average",
      dimensions: {
        FunctionName: "release-calendar-api",
      },
    },
    // Lambda エラー率
    {
      name: "HighLambdaErrors",
      metric: "Errors",
      namespace: "AWS/Lambda",
      threshold: 5,
      comparisonOperator: "GreaterThanThreshold",
      evaluationPeriods: 2,
      period: 300,
      statistic: "Sum",
    },
    // DynamoDB スロットリング
    {
      name: "DynamoDBThrottling",
      metric: "ThrottledRequests",
      namespace: "AWS/DynamoDB",
      threshold: 1,
      comparisonOperator: "GreaterThanThreshold",
      evaluationPeriods: 1,
      period: 60,
      statistic: "Sum",
    },
    // Amplify ビルド失敗
    {
      name: "AmplifyBuildFailed",
      metric: "BuildFailure",
      namespace: "AWS/AmplifyHosting",
      threshold: 1,
      comparisonOperator: "GreaterThanThreshold",
      evaluationPeriods: 1,
      period: 300,
      statistic: "Sum",
    },
  ],

  dashboards: [
    {
      name: "ReleaseCalendar-Overview",
      widgets: [
        {
          type: "metric",
          title: "API リクエスト数",
          metrics: [
            ["AWS/Lambda", "Invocations", "FunctionName", "release-calendar-api"],
          ],
        },
        {
          type: "metric",
          title: "API レスポンスタイム",
          metrics: [
            ["AWS/Lambda", "Duration", "FunctionName", "release-calendar-api"],
          ],
        },
        {
          type: "metric",
          title: "エラー数",
          metrics: [
            ["AWS/Lambda", "Errors", "FunctionName", "release-calendar-api"],
          ],
        },
        {
          type: "metric",
          title: "DynamoDB 読み取りキャパシティ",
          metrics: [
            ["AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", "Item"],
          ],
        },
      ],
    },
  ],

  notifications: {
    email: ["admin@example.com"],
  },
};

/**
 * Slack通知を送信
 */
export async function sendSlackNotification(
  webhookUrl: string,
  message: {
    title: string;
    text: string;
    color?: "good" | "warning" | "danger";
    fields?: Array<{ title: string; value: string; short?: boolean }>;
  }
) {
  const payload = {
    attachments: [
      {
        color: message.color || "warning",
        title: message.title,
        text: message.text,
        fields: message.fields,
        footer: "Release Calendar Monitoring",
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Slack notification failed: ${response.status}`);
  }
}

/**
 * Discord通知を送信
 */
export async function sendDiscordNotification(
  webhookUrl: string,
  message: {
    title: string;
    description: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
  }
) {
  const payload = {
    embeds: [
      {
        title: message.title,
        description: message.description,
        color: message.color || 0xffa500, // オレンジ
        fields: message.fields,
        timestamp: new Date().toISOString(),
        footer: {
          text: "Release Calendar Monitoring",
        },
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Discord notification failed: ${response.status}`);
  }
}

/**
 * アラート発火時のハンドラー（Lambda用）
 */
export async function handleAlarm(event: {
  alarmName: string;
  newState: string;
  reason: string;
}) {
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  const discordWebhook = process.env.DISCORD_WEBHOOK_URL;

  const message = {
    title: `🚨 アラート: ${event.alarmName}`,
    text: event.reason,
    color: event.newState === "ALARM" ? "danger" as const : "good" as const,
    fields: [
      { title: "状態", value: event.newState, short: true },
      { title: "時刻", value: new Date().toLocaleString("ja-JP"), short: true },
    ],
  };

  const promises: Promise<void>[] = [];

  if (slackWebhook) {
    promises.push(sendSlackNotification(slackWebhook, message));
  }

  if (discordWebhook) {
    promises.push(
      sendDiscordNotification(discordWebhook, {
        title: message.title,
        description: message.text,
        color: event.newState === "ALARM" ? 0xff0000 : 0x00ff00,
        fields: message.fields?.map((f) => ({
          name: f.title,
          value: f.value,
          inline: f.short,
        })),
      })
    );
  }

  await Promise.allSettled(promises);
}

/**
 * 日次レポートの生成
 */
export function generateDailyReport(metrics: {
  totalRequests: number;
  averageLatency: number;
  errorRate: number;
  uniqueUsers: number;
  topItems: Array<{ title: string; views: number }>;
}) {
  return {
    title: "📊 日次レポート",
    description: `${new Date().toLocaleDateString("ja-JP")} のサマリー`,
    fields: [
      { name: "総リクエスト数", value: metrics.totalRequests.toLocaleString(), inline: true },
      { name: "平均レスポンス時間", value: `${metrics.averageLatency}ms`, inline: true },
      { name: "エラー率", value: `${(metrics.errorRate * 100).toFixed(2)}%`, inline: true },
      { name: "ユニークユーザー", value: metrics.uniqueUsers.toLocaleString(), inline: true },
      {
        name: "人気アイテム Top 3",
        value: metrics.topItems
          .slice(0, 3)
          .map((item, i) => `${i + 1}. ${item.title} (${item.views}回)`)
          .join("\n"),
        inline: false,
      },
    ],
  };
}
