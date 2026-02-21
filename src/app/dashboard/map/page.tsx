"use client";
import { useState, useEffect } from "react";
import { FaMap, FaMapMarkerAlt, FaFilter, FaSearch, FaEye, FaExclamationTriangle, FaExclamationCircle, FaClock, FaCheck, FaExpand, FaCompress, FaLayerGroup, FaInfoCircle, FaSpinner } from "react-icons/fa";
import dynamicImport from "next/dynamic";
import { Issue as IssueType } from "@/lib/types/api";
import { CATEGORIES } from "@/config/categories";

// Force static generation
export const dynamic = 'force-static';

const statusColors = {
    submitted: "#EB3223", // Changed from 'reported' to 'submitted' to match API
    acknowledged: "#F29D38",
    pending: "#FFFD54",
    resolved: "#75F94C"
};

const statusIcons = {
    submitted: FaExclamationTriangle, // Changed from 'reported' to 'submitted'
    acknowledged: FaExclamationCircle,
    pending: FaClock,
    resolved: FaCheck
};

export default function PublicMapPage() {
    const [issues, setIssues] = useState<any[]>([]);
    const [selectedIssue, setSelectedIssue] = useState<any>(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPriority, setFilterPriority] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showLegend, setShowLegend] = useState(true);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);

    // Fetch categories and issues from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Use the unified categories from the config
                setCategories(CATEGORIES.map(cat => ({ id: cat.name, name: cat.name })));
                
                // Fetch issues using direct fetch
                console.log('Fetching issues from:', '/api/issues?page=1&limit=100');
                const issuesResponse = await fetch('/api/issues?page=1&limit=100');
                
                if (!issuesResponse.ok) {
                    console.error('Issues API response status:', issuesResponse.status);
                    console.error('Issues API response text:', await issuesResponse.text());
                    setIssues([]);
                    return;
                }
                
                const issuesData = await issuesResponse.json();
                console.log('Issues API response:', issuesData);
                
                // Transform API response to match map component format
                const transformedIssues = issuesData.data?.issues?.map((issue: IssueType) => ({
                    id: issue._id,
                    title: issue.title,
                    status: issue.status,
                    priority: issue.priority.toLowerCase(),
                    location: issue.location?.address || 'Unknown Location',
                    coordinates: issue.location?.type === 'Point' 
                        ? { 
                            lat: issue.location.coordinates[1], 
                            lng: issue.location.coordinates[0] 
                        }
                        : { lat: -1.94995, lng: 30.05885 }, // Default Kigali coordinates if no location
                    reportedAt: issue.date || new Date().toISOString(),
                    category: issue.category,
                    description: issue.description || '',
                    trackingNumber: issue.trackingNumber
                })) || [];
                
                setIssues(transformedIssues);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Set empty arrays on error to prevent crashes
                setIssues([]);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredIssues = issues.filter(issue => {
        const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || issue.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || issue.status === filterStatus;
        const matchesPriority = filterPriority === "all" || issue.priority === filterPriority;
        const matchesCategory = filterCategory === "all" || issue.category === filterCategory;
        
        return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status: string) => {
        return statusIcons[status as keyof typeof statusIcons] || FaExclamationTriangle;
    };

    const handleIssueClick = (issue: any) => {
        setSelectedIssue(issue);
    };

    const handleViewDetails = (issueId: string) => {
        const issue = issues.find(i => i.id === issueId);
        if (issue) {
            const statusRoute = issue.status === 'submitted' ? 'reported' : 
                              issue.status === 'acknowledged' ? 'acknowledged' :
                              issue.status === 'pending' ? 'pending' : 'resolved';
            window.open(`/dashboard/issues/${statusRoute}/${issueId}`, '_blank');
        }
    };

    const LeafletMap = dynamicImport(() => import("./LeafletMap"), { 
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent2 mx-auto mb-2"></div>
                    <p className="text-neutral-text">Loading map...</p>
                </div>
            </div>
        )
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-almost-black">Public Issues Map</h1>
                    <p className="text-neutral-text mt-1">Visual overview of all reported issues in your jurisdiction</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowLegend(!showLegend)}
                        className="px-4 py-2 border border-light-gray rounded-lg hover:border-accent2 hover:text-accent2 transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                    >
                        <FaLayerGroup size={14} />
                        {showLegend ? 'Hide' : 'Show'} Legend
                    </button>
                    <button onClick={() => setIsFullscreen(!isFullscreen)}
                        className="px-4 py-2 bg-accent2 text-white rounded-lg hover:bg-accent transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                    >
                        {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
                        {isFullscreen ? 'Exit' : 'Fullscreen'}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-light-gray">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-text" size={16} />
                        <input type="text" placeholder="Search issues on map..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                        />
                    </div>
                    
                    {/* Status Filter */}
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                    >
                        <option value="all">All Status</option>
                        <option value="submitted">Submitted</option>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                    </select>

                    {/* Priority Filter */}
                    <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
                        className="px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                    >
                        <option value="all">All Priorities</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>

                    {/* Category Filter */}
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} disabled={loading}
                        className="px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((category: any) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Map Container */}
            <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'}`}>
                <div className={`grid ${isFullscreen ? 'grid-cols-4' : 'grid-cols-1 lg:grid-cols-4'} gap-6 ${isFullscreen ? 'h-screen p-6' : ''}`}>
                    {/* Map Area */}
                    <div className={`${isFullscreen ? 'col-span-3' : 'col-span-1 lg:col-span-3'} bg-white rounded-xl shadow-sm border border-light-gray overflow-hidden`}>
                        {/* Map Header */}
                        <div className="p-4 border-b border-light-gray flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FaMap className="text-accent2" size={20} />
                                <h3 className="font-semibold text-almost-black">Issues Map View</h3>
                                <span className="px-2 py-1 bg-accent2/10 text-accent2 text-xs font-medium rounded-full">
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <FaSpinner className="animate-spin" size={10} />
                                            Loading...
                                        </span>
                                    ) : (
                                        `${filteredIssues.length} issues`
                                    )}
                                </span>
                            </div>
                            {isFullscreen && (
                                <button onClick={() => setIsFullscreen(false)}
                                    className="p-2 text-neutral-text hover:text-accent2 transition-colors"
                                >
                                    <FaCompress size={16} />
                                </button>
                            )}
                        </div>

                        {/* Leaflet Map */}
                        <div className={`relative ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96 lg:h-[500px]'}`}>
                            {loading ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <div className="text-center">
                                        <FaSpinner className="animate-spin text-accent2 text-4xl mb-4 mx-auto" />
                                        <p className="text-neutral-text">Loading issues on map...</p>
                                    </div>
                                </div>
                            ) : (
                                <LeafletMap issues={filteredIssues} statusColors={statusColors} statusIcons={statusIcons} onIssueClick={handleIssueClick} center={[-1.94995, 30.05885]} zoom={13} />
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className={`${isFullscreen ? 'col-span-1' : 'col-span-1 lg:col-span-1'} space-y-4`}>
                        {/* Legend */}
                        {showLegend && (
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-light-gray">
                                <h3 className="font-semibold text-almost-black mb-3">Map Legend</h3>
                                <div className="space-y-3">
                                    {Object.entries(statusColors).map(([status, color]) => {
                                        const StatusIcon = getStatusIcon(status);
                                        return (
                                            <div key={status} className="flex items-center gap-3">
                                                <div style={{ backgroundColor: color }}
                                                    className="w-6 h-6 rounded-full border border-white shadow-sm flex items-center justify-center"
                                                >
                                                    <StatusIcon className="text-white" size={12} />
                                                </div>
                                                <span className="text-sm text-neutral-text capitalize">{status}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Statistics */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-light-gray">
                            <h3 className="font-semibold text-almost-black mb-3">Map Statistics</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-neutral-text">Total Issues</span>
                                    <span className="font-medium">{filteredIssues.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-neutral-text">High Priority</span>
                                    <span className="font-medium text-red-600">{filteredIssues.filter(i => i.priority === 'high').length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-neutral-text">In Progress</span>
                                    <span className="font-medium text-yellow-600">{filteredIssues.filter(i => i.status === 'pending').length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-neutral-text">Resolved</span>
                                    <span className="font-medium text-green-600">{filteredIssues.filter(i => i.status === 'resolved').length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Issues List */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-light-gray">
                            <h3 className="font-semibold text-almost-black mb-3">Recent Issues</h3>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {filteredIssues.slice(0, 5).map((issue) => {
                                    const StatusIcon = getStatusIcon(issue.status);
                                    return (
                                        <div key={issue.id} onClick={() => handleIssueClick(issue)}
                                            className="p-3 rounded-lg hover:bg-light-gray/50 cursor-pointer transition-colors duration-200"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center  shrink-0"
                                                    style={{ backgroundColor: `${statusColors[issue.status as keyof typeof statusColors]}20` }}
                                                >
                                                    <StatusIcon className="text-current" size={12}
                                                        style={{ color: statusColors[issue.status as keyof typeof statusColors] }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm text-almost-black truncate">{issue.title}</h4>
                                                    <p className="text-xs text-neutral-text truncate">{issue.location}</p>
                                                    <p className="text-xs text-neutral-text">{formatDate(issue.reportedAt)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}