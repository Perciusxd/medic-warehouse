// src/components/auth/login-form.jsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const result = await signIn("email", {
                email,
                redirect: false,
                callbackUrl: "/dashboard",
            });

            if (result?.error) {
                setMessage("Error sending the magic link. Please try again.");
            } else {
                setMessage("Check your email for the magic link.");
            }
        } catch (error) {
            setMessage("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium">
                        Email address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="name@example.com"
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md"
                >
                    {isLoading ? "Sending..." : "Send Magic Link"}
                </button>
            </form>

            {message && (
                <div className="text-center text-sm p-2 bg-blue-50 text-blue-700 rounded">
                    {message}
                </div>
            )}

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                    className="py-2 px-4 border border-gray-300 rounded-md text-sm flex items-center justify-center"
                >
                    GitHub
                </button>
                <button
                    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                    className="py-2 px-4 border border-gray-300 rounded-md text-sm flex items-center justify-center"
                >
                    Google
                </button>
            </div>
        </div>
    );
}