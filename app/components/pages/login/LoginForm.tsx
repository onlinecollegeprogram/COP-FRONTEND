'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { safeRedirect, withRedirect } from '@/app/lib/redirect';

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get('message');
    const redirectTo = safeRedirect(searchParams.get('redirect'));

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                const processEnvApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                const response = await fetch(`${processEnvApi}/api/public/student/google-auth`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        accessToken: tokenResponse.access_token
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    toast.success("Login successful!");
                    if (data.token) {
                        localStorage.setItem('studentToken', data.token);
                    }
                    router.push(redirectTo);
                } else {
                    toast.error(data.error || "Google login failed");
                }
            } catch (error) {
                console.error("Google Auth error:", error);
                toast.error("An unexpected error occurred during Google login.");
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            toast.error("Google login failed");
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast.error("Email and password are required");
            return;
        }

        setIsLoading(true);

        try {
            const processEnvApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const response = await fetch(`${processEnvApi}/api/public/student/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    identifier: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Login successful!");
                if (data.token) {
                    localStorage.setItem('studentToken', data.token);
                }
                router.push(redirectTo);
            } else {
                toast.error(data.error || "Invalid credentials");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full lg:w-1/2 flex justify-center lg:items-start items-center p-6 lg:pt-20 bg-white min-h-screen relative">
            <div className="w-full max-w-md">
                {/* Back to Home - Mobile Only */}
                <Link
                    href="/"
                    className="inline-flex lg:hidden items-center gap-1.5 mb-8 text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Home
                </Link>

                {/* Logo */}
                <div className="mb-6">
                    <Link href="/">
                        <img
                            src="/logoDark.svg"
                            alt="CollegeProgram Logo"
                            className="h-26 mx-auto"
                        />
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-6">
                    {message === 'comparison' && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500 shadow-sm">
                            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Lock className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-red-900 text-sm">Action Required</h3>
                                <p className="text-red-700 text-xs mt-0.5 font-medium leading-relaxed">
                                    Please Login for seeing full comparison table
                                </p>
                            </div>
                        </div>
                    )}
                    <h2 className="text-xl font-extrabold text-gray-900 mb-1">Welcome Back</h2>
                    <p className="text-gray-500">Sign in to continue your learning journey</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Email or Phone Number</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-purple-600" />
                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your.email@example.com or Phone"
                                className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-800 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-purple-600" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className="w-full pl-12 pr-12 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-800 placeholder:text-gray-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Remember & Forgot */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                            <span className="text-sm text-gray-600">Remember me</span>
                        </label>
                        <a href="#" className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors">Forgot password?</a>
                    </div>

                    {/* Sign In Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2.5 text-white font-bold rounded-xl shadow-lg transform transition-all cursor-pointer hover:brightness-80 ${isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-[#9810FA] shadow-purple-500/30 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0'
                            }`}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>

                    {/* Divider */}
                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Button */}
                    <button
                        type="button"
                        onClick={() => handleGoogleLogin()}
                        disabled={isLoading}
                        className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all cursor-pointer shadow"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                    </button>
                </form>

                {/* Footer */}
                <p className="mt-6 text-center text-gray-600">
                    Don't have an account? <Link href={redirectTo === '/' ? '/signup' : withRedirect('/signup', redirectTo)} className="font-bold text-purple-600 hover:text-purple-700 hover:underline">Sign up</Link>
                </p>

                <div className="mt-8 text-center text-xs text-gray-400">
                    By signing in, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
