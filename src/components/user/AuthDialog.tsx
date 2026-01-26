"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/amplify";

type AuthMode = "signin" | "signup" | "confirm";

/**
 * 認証ダイアログ
 * - サインイン/サインアップを切り替え可能
 */
export function AuthDialog({ trigger }: { trigger: React.ReactNode }) {
  const { signIn, signUp, confirmSignUp, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
      setOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "サインインに失敗しました");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await signUp(email, password);
      if (result.needsConfirmation) {
        setMode("confirm");
      } else {
        setOpen(false);
        resetForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "サインアップに失敗しました");
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await confirmSignUp(email, confirmCode);
      // 確認後、自動でサインイン
      await signIn(email, password);
      setOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "確認に失敗しました");
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmCode("");
    setError(null);
    setMode("signin");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "signin" && "ログイン"}
            {mode === "signup" && "新規登録"}
            {mode === "confirm" && "メール確認"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signin" && "アカウントにログインしてください"}
            {mode === "signup" && "新しいアカウントを作成します"}
            {mode === "confirm" && "メールに送信された確認コードを入力してください"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "ログイン中..." : "ログイン"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              アカウントをお持ちでない方は{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-primary hover:underline"
              >
                新規登録
              </button>
            </p>
          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">メールアドレス</Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">パスワード</Label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8文字以上"
                minLength={8}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "登録中..." : "登録する"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              すでにアカウントをお持ちの方は{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-primary hover:underline"
              >
                ログイン
              </button>
            </p>
          </form>
        )}

        {mode === "confirm" && (
          <form onSubmit={handleConfirm} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm-code">確認コード</Label>
              <Input
                id="confirm-code"
                type="text"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "確認中..." : "確認する"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * ユーザーメニュー（ログイン済み用）
 */
export function UserMenu() {
  const { user, signOut, isLoading } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">
        {user.email}
      </span>
      <Button variant="outline" size="sm" onClick={signOut} disabled={isLoading}>
        {isLoading ? "..." : "ログアウト"}
      </Button>
    </div>
  );
}

/**
 * 認証状態に応じたヘッダーコンポーネント
 */
export function AuthHeader() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-9 w-24 animate-pulse bg-gray-200 rounded" />;
  }

  if (isAuthenticated) {
    return <UserMenu />;
  }

  return (
    <AuthDialog
      trigger={
        <Button variant="default" size="sm">
          ログイン
        </Button>
      }
    />
  );
}
