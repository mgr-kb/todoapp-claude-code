"use client";

import { useUser, useAuth } from "@clerk/nextjs";

export function AuthDebugger() {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  if (!userLoaded || !authLoaded) return null;

  if (isSignedIn && user) {
    console.log("✅ 認証状態: ログイン済み", {
      userId: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.primaryEmailAddress?.verification.status === "verified"
    });
  } else {
    console.log("ℹ️ 認証状態: 未ログイン");
  }

  return null;
}