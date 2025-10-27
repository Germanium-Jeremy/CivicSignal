"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaUsers, FaChartLine, FaDollarSign, FaRocket, FaCheckCircle } from "react-icons/fa";

const whyUs = [
    { 
        id: 1, 
        name: "Dual-Sided Value", 
        description: "Empowerment and transparency for citizens and actionable data efficiency for governments.",
        icon: <FaUsers className="text-accent2" />,
        benefits: ["Citizen empowerment", "Government efficiency", "Data transparency"]
    },
    { 
        id: 2, 
        name: "Community-Driven", 
        description: "Built on public participation and transparency, not just top-down reporting.",
        icon: <FaChartLine className="text-accent2" />,
        benefits: ["Public participation", "Transparent processes", "Bottom-up solutions"]
    },
    { 
        id: 3, 
        name: "Low-Cost, High-Impact", 
        description: "Uses scalable, affordable tech to solve a massive problem.",
        icon: <FaDollarSign className="text-accent2" />,
        benefits: ["Scalable technology", "Cost-effective", "Maximum impact"]
    },
    { 
        id: 4, 
        name: "Pilot-First Approach", 
        description: "We're proving our model with a small, manageable partnership before scaling.",
        icon: <FaRocket className="text-accent2" />,
        benefits: ["Proven methodology", "Risk mitigation", "Gradual scaling"]
    },
]

export default function WhyUs() {
    const router = useRouter();
    
    const handleStartFreeTrialClick = () => {
        router.push('/auth/signup');
    };

    return (
        <section className="relative py-16 md:py-24 lg:py-[10rem] px-4 md:px-8 lg:px-[7.5rem] whyUsGradient overflow-hidden" id="whyUs">
            {/* Background Elements - Hidden on mobile */}
            <div className="hidden md:block absolute top-20 right-20 w-48 lg:w-64 h-48 lg:h-64 bg-accent2/5 rounded-full blur-3xl"></div>
            <div className="hidden md:block absolute bottom-20 left-20 w-32 lg:w-48 h-32 lg:h-48 bg-primary/5 rounded-full blur-2xl"></div>
            
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-[8rem] items-center">
                {/* Content Section */}
                <div className="flex-1 py-4 md:py-8 space-y-6 md:space-y-8 text-center lg:text-left">
                    {/* Header */}
                    <div className="space-y-3 md:space-y-4">
                        <div className="inline-flex items-center gap-2 bg-accent2/10 px-3 md:px-4 py-2 rounded-full mx-auto lg:mx-0">
                            <div className="w-2 h-2 bg-accent2 rounded-full"></div>
                            <span className="text-xs md:text-sm font-medium text-accent2">Why Choose CivicSignal</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl lg:text-[3.5rem] font-bold text-almost-black leading-tight">
                            Built for
                            <span className="block bg-gradient-to-r from-primary to-accent2 bg-clip-text text-transparent">
                                Real Impact
                            </span>
                        </h1>
                        <div className="w-16 md:w-20 h-1 bg-gradient-to-r from-accent2 to-accent rounded-full mx-auto lg:mx-0"></div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 gap-6">
                        {whyUs.map((item, index) => (
                            <div 
                                key={item.id} 
                                className="group bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 md:p-5 lg:p-6 border border-light-gray/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 text-center sm:text-left">
                                    {/* Icon */}
                                    <div className="flex-shrink-0 w-12 md:w-14 h-12 md:h-14 bg-accent2/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mx-auto sm:mx-0">
                                        <div className="text-lg md:text-xl">
                                            {item.icon}
                                        </div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 space-y-2 md:space-y-3">
                                        <h2 className="text-lg md:text-xl font-bold text-almost-black group-hover:text-primary transition-colors duration-300">
                                            {item.name}
                                        </h2>
                                        <p className="text-sm md:text-base text-neutral-text leading-relaxed">
                                            {item.description}
                                        </p>
                                        
                                        {/* Benefits */}
                                        <div className="flex flex-wrap gap-1 md:gap-2 pt-2 justify-center sm:justify-start">
                                            {item.benefits.map((benefit, idx) => (
                                                <div 
                                                    key={idx}
                                                    className="flex items-center gap-1 text-[10px] md:text-xs bg-accent2/10 text-accent2 px-2 py-1 rounded-full"
                                                >
                                                    <FaCheckCircle className="text-[6px] md:text-[8px]" />
                                                    <span>{benefit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-4 md:pt-6">
                        <div className="bg-gradient-to-r from-primary/10 to-accent2/10 rounded-xl lg:rounded-2xl p-4 md:p-6 border border-accent2/20">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 text-center sm:text-left">
                                <div>
                                    <h3 className="text-base md:text-lg font-bold text-almost-black">Ready to get started?</h3>
                                    <p className="text-xs md:text-sm text-neutral-text">Join 25K+ communities already using CivicSignal</p>
                                </div>
                                <button className="px-4 md:px-6 py-2 md:py-3 bg-accent2 hover:bg-accent text-white font-semibold rounded-lg md:rounded-xl transition-all duration-300 hover:scale-105 shadow-lg text-sm md:text-base whitespace-nowrap" onClick={handleStartFreeTrialClick}>
                                    Start Free Trial
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Image Section */}
                <div className="flex-1 relative w-full max-w-md lg:max-w-none mx-auto">
                    {/* Decorative Elements - Hidden on mobile */}
                    <div className="hidden md:block absolute -top-4 lg:-top-8 -left-4 lg:-left-8 w-16 lg:w-24 h-16 lg:h-24 bg-gradient-to-br from-accent2/20 to-primary/20 rounded-2xl lg:rounded-3xl rotate-12 animate-float"></div>
                    <div className="hidden md:block absolute -bottom-4 lg:-bottom-8 -right-4 lg:-right-8 w-20 lg:w-32 h-20 lg:h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl lg:rounded-2xl -rotate-12 animate-float delay-700"></div>
                    
                    {/* Main Image Container */}
                    <div className="relative bg-white/20 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-4 md:p-6 lg:p-8 border border-white/30 shadow-2xl">
                        <Image 
                            src="/images/whyUs.png" 
                            alt="Why Choose CivicSignal" 
                            width={500} 
                            height={600}
                            className="w-full h-auto rounded-xl lg:rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Floating Stats - Smaller on mobile */}
                        <div className="absolute -top-2 md:-top-4 -right-2 md:-right-4 bg-white rounded-lg md:rounded-xl p-2 md:p-4 shadow-lg animate-bounce delay-300">
                            <div className="text-center">
                                <div className="text-sm md:text-lg font-bold text-primary">99.9%</div>
                                <div className="text-[10px] md:text-xs text-neutral-text">Uptime</div>
                            </div>
                        </div>
                        
                        <div className="absolute -bottom-2 md:-bottom-4 -left-2 md:-left-4 bg-white rounded-lg md:rounded-xl p-2 md:p-4 shadow-lg animate-bounce delay-500">
                            <div className="text-center">
                                <div className="text-sm md:text-lg font-bold text-accent2">24/7</div>
                                <div className="text-[10px] md:text-xs text-neutral-text">Support</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}