import Image from "next/image";
import MainBtn from "../../components/mainBtn";

const navLinks = [
    { id: 1, name: "Home", relativeLink: "#hero" },
    { id: 2, name: "Achievements", relativeLink: "#achievements" },
    { id: 3, name: "Why Us", relativeLink: "#whyUs" },
    { id: 4, name: "Partners", relativeLink: "#partners" },
    { id: 5, name: "Testimonials", relativeLink: "#testimonials" },
    { id: 6, name: "Contacts", relativeLink: "#contacts" },
]

export default function HeaderUnAuthenticated() {
    return (
        <header className={`py-[1rem] bg-white px-[2rem] fixed top-[.5rem] left-[7.5rem] right-[7.5rem] z-[10] rounded-[1.25rem] shadow-2xl`}>
            <div className="flex justify-between items-center">
                <Image src="/images/pin.png" alt="Logo" width={40} height={40} />
                <nav className="flex gap-[1.5rem]">
                    {navLinks.map((link) => (
                        <a className={`font-normal hover:font-semibold active:text-accent2`} key={link.id} href={link.relativeLink}>{link.name}</a>
                    ))}
                </nav>
                <MainBtn test="Login" toDo={() => { }} />
            </div>
        </header>
    )
}