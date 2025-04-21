// src/app/(auth)/login/page.jsx
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
                <h1 className="text-2xl font-bold text-center">Sign In</h1>
                <LoginForm />
            </div>
        </div>
    );
}