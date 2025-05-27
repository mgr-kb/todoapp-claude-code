"use client";

import { SignUp } from "@clerk/nextjs";

export function SignUpForm() {
  return (
    <SignUp 
      appearance={{
        elements: {
          formButtonPrimary: "bg-green-600 hover:bg-green-700",
        }
      }}
      routing="path"
      path="/signup"
      signInUrl="/login"
    />
  );
}