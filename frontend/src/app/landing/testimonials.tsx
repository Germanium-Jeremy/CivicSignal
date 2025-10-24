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
        <section className={`px-[7.5rem] py-[6rem] bg-panel`} id="testimonials">
            <h1 className="text-[3rem] font-semibold text-almost-black text-center mb-[5rem]">Testimonials</h1>
            
            <div className="max-w-4xl mx-auto">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {comments.map((comment) => (
                            <CarouselItem key={comment.id}>
                                <div className="p-6">
                                    <div className="bg-white rounded-[1.25rem] p-8 shadow-lg border border-light-gray">
                                        <div className="flex flex-col items-center text-center space-y-6">
                                            {/* Profile Image */}
                                            <div className="relative">
                                                <Image src={comment.profile} alt={comment.name} width={80} height={80} className="rounded-full border-4 border-accent2/20 w-[7rem] h-[7rem]" objectFit="contain" />
                                            </div>
                                            
                                            {/* Rating Stars */}
                                            <div className="flex items-center gap-1">
                                                {renderStars(comment.ratings)}
                                                <span className="ml-2 text-sm text-neutral-text font-medium">
                                                    {comment.ratings}/5
                                                </span>
                                            </div>
                                            
                                            {/* Testimonial Text */}
                                            <blockquote className="text-lg text-neutral-text leading-relaxed px-[1rem]">
                                                "{comment.description}"
                                            </blockquote>
                                            
                                            {/* Name and Role */}
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-semibold text-almost-black">
                                                    {comment.name}
                                                </h3>
                                                <p className="text-sm text-accent2 font-medium">
                                                    {comment.role}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    
                    <CarouselPrevious className="left-4 bg-white hover:bg-accent2 hover:text-white border-accent2" />
                    <CarouselNext className="right-4 bg-white hover:bg-accent2 hover:text-white border-accent2" />
                </Carousel>
                
                {/* Optional: Dots indicator */}
                <div className="flex justify-center mt-6 space-x-2">
                    {comments.map((_, index) => (
                        <div 
                            key={index} 
                            className="w-2 h-2 rounded-full bg-light-gray hover:bg-accent2 transition-colors cursor-pointer"
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}