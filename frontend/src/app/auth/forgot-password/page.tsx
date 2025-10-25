"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { FaEnvelope, FaPhone, FaArrowRight } from "react-icons/fa";

export default function ForgotPasswordPage() {
    const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
    const [contactValue, setContactValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // Navigate to verification page with contact method and value
            router.push(`/auth/verify-code?method=${contactMethod}&contact=${encodeURIComponent(contactValue)}`);
        }, 2000);
    };

    const formatContactDisplay = (value: string) => {
        if (contactMethod === 'email') {
            const [username, domain] = value.split('@');
            if (username && domain) {
                return `${username.slice(0, 2)}***@${domain}`;
            }
        } else {
            return value.replace(/(\d{3})\d{3}(\d{4})/, '$1***$2');
        }
        return value;
    };

    return (
        <AuthLayout 
            title="Forgot Password?" 
            subtitle="No worries! We'll help you reset your password"
            showBackButton={true}
            backHref="/auth/login"
        >
            <div className="space-y-6">
                {/* Contact Method Selection */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-almost-black text-center">
                        How would you like to receive your verification code?
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setContactMethod('email')}
                            className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                                contactMethod === 'email'
                                    ? 'border-accent2 bg-accent2/5 text-accent2'
                                    : 'border-light-gray hover:border-accent2/50 text-neutral-text'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <FaEnvelope size={20} />
                                <div className="text-left">
                                    <div className="font-medium">Email</div>
                                    <div className="text-xs opacity-75">Send code via email</div>
                                </div>
                            </div>
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => setContactMethod('phone')}
                            className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                                contactMethod === 'phone'
                                    ? 'border-accent2 bg-accent2/5 text-accent2'
                                    : 'border-light-gray hover:border-accent2/50 text-neutral-text'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <FaPhone size={20} />
                                <div className="text-left">
                                    <div className="font-medium">SMS</div>
                                    <div className="text-xs opacity-75">Send code via SMS</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Contact Input Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="contact" className="block text-sm font-medium text-almost-black">
                            {contactMethod === 'email' ? 'Email Address' : 'Phone Number'}
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-text">
                                {contactMethod === 'email' ? <FaEnvelope size={16} /> : <FaPhone size={16} />}
                            </div>
                            <input
                                type={contactMethod === 'email' ? 'email' : 'tel'}
                                id="contact"
                                value={contactValue}
                                onChange={(e) => setContactValue(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                                placeholder={
                                    contactMethod === 'email' 
                                        ? 'Enter your email address' 
                                        : 'Enter your phone number'
                                }
                                required
                            />
                        </div>
                        <p className="text-xs text-neutral-text/70">
                            {contactMethod === 'email' 
                                ? 'We\'ll send a verification code to this email address'
                                : 'We\'ll send a verification code to this phone number'
                            }
                        </p>
                    </div>

                    {/* Send Code Button */}
                    <button
                        type="submit"
                        disabled={isLoading || !contactValue}
                        className="w-full bg-gradient-to-r from-accent2 to-accent text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Sending code...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                Send Verification Code
                                <FaArrowRight size={16} />
                            </div>
                        )}
                    </button>

                    {/* Help Text */}
                    <div className="bg-accent2/5 border border-accent2/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-accent2 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs font-bold">i</span>
                            </div>
                            <div className="text-sm text-neutral-text">
                                <p className="font-medium text-almost-black mb-1">Need help?</p>
                                <p>
                                    If you don't receive the code within a few minutes, check your spam folder or 
                                    try using a different {contactMethod === 'email' ? 'email address' : 'phone number'}.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Back to Login */}
                <div className="text-center">
                    <Link 
                        href="/auth/login" 
                        className="text-sm text-neutral-text hover:text-accent2 transition-colors duration-300"
                    >
                        Remember your password? <span className="font-semibold">Sign in</span>
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
