import Image from "next/image";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaGithub } from "react-icons/fa";
import { FaLocationPin, FaPhone, FaEnvelope } from "react-icons/fa6";

const footerLinks = {
    product: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "API Documentation", href: "/docs" },
        { name: "Mobile App", href: "/download" },
    ],
    company: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Press Kit", href: "/press" },
        { name: "Contact", href: "#contacts" },
    ],
    support: [
        { name: "Help Center", href: "/help" },
        { name: "Community Forum", href: "/forum" },
        { name: "Status Page", href: "/status" },
        { name: "Bug Reports", href: "/bugs" },
    ],
    legal: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "GDPR Compliance", href: "/gdpr" },
    ],
};

const socialLinks = [
    { name: "Facebook", icon: <FaFacebook />, href: "https://facebook.com/civicsignal" },
    { name: "Twitter", icon: <FaTwitter />, href: "https://twitter.com/civicsignal" },
    { name: "LinkedIn", icon: <FaLinkedin />, href: "https://linkedin.com/company/civicsignal" },
    { name: "Instagram", icon: <FaInstagram />, href: "https://instagram.com/civicsignal" },
    { name: "GitHub", icon: <FaGithub />, href: "https://github.com/civicsignal" },
];

export default function Footer() {
    return (
        <footer className="bg-primary text-white" id="contacts">
            {/* Main Footer Content */}
            <div className="px-4 md:px-8 lg:px-30 py-8 md:py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 md:gap-8">
                    {/* Company Info & Newsletter */}
                    <div className="md:col-span-2 lg:col-span-2 space-y-4 md:space-y-6 text-center md:text-left">
                        {/* Logo and Description */}
                        <div className="space-y-3 md:space-y-4">
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <Image src="/images/pin.png" alt="CivicSignal Logo" width={32} height={32} className="md:w-10 md:h-10" />
                                <h2 className="text-xl md:text-2xl font-bold text-white">CivicSignal</h2>
                            </div>
                            <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-md mx-auto md:mx-0">
                                Empowering communities through transparent civic engagement. 
                                Report issues, track progress, and build better cities together.
                            </p>
                        </div>

                        {/* Newsletter Signup */}
                        <div className="space-y-3">
                            <h3 className="text-base md:text-lg font-semibold text-white">Stay Updated</h3>
                            <p className="text-xs md:text-sm text-gray-300">
                                Get the latest updates on new features and community improvements.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-3 md:px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent2 focus:border-transparent text-sm md:text-base"
                                />
                                <button className="px-4 md:px-6 py-2 bg-accent2 hover:bg-accent text-white font-semibold rounded-lg transition-all duration-200 text-sm md:text-base whitespace-nowrap">
                                    Subscribe
                                </button>
                            </div>
                        </div>

                        {/* Contact Info - Hidden on mobile, shown on larger screens */}
                        <div className="hidden md:block space-y-3">
                            <h3 className="text-base md:text-lg font-semibold text-white">Contact Info</h3>
                            <div className="space-y-2 text-xs md:text-sm text-gray-300">
                                <div className="flex items-center gap-3">
                                    <FaLocationPin className="text-accent2  shrink-0" />
                                    <span>123 Civic Street, Democracy City, DC 12345</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaPhone className="text-accent2  shrink-0" />
                                    <span>+1 (555) 123-4567</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaEnvelope className="text-accent2  shrink-0" />
                                    <span>hello@civicsignal.com</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div className="space-y-3 md:space-y-4 text-center md:text-left">
                        <h3 className="text-base md:text-lg font-semibold text-white">Product</h3>
                        <ul className="space-y-1 md:space-y-2">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-gray-300 hover:text-accent2 transition-colors duration-200 text-xs md:text-sm"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div className="space-y-3 md:space-y-4 text-center md:text-left">
                        <h3 className="text-base md:text-lg font-semibold text-white">Company</h3>
                        <ul className="space-y-1 md:space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-gray-300 hover:text-accent2 transition-colors duration-200 text-xs md:text-sm"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className="space-y-3 md:space-y-4 text-center md:text-left">
                        <h3 className="text-base md:text-lg font-semibold text-white">Support</h3>
                        <ul className="space-y-1 md:space-y-2">
                            {footerLinks.support.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-gray-300 hover:text-accent2 transition-colors duration-200 text-xs md:text-sm"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div className="space-y-3 md:space-y-4 text-center md:text-left">
                        <h3 className="text-base md:text-lg font-semibold text-white">Legal</h3>
                        <ul className="space-y-1 md:space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-gray-300 hover:text-accent2 transition-colors duration-200 text-xs md:text-sm"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-white/10">
                <div className="px-4 md:px-8 lg:px-30 py-4 md:py-6">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-center lg:text-left">
                        {/* Copyright */}
                        <div className="text-xs md:text-sm text-gray-300">
                            © {new Date().getFullYear()} CivicSignal. All rights reserved. 
                            <span className="block sm:inline sm:ml-2">Made with ❤️ for better communities.</span>
                        </div>

                        {/* Social Media Links */}
                        <div className="flex items-center gap-3 md:gap-4">
                            <span className="text-xs md:text-sm text-gray-300 mr-2 hidden sm:inline">Follow us:</span>
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-300 hover:text-accent2 transition-colors duration-200 text-base md:text-lg"
                                    aria-label={`Follow us on ${social.name}`}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Contact Info - Mobile only */}
                    <div className="md:hidden mt-6 pt-4 border-t border-white/5 space-y-2 text-center">
                        <div className="flex items-center justify-center gap-3 text-xs text-gray-300">
                            <FaLocationPin className="text-accent2" />
                            <span>123 Civic Street, Democracy City, DC 12345</span>
                        </div>
                        <div className="flex items-center justify-center gap-3 text-xs text-gray-300">
                            <FaPhone className="text-accent2" />
                            <span>+1 (555) 123-4567</span>
                        </div>
                        <div className="flex items-center justify-center gap-3 text-xs text-gray-300">
                            <FaEnvelope className="text-accent2" />
                            <span>hello@civicsignal.com</span>
                        </div>
                    </div>

                    {/* Additional Footer Info */}
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-3 lg:gap-2 text-[10px] md:text-xs text-gray-400 text-center lg:text-left">
                            <div>
                                CivicSignal is a registered trademark. Platform designed for civic engagement and community improvement.
                            </div>
                            <div className="flex flex-wrap justify-center lg:justify-end gap-2 md:gap-4">
                                <span>🌍 Available in 25+ languages</span>
                                <span>📱 iOS & Android Apps</span>
                                <span>🔒 SOC 2 Compliant</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}