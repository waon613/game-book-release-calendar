import { defineAuth } from "@aws-amplify/backend";

/**
 * 認証設定
 * 日本市場向け設定
 *
 * Google Social Loginを有効にするには:
 * 1. Google Cloud ConsoleでOAuth 2.0クライアントを作成
 * 2. npx ampx sandbox secret set GOOGLE_CLIENT_ID
 * 3. npx ampx sandbox secret set GOOGLE_CLIENT_SECRET
 * 4. このファイルのexternalProvidersセクションのコメントを解除
 *
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    // Google Social Login (シークレット設定後に有効化)
    // externalProviders: {
    //   google: {
    //     clientId: secret("GOOGLE_CLIENT_ID"),
    //     clientSecret: secret("GOOGLE_CLIENT_SECRET"),
    //     scopes: ["email", "profile", "openid"],
    //     attributeMapping: {
    //       email: "email",
    //       fullname: "name",
    //       profilePicture: "picture",
    //     },
    //   },
    //   callbackUrls: [
    //     "http://localhost:3000/",
    //     "https://main.your-amplify-app.amplifyapp.com/",
    //   ],
    //   logoutUrls: [
    //     "http://localhost:3000/",
    //     "https://main.your-amplify-app.amplifyapp.com/",
    //   ],
    // },
  },
  // ユーザー属性
  userAttributes: {
    preferredUsername: {
      mutable: true,
      required: false,
    },
  },
});
