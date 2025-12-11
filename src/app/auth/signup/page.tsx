"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import { authAPI } from "@/lib/api";
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaApple, FaCheck, FaExclamationTriangle } from "react-icons/fa";

export default function SignupPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
        subscribeNewsletter: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (error) setError("");

        // Calculate password strength
        if (name === 'password') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        setPasswordStrength(strength);
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 2) return "bg-red-500";
        if (passwordStrength <= 3) return "bg-yellow-500";
        if (passwordStrength <= 4) return "bg-blue-500";
        return "bg-green-500";
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength <= 2) return "Weak";
        if (passwordStrength <= 3) return "Fair";
        if (passwordStrength <= 4) return "Good";
        return "Strong";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        
        // Client-side validation
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setError("Please enter your full name.");
            return;
        }

        if (!formData.email || !formData.phone || !formData.password) {
            setError("Please fill in all required fields.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match!");
            return;
        }

        if (passwordStrength < 3) {
            setError("Please choose a stronger password.");
            return;
        }

        if (!formData.agreeToTerms) {
            setError("Please agree to the Terms of Service and Privacy Policy.");
            return;
        }
        
        setIsLoading(true);
        
        try {
            // Combine first and last name for API
            const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
            
            const response = await authAPI.register({
                fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });

            if (response.success) {
                setSuccess(true);
                // Redirect to verification page after a short delay with both email and phone
                setTimeout(() => {
                    router.push(`/auth/verify-account?email=${encodeURIComponent(formData.email)}&phone=${encodeURIComponent(formData.phone)}`);
                }, 2000);
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            
            // Handle specific error cases
            if (err.message.includes('Access denied')) {
                setError("Registration is only available from Rwanda. Please check your location.");
            } else if (err.message.includes('already exists')) {
                setError(err.message);
            } else if (err.message.includes('Password does not meet requirements')) {
                setError("Password does not meet security requirements. Please choose a stronger password.");
            } else if (err.message.includes('valid email')) {
                setError("Please enter a valid email address.");
            } else if (err.message.includes('valid phone')) {
                setError("Please enter a valid phone number.");
            } else {
                setError("Registration failed. Please try again later.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialSignup = (provider: string) => {
        console.log(`Signup with ${provider}`);
        setError("Social registration is not yet implemented. Please use the form above.");
    };

    return (
        <AuthLayout 
            title="Create Your Account" 
            subtitle="Step 1: Enter your personal details to get started"
        >
            <div className="space-y-6">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-accent2 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            1
                        </div>
                        <span className="ml-2 text-sm font-medium text-accent2">Personal Details</span>
                    </div>
                    <div className="w-12 h-0.5 bg-light-gray"></div>
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-light-gray text-neutral-text rounded-full flex items-center justify-center text-sm font-semibold">
                            2
                        </div>
                        <span className="ml-2 text-sm font-medium text-neutral-text">Agency Registration</span>
                    </div>
                </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <FaCheck className="text-green-500 mt-0.5  shrink-0" />
                            <div className="flex-1">
                                <p className="text-green-800 text-sm font-medium">Registration successful!</p>
                                <p className="text-green-700 text-xs mt-1">
                                    Please check your email and phone for verification instructions. Redirecting...
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <FaExclamationTriangle className="text-red-500 mt-0.5  shrink-0" />
                            <div className="flex-1">
                                <p className="text-red-800 text-sm font-medium">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="firstName" className="block text-sm font-medium text-almost-black">
                            First Name
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                            placeholder="First name"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="lastName" className="block text-sm font-medium text-almost-black">
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                            placeholder="Last name"
                            required
                        />
                    </div>
                </div>

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

                {/* Phone Input */}
                <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-almost-black">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                        placeholder="Enter your phone number"
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
                            placeholder="Create a password"
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
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-light-gray rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                    ></div>
                                </div>
                                <span className={`text-xs font-medium ${getPasswordStrengthColor().replace('bg-', 'text-')}`}>
                                    {getPasswordStrengthText()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-almost-black">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 pr-12 border border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                            placeholder="Confirm your password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-text hover:text-accent2 transition-colors duration-300"
                        >
                            {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-red-500 text-xs">Passwords don't match</p>
                    )}
                </div>

                {/* Terms and Newsletter */}
                <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-accent2 border-light-gray rounded focus:ring-accent2 focus:ring-2 mt-0.5"
                            required
                        />
                        <span className="text-sm text-neutral-text">
                            I agree to the{" "}
                            <Link href="/terms" className="text-accent2 hover:text-accent font-medium">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="text-accent2 hover:text-accent font-medium">
                                Privacy Policy
                            </Link>
                        </span>
                    </label>
                    
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="subscribeNewsletter"
                            checked={formData.subscribeNewsletter}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-accent2 border-light-gray rounded focus:ring-accent2 focus:ring-2 mt-0.5"
                        />
                        <span className="text-sm text-neutral-text">
                            Subscribe to our newsletter for updates and community news
                        </span>
                    </label>
                </div>

                {/* Signup Button */}
                <button
                    type="submit"
                    disabled={isLoading || !formData.agreeToTerms}
                    className="w-full bg-linear-to-r from-accent2 to-accent text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Creating account...
                        </div>
                    ) : (
                        "Continue to Agency Registration"
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

                {/* Social Signup Buttons */}
                <div className="grid grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => handleSocialSignup('Google')}
                        className="flex items-center justify-center py-3 px-4 border border-light-gray rounded-xl hover:bg-light-gray/50 transition-all duration-300 hover:scale-105"
                    >
                        <FaGoogle className="text-red-500" size={20} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSocialSignup('Facebook')}
                        className="flex items-center justify-center py-3 px-4 border border-light-gray rounded-xl hover:bg-light-gray/50 transition-all duration-300 hover:scale-105"
                    >
                        <FaFacebook className="text-blue-600" size={20} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSocialSignup('Apple')}
                        className="flex items-center justify-center py-3 px-4 border border-light-gray rounded-xl hover:bg-light-gray/50 transition-all duration-300 hover:scale-105"
                    >
                        <FaApple className="text-black" size={20} />
                    </button>
                </div>

            </form>

                {/* Login Link */}
                <div className="text-center text-sm">
                    <span className="text-neutral-text">Already have an account? </span>
                    <Link 
                        href="/auth/login" 
                        className="text-accent2 hover:text-accent font-semibold transition-colors duration-300"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
