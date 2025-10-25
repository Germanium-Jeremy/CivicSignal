"use client";
import { useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaApple } from "react-icons/fa";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            console.log("Login attempt:", formData);
        }, 2000);
    };

    const handleSocialLogin = (provider: string) => {
        console.log(`Login with ${provider}`);
    };

    return (
        <AuthLayout 
            title="Welcome Back" 
            subtitle="Sign in to your account to continue"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-almost-black">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                        placeholder="Enter your email"
                        required
                    />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-almost-black">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 pr-12 border border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                            placeholder="Enter your password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-text hover:text-accent2 transition-colors duration-300"
                        >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-accent2 border-light-gray rounded focus:ring-accent2 focus:ring-2"
                        />
                        <span className="text-neutral-text">Remember me</span>
                    </label>
                    <Link 
                        href="/auth/forgot-password" 
                        className="text-accent2 hover:text-accent font-medium transition-colors duration-300"
                    >
                        Forgot password?
                    </Link>
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-accent2 to-accent text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Signing in...
                        </div>
                    ) : (
                        "Sign In"
                    )}
                </button>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-light-gray"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-neutral-text">Or continue with</span>
                    </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => handleSocialLogin('Google')}
                        className="flex items-center justify-center py-3 px-4 border border-light-gray rounded-xl hover:bg-light-gray/50 transition-all duration-300 hover:scale-105"
                    >
                        <FaGoogle className="text-red-500" size={20} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSocialLogin('Facebook')}
                        className="flex items-center justify-center py-3 px-4 border border-light-gray rounded-xl hover:bg-light-gray/50 transition-all duration-300 hover:scale-105"
                    >
                        <FaFacebook className="text-blue-600" size={20} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSocialLogin('Apple')}
                        className="flex items-center justify-center py-3 px-4 border border-light-gray rounded-xl hover:bg-light-gray/50 transition-all duration-300 hover:scale-105"
                    >
                        <FaApple className="text-black" size={20} />
                    </button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center text-sm">
                    <span className="text-neutral-text">Don't have an account? </span>
                    <Link 
                        href="/auth/signup" 
                        className="text-accent2 hover:text-accent font-semibold transition-colors duration-300"
                    >
                        Sign up
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
