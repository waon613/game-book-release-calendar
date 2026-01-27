/**
 * AWS Secrets Manager からシークレットを取得するユーティリティ
 * フォールバック: 環境変数 → Secrets Manager
 */
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const SECRET_NAME = "game-book-calendar/api-keys";
const REGION = "ap-northeast-1";

// シークレットのキャッシュ（Lambda のコールドスタート対策）
let cachedSecrets: ApiSecrets | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5分

export interface ApiSecrets {
  RAKUTEN_APP_ID: string;
  RAKUTEN_AFFILIATE_ID: string;
  IGDB_CLIENT_ID: string;
  IGDB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

/**
 * 環境変数からAPIキーを取得（フォールバック用）
 */
function getSecretsFromEnv(): ApiSecrets | null {
  const rakutenAppId = process.env.RAKUTEN_APP_ID;
  const rakutenAffiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  const igdbClientId = process.env.IGDB_CLIENT_ID;
  const igdbClientSecret = process.env.IGDB_CLIENT_SECRET;

  // 必須の環境変数が設定されているかチェック
  if (rakutenAppId && rakutenAffiliateId && igdbClientId && igdbClientSecret) {
    return {
      RAKUTEN_APP_ID: rakutenAppId,
      RAKUTEN_AFFILIATE_ID: rakutenAffiliateId,
      IGDB_CLIENT_ID: igdbClientId,
      IGDB_CLIENT_SECRET: igdbClientSecret,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
    };
  }
  return null;
}

/**
 * Secrets Manager からAPIキーを取得
 * フォールバック: 環境変数 → Secrets Manager
 */
export async function getApiSecrets(): Promise<ApiSecrets> {
  // まず環境変数を試す（開発環境 & ビルド時埋め込み対応）
  const envSecrets = getSecretsFromEnv();
  if (envSecrets) {
    return envSecrets;
  }

  // キャッシュが有効ならそれを使用
  if (cachedSecrets && Date.now() < cacheExpiry) {
    return cachedSecrets;
  }

  // Secrets Manager から取得
  const client = new SecretsManagerClient({ region: REGION });

  try {
    const command = new GetSecretValueCommand({ SecretId: SECRET_NAME });
    const response = await client.send(command);

    if (!response.SecretString) {
      throw new Error("Secret string is empty");
    }

    cachedSecrets = JSON.parse(response.SecretString) as ApiSecrets;
    cacheExpiry = Date.now() + CACHE_TTL;

    return cachedSecrets;
  } catch (error) {
    console.error("Failed to retrieve secrets:", error);
    throw error;
  }
}

/**
 * 個別のシークレットを取得
 */
export async function getRakutenCredentials(): Promise<{
  appId: string;
  affiliateId: string;
}> {
  const secrets = await getApiSecrets();
  return {
    appId: secrets.RAKUTEN_APP_ID,
    affiliateId: secrets.RAKUTEN_AFFILIATE_ID,
  };
}

export async function getIgdbCredentials(): Promise<{
  clientId: string;
  clientSecret: string;
}> {
  const secrets = await getApiSecrets();
  return {
    clientId: secrets.IGDB_CLIENT_ID,
    clientSecret: secrets.IGDB_CLIENT_SECRET,
  };
}

export async function getGoogleCredentials(): Promise<{
  clientId: string;
  clientSecret: string;
}> {
  const secrets = await getApiSecrets();
  return {
    clientId: secrets.GOOGLE_CLIENT_ID,
    clientSecret: secrets.GOOGLE_CLIENT_SECRET,
  };
}
