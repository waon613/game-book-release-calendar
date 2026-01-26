"use client";

import { AuthProvider } from "@/lib/amplify";
import { AuthHeader, UserDashboard } from "@/components/user";

export default function MyPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        {/* ヘッダー */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <a href="/" className="text-xl font-bold">
                  🎮📚 リリースカレンダー
                </a>
              </div>
              <AuthHeader />
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">マイページ</h1>
            <p className="text-muted-foreground">
              積みゲー・積読の管理、購読シリーズの確認ができます
            </p>
          </div>

          <UserDashboard />
        </main>

        {/* フッター */}
        <footer className="border-t bg-card mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-sm text-muted-foreground">
              <p>© 2026 ゲーム＆書籍リリースカレンダー</p>
              <p className="mt-2">
                Amazon.co.jpアソシエイト / 楽天アフィリエイト
              </p>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
