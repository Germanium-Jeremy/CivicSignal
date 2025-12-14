"use client";
import { useState, useEffect } from "react";
import { agencyAPI } from "@/lib/api";
import { getCategoryById } from "@/config/issueCategories";
import { 
    FaCheck, 
    FaMapMarkerAlt, 
    FaCalendarAlt, 
    FaUser, 
    FaSearch,
    FaEye,
    FaCheckCircle,
    FaComments,
    FaTools,
    FaExclamationTriangle,
    FaClock,
    FaStar,
    FaThumbsUp
} from "react-icons/fa";

interface Issue {
    _id: string;
    title: string;
    description?: string;
    category: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'submitted' | 'acknowledged' | 'pending' | 'resolved';
    submittedAt: string;
    createdAt: string;
    trackingNumber: string;
}

export default function ResolvedIssuesPage() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');

    useEffect(() => {
        fetchResolvedIssues();
    }, []);

    const fetchResolvedIssues = async () => {
        try {
            const response = await agencyAPI.getIssues({ 
                status: 'resolved',
                page: 1, 
                limit: 50 
            });
            
            if (response.success) {
                setIssues(response.data?.issues || []);
            }
        } catch (error) {
            console.error('Error fetching resolved issues:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredIssues = issues.filter(issue => {
        const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (issue.description && issue.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesPriority = selectedPriority === 'all' || issue.priority.toLowerCase() === selectedPriority.toLowerCase();
        const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
        
        return matchesSearch && matchesPriority && matchesCategory;
    });

    const priorityColors = {
        low: "#10B981",
        medium: "#F59E0B",
        high: "#EF4444"
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-accent2/30 border-t-accent2 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-almost-black">Resolved Issues</h1>
                    <p className="text-neutral-text mt-1">
                        Issues that have been successfully completed and resolved
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {filteredIssues.length} Issues
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-light-gray">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-text" size={16} />
                        <input
                            type="text"
                            placeholder="Search issues..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                        />
                    </div>
                    
                    {/* Priority Filter */}
                    <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                    >
                        <option value="all">All Priorities</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                    >
                        <option value="all">All Categories</option>
                        <option value="Infrastructure">Infrastructure</option>
                        <option value="Roads">Roads</option>
                        <option value="Parks">Parks</option>
                        <option value="Utilities">Utilities</option>
                    </select>
                </div>
            </div>

            {/* Issues List */}
            <div className="bg-white rounded-xl shadow-sm border border-light-gray">
                <div className="p-6 border-b border-light-gray">
                    <h2 className="text-lg font-semibold text-almost-black">Resolved Issues</h2>
                </div>
                <div className="divide-y divide-light-gray">
                    {filteredIssues.map((issue) => {
                        const categoryInfo = getCategoryById(issue.category) || { name: 'Other', color: '#999' };
                        return (
                            <div key={issue._id} className="p-6 hover:bg-light-gray/30 transition-colors">
                                <div className="flex items-start gap-4">
                                    {/* Status Indicator */}
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                        <FaCheckCircle className="text-green-600" size={16} />
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
                                                        style={{ backgroundColor: `${priorityColors[issue.priority.toLowerCase() as keyof typeof priorityColors]}20`, color: priorityColors[issue.priority.toLowerCase() as keyof typeof priorityColors] }}
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
                                                        <span className="text-xs font-medium text-accent2">
                                                            #{issue.trackingNumber ? issue.trackingNumber.split('-')[1] : 'N/A'}
                                                        </span>
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
                    {filteredIssues.length === 0 && (
                        <div className="p-12 text-center">
                            <FaCheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                            <p className="text-neutral-text">No resolved issues found</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Issues that have been successfully completed will appear here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
