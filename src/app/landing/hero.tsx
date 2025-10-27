"use client"
import Image from "next/image";
import MainBtn from "../../components/mainBtn";
import { useRouter } from "next/navigation";
import { FaArrowRight, FaPlay } from "react-icons/fa";

export default function Hero() {
    const router = useRouter();

    const handleGetStarted = () => {
        router.push('/auth/login');
    };

    const handleWatchDemo = () => {
        // You can add a demo video modal or redirect to a demo page
        console.log('Watch demo clicked');
    };

    return (
        <section className="relative px-4 md:px-8 lg:px-[7.5rem] py-20 md:py-32 lg:py-[14rem] flex flex-col lg:flex-row gap-8 lg:gap-[4rem] items-center heroGradient overflow-hidden" id="hero">
            {/* Floating Elements - Hidden on mobile */}
            <div className="hidden md:block absolute top-20 left-20 w-20 h-20 bg-accent2/10 rounded-full animate-pulse"></div>
            <div className="hidden md:block absolute top-40 right-32 w-16 h-16 bg-primary/10 rounded-full animate-bounce"></div>
            <div className="hidden lg:block absolute bottom-32 left-1/4 w-12 h-12 bg-accent/10 rounded-full animate-pulse delay-300"></div>

            {/* Content Section */}
            <div className="flex-1 py-4 md:py-8 flex flex-col gap-6 md:gap-8 lg:gap-[3rem] animate-fade-in-up text-center lg:text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full border border-accent2/20 w-fit shadow-sm mx-auto lg:mx-0">
                    <div className="w-2 h-2 bg-accent2 rounded-full animate-pulse"></div>
                    <span className="text-xs md:text-sm font-medium text-primary">Trusted by 25K+ communities</span>
                </div>

                {/* Main Heading */}
                <div className="space-y-3 md:space-y-4">
                    <h1 className="text-3xl md:text-5xl lg:text-[4rem] font-bold text-almost-black leading-tight">
                        Transform Your
                        <span className="block bg-gradient-to-r from-primary via-accent to-accent2 bg-clip-text text-transparent">
                            Community
                        </span>
                        <span className="block">Engagement</span>
                    </h1>
                    <div className="w-16 md:w-20 lg:w-24 h-1 bg-gradient-to-r from-accent2 to-accent rounded-full mx-auto lg:mx-0"></div>
                </div>

                {/* Description */}
                <p className="text-neutral-text text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    Empower citizens to report issues, track progress, and build stronger communities through 
                    transparent civic engagement. Join thousands of cities already making a difference.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 justify-center lg:justify-start">
                    <MainBtn text="Get Started Free" onClick={handleGetStarted} />
                    <button 
                        onClick={handleWatchDemo}
                        className="flex items-center gap-3 px-4 md:px-6 py-3 text-primary font-semibold hover:text-accent2 transition-all duration-300 group"
                    >
                        <div className="w-10 md:w-12 h-10 md:h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                            <FaPlay className="text-primary ml-1 text-sm md:text-base" />
                        </div>
                        <span className="text-sm md:text-base">Watch Demo</span>
                    </button>
                </div>

                {/* Stats */}
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 pt-4 justify-center lg:justify-start">
                    <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-primary">1.5M+</div>
                        <div className="text-xs md:text-sm text-neutral-text">Issues Reported</div>
                    </div>
                    <div className="hidden sm:block w-px h-12 bg-light-gray"></div>
                    <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-primary">98%</div>
                        <div className="text-xs md:text-sm text-neutral-text">Resolution Rate</div>
                    </div>
                    <div className="hidden sm:block w-px h-12 bg-light-gray"></div>
                    <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-primary">25K+</div>
                        <div className="text-xs md:text-sm text-neutral-text">Active Users</div>
                    </div>
                </div>
            </div>

            {/* Image Section */}
            <div className="flex-1 relative animate-fade-in-right w-full max-w-lg lg:max-w-none mx-auto">
                {/* Decorative Elements - Hidden on mobile */}
                <div className="hidden md:block absolute -top-4 lg:-top-8 -right-4 lg:-right-8 w-20 md:w-24 lg:w-32 h-20 md:h-24 lg:h-32 bg-gradient-to-br from-accent2/20 to-accent/20 rounded-2xl lg:rounded-3xl rotate-12 animate-float"></div>
                <div className="hidden md:block absolute -bottom-4 lg:-bottom-8 -left-4 lg:-left-8 w-16 md:w-20 lg:w-24 h-16 md:h-20 lg:h-24 bg-gradient-to-br from-primary/20 to-accent2/20 rounded-xl lg:rounded-2xl -rotate-12 animate-float delay-500"></div>
                
                {/* Main Image Container */}
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl border border-white/20">
                    <Image 
                        src="/images/app.png" 
                        alt="CivicSignal Platform Preview" 
                        width={600} 
                        height={400}
                        className="w-full h-auto rounded-xl lg:rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500"
                        priority
                    />
                    
                    {/* Floating UI Elements - Smaller on mobile */}
                    <div className="absolute -top-2 md:-top-4 -left-2 md:-left-4 bg-white rounded-lg md:rounded-xl p-2 md:p-3 shadow-lg animate-bounce delay-700">
                        <div className="flex items-center gap-1 md:gap-2">
                            <div className="w-2 md:w-3 h-2 md:h-3 bg-accent2 rounded-full"></div>
                            <span className="text-[10px] md:text-xs font-medium text-primary">Live Updates</span>
                        </div>
                    </div>
                    
                    <div className="absolute -bottom-2 md:-bottom-4 -right-2 md:-right-4 bg-white rounded-lg md:rounded-xl p-2 md:p-3 shadow-lg animate-bounce delay-1000">
                        <div className="flex items-center gap-1 md:gap-2">
                            <span className="text-[10px] md:text-xs font-medium text-primary">Real-time Analytics</span>
                            <FaArrowRight className="text-accent2 text-[8px] md:text-xs" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}