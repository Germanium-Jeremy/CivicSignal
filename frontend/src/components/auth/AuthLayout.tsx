"use client";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    showBackButton?: boolean;
    backHref?: string;
}

export default function AuthLayout({ 
    children, 
    title, 
    subtitle, 
    showBackButton = false, 
    backHref = "/" 
}: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-panel via-white to-accent2/5 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-accent2/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-48 h-48 bg-primary/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse delay-500"></div>
            
            {/* Main Container */}
            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    {/* Logo */}
                    <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:scale-105 transition-transform duration-300">
                        <div className="relative">
                            <Image 
                                src="/images/pin.png" 
                                alt="CivicSignal Logo" 
                                width={48} 
                                height={48} 
                                className="w-12 h-12"
                            />
                            <div className="absolute -inset-2 bg-gradient-to-r from-accent2/20 to-accent/20 rounded-full blur-lg -z-10"></div>
                        </div>
                        <span className="text-2xl font-bold text-primary">CivicSignal</span>
                    </Link>

                    {/* Back Button */}
                    {showBackButton && (
                        <Link 
                            href={backHref}
                            className="inline-flex items-center gap-2 text-sm text-neutral-text hover:text-accent2 transition-colors duration-300 mb-4"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </Link>
                    )}

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-almost-black mb-2">
                        {title}
                    </h1>
                    
                    {/* Subtitle */}
                    {subtitle && (
                        <p className="text-sm md:text-base text-neutral-text max-w-sm mx-auto">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Auth Card */}
                <div className="bg-white rounded-2xl shadow-2xl border border-light-gray/20 p-6 md:p-8 backdrop-blur-sm">
                    {children}
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-xs text-neutral-text/60">
                        © {new Date().getFullYear()} CivicSignal. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
