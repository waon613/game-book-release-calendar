"use client";

import { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";

let isConfigured = false;

async function configureAmplify() {
  if (isConfigured) return;
  
  try {
    // 動的インポートを試行
    const outputs = await import("../../../amplify_outputs.json");
    Amplify.configure(outputs.default || outputs, { ssr: true });
    isConfigured = true;
    console.log("Amplify configured successfully");
  } catch {
    // amplify_outputs.json がない場合はスキップ（本番環境での静的ビルド時）
    console.warn("Amplify outputs not found. Auth features will be disabled.");
    isConfigured = true; // 二重実行防止
  }
}

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    configureAmplify().then(() => setReady(true));
  }, []);

  // SSR時はchildrenをそのまま返す
  if (typeof window === "undefined") {
    return <>{children}</>;
  }

  return <>{children}</>;
}
