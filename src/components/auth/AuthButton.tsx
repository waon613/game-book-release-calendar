"use client";

import { useEffect, useState } from "react";
import {
  signInWithRedirect,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { Button } from "@/components/ui/button";

interface User {
  username: string;
  email?: string;
  name?: string;
  picture?: string;
}

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    // Hubを使用してAuth状態の変化を監視
    const hubListener = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          checkUser();
          break;
        case "signedOut":
          setUser(null);
          break;
      }
    });

    return () => hubListener();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      setUser({
        username: currentUser.username,
        email: attributes.email,
        name: attributes.name,
        picture: attributes.picture,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn() {
    try {
      await signInWithRedirect({ provider: "Google" });
    } catch (error) {
      console.error("ログインエラー:", error);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  }

  if (loading) {
    return (
      <Button variant="outline" disabled className="min-w-[120px]">
        読み込み中...
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {user.picture && (
          <img
            src={user.picture}
            alt={user.name || "ユーザー"}
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-sm hidden md:inline">
          {user.name || user.email}
        </span>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          ログアウト
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleSignIn} className="flex items-center gap-2">
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Googleでログイン
    </Button>
  );
}
