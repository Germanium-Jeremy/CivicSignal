import MainBtn from "@/components/mainBtn";
import Image from "next/image";

export default function Download() {
    return (
        <section className={`px-[7.5rem] py-[4rem] flex gap-[5rem] items-center bg-white`}>
            <div className={`flex flex-col gap-[1rem] py-[1rem]`}>
                <h1 className="text-[3rem] font-semibold text-almost-black">Download The App</h1>
                <p className="text-neutral-text">CivicSignal is available on both mobile and desktop platforms. Download now and start making a difference in your community</p>
            </div>

            <div className={`flex flex-col gap-[1rem] items-center justify-center`}>
                <div className="flex gap-[2rem]">
                    <MainBtn test="Download For Android" toDo={() => {}} />
                    <MainBtn test="Download For iOS" toDo={() => {}} />
                </div>
                <p className="text-lg text-neutral-text">Or you can get the app from...</p>
                <div className="flex gap-[2rem]">
                    <button className="rounded-[0.5rem] px-[2rem] py-[.4rem] bg-light-gray hover:bg-accent2 text-primary font-semibold transition-all flex gap-[1rem]">
                        <Image src="/images/playStore.png" alt="googlePlay" width={23} height={23} />  
                        Google Play
                    </button>
                    <button className="rounded-[0.5rem] px-[2rem] py-[.4rem] bg-light-gray hover:bg-accent2 text-primary font-semibold transition-all flex gap-[1rem]">
                        <Image src="/images/appleStore.png" alt="appStore" width={50} height={20} />
                        App Store
                    </button>
                </div>
            </div>
        </section>
    )
}