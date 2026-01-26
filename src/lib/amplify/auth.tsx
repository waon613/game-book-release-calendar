"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  getCurrentUser,
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  fetchUserAttributes,
  type AuthUser,
} from "aws-amplify/auth";
import { configureAmplify } from "./client";

// ユーザー情報の型
interface UserInfo {
  userId: string;
  email: string;
  username: string;
  emailVerified: boolean;
}

// 認証コンテキストの型
interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認証プロバイダー
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ユーザー情報を取得
  const fetchUser = useCallback(async (): Promise<UserInfo | null> => {
    try {
      const authUser: AuthUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      return {
        userId: authUser.userId,
        username: authUser.username,
        email: attributes.email || "",
        emailVerified: attributes.email_verified === "true",
      };
    } catch {
      return null;
    }
  }, []);

  // 初期化
  useEffect(() => {
    const init = async () => {
      await configureAmplify();
      const currentUser = await fetchUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    init();
  }, [fetchUser]);

  // サインイン
  const handleSignIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signIn({ username: email, password });
      const currentUser = await fetchUser();
      setUser(currentUser);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUser]);

  // サインアップ
  const handleSignUp = useCallback(
    async (email: string, password: string): Promise<{ needsConfirmation: boolean }> => {
      setIsLoading(true);
      try {
        const result = await signUp({
          username: email,
          password,
          options: {
            userAttributes: {
              email,
            },
          },
        });

        return {
          needsConfirmation: result.nextStep.signUpStep === "CONFIRM_SIGN_UP",
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // サインアップ確認
  const handleConfirmSignUp = useCallback(
    async (email: string, code: string) => {
      setIsLoading(true);
      try {
        await confirmSignUp({ username: email, confirmationCode: code });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // サインアウト
  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ユーザー情報を再取得
  const refreshUser = useCallback(async () => {
    const currentUser = await fetchUser();
    setUser(currentUser);
  }, [fetchUser]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn: handleSignIn,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    signOut: handleSignOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 認証フック
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
