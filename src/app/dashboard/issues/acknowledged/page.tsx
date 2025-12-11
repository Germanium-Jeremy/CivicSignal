"use client";
import { useState } from "react";
import { 
    FaExclamationCircle, 
    FaMapMarkerAlt, 
    FaCalendarAlt, 
    FaUser, 
    FaSearch,
    FaEye,
    FaEdit,
    FaClock,
    FaCheckCircle,
    FaComments
} from "react-icons/fa";

// Mock data for acknowledged issues
const mockAcknowledgedIssues = [
    {
        id: "ISS-002",
        title: "Water leak in residential area",
        description: "Water main leak causing flooding in the street. Emergency repair team has been notified.",
        status: "acknowledged",
        priority: "high",
        location: "Oak Avenue, House #45",
        coordinates: { lat: 40.7282, lng: -74.0776 },
        reportedBy: {
            name: "Lisa Chen",
            email: "lisa.chen@email.com",
            phone: "+1-555-0321"
        },
        reportedAt: "2024-01-18T09:20:00Z",
        acknowledgedAt: "2024-01-18T11:45:00Z",
        acknowledgedBy: "Officer Johnson",
        category: "Utilities",
        images: ["/images/water-leak1.jpg", "/images/water-leak2.jpg"],
        urgency: "high",
        comments: [
            {
                id: 1,
                author: "Officer Johnson",
                message: "Issue acknowledged. Water department has been contacted for emergency repair.",
                timestamp: "2024-01-18T11:45:00Z"
            }
        ]
    },
    {
        id: "ISS-006",
        title: "Damaged traffic signal",
        description: "Traffic light at Main St intersection is not functioning properly, causing traffic delays.",
        status: "acknowledged",
        priority: "high",
        location: "Main Street & 5th Avenue",
        coordinates: { lat: 40.7505, lng: -73.9934 },
        reportedBy: {
            name: "Robert Davis",
            email: "robert.davis@email.com",
            phone: "+1-555-0654"
        },
        reportedAt: "2024-01-17T16:30:00Z",
        acknowledgedAt: "2024-01-17T18:15:00Z",
        acknowledgedBy: "Officer Smith",
        category: "Traffic",
        images: ["/images/traffic-light1.jpg"],
        urgency: "high",
        comments: [
            {
                id: 1,
                author: "Officer Smith",
                message: "Acknowledged. Traffic control team dispatched to assess the situation.",
                timestamp: "2024-01-17T18:15:00Z"
            }
        ]
    },
    {
        id: "ISS-008",
        title: "Broken park bench",
        description: "Park bench in Central Park is broken and needs repair or replacement.",
        status: "acknowledged",
        priority: "medium",
        location: "Central Park, Section B",
        coordinates: { lat: 40.7829, lng: -73.9654 },
        reportedBy: {
            name: "Emma Wilson",
            email: "emma.wilson@email.com",
            phone: "+1-555-0987"
        },
        reportedAt: "2024-01-16T14:20:00Z",
        acknowledgedAt: "2024-01-16T16:30:00Z",
        acknowledgedBy: "Officer Brown",
        category: "Parks",
        images: ["/images/bench1.jpg"],
        urgency: "medium",
        comments: [
            {
                id: 1,
                author: "Officer Brown",
                message: "Issue acknowledged. Parks maintenance team will schedule repair within 48 hours.",
                timestamp: "2024-01-16T16:30:00Z"
            }
        ]
    }
];

const priorityColors = {
    low: "#10B981",
    medium: "#F59E0B",
    high: "#EF4444"
};

export default function AcknowledgedIssuesPage() {
    const [selectedIssue, setSelectedIssue] = useState<typeof mockAcknowledgedIssues[0] | null>(mockAcknowledgedIssues[0]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPriority, setFilterPriority] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [newComment, setNewComment] = useState("");

    const filteredIssues = mockAcknowledgedIssues.filter(issue => {
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

    const handleMarkPending = (issueId: string) => {
        console.log("Marking issue as pending:", issueId);
        // Here you would update the issue status to "pending"
    };

    const handleAddComment = () => {
        if (newComment.trim() && selectedIssue) {
            console.log("Adding comment to issue:", selectedIssue.id, newComment);
            // Here you would add the comment to the issue
            setNewComment("");
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-almost-black">Acknowledged Issues</h1>
                    <p className="text-neutral-text mt-1">
                        Issues that have been acknowledged and are awaiting action
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
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
                        <option value="Utilities">Utilities</option>
                        <option value="Traffic">Traffic</option>
                        <option value="Parks">Parks</option>
                        <option value="Infrastructure">Infrastructure</option>
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
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-light-gray hover:border-orange-300 bg-white'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center  shrink-0">
                                        <FaExclamationCircle className="text-orange-600" size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-almost-black text-sm truncate">
                                                {issue.title}
                                            </h3>
                                            <span
                                                className="px-2 py-1 text-xs font-medium rounded-full  shrink-0"
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
                                        <div className="flex items-center gap-3 text-xs text-neutral-text">
                                            <div className="flex items-center gap-1">
                                                <FaMapMarkerAlt size={10} />
                                                <span className="truncate">{issue.location}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-neutral-text mt-1">
                                            <FaCalendarAlt size={10} />
                                            <span>{new Date(issue.acknowledgedAt).toLocaleDateString()}</span>
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
                                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                                <FaExclamationCircle className="text-orange-600" size={20} />
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
                                            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                                                Acknowledged
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleMarkPending(selectedIssue.id)}
                                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-300 text-sm font-medium"
                                        >
                                            Mark as Pending
                                        </button>
                                        <button className="px-4 py-2 border border-light-gray text-neutral-text rounded-lg hover:border-accent2 hover:text-accent2 transition-colors duration-300 text-sm font-medium">
                                            <FaEdit size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
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
                                                <FaExclamationCircle className="text-white" size={12} />
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
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <div>
                                    <h3 className="font-semibold text-almost-black mb-3">Comments & Updates</h3>
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
                                                        placeholder="Add a comment or update..."
                                                        className="w-full p-3 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2 resize-none"
                                                        rows={3}
                                                    />
                                                    <div className="flex justify-end mt-2">
                                                        <button
                                                            onClick={handleAddComment}
                                                            disabled={!newComment.trim()}
                                                            className="px-4 py-2 bg-accent2 text-white rounded-lg hover:bg-accent transition-colors duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Add Comment
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
                            <FaExclamationCircle className="mx-auto text-neutral-text mb-4" size={48} />
                            <h3 className="text-lg font-semibold text-almost-black mb-2">Select an Issue</h3>
                            <p className="text-neutral-text">Choose an issue from the list to view its details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
