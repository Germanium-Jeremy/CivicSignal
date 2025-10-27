"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import { authAPI } from "@/lib/api";
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaApple, FaExclamationTriangle } from "react-icons/fa";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [verificationRequired, setVerificationRequired] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState({
        emailVerified: false,
        phoneVerified: false
    });
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setVerificationRequired(false);
        
        // Basic validation
        if (!formData.email || !formData.password) {
            setError("Please fill in all required fields.");
            setIsLoading(false);
            return;
        }

        if (!formData.email.includes('@')) {
            setError("Please enter a valid email address.");
            setIsLoading(false);
            return;
        }
        
        try {
            // Get device info for security tracking
            const deviceInfo = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language
            };

            const response = await authAPI.login(
                formData.email, 
                formData.password, 
                deviceInfo
            );

            if (response.success) {
                // Store user data if needed
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('user', JSON.stringify(response.user));
                }

                // Show success message if it's a new device
                if (response.isNewDevice) {
                    // You could show a toast notification here
                    console.log('New device login detected - security email sent');
                }

                // Redirect to dashboard
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            
            // Handle verification required error (check both error data and message)
            const errorData = (err as any).data;
            if (errorData?.requiresVerification || err.message.includes('Account not fully verified')) {
                setVerificationRequired(true);
                setVerificationStatus({
                    emailVerified: errorData?.emailVerified || false,
                    phoneVerified: errorData?.phoneVerified || false
                });
                setError("Your account requires verification to continue.");
                return;
            }
            
            // Handle other specific errors
            const errorMessage = err.message || 'Unknown error';
            
            if (errorMessage.includes('Access denied') || errorMessage.includes('only available in Rwanda')) {
                setError("Access is only available from Rwanda. Please check your location.");
            } else if (errorMessage.includes('Invalid credentials')) {
                setError("Invalid email or password. Please try again.");
            } else if (errorMessage.includes('Account is deactivated')) {
                setError("Your account has been deactivated. Please contact support.");
            } else if (errorMessage.includes('Email and password are required')) {
                setError("Please fill in all required fields.");
            } else {
                setError("Login failed. Please check your credentials and try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        console.log(`Login with ${provider}`);
        // TODO: Implement social login
        setError("Social login is not yet implemented. Please use email and password.");
    };

    const handleVerificationRedirect = () => {
        if (!verificationStatus.emailVerified) {
            router.push('/auth/verify-code?method=email&contact=' + encodeURIComponent(formData.email));
        } else if (!verificationStatus.phoneVerified) {
            router.push('/auth/verify-code?method=phone');
        }
    };

    return (
        <AuthLayout 
            title="Welcome Back" 
            subtitle="Sign in to your account to continue"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-red-800 text-sm font-medium">{error}</p>
                                {verificationRequired && (
                                    <div className="mt-3">
                                        <p className="text-red-700 text-xs mb-2">
                                            Verification Status:
                                        </p>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${verificationStatus.emailVerified ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                <span className="text-red-700">
                                                    Email {verificationStatus.emailVerified ? 'Verified' : 'Not Verified'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${verificationStatus.phoneVerified ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                <span className="text-red-700">
                                                    Phone {verificationStatus.phoneVerified ? 'Verified' : 'Not Verified'}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleVerificationRedirect}
                                            className="mt-3 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg transition-colors duration-300"
                                        >
                                            Complete Verification
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

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
