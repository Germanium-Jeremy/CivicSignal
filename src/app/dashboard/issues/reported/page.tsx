"use client";
import { useState, useEffect } from "react";
import { agencyAPI } from "@/lib/api";
import { getCategoryByName, CATEGORIES } from "@/config/categories";
import { 
    FaExclamationTriangle, 
    FaMapMarkerAlt, 
    FaCalendarAlt, 
    FaUser, 
    FaFilter,
    FaSearch,
    FaEye,
    FaEdit,
    FaClock
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

export default function ReportedIssuesPage() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginationData, setPaginationData] = useState({
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
    });

    // State for status change modal
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [newStatus, setNewStatus] = useState<'submitted' | 'acknowledged' | 'pending' | 'resolved'>('submitted');
    const [statusComment, setStatusComment] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    useEffect(() => {
        fetchReportedIssues();
    }, [page, itemsPerPage]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, selectedCategory, selectedPriority, itemsPerPage]);

    const fetchReportedIssues = async () => {
        try {
            const response = await agencyAPI.getIssues({ 
                status: 'submitted',
                page,
                limit: itemsPerPage
            });
            
            if (response.success) {
                const issueList = response.data?.issues ?? [];
                const pagination = response.data?.pagination ?? {
                    page: 1,
                    limit: itemsPerPage,
                    total: 0,
                    totalPages: 0,
                };
                setIssues(issueList);
                setPaginationData({
                    total: pagination.total,
                    totalPages: pagination.totalPages,
                    page: pagination.page,
                    limit: pagination.limit,
                });
            } else {
                console.error('Failed to fetch reported issues:', response.error);
            }
        } catch (error) {
            console.error('Error fetching reported issues:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle status change
    const handleStatusChange = (issue: Issue) => {
        setSelectedIssue(issue);
        setNewStatus(issue.status as 'submitted' | 'acknowledged' | 'pending' | 'resolved');
        setStatusComment('');
        setStatusModalOpen(true);
    };

    // Update issue status with comment
    const updateIssueStatus = async () => {
        if (!selectedIssue || !newStatus) return;

        setIsUpdatingStatus(true);
        try {
            const response = await agencyAPI.updateIssueStatus(selectedIssue._id, newStatus, statusComment);
            if (response.success) {
                // Update the issue in the local state
                setIssues(issues.map(issue => 
                    issue._id === selectedIssue._id 
                        ? { ...issue, status: newStatus }
                        : issue
                ));
                setStatusModalOpen(false);
                setSelectedIssue(null);
                setStatusComment('');
                setNewStatus('submitted');
            }
        } catch (error) {
            console.error('Error updating issue status:', error);
        } finally {
            setIsUpdatingStatus(false);
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
                    <h1 className="text-2xl md:text-3xl font-bold text-almost-black">Reported Issues</h1>
                    <p className="text-neutral-text mt-1">New issues reported by citizens that require acknowledgment</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        {paginationData.total} {paginationData.total === 1 ? 'Issue' : 'Issues'}
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
                        {CATEGORIES.map((category) => (
                            <option key={category.name} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Content - Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Issues List */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-lg font-semibold text-almost-black">Issues List</h2>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {filteredIssues.map((issue) => {
                            const categoryInfo = getCategoryByName(issue.category) || { name: 'Other', color: '#999' };
                            return (
                                <div
                                    key={issue._id}
                                    onClick={() => setActiveIssue(issue)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${activeIssue?._id === issue._id ? 'border-accent2' : 'border-light-gray hover:border-red-300'} bg-white`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-almost-black text-sm mb-1 line-clamp-2">
                                                {issue.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mb-2">
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
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <FaCalendarAlt size={10} />
                                                <span>{formatDate(issue.submittedAt || issue.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-medium text-accent2">
                                                #{issue.trackingNumber ? issue.trackingNumber.split('-')[1] : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredIssues.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                <p className="text-sm">No reported issues found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Issue Details */}
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-semibold text-almost-black mb-4">Issue Details</h2>
                    {activeIssue ? (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-light-gray">
                            <div className="space-y-6">
                                {/* Issue Header */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-almost-black mb-2">{activeIssue.title}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                                #{activeIssue.trackingNumber ? activeIssue.trackingNumber.split('-')[1] : 'N/A'}
                                            </span>
                                            <span 
                                                className="px-3 py-1 rounded-full text-sm font-medium"
                                                style={{ backgroundColor: `${priorityColors[activeIssue.priority.toLowerCase() as keyof typeof priorityColors]}20`, color: priorityColors[activeIssue.priority.toLowerCase() as keyof typeof priorityColors] }}
                                            >
                                                {activeIssue.priority} Priority
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleStatusChange(activeIssue)}
                                            className="px-4 py-2 bg-accent2 text-white rounded-lg hover:bg-accent2/90 transition-colors flex items-center gap-2"
                                        >
                                            <FaEdit size={14} />
                                            Change Status
                                        </button>
                                    </div>
                                </div>

                                {/* Issue Description */}
                                <div>
                                    <h4 className="font-semibold text-almost-black mb-2">Description</h4>
                                    <p className="text-neutral-text">
                                        {activeIssue.description || 'No description provided'}
                                    </p>
                                </div>

                                {/* Issue Metadata */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold text-almost-black mb-2">Submitted</h4>
                                        <p className="text-neutral-text text-sm">
                                            {formatDate(activeIssue.submittedAt || activeIssue.createdAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-almost-black mb-2">Category</h4>
                                        <p className="text-neutral-text text-sm">
                                            {getCategoryByName(activeIssue.category)?.name || 'Other'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-12 shadow-sm border border-light-gray text-center">
                            <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                            <p className="text-neutral-text">Select an issue to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Change Modal */}
            {statusModalOpen && selectedIssue && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-xl font-bold text-almost-black mb-4">Change Issue Status</h3>
                        
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Issue: <span className="font-medium">{selectedIssue.title}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                                Current Status: <span className="font-medium capitalize">{selectedIssue.status}</span>
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-almost-black mb-2">New Status</label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value as any)}
                                className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                            >
                                <option value="submitted">Submitted</option>
                                <option value="acknowledged">Acknowledged</option>
                                <option value="pending">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-almost-black mb-2">
                                Comment (optional)
                            </label>
                            <textarea
                                value={statusComment}
                                onChange={(e) => setStatusComment(e.target.value)}
                                placeholder="Add a comment about this status change..."
                                className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2 resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStatusModalOpen(false)}
                                className="flex-1 px-4 py-2 border border-light-gray text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateIssueStatus}
                                disabled={isUpdatingStatus || newStatus === selectedIssue.status}
                                className="flex-1 px-4 py-2 bg-accent2 text-white rounded-lg hover:bg-accent2/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
