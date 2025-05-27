import { SignInForm } from "../_components/SignInForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ログイン</h1>
          <p className="mt-2 text-gray-600">TODOリストアプリにアクセス</p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}