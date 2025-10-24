import Image from "next/image";

const partners = [
    { id: 1, name: "Partner 1", image: "/file.svg" },
    { id: 2, name: "Partner 2", image: "/globe.svg" },
    { id: 3, name: "Partner 3", image: "/next.svg" },
    { id: 4, name: "Partner 4", image: "/images/appleStore.png" },
    { id: 5, name: "Partner 5", image: "/window.svg" },
]

export default function Partners() {
    return (
        <section className={`px-[7.5rem] py-[3rem] bg-white text-center`} id="partners">
            <h1 className="text-[3rem] font-semibold text-almost-black mb-[5rem]">Partners</h1>
            <div className={`flex gap-[4rem] items-center justify-center overflow-hidden w-full`}>
                {partners.map((partner) => (
                    <div key={partner.id} className={`flex items-center justify-center gap-[1rem]`}>
                        <Image src={partner.image} alt={partner.name} width={50} height={50} />
                        <p className="text-neutral-text font-semibold text-[1rem]">{partner.name}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}