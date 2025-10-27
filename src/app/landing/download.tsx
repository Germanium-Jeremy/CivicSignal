"use client"
import MainBtn from "@/components/mainBtn";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Download() {
    const router = useRouter();

    const handleDownloadAndroid = () => {
        // For now, redirect to signup since mobile app isn't ready
        router.push('/auth/signup');
    };

    const handleDownloadIOS = () => {
        // For now, redirect to signup since mobile app isn't ready
        router.push('/auth/signup');
    };

    return (
        <section className="px-4 md:px-8 lg:px-[7.5rem] py-12 md:py-16 lg:py-[4rem] flex flex-col lg:flex-row gap-8 lg:gap-[5rem] items-center bg-white">
            <div className="flex flex-col gap-4 md:gap-6 py-4 text-center lg:text-left">
                <h1 className="text-2xl md:text-4xl lg:text-[3rem] font-semibold text-almost-black">Download The App</h1>
                <p className="text-sm md:text-base text-neutral-text max-w-lg mx-auto lg:mx-0">CivicSignal is available on both mobile and desktop platforms. Download now and start making a difference in your community</p>
            </div>

            <div className="flex flex-col gap-4 md:gap-6 items-center justify-center w-full lg:w-auto">
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto">
                    <MainBtn text="Download For Android" onClick={handleDownloadAndroid} />
                    <MainBtn text="Download For iOS" onClick={handleDownloadIOS} />
                </div>
                <p className="text-sm md:text-lg text-neutral-text">Or you can get the app from...</p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto">
                    <button 
                        onClick={handleDownloadAndroid}
                        className="rounded-lg px-4 md:px-6 py-2 md:py-3 bg-light-gray hover:bg-accent2 text-primary font-semibold transition-all flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base"
                    >
                        <Image src="/images/playStore.png" alt="googlePlay" width={20} height={20} className="md:w-6 md:h-6" />  
                        Google Play
                    </button>
                    <button 
                        onClick={handleDownloadIOS}
                        className="rounded-lg px-4 md:px-6 py-2 md:py-3 bg-light-gray hover:bg-accent2 text-primary font-semibold transition-all flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base"
                    >
                        <Image src="/images/appleStore.png" alt="appStore" width={24} height={18} className="md:w-7 md:h-5" />
                        App Store
                    </button>
                </div>
            </div>
        </section>
    )
}