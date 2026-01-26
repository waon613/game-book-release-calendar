import { defineFunction } from "@aws-amplify/backend";

export const dailySyncFunction = defineFunction({
  name: "daily-sync",
  entry: "./handler.ts",
  // 毎日 03:00 JST (18:00 UTC) に実行
  schedule: "cron(0 18 * * ? *)",
  timeoutSeconds: 900, // 15分
  memoryMB: 512,
  environment: {
    // 楽天API
    RAKUTEN_APP_ID: process.env.RAKUTEN_APP_ID || "",
    RAKUTEN_AFFILIATE_ID: process.env.RAKUTEN_AFFILIATE_ID || "",
    // IGDB/Twitch API
    TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID || "",
    TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET || "",
    // Amazon PA-API
    AMAZON_ACCESS_KEY: process.env.AMAZON_ACCESS_KEY || "",
    AMAZON_SECRET_KEY: process.env.AMAZON_SECRET_KEY || "",
    AMAZON_PARTNER_TAG: process.env.AMAZON_PARTNER_TAG || "",
  },
});
