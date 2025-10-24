"use client";
import MainBtn from "@/components/mainBtn";
import Image from "next/image";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

const navLinks = [
    { id: 1, name: "Home", relativeLink: "#hero" },
    { id: 2, name: "Achievements", relativeLink: "#achievements" },
    { id: 3, name: "Why Us", relativeLink: "#whyUs" },
    { id: 4, name: "Partners", relativeLink: "#partners" },
    { id: 5, name: "Testimonials", relativeLink: "#testimonials" },
    { id: 6, name: "Contacts", relativeLink: "#contacts" },
]

export default function HeaderUnAuthenticated() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <header className="py-3 md:py-4 bg-white px-4 md:px-8 fixed top-2 md:top-2 left-4 md:left-[7.5rem] right-4 md:right-[7.5rem] z-[20] rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Image src="/images/pin.png" alt="Logo" width={32} height={32} className="md:w-10 md:h-10" />
                    <span className="font-bold text-lg text-primary md:hidden">CivicSignal</span>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex gap-6">
                    {navLinks.map((link) => (
                        <a 
                            className="font-medium text-neutral-text hover:text-primary hover:font-semibold transition-all duration-300 relative group" 
                            key={link.id} 
                            href={link.relativeLink}
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent2 transition-all duration-300 group-hover:w-full"></span>
                        </a>
                    ))}
                </nav>

                {/* Desktop CTA */}
                <div className="hidden md:block">
                    <MainBtn test="Login" toDo={() => {}} />
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden p-2 text-primary hover:text-accent2 transition-colors duration-300"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
            </div>

            {/* Mobile Navigation Menu */}
            <div className={`lg:hidden absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-light-gray/20 transition-all duration-300 ${
                isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'
            }`}>
                <nav className="p-6 space-y-4">
                    {navLinks.map((link) => (
                        <a 
                            className="block py-3 px-4 font-medium text-neutral-text hover:text-primary hover:bg-accent2/5 rounded-xl transition-all duration-300" 
                            key={link.id} 
                            href={link.relativeLink}
                            onClick={closeMenu}
                        >
                            {link.name}
                        </a>
                    ))}
                    <div className="pt-4 border-t border-light-gray/30">
                        <MainBtn test="Login" toDo={() => {}} />
                    </div>
                </nav>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
                    onClick={closeMenu}
                ></div>
            )}
        </header>
    )
}