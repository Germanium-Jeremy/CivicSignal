import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Star } from "lucide-react";

const comments = [
    { 
        id: 1, 
        name: "John Doe", 
        description: "CivicSignal has transformed how our community reports issues. The interface is intuitive and the response time from local authorities has improved dramatically.", 
        ratings: 4.5, 
        profile: '/images/person.png',
        role: "Community Leader"
    },
    { 
        id: 2, 
        name: "Mary Jane", 
        description: "As a city council member, this platform has given us unprecedented insight into citizen concerns. The data visualization helps us prioritize resources effectively.", 
        ratings: 4, 
        profile: '/globe.svg',
        role: "City Council Member"
    },
    { 
        id: 3, 
        name: "Peter Parker", 
        description: "I love how easy it is to report street issues and track their progress. Finally, a platform that makes civic engagement accessible to everyone.", 
        ratings: 5, 
        profile: '/next.svg',
        role: "Local Resident"
    },
    { 
        id: 4, 
        name: "John Wick", 
        description: "The real-time updates and transparency features have built trust between our department and the community. Highly recommend for any municipality.", 
        ratings: 4.5, 
        profile: '/window.svg',
        role: "Public Works Director"
    },
    { 
        id: 5, 
        name: "Ed Lorraine", 
        description: "CivicSignal's analytics dashboard provides valuable insights that help us make data-driven decisions for urban planning and resource allocation.", 
        ratings: 2, 
        profile: '/file.svg',
        role: "Urban Planner"
    },
]

// Helper function to render stars
const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
        stars.push(<Star key={i} className="w-4 h-4 fill-warn text-warn" />);
    }
    
    if (hasHalfStar) {
        stars.push(<Star key="half" className="w-4 h-4 fill-warn/50 text-warn" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
        stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-light-gray" />);
    }
    
    return stars;
};

export default function Testimonials() {
    return (
        <section className="px-4 md:px-8 lg:px-30 py-12 md:py-16 lg:py-24 bg-panel relative overflow-hidden" id="testimonials">
            {/* Background Elements */}
            <div className="hidden md:block absolute top-10 left-10 w-32 h-32 bg-accent2/5 rounded-full blur-2xl"></div>
            <div className="hidden md:block absolute bottom-10 right-10 w-24 h-24 bg-primary/5 rounded-full blur-xl"></div>
            
            {/* Header */}
            <div className="text-center mb-8 md:mb-12 lg:mb-20 space-y-3 md:space-y-4">
                <div className="inline-flex items-center gap-2 bg-accent2/10 px-3 md:px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-accent2 rounded-full"></div>
                    <span className="text-xs md:text-sm font-medium text-accent2">What Our Users Say</span>
                </div>
                
                <h1 className="text-2xl md:text-4xl lg:text-[3rem] font-semibold text-almost-black">
                    Testimonials
                </h1>
                
                <p className="text-sm md:text-base text-neutral-text max-w-2xl mx-auto px-4 md:px-0">
                    Hear from community leaders, residents, and officials who are making a difference with CivicSignal
                </p>
                
                <div className="w-16 md:w-20 h-1 bg-linear-to-r from-accent2 to-accent rounded-full mx-auto"></div>
            </div>
            
            <div className="max-w-5xl mx-auto relative">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {comments.map((comment) => (
                            <CarouselItem key={comment.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                <div className="p-2 md:p-4 h-full">
                                    <div className="bg-white rounded-xl lg:rounded-[1.25rem] p-4 md:p-6 lg:p-8 shadow-lg border border-light-gray hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full flex flex-col">
                                        <div className="flex flex-col items-center text-center space-y-4 md:space-y-5 lg:space-y-6 flex-1">
                                            {/* Profile Image */}
                                            <div className="relative">
                                                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 rounded-full border-3 md:border-4 border-accent2/20 overflow-hidden bg-light-gray/50 flex items-center justify-center">
                                                    <Image 
                                                        src={comment.profile} 
                                                        alt={comment.name} 
                                                        width={80} 
                                                        height={80} 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                </div>
                                                {/* Decorative ring */}
                                                <div className="absolute -inset-1 rounded-full bg-linear-to-r from-accent2/20 to-accent/20 -z-10"></div>
                                            </div>
                                            
                                            {/* Rating Stars */}
                                            <div className="flex items-center gap-1">
                                                <div className="flex gap-0.5">
                                                    {renderStars(comment.ratings)}
                                                </div>
                                                <span className="ml-2 text-xs md:text-sm text-neutral-text font-medium">
                                                    {comment.ratings}/5
                                                </span>
                                            </div>
                                            
                                            {/* Testimonial Text */}
                                            <blockquote className="text-sm md:text-base lg:text-lg text-neutral-text leading-relaxed px-2 md:px-4 flex-1 flex items-center">
                                                <span className="relative">
                                                    <span className="text-accent2/30 text-4xl md:text-5xl absolute -top-4 -left-2">"</span>
                                                    {comment.description}
                                                    <span className="text-accent2/30 text-4xl md:text-5xl absolute -bottom-6 -right-2">"</span>
                                                </span>
                                            </blockquote>
                                            
                                            {/* Name and Role */}
                                            <div className="space-y-1 mt-auto">
                                                <h3 className="text-base md:text-lg lg:text-xl font-semibold text-almost-black">
                                                    {comment.name}
                                                </h3>
                                                <p className="text-xs md:text-sm text-accent2 font-medium">
                                                    {comment.role}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    
                    {/* Navigation Buttons - Hidden on mobile */}
                    <CarouselPrevious className="hidden md:flex left-2 lg:left-4 bg-white hover:bg-accent2 hover:text-white border-accent2 shadow-lg" />
                    <CarouselNext className="hidden md:flex right-2 lg:right-4 bg-white hover:bg-accent2 hover:text-white border-accent2 shadow-lg" />
                </Carousel>
                
                {/* Dots indicator - Enhanced for mobile */}
                <div className="flex justify-center mt-6 md:mt-8 space-x-2 md:space-x-3">
                    {comments.map((_, index) => (
                        <div 
                            key={index} 
                            className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-light-gray hover:bg-accent2 transition-all duration-300 cursor-pointer hover:scale-125"
                        />
                    ))}
                </div>
                
                {/* Mobile swipe indicator */}
                <div className="md:hidden flex justify-center mt-4 text-xs text-neutral-text/60">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        Swipe to see more
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </span>
                </div>
                
                {/* Stats Section */}
                <div className="mt-8 md:mt-12 bg-linear-to-r from-primary/5 via-accent2/5 to-accent/5 rounded-2xl p-4 md:p-6 lg:p-8 border border-accent2/10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
                        <div className="space-y-1 md:space-y-2">
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">4.7/5</div>
                            <div className="text-xs md:text-sm text-neutral-text">Average Rating</div>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-accent2">1,200+</div>
                            <div className="text-xs md:text-sm text-neutral-text">Happy Users</div>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-accent">95%</div>
                            <div className="text-xs md:text-sm text-neutral-text">Satisfaction Rate</div>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">50+</div>
                            <div className="text-xs md:text-sm text-neutral-text">Cities Using</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}