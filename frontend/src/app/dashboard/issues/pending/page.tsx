"use client";
import { useState } from "react";
import { 
    FaClock, 
    FaMapMarkerAlt, 
    FaCalendarAlt, 
    FaUser, 
    FaSearch,
    FaEye,
    FaEdit,
    FaCheckCircle,
    FaComments,
    FaTools,
    FaExclamationTriangle
} from "react-icons/fa";

// Mock data for pending issues
const mockPendingIssues = [
    {
        id: "ISS-003",
        title: "Road construction blocking traffic",
        description: "Ongoing road construction is causing severe traffic delays. Work crew is on site but progress is slow.",
        status: "pending",
        priority: "high",
        location: "Highway 95, Mile 22",
        coordinates: { lat: 40.7614, lng: -73.9776 },
        reportedBy: {
            name: "Michael Brown",
            email: "michael.brown@email.com",
            phone: "+1-555-0147"
        },
        reportedAt: "2024-01-15T08:30:00Z",
        acknowledgedAt: "2024-01-15T09:15:00Z",
        pendingAt: "2024-01-15T10:30:00Z",
        acknowledgedBy: "Officer Davis",
        assignedTo: "Construction Team Alpha",
        category: "Roads",
        images: ["/images/construction1.jpg", "/images/construction2.jpg"],
        urgency: "high",
        estimatedCompletion: "2024-01-25T17:00:00Z",
        workProgress: 65,
        comments: [
            {
                id: 1,
                author: "Officer Davis",
                message: "Issue acknowledged. Construction team has been notified.",
                timestamp: "2024-01-15T09:15:00Z"
            },
            {
                id: 2,
                author: "Construction Team Alpha",
                message: "Work in progress. Expected completion by end of week.",
                timestamp: "2024-01-15T10:30:00Z"
            },
            {
                id: 3,
                author: "Officer Davis",
                message: "Progress update: 65% complete. Traffic management improved.",
                timestamp: "2024-01-20T14:20:00Z"
            }
        ]
    },
    {
        id: "ISS-007",
        title: "Streetlight maintenance required",
        description: "Multiple streetlights on Elm Street are flickering and need bulb replacement.",
        status: "pending",
        priority: "medium",
        location: "Elm Street, Blocks 1-3",
        coordinates: { lat: 40.7505, lng: -73.9934 },
        reportedBy: {
            name: "Jennifer Lee",
            email: "jennifer.lee@email.com",
            phone: "+1-555-0258"
        },
        reportedAt: "2024-01-14T19:45:00Z",
        acknowledgedAt: "2024-01-15T08:00:00Z",
        pendingAt: "2024-01-15T09:30:00Z",
        acknowledgedBy: "Officer Wilson",
        assignedTo: "Electrical Maintenance Team",
        category: "Infrastructure",
        images: ["/images/streetlight-maintenance1.jpg"],
        urgency: "medium",
        estimatedCompletion: "2024-01-22T16:00:00Z",
        workProgress: 30,
        comments: [
            {
                id: 1,
                author: "Officer Wilson",
                message: "Acknowledged. Electrical team scheduled for maintenance.",
                timestamp: "2024-01-15T08:00:00Z"
            },
            {
                id: 2,
                author: "Electrical Maintenance Team",
                message: "Started work on Block 1. Will proceed to other blocks tomorrow.",
                timestamp: "2024-01-15T09:30:00Z"
            }
        ]
    },
    {
        id: "ISS-010",
        title: "Park playground equipment repair",
        description: "Swing set in children's playground has broken chains and needs immediate repair for safety.",
        status: "pending",
        priority: "high",
        location: "Riverside Park, Playground Area",
        coordinates: { lat: 40.7829, lng: -73.9654 },
        reportedBy: {
            name: "Sarah Martinez",
            email: "sarah.martinez@email.com",
            phone: "+1-555-0369"
        },
        reportedAt: "2024-01-13T11:20:00Z",
        acknowledgedAt: "2024-01-13T12:45:00Z",
        pendingAt: "2024-01-14T08:00:00Z",
        acknowledgedBy: "Officer Thompson",
        assignedTo: "Parks Maintenance Team",
        category: "Parks",
        images: ["/images/playground1.jpg", "/images/playground2.jpg"],
        urgency: "high",
        estimatedCompletion: "2024-01-21T15:00:00Z",
        workProgress: 80,
        comments: [
            {
                id: 1,
                author: "Officer Thompson",
                message: "Safety issue acknowledged. Parks team dispatched immediately.",
                timestamp: "2024-01-13T12:45:00Z"
            },
            {
                id: 2,
                author: "Parks Maintenance Team",
                message: "Equipment ordered. Temporary barriers installed for safety.",
                timestamp: "2024-01-14T08:00:00Z"
            },
            {
                id: 3,
                author: "Parks Maintenance Team",
                message: "New chains installed. Final safety inspection scheduled for tomorrow.",
                timestamp: "2024-01-20T16:30:00Z"
            }
        ]
    }
];

