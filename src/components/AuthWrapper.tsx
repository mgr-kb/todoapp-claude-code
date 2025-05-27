"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { ReactNode } from "react";

interface AuthWrapperProps {
  children: ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">TODOリストアプリ</h1>
          <p className="text-gray-600 mb-8">タスクを効率的に管理しましょう</p>
          <div className="space-x-4">
            <Link 
              href="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              ログイン
            </Link>
            <Link 
              href="/signup"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              新規登録
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">TODOリスト</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">こんにちは、{user?.firstName || user?.emailAddresses[0]?.emailAddress}さん</span>
              <SignOutButton>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  ログアウト
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}