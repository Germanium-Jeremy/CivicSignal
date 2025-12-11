"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";

export default function ResetPasswordPage() {
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const router = useRouter();

    const passwordRequirements = [
        { text: "At least 8 characters", test: (pwd: string) => pwd.length >= 8 },
        { text: "One uppercase letter", test: (pwd: string) => /[A-Z]/.test(pwd) },
        { text: "One lowercase letter", test: (pwd: string) => /[a-z]/.test(pwd) },
        { text: "One number", test: (pwd: string) => /[0-9]/.test(pwd) },
        { text: "One special character", test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd) }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Calculate password strength
        if (name === 'password') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password: string) => {
        const strength = passwordRequirements.reduce((count, req) => {
            return req.test(password) ? count + 1 : count;
        }, 0);
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
        
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        if (passwordStrength < 4) {
            alert("Please create a stronger password that meets all requirements.");
            return;
        }

        setIsLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // Navigate to confirmation page
            router.push('/auth/confirmation?type=password-reset');
        }, 2000);
    };

    return (
        <AuthLayout 
            title="Create New Password" 
            subtitle="Your new password must be different from your previous password"
            showBackButton={true}
            backHref="/auth/verify-code"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Input */}
                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-almost-black">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 pr-12 border border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                            placeholder="Enter your new password"
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
                        <div className="space-y-3">
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
                            
                            {/* Password Requirements */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-almost-black">Password must contain:</p>
                                <div className="grid grid-cols-1 gap-1">
                                    {passwordRequirements.map((req, index) => {
                                        const isValid = req.test(formData.password);
                                        return (
                                            <div key={index} className="flex items-center gap-2 text-xs">
                                                {isValid ? (
                                                    <FaCheck className="text-green-500 w-3 h-3" />
                                                ) : (
                                                    <FaTimes className="text-red-500 w-3 h-3" />
                                                )}
                                                <span className={isValid ? 'text-green-600' : 'text-neutral-text'}>
                                                    {req.text}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-almost-black">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 pr-12 border border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                            placeholder="Confirm your new password"
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
                    
                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                        <div className="flex items-center gap-2 text-xs">
                            {formData.password === formData.confirmPassword ? (
                                <>
                                    <FaCheck className="text-green-500 w-3 h-3" />
                                    <span className="text-green-600">Passwords match</span>
                                </>
                            ) : (
                                <>
                                    <FaTimes className="text-red-500 w-3 h-3" />
                                    <span className="text-red-500">Passwords don't match</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Reset Password Button */}
                <button
                    type="submit"
                    disabled={
                        isLoading || 
                        !formData.password || 
                        !formData.confirmPassword || 
                        formData.password !== formData.confirmPassword ||
                        passwordStrength < 4
                    }
                    className="w-full bg-linear-to-r from-accent2 to-accent text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Updating password...
                        </div>
                    ) : (
                        "Update Password"
                    )}
                </button>

                {/* Security Tips */}
                <div className="bg-accent2/5 border border-accent2/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-accent2 rounded-full flex items-center justify-center  shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">💡</span>
                        </div>
                        <div className="text-sm text-neutral-text">
                            <p className="font-medium text-almost-black mb-2">Security Tips:</p>
                            <ul className="space-y-1 text-xs">
                                <li>• Use a unique password you haven't used before</li>
                                <li>• Consider using a password manager</li>
                                <li>• Don't share your password with anyone</li>
                                <li>• Update your password regularly</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
