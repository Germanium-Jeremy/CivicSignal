"use client";
import { ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
    FaHome, 
    FaExclamationTriangle, 
    FaCheckCircle, 
    FaClock, 
    FaCheck, 
    FaMap, 
    FaUser, 
    FaCog, 
    FaBell, 
    FaBars, 
    FaTimes,
    FaShieldAlt,
    FaExclamationCircle
} from "react-icons/fa";

interface DashboardLayoutProps {
    children: ReactNode;
    isVerified?: boolean;
    agencyName?: string;
    agencyLogo?: string;
    notificationCount?: number;
}

const navigationItems = [
    { 
        id: "home", 
        label: "Home", 
        icon: FaHome, 
        href: "/dashboard", 
        requiresVerification: false 
    },
    { 
        id: "reported", 
        label: "Reported Issues", 
        icon: FaExclamationTriangle, 
        href: "/dashboard/issues/reported", 
        requiresVerification: true,
        color: "#EB3223"
    },
    { 
        id: "acknowledged", 
        label: "Acknowledged Issues", 
        icon: FaExclamationCircle, 
        href: "/dashboard/issues/acknowledged", 
        requiresVerification: true,
        color: "#F29D38"
    },
    { 
        id: "pending", 
        label: "Pending Issues", 
        icon: FaClock, 
        href: "/dashboard/issues/pending", 
        requiresVerification: true,
        color: "#FFFD54"
    },
    { 
        id: "resolved", 
        label: "Resolved Issues", 
        icon: FaCheck, 
        href: "/dashboard/issues/resolved", 
        requiresVerification: true,
        color: "#75F94C"
    },
    { 
        id: "map", 
        label: "Public Map", 
        icon: FaMap, 
        href: "/dashboard/map", 
        requiresVerification: true 
    },
    { 
        id: "profile", 
        label: "User Profile", 
        icon: FaUser, 
        href: "/dashboard/profile", 
        requiresVerification: false 
    },
    { 
        id: "settings", 
        label: "Settings", 
        icon: FaCog, 
        href: "/dashboard/settings", 
        requiresVerification: false 
    }
];

export default function DashboardLayout({ 
    children, 
    isVerified = false, 
    agencyName = "Your Agency",
    agencyLogo = "/images/pin.png",
    notificationCount = 0 
}: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const handleNavigation = (item: typeof navigationItems[0]) => {
        if (item.requiresVerification && !isVerified) {
            // Show verification required message
            return;
        }
        router.push(item.href);
        closeSidebar();
    };

    const isActiveRoute = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard";
        }
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-panel flex">
            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-light-gray">
                    <Link href="/" className="flex items-center gap-3">
                        <Image 
                            src="/images/pin.png" 
                            alt="CivicSignal" 
                            width={32} 
                            height={32}
                            className="w-8 h-8"
                        />
                        <span className="text-lg font-bold text-primary">CivicSignal</span>
                    </Link>
                    <button
                        onClick={closeSidebar}
                        className="lg:hidden p-2 text-neutral-text hover:text-accent2 transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Verification Status */}
                {!isVerified && (
                    <div className="mx-4 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <div className="flex items-center gap-2 text-yellow-700">
                            <FaShieldAlt size={16} />
                            <span className="text-sm font-medium">Verification Pending</span>
                        </div>
                        <p className="text-xs text-yellow-600 mt-1">
                            Limited access until admin verification
                        </p>
                    </div>
                )}

                {/* Navigation */}
                <nav className="mt-6 px-4 space-y-2">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActiveRoute(item.href);
                        const isDisabled = item.requiresVerification && !isVerified;
                        
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigation(item)}
                                disabled={isDisabled}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                                    isActive
                                        ? 'bg-accent2 text-white shadow-lg'
                                        : isDisabled
                                        ? 'text-neutral-text/50 cursor-not-allowed'
                                        : 'text-neutral-text hover:bg-accent2/10 hover:text-accent2'
                                }`}
                            >
                                <Icon 
                                    size={18} 
                                    style={{ 
                                        color: isActive ? 'white' : item.color || 'currentColor' 
                                    }} 
                                />
                                <span className="font-medium">{item.label}</span>
                                {isDisabled && (
                                    <FaShieldAlt size={12} className="ml-auto text-neutral-text/50" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="p-3 bg-gradient-to-r from-accent2/10 to-accent/10 rounded-xl border border-accent2/20">
                        <div className="text-xs text-neutral-text">
                            <p className="font-medium text-almost-black">Need Help?</p>
                            <p>Contact support for assistance</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={closeSidebar}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-light-gray h-16 flex items-center justify-between px-4 lg:px-8">
                    {/* Left Side */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 text-neutral-text hover:text-accent2 transition-colors"
                        >
                            <FaBars size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Image 
                                    src={agencyLogo} 
                                    alt="Agency Logo" 
                                    width={40} 
                                    height={40}
                                    className="w-10 h-10 rounded-full border-2 border-accent2/20"
                                />
                                {isVerified && (
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                        <FaCheck size={8} className="text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="hidden md:block">
                                <h1 className="text-lg font-semibold text-almost-black">{agencyName}</h1>
                                <p className="text-xs text-neutral-text">
                                    {isVerified ? 'Verified Agency' : 'Pending Verification'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <button className="relative p-2 text-neutral-text hover:text-accent2 transition-colors">
                            <FaBell size={20} />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </span>
                            )}
                        </button>

                        {/* Profile Menu */}
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-light-gray/50 transition-colors">
                                <div className="w-8 h-8 bg-gradient-to-r from-accent2 to-accent rounded-full flex items-center justify-center">
                                    <FaUser size={14} className="text-white" />
                                </div>
                                <span className="hidden md:block text-sm font-medium text-almost-black">Profile</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
