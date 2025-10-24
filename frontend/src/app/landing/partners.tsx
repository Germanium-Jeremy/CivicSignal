import Image from "next/image";

const partners = [
    { id: 1, name: "TechCorp", image: "/file.svg", category: "Technology" },
    { id: 2, name: "GlobalNet", image: "/globe.svg", category: "Infrastructure" },
    { id: 3, name: "NextGen", image: "/next.svg", category: "Development" },
    { id: 4, name: "MobileFirst", image: "/images/appleStore.png", category: "Mobile Solutions" },
    { id: 5, name: "CloudSys", image: "/window.svg", category: "Cloud Services" },
]

export default function Partners() {
    return (
        <section className="px-4 md:px-8 lg:px-[7.5rem] py-16 md:py-24 lg:py-[8rem] bg-white relative overflow-hidden" id="partners">
            {/* Background Elements - Hidden on mobile */}
            <div className="hidden md:block absolute top-0 left-1/4 w-64 lg:w-96 h-64 lg:h-96 bg-accent2/5 rounded-full blur-3xl"></div>
            <div className="hidden md:block absolute bottom-0 right-1/4 w-48 lg:w-64 h-48 lg:h-64 bg-primary/5 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-12 md:mb-16 space-y-4 md:space-y-6">
                    <div className="inline-flex items-center gap-2 bg-primary/10 px-3 md:px-4 py-2 rounded-full">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-xs md:text-sm font-medium text-primary">Trusted Partnerships</span>
                    </div>
                    
                    <h1 className="text-2xl md:text-4xl lg:text-[3.5rem] font-bold text-almost-black leading-tight">
                        Powered by
                        <span className="block bg-gradient-to-r from-primary to-accent2 bg-clip-text text-transparent">
                            Industry Leaders
                        </span>
                    </h1>
                    
                    <p className="text-base md:text-lg lg:text-xl text-neutral-text max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
                        We collaborate with the best technology partners to deliver exceptional civic engagement solutions
                    </p>
                    
                    <div className="w-16 md:w-20 h-1 bg-gradient-to-r from-accent2 to-accent rounded-full mx-auto"></div>
                </div>

                {/* Partners Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
                    {partners.map((partner, index) => (
                        <div 
                            key={partner.id} 
                            className="group relative bg-white rounded-xl lg:rounded-2xl p-4 md:p-6 lg:p-8 border border-light-gray/30 hover:border-accent2/30 transition-all duration-300 hover:shadow-xl hover:scale-105"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Hover Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-accent2/5 to-primary/5 rounded-xl lg:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            <div className="relative z-10 text-center space-y-2 md:space-y-3 lg:space-y-4">
                                {/* Logo Container */}
                                <div className="w-12 md:w-14 lg:w-16 h-12 md:h-14 lg:h-16 mx-auto bg-light-gray/50 rounded-lg lg:rounded-xl flex items-center justify-center group-hover:bg-accent2/10 transition-colors duration-300">
                                    <Image 
                                        src={partner.image} 
                                        alt={partner.name} 
                                        width={24} 
                                        height={24}
                                        className="md:w-7 md:h-7 lg:w-8 lg:h-8 group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                
                                {/* Partner Info */}
                                <div>
                                    <h3 className="text-sm md:text-base font-bold text-almost-black group-hover:text-primary transition-colors duration-300">
                                        {partner.name}
                                    </h3>
                                    <p className="text-[10px] md:text-xs text-neutral-text mt-1">
                                        {partner.category}
                                    </p>
                                </div>
                                
                                {/* Connection Line */}
                                <div className="w-full h-px bg-gradient-to-r from-transparent via-accent2/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats Section */}
                <div className="bg-gradient-to-r from-primary/5 via-accent2/5 to-accent/5 rounded-2xl lg:rounded-3xl p-4 md:p-6 lg:p-8 border border-accent2/10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 text-center">
                        <div className="space-y-1 md:space-y-2">
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">50+</div>
                            <div className="text-xs md:text-sm text-neutral-text">Technology Partners</div>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-accent2">99.9%</div>
                            <div className="text-xs md:text-sm text-neutral-text">Service Reliability</div>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-accent">24/7</div>
                            <div className="text-xs md:text-sm text-neutral-text">Partner Support</div>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">5+</div>
                            <div className="text-xs md:text-sm text-neutral-text">Years Partnership</div>
                        </div>
                    </div>
                </div>

                {/* Partnership CTA */}
                <div className="text-center mt-8 md:mt-12">
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white rounded-xl lg:rounded-2xl p-4 md:p-6 border border-light-gray/30 shadow-lg max-w-2xl mx-auto">
                        <div className="text-center sm:text-left">
                            <h3 className="text-base md:text-lg font-bold text-almost-black">Interested in partnering with us?</h3>
                            <p className="text-xs md:text-sm text-neutral-text">Join our ecosystem of innovation</p>
                        </div>
                        <button className="px-4 md:px-6 py-2 md:py-3 bg-primary hover:bg-accent2 text-white font-semibold rounded-lg md:rounded-xl transition-all duration-300 hover:scale-105 shadow-lg whitespace-nowrap text-sm md:text-base">
                            Become a Partner
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}