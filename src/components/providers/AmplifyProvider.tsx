"use client";

import { useEffect } from "react";
import { Amplify } from "aws-amplify";
import outputs from "../../../amplify_outputs.json";

// Amplify設定を初期化
Amplify.configure(outputs, { ssr: true });

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
