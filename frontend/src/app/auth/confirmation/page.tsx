"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { FaCheck, FaArrowRight, FaHome, FaUser } from "react-icons/fa";

function ConfirmationContent() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const type = searchParams.get('type') || 'default';

    const getConfirmationContent = () => {
        switch (type) {
            case 'password-reset':
                return {
                    title: "Password Reset Successful!",
                    subtitle: "Your password has been successfully updated. You can now sign in with your new password.",
                    icon: "🔐",
                    primaryAction: "Sign In",
                    primaryHref: "/auth/login",
                    secondaryAction: "Go to Homepage",
                    secondaryHref: "/"
                };
            case 'account-verified':
                return {
                    title: "Account Verified Successfully!",
                    subtitle: "Your email and phone number have been verified. Welcome to CivicSignal!",
                    icon: "✅",
                    primaryAction: "Continue to Dashboard",
                    primaryHref: "/dashboard",
                    secondaryAction: "Complete Profile",
                    secondaryHref: "/profile/setup"
                };
            case 'signup-complete':
                return {
                    title: "Welcome to CivicSignal!",
                    subtitle: "Your account has been created successfully. Start making a difference in your community today.",
                    icon: "🎉",
                    primaryAction: "Get Started",
                    primaryHref: "/dashboard",
                    secondaryAction: "Explore Features",
                    secondaryHref: "/features"
                };
            default:
                return {
                    title: "Success!",
                    subtitle: "Your action has been completed successfully.",
                    icon: "✨",
                    primaryAction: "Continue",
                    primaryHref: "/dashboard",
                    secondaryAction: "Go Home",
                    secondaryHref: "/"
                };
        }
    };

    const content = getConfirmationContent();

    const handlePrimaryAction = () => {
        setIsLoading(true);
        setTimeout(() => {
            router.push(content.primaryHref);
        }, 1000);
    };

    const handleSecondaryAction = () => {
        router.push(content.secondaryHref);
    };

    return (
        <AuthLayout 
            title={content.title}
            subtitle={content.subtitle}
        >
            <div className="text-center space-y-8">
                {/* Success Animation */}
                <div className="relative">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce">
                        <FaCheck className="text-white text-3xl" />
                    </div>
                    
                    {/* Animated Rings */}
                    <div className="absolute inset-0 w-24 h-24 mx-auto">
                        <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-ping"></div>
                        <div className="absolute inset-2 border-2 border-green-300 rounded-full animate-ping animation-delay-200"></div>
                    </div>
                    
                    {/* Icon */}
                    <div className="absolute -bottom-2 -right-2 text-4xl animate-pulse">
                        {content.icon}
                    </div>
                </div>

                {/* Success Stats */}
                <div className="bg-gradient-to-r from-green-50 to-accent2/5 rounded-2xl p-6 border border-green-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                            <div className="text-2xl font-bold text-green-600">✓</div>
                            <div className="text-xs text-neutral-text">Verified</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-bold text-accent2">🔒</div>
                            <div className="text-xs text-neutral-text">Secure</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-bold text-primary">🚀</div>
                            <div className="text-xs text-neutral-text">Ready</div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <button
                        onClick={handlePrimaryAction}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-accent2 to-accent text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Loading...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                {content.primaryAction}
                                <FaArrowRight size={16} />
                            </div>
                        )}
                    </button>

                    <button
                        onClick={handleSecondaryAction}
                        className="w-full border-2 border-light-gray text-neutral-text font-semibold py-3 px-6 rounded-xl hover:border-accent2 hover:text-accent2 hover:bg-accent2/5 transition-all duration-300 text-sm md:text-base"
                    >
                        {content.secondaryAction}
                    </button>
                </div>

                {/* Additional Information */}
                {type === 'account-verified' && (
                    <div className="bg-accent2/5 border border-accent2/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-accent2 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs font-bold">💡</span>
                            </div>
                            <div className="text-sm text-neutral-text text-left">
                                <p className="font-medium text-almost-black mb-2">What's next?</p>
                                <ul className="space-y-1 text-xs">
                                    <li>• Complete your profile setup</li>
                                    <li>• Explore your local community issues</li>
                                    <li>• Start reporting and tracking civic issues</li>
                                    <li>• Connect with local government officials</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {type === 'password-reset' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <FaCheck className="text-white text-xs" />
                            </div>
                            <div className="text-sm text-neutral-text text-left">
                                <p className="font-medium text-almost-black mb-2">Security Tips:</p>
                                <ul className="space-y-1 text-xs">
                                    <li>• Your password has been securely updated</li>
                                    <li>• Consider enabling two-factor authentication</li>
                                    <li>• Keep your password safe and don't share it</li>
                                    <li>• Sign out of all devices if you suspect unauthorized access</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-light-gray/30">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center justify-center gap-2 py-3 px-4 border border-light-gray rounded-xl hover:bg-light-gray/50 transition-all duration-300 hover:scale-105 text-sm"
                    >
                        <FaHome size={14} />
                        <span>Home</span>
                    </button>
                    <button
                        onClick={() => router.push('/profile')}
                        className="flex items-center justify-center gap-2 py-3 px-4 border border-light-gray rounded-xl hover:bg-light-gray/50 transition-all duration-300 hover:scale-105 text-sm"
                    >
                        <FaUser size={14} />
                        <span>Profile</span>
                    </button>
                </div>
            </div>

            {/* Custom CSS for animation delay */}
            <style jsx>{`
                .animation-delay-200 {
                    animation-delay: 200ms;
                }
            `}</style>
        </AuthLayout>
    );
}

function LoadingFallback() {
    return (
        <AuthLayout 
            title="Loading..."
            subtitle="Please wait while we load your confirmation"
        >
            <div className="text-center space-y-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-accent2 to-accent rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
                <p className="text-neutral-text">Loading confirmation details...</p>
            </div>
        </AuthLayout>
    );
}

export default function ConfirmationPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ConfirmationContent />
        </Suspense>
    );
}
