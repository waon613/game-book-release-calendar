# Game & Book Release Calendar Platform

🎮📚 日本市場向けのゲーム・書籍発売日カレンダープラットフォーム

## 機能

- **カレンダー表示**: 月間/リスト表示の切り替え
- **フィルタリング**: クリア時間、評価スコア、ジャンルで絞り込み
- **積みゲー/積読管理**: ユーザーごとのゲーム・書籍管理
- **シリーズ購読**: 新刊通知
- **アフィリエイト連携**: Amazon.co.jp、楽天ブックス

## 技術スタック

- **フロントエンド**: Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui
- **バックエンド**: AWS Amplify Gen 2, AppSync (GraphQL), DynamoDB
- **認証**: Amazon Cognito
- **API連携**: 楽天Books API, IGDB API, Amazon PA-API 5.0

## セットアップ

### 前提条件

- Node.js 20+
- AWS CLI (設定済み)
- AWS アカウント

### インストール

```bash
# 依存関係をインストール
npm install

# Amplify Sandbox を起動（開発用）
npx ampx sandbox

# 開発サーバーを起動
npm run dev
```

### 環境変数

`.env.example` をコピーして `.env.local` を作成:

```bash
cp .env.example .env.local
```

必要なAPIキーを設定:
- 楽天API: https://webservice.rakuten.co.jp/
- IGDB/Twitch: https://api-docs.igdb.com/
- Amazon PA-API: https://affiliate.amazon.co.jp/

## プロジェクト構造

```
├── amplify/
│   ├── auth/             # Cognito認証設定
│   ├── data/             # DynamoDBスキーマ
│   └── functions/        # Lambda関数
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # UIコンポーネント
│   │   ├── calendar/     # カレンダー表示
│   │   ├── filters/      # フィルターUI
│   │   ├── affiliate/    # アフィリエイトボタン
│   │   ├── user/         # ユーザー機能
│   │   └── ads/          # AdSense広告
│   └── lib/
│       ├── amplify/      # Amplifyクライアント
│       ├── api/          # 外部APIクライアント
│       ├── utils/        # ユーティリティ
│       └── seo/          # SEOヘルパー
├── public/               # 静的ファイル
└── amplify.yml           # Amplifyビルド設定
```

## デプロイ

### Amplify Console でデプロイ

1. AWS Amplify Console を開く
2. 「新しいアプリ」→「既存のリポジトリをホスト」
3. リポジトリを接続
4. 環境変数を設定（`.env.example` 参照）
5. デプロイ

### 手動デプロイ

```bash
# ビルド
npm run build

# 本番サンドボックスをデプロイ
npx ampx pipeline-deploy --branch main --app-id YOUR_APP_ID
```

## API連携

### 楽天Books API
- 書籍・ゲーム検索
- 価格情報取得
- アフィリエイトリンク生成

### IGDB API
- グローバルゲーム情報
- 評価スコア
- プラットフォーム情報

### Amazon PA-API
- 商品検索
- 価格・在庫情報
- アフィリエイトリンク生成

## 日次バッチ

毎日 03:00 JST に以下を実行:
1. 楽天APIから新刊/新作を取得
2. IGDBから発売予定ゲームを取得
3. DynamoDBにアップサート

## ライセンス

MIT
