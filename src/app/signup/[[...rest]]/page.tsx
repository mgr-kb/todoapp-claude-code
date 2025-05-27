import { SignUpForm } from "../_components/SignUpForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">新規登録</h1>
          <p className="mt-2 text-gray-600">TODOリストアプリをはじめる</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}