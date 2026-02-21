"use client";
import { useState, useEffect } from "react";
import { agencyAPI } from "@/lib/api";
import { getCategoryByName, CATEGORIES } from "@/config/categories";
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaCheck, FaArrowUp, FaArrowDown, FaEye, FaCalendarAlt, FaMapMarkerAlt, FaUser} from "react-icons/fa";
import Link from "next/link";

interface AgencyData {
    name: string;
    isVerified: boolean;
    verificationStatus: string;
    type: string;
    district: string;
    sector: string;
}

interface Stats {
    reported: { count: number; change: number; trend: string };
    acknowledged: { count: number; change: number; trend: string };
    pending: { count: number; change: number; trend: string };
    resolved: { count: number; change: number; trend: string };
}

const mockRecentIssues = [
    {
        id: "ISS-001",
        title: "Broken streetlight on Main Street",
        status: "reported",
        priority: "medium",
        location: "Kigali",
        reportedBy: "John Doe",
        reportedAt: "2024-01-20T10:30:00Z",
        description: "The streetlight has been flickering and completely went out last night."
    },
    {
        id: "ISS-002", 
        title: "Pothole causing traffic issues",
        status: "acknowledged",
        priority: "high",
        location: "Kigali",
        reportedBy: "Sarah Wilson",
        reportedAt: "2024-01-19T14:15:00Z",
        description: "Large pothole is causing vehicles to swerve dangerously."
    },
    {
        id: "ISS-003",
        title: "Water leak in residential area",
        status: "pending",
        priority: "high", 
        location: "Kigali",
        reportedBy: "Mike Johnson",
        reportedAt: "2024-01-18T09:20:00Z",
        description: "Water main leak causing flooding in the street."
    },
    {
        id: "ISS-004",
        title: "Graffiti removal needed",
        status: "resolved",
        priority: "low",
        location: "Kigali",
        reportedBy: "Lisa Chen",
        reportedAt: "2024-01-15T16:45:00Z",
        description: "Graffiti on public property needs to be cleaned."
    }
];

const statusColors = {
    reported: "#EB3223",
    acknowledged: "#F29D38", 
    pending: "#FFFD54",
    resolved: "#75F94C"
};

const priorityColors = {
    low: "#10B981",
    medium: "#F59E0B", 
    high: "#EF4444"
};

const StatCard = ({ title, count, change, trend, color, icon: Icon }: any) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-light-gray hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20`, color: color }}>
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-neutral-text">{title}</h3>
                    <p className="text-2xl font-bold text-almost-black">{count}</p>
                </div>
            </div>
            <div className={`flex items-center gap-1 text-sm ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
                {trend === 'up' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                <span>{Math.abs(change)}</span>
            </div>
        </div>
        <div className="w-full bg-light-gray rounded-full h-2">
            <div className="h-2 rounded-full transition-all duration-500" style={{ backgroundColor: color, width: `${Math.min((count / 200) * 100, 100)}%` }} />
        </div>
    </div>
);

