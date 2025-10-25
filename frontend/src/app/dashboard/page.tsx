"use client";
import { useState } from "react";
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaCheck, FaArrowUp, FaArrowDown, FaEye, FaCalendarAlt, FaMapMarkerAlt, FaUser} from "react-icons/fa";

// Mock data - replace with actual API calls
const mockAgencyData = {
    name: "City Municipal Corporation",
    logo: "/images/pin.png",
    isVerified: false, // Change to true to see verified state
    notifications: 5
};

const mockStats = {
    reported: { count: 45, change: 12, trend: "up" },
    acknowledged: { count: 23, change: -5, trend: "down" },
    pending: { count: 18, change: 3, trend: "up" },
    resolved: { count: 156, change: 28, trend: "up" }
};

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

export default function DashboardHome() {
    const [timeRange, setTimeRange] = useState("7d");

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

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-almost-black">Dashboard Overview</h1>
                    <p className="text-neutral-text mt-1">
                        Welcome back! Here's what's happening in your jurisdiction.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select 
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
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
            {!mockAgencyData.isVerified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FaExclamationTriangle className="text-white text-xs" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-yellow-800">Account Verification Pending</h3>
                            <p className="text-yellow-700 text-sm mt-1">
                                Your agency account is under review. You have limited access until verification is complete. 
                                This usually takes 2-3 business days.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Reported Issues"
                    count={mockStats.reported.count}
                    change={mockStats.reported.change}
                    trend={mockStats.reported.trend}
                    color={statusColors.reported}
                    icon={FaExclamationTriangle}
                />
                <StatCard
                    title="Acknowledged"
                    count={mockStats.acknowledged.count}
                    change={mockStats.acknowledged.change}
                    trend={mockStats.acknowledged.trend}
                    color={statusColors.acknowledged}
                    icon={FaCheckCircle}
                />
                <StatCard
                    title="Pending Action"
                    count={mockStats.pending.count}
                    change={mockStats.pending.change}
                    trend={mockStats.pending.trend}
                    color={statusColors.pending}
                    icon={FaClock}
                />
                <StatCard
                    title="Resolved"
                    count={mockStats.resolved.count}
                    change={mockStats.resolved.change}
                    trend={mockStats.resolved.trend}
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
                    {mockRecentIssues.map((issue) => {
                        const StatusIcon = getStatusIcon(issue.status);
                        return (
                            <div key={issue.id} className="p-6 hover:bg-light-gray/30 transition-colors duration-200">
                                <div className="flex items-start gap-4">
                                    {/* Status Indicator */}
                                    <div 
                                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
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
                                                    <span className="text-xs text-neutral-text">#{issue.id}</span>
                                                    <span 
                                                        className="px-2 py-1 text-xs font-medium rounded-full"
                                                        style={{
                                                            backgroundColor: `${priorityColors[issue.priority as keyof typeof priorityColors]}20`,
                                                            color: priorityColors[issue.priority as keyof typeof priorityColors]
                                                        }}
                                                    >
                                                        {issue.priority} priority
                                                    </span>
                                                </div>
                                                <p className="text-sm text-neutral-text mb-3 line-clamp-2">
                                                    {issue.description}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-text">
                                                    <div className="flex items-center gap-1">
                                                        <FaMapMarkerAlt size={10} />
                                                        <span>{issue.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FaUser size={10} />
                                                        <span>{mockAgencyData.isVerified ? issue.reportedBy : 'Citizen'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FaCalendarAlt size={10} />
                                                        <span>{formatDate(issue.reportedAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="text-accent2 hover:text-accent text-sm font-medium whitespace-nowrap">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-light-gray">
                    <h3 className="font-semibold text-almost-black mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full text-left p-3 rounded-lg hover:bg-accent2/5 hover:text-accent2 transition-colors duration-200">
                            View All Reported Issues
                        </button>
                        <button className="w-full text-left p-3 rounded-lg hover:bg-accent2/5 hover:text-accent2 transition-colors duration-200">
                            Update Issue Status
                        </button>
                        <button className="w-full text-left p-3 rounded-lg hover:bg-accent2/5 hover:text-accent2 transition-colors duration-200">
                            Generate Reports
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-light-gray">
                    <h3 className="font-semibold text-almost-black mb-4">Performance</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-neutral-text">Response Time</span>
                                <span className="font-medium">2.3 hrs avg</span>
                            </div>
                            <div className="w-full bg-light-gray rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-neutral-text">Resolution Rate</span>
                                <span className="font-medium">87%</span>
                            </div>
                            <div className="w-full bg-light-gray rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-light-gray">
                    <h3 className="font-semibold text-almost-black mb-4">System Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-text">API Status</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-green-600">Online</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-text">Database</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-green-600">Healthy</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-text">Last Sync</span>
                            <span className="text-sm font-medium">2 min ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
