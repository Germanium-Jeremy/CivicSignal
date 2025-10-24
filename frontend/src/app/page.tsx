import HeaderUnAuthenticated from "./landing/header";
import Hero from "./landing/hero";
import Achievements from "./landing/achievements";
import WhyUs from "./landing/whyUs";
import Partners from "./landing/partners";
import Testimonials from "./landing/testimonials";

export default function Home() {
    return (
        <div className="min-h-screen">
            <HeaderUnAuthenticated />
            <Hero />
            <Achievements />
            <WhyUs />
            <Partners />
            <Testimonials />
        </div>
    );
}
