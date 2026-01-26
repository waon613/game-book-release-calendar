import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

/**
 * Amplify設定の初期化
 * Server Side Rendering (SSR) 対応
 */
export function configureAmplify() {
  Amplify.configure(outputs, {
    ssr: true,
  });
}

/**
 * クライアントサイド初期化用
 */
export function configureAmplifyClient() {
  if (typeof window !== "undefined") {
    configureAmplify();
  }
}
