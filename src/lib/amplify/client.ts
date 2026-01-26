"use client";

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../amplify/data/resource";

// Amplify設定を読み込み（ビルド時に生成される）
let isConfigured = false;

export async function configureAmplify() {
  if (isConfigured) return;

  try {
    // amplify_outputs.json は npx ampx sandbox 実行時に生成される
    const outputs = await import("../../../amplify_outputs.json");
    Amplify.configure(outputs.default);
    isConfigured = true;
  } catch (error) {
    console.warn("Amplify outputs not found. Run 'npx ampx sandbox' to generate.");
  }
}

// GraphQL クライアント（型安全）
export const client = generateClient<Schema>();

// 型エクスポート
export type { Schema };
