"use client";

import { useEffect, useState } from "react";
import {
  signOut,
  getCurrentUser,
  fetchUserAttributes,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { Authenticator, useAuthenticator, View } from "@aws-amplify/ui-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface User {
  username: string;
  email?: string;
  name?: string;
  picture?: string;
}

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    checkUser();

    // Hubを使用してAuth状態の変化を監視
    const hubListener = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          checkUser();
          setIsOpen(false);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          ログイン / 登録
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] flex justify-center p-0 overflow-hidden bg-white">
        <div className="w-full max-h-[80vh] overflow-y-auto p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-center">ログイン</DialogTitle>
            <DialogDescription className="text-center">
              アカウントにログインして、お気に入りや積読を同期しましょう。
            </DialogDescription>
          </DialogHeader>
          <Authenticator 
             initialState="signIn"
             components={{
               Header: () => <div className="p-4 text-center font-bold">Game & Book Calendar</div>
             }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
