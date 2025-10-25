"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { FaEnvelope, FaPhone, FaArrowRight, FaRedo } from "react-icons/fa";

export default function VerifyCodePage() {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const method = searchParams.get('method') || 'email';
    const contact = searchParams.get('contact') || '';

    // Timer for resend functionality
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const formatContactDisplay = (value: string) => {
        if (method === 'email') {
            const [username, domain] = value.split('@');
            if (username && domain) {
                return `${username.slice(0, 2)}***@${domain}`;
            }
        } else {
            return value.replace(/(\d{3})\d{3}(\d{4})/, '$1***$2');
        }
        return value;
    };

    const handleInputChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only allow single digit
        
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newCode = [...code];
        
        for (let i = 0; i < pastedData.length; i++) {
            newCode[i] = pastedData[i];
        }
        
        setCode(newCode);
        
        // Focus the next empty input or the last input
        const nextEmptyIndex = newCode.findIndex(digit => !digit);
        const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
        inputRefs.current[focusIndex]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join('');
        
        if (fullCode.length !== 6) {
            alert('Please enter the complete 6-digit code');
            return;
        }

        setIsLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // Navigate to reset password page
            router.push('/auth/reset-password');
        }, 2000);
    };

    const handleResendCode = async () => {
        setIsResending(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsResending(false);
            setTimeLeft(60);
            setCanResend(false);
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }, 2000);
    };

    return (
        <AuthLayout 
            title="Verify Your Identity" 
            subtitle={`We've sent a 6-digit code to ${formatContactDisplay(contact)}`}
            showBackButton={true}
            backHref="/auth/forgot-password"
        >
            <div className="space-y-6">
                {/* Contact Method Display */}
                <div className="flex items-center justify-center gap-3 p-4 bg-accent2/5 rounded-xl border border-accent2/20">
                    {method === 'email' ? <FaEnvelope className="text-accent2" size={20} /> : <FaPhone className="text-accent2" size={20} />}
                    <span className="text-sm font-medium text-almost-black">
                        Code sent to {formatContactDisplay(contact)}
                    </span>
                </div>

                {/* Verification Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Code Input */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-almost-black text-center">
                            Enter the 6-digit verification code
                        </label>
                        
                        <div className="flex justify-center gap-2 md:gap-3">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => {
                                        if (el) inputRefs.current[index] = el;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-12 h-12 md:w-14 md:h-14 text-center text-lg md:text-xl font-bold border-2 border-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-accent2 transition-all duration-300"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Verify Button */}
                    <button
                        type="submit"
                        disabled={isLoading || code.join('').length !== 6}
                        className="w-full bg-gradient-to-r from-accent2 to-accent text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Verifying...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                Verify Code
                                <FaArrowRight size={16} />
                            </div>
                        )}
                    </button>
                </form>

                {/* Resend Code */}
                <div className="text-center space-y-3">
                    <p className="text-sm text-neutral-text">
                        Didn't receive the code?
                    </p>
                    
                    {canResend ? (
                        <button
                            onClick={handleResendCode}
                            disabled={isResending}
                            className="inline-flex items-center gap-2 text-accent2 hover:text-accent font-semibold text-sm transition-colors duration-300 disabled:opacity-50"
                        >
                            {isResending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-accent2/30 border-t-accent2 rounded-full animate-spin"></div>
                                    Resending...
                                </>
                            ) : (
                                <>
                                    <FaRedo size={14} />
                                    Resend Code
                                </>
                            )}
                        </button>
                    ) : (
                        <p className="text-sm text-neutral-text">
                            Resend code in <span className="font-semibold text-accent2">{timeLeft}s</span>
                        </p>
                    )}
                </div>

                {/* Help Text */}
                <div className="bg-light-gray/30 rounded-xl p-4">
                    <div className="text-sm text-neutral-text text-center">
                        <p className="font-medium text-almost-black mb-1">Having trouble?</p>
                        <p>
                            Check your {method === 'email' ? 'email inbox and spam folder' : 'text messages'} for the verification code.
                            The code expires in 10 minutes.
                        </p>
                    </div>
                </div>

                {/* Change Method */}
                <div className="text-center">
                    <button
                        onClick={() => router.push('/auth/forgot-password')}
                        className="text-sm text-neutral-text hover:text-accent2 transition-colors duration-300"
                    >
                        Use a different {method === 'email' ? 'phone number' : 'email address'}
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
}