const priorityColors = {
    low: "#10B981",
    medium: "#F59E0B",
    high: "#EF4444"
};

export default function PendingIssuesPage() {
    const [selectedIssue, setSelectedIssue] = useState<typeof mockPendingIssues[0] | null>(mockPendingIssues[0]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPriority, setFilterPriority] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [newComment, setNewComment] = useState("");

    const filteredIssues = mockPendingIssues.filter(issue => {
        const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            issue.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = filterPriority === "all" || issue.priority === filterPriority;
        const matchesCategory = filterCategory === "all" || issue.category === filterCategory;
        
        return matchesSearch && matchesPriority && matchesCategory;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleMarkResolved = (issueId: string) => {
        console.log("Marking issue as resolved:", issueId);
        // Here you would update the issue status to "resolved"
    };

    const handleAddComment = () => {
        if (newComment.trim() && selectedIssue) {
            console.log("Adding comment to issue:", selectedIssue.id, newComment);
            // Here you would add the comment to the issue
            setNewComment("");
        }
    };

    const getProgressColor = (progress: number) => {
        if (progress < 30) return "#EF4444"; // Red
        if (progress < 70) return "#F59E0B"; // Orange
        return "#10B981"; // Green
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-almost-black">Pending Issues</h1>
                    <p className="text-neutral-text mt-1">
                        Issues currently being worked on by assigned teams
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
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
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                    >
                        <option value="all">All Priorities</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>

                    {/* Category Filter */}
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                    >
                        <option value="all">All Categories</option>
                        <option value="Roads">Roads</option>
                        <option value="Infrastructure">Infrastructure</option>
                        <option value="Parks">Parks</option>
                        <option value="Utilities">Utilities</option>
                    </select>
                </div>
            </div>

            {/* Main Content - Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Issues List */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-lg font-semibold text-almost-black">Issues List</h2>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {filteredIssues.map((issue) => (
                            <div
                                key={issue.id}
                                onClick={() => setSelectedIssue(issue)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                                    selectedIssue?.id === issue.id
                                        ? 'border-yellow-500 bg-yellow-50'
                                        : 'border-light-gray hover:border-yellow-300 bg-white'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FaClock className="text-yellow-600" size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-almost-black text-sm truncate">
                                                {issue.title}
                                            </h3>
                                            <span
                                                className="px-2 py-1 text-xs font-medium rounded-full flex-shrink-0"
                                                style={{
                                                    backgroundColor: `${priorityColors[issue.priority as keyof typeof priorityColors]}20`,
                                                    color: priorityColors[issue.priority as keyof typeof priorityColors]
                                                }}
                                            >
                                                {issue.priority}
                                            </span>
                                        </div>
                                        <p className="text-xs text-neutral-text mb-2 line-clamp-2">
                                            {issue.description}
                                        </p>
                                        
                                        {/* Progress Bar */}
                                        <div className="mb-2">
                                            <div className="flex justify-between text-xs text-neutral-text mb-1">
                                                <span>Progress</span>
                                                <span>{issue.workProgress}%</span>
                                            </div>
                                            <div className="w-full bg-light-gray rounded-full h-2">
                                                <div 
                                                    className="h-2 rounded-full transition-all duration-500"
                                                    style={{ 
                                                        backgroundColor: getProgressColor(issue.workProgress),
                                                        width: `${issue.workProgress}%` 
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-neutral-text">
                                            <div className="flex items-center gap-1">
                                                <FaMapMarkerAlt size={10} />
                                                <span className="truncate">{issue.location}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-neutral-text mt-1">
                                            <FaTools size={10} />
                                            <span className="truncate">{issue.assignedTo}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Issue Details */}
                <div className="lg:col-span-2">
                    {selectedIssue ? (
                        <div className="bg-white rounded-xl shadow-sm border border-light-gray">
                            {/* Header */}
                            <div className="p-6 border-b border-light-gray">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                                <FaClock className="text-yellow-600" size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-almost-black">{selectedIssue.title}</h2>
                                                <p className="text-sm text-neutral-text">Issue #{selectedIssue.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span
                                                className="px-3 py-1 text-sm font-medium rounded-full"
                                                style={{
                                                    backgroundColor: `${priorityColors[selectedIssue.priority as keyof typeof priorityColors]}20`,
                                                    color: priorityColors[selectedIssue.priority as keyof typeof priorityColors]
                                                }}
                                            >
                                                {selectedIssue.priority} priority
                                            </span>
                                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                                                {selectedIssue.category}
                                            </span>
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                                                In Progress
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleMarkResolved(selectedIssue.id)}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 text-sm font-medium"
                                        >
                                            Mark as Resolved
                                        </button>
                                        <button className="px-4 py-2 border border-light-gray text-neutral-text rounded-lg hover:border-accent2 hover:text-accent2 transition-colors duration-300 text-sm font-medium">
                                            <FaEdit size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Progress Overview */}
                                <div className="bg-yellow-50 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-almost-black">Work Progress</h3>
                                        <span className="text-lg font-bold text-yellow-700">{selectedIssue.workProgress}%</span>
                                    </div>
                                    <div className="w-full bg-white rounded-full h-3 mb-3">
                                        <div 
                                            className="h-3 rounded-full transition-all duration-500"
                                            style={{ 
                                                backgroundColor: getProgressColor(selectedIssue.workProgress),
                                                width: `${selectedIssue.workProgress}%` 
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-text">Assigned to: {selectedIssue.assignedTo}</span>
                                        <span className="text-neutral-text">
                                            ETA: {formatDate(selectedIssue.estimatedCompletion)}
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="font-semibold text-almost-black mb-3">Description</h3>
                                    <p className="text-neutral-text leading-relaxed">{selectedIssue.description}</p>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-almost-black mb-3">Location Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <FaMapMarkerAlt className="text-neutral-text" size={16} />
                                                <span className="text-neutral-text">{selectedIssue.location}</span>
                                            </div>
                                            <div className="text-sm text-neutral-text">
                                                Coordinates: {selectedIssue.coordinates.lat}, {selectedIssue.coordinates.lng}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-almost-black mb-3">Reporter Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <FaUser className="text-neutral-text" size={16} />
                                                <span className="text-neutral-text">{selectedIssue.reportedBy.name}</span>
                                            </div>
                                            <div className="text-sm text-neutral-text">
                                                Email: {selectedIssue.reportedBy.email}
                                            </div>
                                            <div className="text-sm text-neutral-text">
                                                Phone: {selectedIssue.reportedBy.phone}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div>
                                    <h3 className="font-semibold text-almost-black mb-3">Timeline</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                                <FaExclamationTriangle className="text-white" size={12} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-almost-black">Issue Reported</p>
                                                <p className="text-sm text-neutral-text">{formatDate(selectedIssue.reportedAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                                <FaCheckCircle className="text-white" size={12} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-almost-black">Issue Acknowledged</p>
                                                <p className="text-sm text-neutral-text">{formatDate(selectedIssue.acknowledgedAt)}</p>
                                                <p className="text-xs text-neutral-text">by {selectedIssue.acknowledgedBy}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                                <FaTools className="text-white" size={12} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-almost-black">Work Started</p>
                                                <p className="text-sm text-neutral-text">{formatDate(selectedIssue.pendingAt)}</p>
                                                <p className="text-xs text-neutral-text">by {selectedIssue.assignedTo}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <div>
                                    <h3 className="font-semibold text-almost-black mb-3">Progress Updates & Comments</h3>
                                    <div className="space-y-4">
                                        {selectedIssue.comments.map((comment) => (
                                            <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 bg-accent2 rounded-full flex items-center justify-center">
                                                        <FaUser className="text-white" size={12} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium text-almost-black">{comment.author}</span>
                                                            <span className="text-xs text-neutral-text">
                                                                {formatDate(comment.timestamp)}
                                                            </span>
                                                        </div>
                                                        <p className="text-neutral-text text-sm">{comment.message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add Comment */}
                                        <div className="border-t border-light-gray pt-4">
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 bg-accent2 rounded-full flex items-center justify-center">
                                                    <FaUser className="text-white" size={12} />
                                                </div>
                                                <div className="flex-1">
                                                    <textarea
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        placeholder="Add a progress update or comment..."
                                                        className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2 resize-none"
                                                        rows={3}
                                                    />
                                                    <div className="flex justify-end mt-2">
                                                        <button
                                                            onClick={handleAddComment}
                                                            disabled={!newComment.trim()}
                                                            className="px-4 py-2 bg-accent2 text-white rounded-lg hover:bg-accent transition-colors duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Add Update
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Images */}
                                {selectedIssue.images && selectedIssue.images.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-almost-black mb-3">Attached Images</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {selectedIssue.images.map((image, index) => (
                                                <div key={index} className="aspect-square bg-light-gray rounded-lg flex items-center justify-center">
                                                    <FaEye className="text-neutral-text" size={24} />
                                                    <span className="ml-2 text-sm text-neutral-text">Image {index + 1}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-light-gray p-12 text-center">
                            <FaClock className="mx-auto text-neutral-text mb-4" size={48} />
                            <h3 className="text-lg font-semibold text-almost-black mb-2">Select an Issue</h3>
                            <p className="text-neutral-text">Choose an issue from the list to view its details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
