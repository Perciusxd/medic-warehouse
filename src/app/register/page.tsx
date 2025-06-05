'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from '@/components/providers';
import { useEffect } from 'react';

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [hospitalName, setHospitalName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const { user } = useAuth(); // Assuming useAuth is defined in your context
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        // Example: get a parameter named "ref"
        const ref = searchParams.get('onlyAdmin');
        console.log(`Ref parameter: ${ref}`);
        if (!ref) {
            // If no ref parameter, redirect to home
            router.push('/');
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, name, role, hospitalName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            } else {
                setEmail('');
                setPassword('');
                setName('');
                setRole('');
                setHospitalName('');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join us today and start managing your medicines
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <Alert variant="destructive" className="animate-fade-in">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert className="bg-green-50 border-green-200 animate-fade-in">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Success!</AlertTitle>
                            <AlertDescription className="text-green-700">
                                Registration successful! Redirecting to login...
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email address
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                Full Name
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Password
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                                    placeholder="Create a password"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                                Role
                            </Label>
                            <div className="relative">
                                <Input
                                    id="role"
                                    name="role"
                                    type="text"
                                    required
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                                    placeholder="Enter your role"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hospitalName" className="text-sm font-medium text-gray-700">
                                Hospital Name
                            </Label>
                            <div className="relative">
                                <Input
                                    id="hospitalName"
                                    name="hospitalName"
                                    type="text"
                                    required
                                    value={hospitalName}
                                    onChange={(e) => setHospitalName(e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                                    placeholder="Enter your hospital name"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <ArrowRight className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
                            </span>
                            Create Account
                        </Button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => router.push('/')}
                                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;