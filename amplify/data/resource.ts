import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
 * ゲーム＆書籍リリースカレンダー データスキーマ
 * 日本市場向け設定
 */

const schema = a.schema({
  // Enum定義
  ItemType: a.enum(["GAME", "BOOK"]),
  UserStatus: a.enum(["WANT", "PLAYING", "CLEARED", "DROPPED"]),

  /**
   * Item: ゲームまたは書籍の情報
   */
  Item: a
    .model({
      // 基本情報
      type: a.ref("ItemType").required(),
      title: a.string().required(), // 日本語タイトル優先
      titleOriginal: a.string(), // 原題（海外タイトル）
      releaseDate: a.date(), // 発売日 (JST)
      coverUrl: a.string(), // カバー画像URL

      // 評価・プレイ時間
      criticScore: a.integer(), // メタスコア (0-100)
      userScore: a.float(), // ユーザー評価 (0-10)
      estimatedClearTime: a.integer(), // クリア時間（分）
      estimatedClearTimeMin: a.integer(), // 最短クリア時間（分）
      estimatedClearTimeMax: a.integer(), // 最長クリア時間（分）

      // アフィリエイト・価格情報
      affiliateLinks: a.json(), // { amazon_jp: string, rakuten: string }
      currentPrice: a.integer(), // 現在価格（円）
      historyLowPrice: a.integer(), // 最安値（円）
      listPrice: a.integer(), // 定価（円）

      // カテゴリ・シリーズ
      genre: a.string().array(), // ジャンル配列
      platform: a.string().array(), // プラットフォーム (PS5, Switch, PC等)
      seriesId: a.string(), // シリーズID（関連付け用）
      publisher: a.string(), // パブリッシャー
      developer: a.string(), // デベロッパー

      // 外部API ID
      igdbId: a.integer(), // IGDB ID
      rakutenIsbn: a.string(), // 楽天ISBN
      amazonAsin: a.string(), // Amazon ASIN

      // メタデータ
      description: a.string(), // 説明文
      lastSyncedAt: a.datetime(), // 最終同期日時
    })
    .secondaryIndexes((index) => [
      index("type").sortKeys(["releaseDate"]).name("byTypeAndReleaseDate"),
      index("seriesId").sortKeys(["releaseDate"]).name("bySeriesAndReleaseDate"),
    ])
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated().to(["read"]),
    ]),

  /**
   * UserInteraction: ユーザーとアイテムの関係（積みゲー/積読管理）
   */
  UserInteraction: a
    .model({
      userId: a.string().required(), // Cognito User ID
      itemId: a.string().required(), // Item ID
      status: a.ref("UserStatus").required(), // ステータス
      isSpoiler: a.boolean().default(false), // ネタバレ非表示フラグ
      personalRating: a.float(), // 個人評価 (0-10)
      personalNote: a.string(), // メモ
      startedAt: a.date(), // 開始日
      completedAt: a.date(), // 完了日
      playTimeMinutes: a.integer(), // プレイ時間（分）
    })
    .identifier(["userId", "itemId"])
    .secondaryIndexes((index) => [
      index("userId").sortKeys(["status"]).name("byUserAndStatus"),
    ])
    .authorization((allow) => [allow.owner().identityClaim("sub")]),

  /**
   * Series: シリーズ情報（続編通知用）
   */
  Series: a
    .model({
      title: a.string().required(), // シリーズタイトル
      titleOriginal: a.string(), // 原題
      coverUrl: a.string(), // シリーズカバー画像
      description: a.string(), // 説明
      totalItems: a.integer(), // 総作品数
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated().to(["read"]),
    ]),

  /**
   * SeriesSubscription: シリーズ購読（新作通知用）
   */
  SeriesSubscription: a
    .model({
      userId: a.string().required(),
      seriesId: a.string().required(),
      notifyEmail: a.boolean().default(true),
      notifyPush: a.boolean().default(false),
    })
    .identifier(["userId", "seriesId"])
    .authorization((allow) => [allow.owner().identityClaim("sub")]),

  /**
   * PriceHistory: 価格履歴（価格推移表示用）
   */
  PriceHistory: a
    .model({
      itemId: a.string().required(),
      price: a.integer().required(), // 価格（円）
      source: a.string().required(), // amazon_jp / rakuten
      recordedAt: a.datetime().required(), // 記録日時
    })
    .secondaryIndexes((index) => [
      index("itemId").sortKeys(["recordedAt"]).name("byItemAndDate"),
    ])
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated().to(["read"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "identityPool",
  },
});
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
