import { defineAuth, secret } from "@aws-amplify/backend";

/**
 * 認証設定
 * 日本市場向け設定 + Google OAuth
 *
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    // Google Social Login
    externalProviders: {
      google: {
        clientId: secret("GOOGLE_CLIENT_ID"),
        clientSecret: secret("GOOGLE_CLIENT_SECRET"),
        scopes: ["email", "profile", "openid"],
        attributeMapping: {
          email: "email",
          fullname: "name",
          profilePicture: "picture",
        },
      },
      callbackUrls: [
        "http://localhost:3000/",
        "https://master.dkgndrbx9dc92.amplifyapp.com/",
      ],
      logoutUrls: [
        "http://localhost:3000/",
        "https://master.dkgndrbx9dc92.amplifyapp.com/",
      ],
    },
  },
  // ユーザー属性
  userAttributes: {
    preferredUsername: {
      mutable: true,
      required: false,
    },
  },
});
