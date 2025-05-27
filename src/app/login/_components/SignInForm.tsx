"use client";

import { SignIn } from "@clerk/nextjs";

export function SignInForm() {
  return (
    <SignIn 
      appearance={{
        elements: {
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
        }
      }}
      routing="path"
      path="/login"
      signUpUrl="/signup"
    />
  );
}