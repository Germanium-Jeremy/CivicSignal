import Image from "next/image";

const whyUs = [
    { id: 1, name: "Dual-Sided Value", description: "Empowerment and transparency for citizens and Actionable data efficiency for governments." },
    { id: 2, name: "Community-Driven", description: "Built on public participation and transparency, not just top-down reporting." },
    { id: 3, name: "Low-Cost, High-Impact", description: "Uses scalable, affordable tech to solve a massive problem." },
    { id: 4, name: "Pilot-First Approach", description: "We're proving our model with a small, manageable partnership before scaling." },
]

export default function WhyUs() {
    return (
        <section className={`py-[10rem] px-[7.5rem] flex gap-[12rem] items-center whyUsGradient`} id="whyUs">
            <div className={`py-[2rem] flex flex-col gap-[2rem]`}>
                <h1 className="text-[3rem] font-semibold text-almost-black">Why Us</h1>
                <ul className={`pl-[2rem]`}>
                    {whyUs.map((item) => (
                        <li key={item.id}>
                            <h2 className="text-[1.75rem] text-almost-black">{item.name}</h2>
                            <p className="text-neutral-text text-[1rem] pl-[.5rem]">{item.description}</p>
                        </li>
                    ))}
                </ul>
            </div>
            
            <Image src="/images/whyUs.png" alt="Why Us" width={450} height={500} />
        </section>
    )
}