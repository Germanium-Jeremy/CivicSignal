"use client";
import { ReactNode } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Mock data - replace with actual API calls or context
const mockAgencyData = {
    name: "City Municipal Corporation",
    logo: "/images/pin.png",
    isVerified: false, // Change to true to see verified state
    notifications: 5
};

interface DashboardLayoutWrapperProps {
    children: ReactNode;
}

export default function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
    return (
        <DashboardLayout 
            isVerified={mockAgencyData.isVerified}
            agencyName={mockAgencyData.name}
            agencyLogo={mockAgencyData.logo}
            notificationCount={mockAgencyData.notifications}
        >
            {children}
        </DashboardLayout>
    );
}
