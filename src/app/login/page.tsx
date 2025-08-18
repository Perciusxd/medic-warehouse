// src/app/(auth)/login/page.jsx
// import LoginForm from "@/components/auth/login-form";

"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers";

export default function LoginPage() {
    // return (
    //     <div className="flex justify-center items-center min-h-screen">
    //         <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
    //             <h1 className="text-2xl font-bold text-center">Sign In</h1>
    //             {/* <LoginForm /> */}
    //         </div>
    //     </div>
    // );

    const router = useRouter();
    const { user, loading, error: authError, checkAuth } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!loading && user) {
        router.replace("/dashboard"); // ⬅️ ใช้ replace ป้องกัน history loop
        }
    }, [user, loading, router]);

    // useEffect(() => {
    //   if (authError) {
    //     setError(authError);
    //   }
    // }, [authError]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
        const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
        });

        const data = await res.json();

        if (res.ok) {
            await checkAuth(); // Refresh auth state
        // router.push('/');
        } else {
            setError(data.message || "Login failed");
            setIsLoading(false);
        }
    } catch (e) {
        // //console.error("Login error:", e);
        setError("An error occurred during login");
        setIsLoading(false);
    } finally {
        router.push('/dashboard');
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }
    };

    if (loading || isLoading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
    );
    }

    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-blue-900 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-16">
            <div className="w-full md:w-1/2 flex justify-center">
            <Image 
                src="/medicine-icon-29795.png" 
                alt="logo" 
                width={200} 
                height={200}
                className="w-full max-w-md animate-float" 
            />
            </div>
            <div className="w-full md:w-1/2">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
                <h1 className="text-4xl font-bold text-white mb-8 text-center">ยินดีต้อนรับกลับ</h1>
                {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500 text-red-200 rounded-lg">
                    {error}
                </div>
                )}
                <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label htmlFor="identifier" className="block text-sm font-medium text-gray-200 mb-2">
                    Email or Username
                    </label>
                    <input 
                    type="text" 
                    id="identifier" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="Enter your email or username" 
                    required 
                    disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                    Password
                    </label>
                    <input 
                    type="password" 
                    id="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="Enter your password" 
                    required 
                    disabled={isLoading}
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    {isLoading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging in...
                    </span>
                    ) : "Login"}
                </button>
                </form>
            </div>
            </div>
        </div>
        </div>
    </div>
    );
}