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
    // webpackIgnoreを使用してビルド時のモジュール解決をスキップ
    const outputs = await import(
      /* webpackIgnore: true */
      "../../../amplify_outputs.json"
    );
    Amplify.configure(outputs.default || outputs);
    isConfigured = true;
  } catch {
    console.warn("Amplify outputs not found. Run 'npx ampx sandbox' to generate.");
    isConfigured = true; // 二重実行防止
  }
}

// GraphQL クライアント（型安全）
export const client = generateClient<Schema>();

// 型エクスポート
export type { Schema };
