import Image from "next/image";
import MainBtn from "../../components/mainBtn";

export default function Hero() {
    return (
        <section className="px-[7.5rem] py-[14rem] flex gap-[2rem] items-center heroGradient" id="hero">
            <div className={`py-[2rem] flex flex-col gap-[2rem]`}>
                <h1 className="text-[3rem] text-almost-black">CIVICSIGNAL</h1>
                <p className="text-neutral-text text-lg">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis nemo rem accusamus molestias numquam sunt, fugit, explicabo dolores laudantium deserunt excepturi quidem ex atque. Deleniti voluptatem fugiat molestiae ducimus laborum!
                </p>

                <div> <MainBtn test="Get started" toDo={() => { }} /> </div>
            </div>

            <Image src="/images/app.png" alt="Hero" width={1350} height={500} id="achievements" />
        </section>
    )
}