/**
 * AWS Secrets Manager からシークレットを取得するユーティリティ
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
 * Secrets Manager からAPIキーを取得
 */
export async function getApiSecrets(): Promise<ApiSecrets> {
  // 開発環境では環境変数から取得
  if (process.env.NODE_ENV === "development") {
    return {
      RAKUTEN_APP_ID: process.env.RAKUTEN_APP_ID || "",
      RAKUTEN_AFFILIATE_ID: process.env.RAKUTEN_AFFILIATE_ID || "",
      IGDB_CLIENT_ID: process.env.IGDB_CLIENT_ID || "",
      IGDB_CLIENT_SECRET: process.env.IGDB_CLIENT_SECRET || "",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
    };
  }

  // キャッシュが有効ならそれを使用
  if (cachedSecrets && Date.now() < cacheExpiry) {
    return cachedSecrets;
  }

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
