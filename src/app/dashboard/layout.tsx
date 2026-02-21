"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { agencyAPI } from "@/lib/api";

interface DashboardLayoutWrapperProps {
    children: ReactNode;
}

export default function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
    const [agencyData, setAgencyData] = useState({ name: "Loading...", logo: "/images/pin.png", isVerified: false, notifications: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchAgencyData();
    }, []);

    const fetchAgencyData = async () => {
        try {
            const response = await agencyAPI.getDashboardData();
            
            if (response.success) {
                setAgencyData({
                    name: response.agency.name,
                    logo: response.agency.logo || "/images/pin.png",
                    isVerified: response.agency.isVerified,
                    notifications: response.notifications || 0
                });
            }
        } catch (error: any) {
            console.error('Error fetching agency data:', error);
            // If error is authentication related, redirect to login
            if (error.message?.includes('Authentication') || error.message?.includes('Invalid')) {
                router.push('/auth/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-panel flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-accent2/30 border-t-accent2 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <DashboardLayout isVerified={agencyData.isVerified} agencyName={agencyData.name} agencyLogo={agencyData.logo} notificationCount={agencyData.notifications}>
            {children}
        </DashboardLayout>
    );
}
