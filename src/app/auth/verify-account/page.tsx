"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { authAPI } from "@/lib/api";
import { FaEnvelope, FaPhone, FaCheck, FaRedo, FaExclamationTriangle } from "react-icons/fa";

function VerifyAccountContent() {
    const [emailCode, setEmailCode] = useState(['', '', '', '', '', '']);
    const [phoneCode, setPhoneCode] = useState(['', '', '', '', '', '']);
    const [emailVerified, setEmailVerified] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
    const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
    const [emailTimeLeft, setEmailTimeLeft] = useState(60);
    const [phoneTimeLeft, setPhoneTimeLeft] = useState(60);
    const [canResendEmail, setCanResendEmail] = useState(false);
    const [canResendPhone, setCanResendPhone] = useState(false);
    const [isResendingEmail, setIsResendingEmail] = useState(false);
    const [isResendingPhone, setIsResendingPhone] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    
    const emailInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const phoneInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get user data from URL params
    const userEmail = searchParams.get('email') || "";
    const userPhone = searchParams.get('phone') || "";

    // Timer for email resend
    useEffect(() => {
        if (emailTimeLeft > 0 && !emailVerified) {
            const timer = setTimeout(() => setEmailTimeLeft(emailTimeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (!emailVerified) {
            setCanResendEmail(true);
        }
    }, [emailTimeLeft, emailVerified]);

    // Timer for phone resend
    useEffect(() => {
        if (phoneTimeLeft > 0 && !phoneVerified) {
            const timer = setTimeout(() => setPhoneTimeLeft(phoneTimeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (!phoneVerified) {
            setCanResendPhone(true);
        }
    }, [phoneTimeLeft, phoneVerified]);

    const formatContactDisplay = (value: string, type: 'email' | 'phone') => {
        if (type === 'email') {
            const [username, domain] = value.split('@');
            if (username && domain) {
                return `${username.slice(0, 2)}***@${domain}`;
            }
        } else {
            return value.replace(/(\+1 \(\d{3}\)) \d{3}(\d{4})/, '$1 ***$2');
        }
        return value;
    };

    const handleCodeChange = (
        index: number, 
        value: string, 
        type: 'email' | 'phone',
        code: string[],
        setCode: React.Dispatch<React.SetStateAction<string[]>>,
        inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
    ) => {
        if (value.length > 1) return;
        
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-verify when code is complete
        if (newCode.join('').length === 6) {
            if (type === 'email') {
                handleVerifyEmail(newCode.join(''));
            } else {
                handleVerifyPhone(newCode.join(''));
            }
        }
    };

    const handleKeyDown = (
        index: number, 
        e: React.KeyboardEvent,
        code: string[],
        inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
    ) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyEmail = async (code: string) => {
        setIsVerifyingEmail(true);
        setEmailError("");
        
        try {
            const response = await authAPI.verifyEmail(userEmail, code);
            
            if (response.success) {
                setEmailVerified(true);
                checkBothVerified(true, phoneVerified, response.tokens);
            }
        } catch (err: any) {
            console.error('Email verification error:', err);
            setEmailError(err.message || 'Verification failed. Please try again.');
            // Clear the code inputs on error
            setEmailCode(['', '', '', '', '', '']);
            emailInputRefs.current[0]?.focus();
        } finally {
            setIsVerifyingEmail(false);
        }
    };

    const handleVerifyPhone = async (code: string) => {
        setIsVerifyingPhone(true);
        setPhoneError("");
        
        try {
            const response = await authAPI.verifyPhone(userPhone, code);
            
            if (response.success) {
                setPhoneVerified(true);
                checkBothVerified(emailVerified, true, response.tokens);
            }
        } catch (err: any) {
            console.error('Phone verification error:', err);
            setPhoneError(err.message || 'Verification failed. Please try again.');
            // Clear the code inputs on error
            setPhoneCode(['', '', '', '', '']);
            phoneInputRefs.current[0]?.focus();
        } finally {
            setIsVerifyingPhone(false);
        }
    };

    const checkBothVerified = (emailStatus: boolean, phoneStatus: boolean, tokens?: any) => {
        if (emailStatus && phoneStatus && tokens) {
            // Redirect to agency registration page with tokens as URL parameters
            const params = new URLSearchParams({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            });
            router.push(`/auth/agency-registration?${params.toString()}`);
        }
    };

    const handleResendCode = async (type: 'email' | 'phone') => {
        if (type === 'email') {
            setIsResendingEmail(true);
            setEmailError("");
            
            try {
                const response = await authAPI.resendEmailVerification(userEmail);
                
                if (response.success) {
                    setEmailTimeLeft(60);
                    setCanResendEmail(false);
                    setEmailCode(['', '', '', '', '', '']);
                    emailInputRefs.current[0]?.focus();
                }
            } catch (err: any) {
                console.error('Resend email error:', err);
                setEmailError(err.message || 'Failed to resend email. Please try again.');
            } finally {
                setIsResendingEmail(false);
            }
        } else {
            setIsResendingPhone(true);
            setPhoneError("");
            
            try {
                const response = await authAPI.resendPhoneVerification(userPhone);
                
                if (response.success) {
                    setPhoneTimeLeft(60);
                    setCanResendPhone(false);
                    setPhoneCode(['', '', '', '', '', '']);
                    phoneInputRefs.current[0]?.focus();
                }
            } catch (err: any) {
                console.error('Resend phone error:', err);
                setPhoneError(err.message || 'Failed to resend SMS. Please try again.');
            } finally {
                setIsResendingPhone(false);
            }
        }
    };

    const renderCodeInput = (
        code: string[],
        setCode: React.Dispatch<React.SetStateAction<string[]>>,
        inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>,
        type: 'email' | 'phone',
        isVerified: boolean,
        isVerifying: boolean
    ) => (
        <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value, type, code, setCode, inputRefs)}
                    onKeyDown={(e) => handleKeyDown(index, e, code, inputRefs)}
                    disabled={isVerified || isVerifying}
                    className={`w-10 h-10 md:w-12 md:h-12 text-center text-lg font-bold border-2 rounded-lg transition-all duration-300 ${
                        isVerified 
                            ? 'border-green-500 bg-green-50 text-green-600'
                            : isVerifying
                            ? 'border-accent2 bg-accent2/5'
                            : 'border-light-gray focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-accent2'
                    }`}
                />
            ))}
        </div>
    );

    return (
        <AuthLayout 
            title="Verify Your Account" 
            subtitle="We've sent verification codes to your email and phone number"
            showBackButton={true}
            backHref="/auth/signup"
        >
            <div className="space-y-8">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
                        emailVerified ? 'bg-green-100 text-green-700' : 'bg-accent2/10 text-accent2'
                    }`}>
                        <FaEnvelope size={14} />
                        <span>Email</span>
                        {emailVerified && <FaCheck size={12} />}
                    </div>
                    <div className="w-8 h-0.5 bg-light-gray"></div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
                        phoneVerified ? 'bg-green-100 text-green-700' : 'bg-accent2/10 text-accent2'
                    }`}>
                        <FaPhone size={14} />
                        <span>Phone</span>
                        {phoneVerified && <FaCheck size={12} />}
                    </div>
                </div>

                {/* Email Verification */}
                <div className={`border-2 rounded-xl p-6 transition-all duration-300 ${
                    emailVerified 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-light-gray hover:border-accent2/50'
                }`}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FaEnvelope className={emailVerified ? 'text-green-600' : 'text-accent2'} size={20} />
                                <div>
                                    <h3 className="font-semibold text-almost-black">Email Verification</h3>
                                    <p className="text-sm text-neutral-text">
                                        Code sent to {formatContactDisplay(userEmail, 'email')}
                                    </p>
                                </div>
                            </div>
                            {emailVerified && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <FaCheck size={16} />
                                    <span className="text-sm font-medium">Verified</span>
                                </div>
                            )}
                        </div>

                        {!emailVerified && (
                            <>
                                {renderCodeInput(emailCode, setEmailCode, emailInputRefs, 'email', emailVerified, isVerifyingEmail)}
                                
                                {emailError && (
                                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <FaExclamationTriangle className="text-red-500 mt-0.5  shrink-0" size={14} />
                                        <p className="text-red-800 text-sm">{emailError}</p>
                                    </div>
                                )}
                                
                                {isVerifyingEmail && (
                                    <div className="flex items-center justify-center gap-2 text-accent2">
                                        <div className="w-4 h-4 border-2 border-accent2/30 border-t-accent2 rounded-full animate-spin"></div>
                                        <span className="text-sm">Verifying...</span>
                                    </div>
                                )}

                                <div className="text-center">
                                    {canResendEmail ? (
                                        <button
                                            onClick={() => handleResendCode('email')}
                                            disabled={isResendingEmail}
                                            className="inline-flex items-center gap-2 text-accent2 hover:text-accent font-medium text-sm transition-colors duration-300 disabled:opacity-50"
                                        >
                                            {isResendingEmail ? (
                                                <>
                                                    <div className="w-3 h-3 border-2 border-accent2/30 border-t-accent2 rounded-full animate-spin"></div>
                                                    Resending...
                                                </>
                                            ) : (
                                                <>
                                                    <FaRedo size={12} />
                                                    Resend Email Code
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <p className="text-sm text-neutral-text">
                                            Resend in <span className="font-semibold text-accent2">{emailTimeLeft}s</span>
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Phone Verification */}
                <div className={`border-2 rounded-xl p-6 transition-all duration-300 ${
                    phoneVerified 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-light-gray hover:border-accent2/50'
                }`}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FaPhone className={phoneVerified ? 'text-green-600' : 'text-accent2'} size={20} />
                                <div>
                                    <h3 className="font-semibold text-almost-black">Phone Verification</h3>
                                    <p className="text-sm text-neutral-text">
                                        Code sent to {formatContactDisplay(userPhone, 'phone')}
                                    </p>
                                </div>
                            </div>
                            {phoneVerified && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <FaCheck size={16} />
                                    <span className="text-sm font-medium">Verified</span>
                                </div>
                            )}
                        </div>

                        {!phoneVerified && (
                            <>
                                {renderCodeInput(phoneCode, setPhoneCode, phoneInputRefs, 'phone', phoneVerified, isVerifyingPhone)}
                                
                                {phoneError && (
                                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <FaExclamationTriangle className="text-red-500 mt-0.5  shrink-0" size={14} />
                                        <p className="text-red-800 text-sm">{phoneError}</p>
                                    </div>
                                )}
                                
                                {isVerifyingPhone && (
                                    <div className="flex items-center justify-center gap-2 text-accent2">
                                        <div className="w-4 h-4 border-2 border-accent2/30 border-t-accent2 rounded-full animate-spin"></div>
                                        <span className="text-sm">Verifying...</span>
                                    </div>
                                )}

                                <div className="text-center">
                                    {canResendPhone ? (
                                        <button
                                            onClick={() => handleResendCode('phone')}
                                            disabled={isResendingPhone}
                                            className="inline-flex items-center gap-2 text-accent2 hover:text-accent font-medium text-sm transition-colors duration-300 disabled:opacity-50"
                                        >
                                            {isResendingPhone ? (
                                                <>
                                                    <div className="w-3 h-3 border-2 border-accent2/30 border-t-accent2 rounded-full animate-spin"></div>
                                                    Resending...
                                                </>
                                            ) : (
                                                <>
                                                    <FaRedo size={12} />
                                                    Resend SMS Code
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <p className="text-sm text-neutral-text">
                                            Resend in <span className="font-semibold text-accent2">{phoneTimeLeft}s</span>
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Help Text */}
                <div className="bg-light-gray/30 rounded-xl p-4">
                    <div className="text-sm text-neutral-text text-center">
                        <p className="font-medium text-almost-black mb-1">Need help?</p>
                        <p>
                            Check your email inbox, spam folder, and text messages for the verification codes.
                            Both codes expire in 10 minutes.
                        </p>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}

export default function VerifyAccountPage() {
    return (
        <Suspense fallback={
            <AuthLayout 
                title="Verify Your Account" 
                subtitle="Loading verification page..."
            >
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-accent2/30 border-t-accent2 rounded-full animate-spin"></div>
                </div>
            </AuthLayout>
        }>
            <VerifyAccountContent />
        </Suspense>
    );
}