export default function DashboardHome() {
    const [timeRange, setTimeRange] = useState("7d");
    const [agencyData, setAgencyData] = useState<AgencyData | null>(null);
    const [stats, setStats] = useState<Stats>({
        reported: { count: 0, change: 0, trend: "up" },
        acknowledged: { count: 0, change: 0, trend: "up" },
        pending: { count: 0, change: 0, trend: "up" },
        resolved: { count: 0, change: 0, trend: "up" }
    });
    const [recentIssues, setRecentIssues] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await agencyAPI.getDashboardData();
            
            if (response.success) {
                setAgencyData(response.agency);
                setStats(response.stats);
                setRecentIssues(response.recentIssues || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "reported": return FaExclamationTriangle;
            case "acknowledged": return FaCheckCircle;
            case "pending": return FaClock;
            case "resolved": return FaCheck;
            default: return FaExclamationTriangle;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-accent2/30 border-t-accent2 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!agencyData) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-neutral-text">No agency data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-almost-black">Dashboard Overview</h1>
                    <p className="text-neutral-text mt-1">Welcome back to {agencyData.name}! Here's what's happening in {agencyData.district}, {agencyData.sector}.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2 text-sm"
                    >
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                </div>
            </div>

            {/* Verification Alert */}
            {!agencyData.isVerified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center  shrink-0 mt-0.5">
                            <FaExclamationTriangle className="text-white text-xs" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-yellow-800">
                                {agencyData.verificationStatus === 'pending' ? 'Account Verification Pending' : 
                                 agencyData.verificationStatus === 'rejected' ? 'Account Verification Rejected' :
                                 'Account Not Verified'}
                            </h3>
                            <p className="text-yellow-700 text-sm mt-1">
                                {agencyData.verificationStatus === 'pending' 
                                    ? 'Your agency account is under review by administrators. You have limited access until verification is complete. This usually takes 2-3 business days.'
                                    : agencyData.verificationStatus === 'rejected'
                                    ? 'Your agency verification was rejected. Please contact support for more information.'
                                    : 'Your agency account requires verification. You have limited access until verification is complete.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Reported Issues" count={stats.reported.count} change={stats.reported.change} trend={stats.reported.trend} color={statusColors.reported} icon={FaExclamationTriangle} />
                <StatCard
                    title="Acknowledged"
                    count={stats.acknowledged.count}
                    change={stats.acknowledged.change}
                    trend={stats.acknowledged.trend}
                    color={statusColors.acknowledged}
                    icon={FaCheckCircle}
                />
                <StatCard
                    title="Pending Action"
                    count={stats.pending.count}
                    change={stats.pending.change}
                    trend={stats.pending.trend}
                    color={statusColors.pending}
                    icon={FaClock}
                />
                <StatCard
                    title="Resolved"
                    count={stats.resolved.count}
                    change={stats.resolved.change}
                    trend={stats.resolved.trend}
                    color={statusColors.resolved}
                    icon={FaCheck}
                />
            </div>

            {/* Recent Issues */}
            <div className="bg-white rounded-xl shadow-sm border border-light-gray">
                <div className="p-6 border-b border-light-gray">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-almost-black">Recent Issue Activity</h2>
                        <button className="text-accent2 hover:text-accent font-medium text-sm flex items-center gap-2">
                            <FaEye size={14} />
                            View All Issues
                        </button>
                    </div>
                </div>
                
                <div className="divide-y divide-light-gray">
                    {recentIssues.length === 0 ? (
                        <div className="p-12 text-center">
                            <FaExclamationTriangle className="mx-auto text-4xl text-gray-300 mb-4" />
                            <p className="text-neutral-text">No issues reported yet</p>
                            <p className="text-sm text-gray-400 mt-1">
                                {agencyData.isVerified 
                                    ? 'Issues from citizens will appear here once they are reported.'
                                    : 'Once your agency is verified, citizen-reported issues will appear here.'}
                            </p>
                        </div>
                    ) : recentIssues.map((issue) => {
                        const StatusIcon = getStatusIcon(issue.status);
                        const categoryInfo = getCategoryByName(issue.category) || { name: 'Other', color: '#999' };
                        return (
                            <div key={issue._id} className="p-6 hover:bg-light-gray/30 transition-colors duration-200">
                                <div className="flex items-start gap-4">
                                    {/* Status Indicator */}
                                    <div 
                                        className="w-10 h-10 rounded-full flex items-center justify-center  shrink-0"
                                        style={{ 
                                            backgroundColor: `${statusColors[issue.status as keyof typeof statusColors]}20`,
                                            color: statusColors[issue.status as keyof typeof statusColors]
                                        }}
                                    >
                                        <StatusIcon size={16} />
                                    </div>

                                    {/* Issue Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-almost-black">{issue.title}</h3>
                                                    <span 
                                                        className="px-2 py-1 rounded-full text-xs font-medium"
                                                        style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
                                                    >
                                                        {categoryInfo.name}
                                                    </span>
                                                    <span 
                                                        className="px-2 py-1 rounded-full text-xs font-medium"
                                                        style={{ backgroundColor: `${priorityColors[issue.priority as keyof typeof priorityColors]}20`, color: priorityColors[issue.priority as keyof typeof priorityColors] }}
                                                    >
                                                        {issue.priority}
                                                    </span>
                                                </div>
                                                <p className="text-neutral-text text-sm mb-3 line-clamp-2">
                                                    {issue.description || 'No description provided'}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <FaCalendarAlt size={12} />
                                                        <span>{formatDate(issue.submittedAt || issue.createdAt)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FaMapMarkerAlt size={12} />
                                                        <span>#{issue.trackingNumber ? issue.trackingNumber.split('-')[1] : 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button className="text-accent2 hover:text-accent font-medium text-sm flex items-center gap-1">
                                                    <FaEye size={14} />
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-light-gray p-6">
                <h2 className="text-xl font-semibold text-almost-black mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/dashboard/issues/reported" className="flex items-center gap-3 p-4 border border-light-gray rounded-lg hover:border-accent2 hover:bg-accent2/5 transition-all">
                        <FaExclamationTriangle className="text-accent2" />
                        <div className="text-left">
                            <p className="font-semibold text-almost-black">View All Issues</p>
                            <p className="text-xs text-neutral-text">See all reported issues</p>
                        </div>
                    </Link>
                    <Link href="/dashboard/map" className="flex items-center gap-3 p-4 border border-light-gray rounded-lg hover:border-accent2 hover:bg-accent2/5 transition-all">
                        <FaMapMarkerAlt className="text-accent2" />
                        <div className="text-left">
                            <p className="font-semibold text-almost-black">Issue Map</p>
                            <p className="text-xs text-neutral-text">View issues on map</p>
                        </div>
                    </Link>
                    <Link href="/dashboard/profile" className="flex items-center gap-3 p-4 border border-light-gray rounded-lg hover:border-accent2 hover:bg-accent2/5 transition-all">
                        <FaUser className="text-accent2" />
                        <div className="text-left">
                            <p className="font-semibold text-almost-black">Agency Profile</p>
                            <p className="text-xs text-neutral-text">Update agency information</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
