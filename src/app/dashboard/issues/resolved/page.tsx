"use client";
import { useState } from "react";
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

// Mock data for resolved issues
const mockResolvedIssues = [
    {
        id: "ISS-004",
        title: "Graffiti removal needed",
        description: "Graffiti on public property has been successfully cleaned and removed.",
        status: "resolved",
        priority: "low",
        location: "Park Avenue Bridge",
        coordinates: { lat: 40.7505, lng: -73.9934 },
        reportedBy: {
            name: "Lisa Chen",
            email: "lisa.chen@email.com",
            phone: "+1-555-0321"
        },
        reportedAt: "2024-01-15T16:45:00Z",
        acknowledgedAt: "2024-01-16T08:30:00Z",
        pendingAt: "2024-01-16T10:00:00Z",
        resolvedAt: "2024-01-17T14:30:00Z",
        acknowledgedBy: "Officer Martinez",
        assignedTo: "Cleaning Crew Beta",
        resolvedBy: "Cleaning Crew Beta",
        category: "Vandalism",
        images: ["/images/graffiti-before.jpg", "/images/graffiti-after.jpg"],
        urgency: "low",
        resolutionTime: "25 hours",
        citizenRating: 5,
        citizenFeedback: "Excellent work! The bridge looks great now. Thank you for the quick response.",
        comments: [
            {
                id: 1,
                author: "Officer Martinez",
                message: "Issue acknowledged. Cleaning crew scheduled for tomorrow morning.",
                timestamp: "2024-01-16T08:30:00Z"
            },
            {
                id: 2,
                author: "Cleaning Crew Beta",
                message: "Started graffiti removal process. Using eco-friendly cleaning solutions.",
                timestamp: "2024-01-16T10:00:00Z"
            },
            {
                id: 3,
                author: "Cleaning Crew Beta",
                message: "Graffiti successfully removed. Area cleaned and restored to original condition.",
                timestamp: "2024-01-17T14:30:00Z"
            }
        ]
    },
    {
        id: "ISS-011",
        title: "Pothole repair completed",
        description: "Large pothole on residential street has been filled and road surface restored.",
        status: "resolved",
        priority: "medium",
        location: "Oak Street, Block 5",
        coordinates: { lat: 40.7282, lng: -74.0776 },
        reportedBy: {
            name: "David Wilson",
            email: "david.wilson@email.com",
            phone: "+1-555-0456"
        },
        reportedAt: "2024-01-12T09:15:00Z",
        acknowledgedAt: "2024-01-12T11:00:00Z",
        pendingAt: "2024-01-13T08:00:00Z",
        resolvedAt: "2024-01-14T16:45:00Z",
        acknowledgedBy: "Officer Johnson",
        assignedTo: "Road Maintenance Team",
        resolvedBy: "Road Maintenance Team",
        category: "Roads",
        images: ["/images/pothole-before.jpg", "/images/pothole-after.jpg"],
        urgency: "medium",
        resolutionTime: "55 hours",
        citizenRating: 4,
        citizenFeedback: "Good job on the repair. Road is much smoother now.",
        comments: [
            {
                id: 1,
                author: "Officer Johnson",
                message: "Pothole reported and verified. Road crew dispatched for repair.",
                timestamp: "2024-01-12T11:00:00Z"
            },
            {
                id: 2,
                author: "Road Maintenance Team",
                message: "Pothole filled with hot asphalt. Road surface leveled and compacted.",
                timestamp: "2024-01-13T08:00:00Z"
            },
            {
                id: 3,
                author: "Road Maintenance Team",
                message: "Repair completed. Road markings restored. Quality check passed.",
                timestamp: "2024-01-14T16:45:00Z"
            }
        ]
    },
    {
        id: "ISS-012",
        title: "Broken water fountain fixed",
        description: "Public water fountain in Central Park has been repaired and is now fully functional.",
        status: "resolved",
        priority: "medium",
        location: "Central Park, Main Entrance",
        coordinates: { lat: 40.7829, lng: -73.9654 },
        reportedBy: {
            name: "Maria Rodriguez",
            email: "maria.rodriguez@email.com",
            phone: "+1-555-0789"
        },
        reportedAt: "2024-01-10T13:20:00Z",
        acknowledgedAt: "2024-01-10T15:45:00Z",
        pendingAt: "2024-01-11T09:30:00Z",
        resolvedAt: "2024-01-12T11:15:00Z",
        acknowledgedBy: "Officer Brown",
        assignedTo: "Parks Maintenance Team",
        resolvedBy: "Parks Maintenance Team",
        category: "Parks",
        images: ["/images/fountain-repair1.jpg", "/images/fountain-repair2.jpg"],
        urgency: "medium",
        resolutionTime: "46 hours",
        citizenRating: 5,
        citizenFeedback: "Perfect! The fountain works great and the water pressure is excellent. My kids love it!",
        comments: [
            {
                id: 1,
                author: "Officer Brown",
                message: "Water fountain issue confirmed. Parks team will investigate tomorrow.",
                timestamp: "2024-01-10T15:45:00Z"
            },
            {
                id: 2,
                author: "Parks Maintenance Team",
                message: "Diagnosed issue: clogged filter and faulty pressure valve. Parts ordered.",
                timestamp: "2024-01-11T09:30:00Z"
            },
            {
                id: 3,
                author: "Parks Maintenance Team",
                message: "New parts installed. Water fountain tested and working perfectly.",
                timestamp: "2024-01-12T11:15:00Z"
            }
        ]
    }
];

const priorityColors = {
    low: "#10B981",
    medium: "#F59E0B",
    high: "#EF4444"
};

export default function ResolvedIssuesPage() {
    const [selectedIssue, setSelectedIssue] = useState<typeof mockResolvedIssues[0] | null>(mockResolvedIssues[0]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPriority, setFilterPriority] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterRating, setFilterRating] = useState("all");

    const filteredIssues = mockResolvedIssues.filter(issue => {
        const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            issue.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = filterPriority === "all" || issue.priority === filterPriority;
        const matchesCategory = filterCategory === "all" || issue.category === filterCategory;
        const matchesRating = filterRating === "all" || 
                            (filterRating === "high" && issue.citizenRating >= 4) ||
                            (filterRating === "low" && issue.citizenRating < 4);
        
        return matchesSearch && matchesPriority && matchesCategory && matchesRating;
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

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <FaStar
                key={index}
                className={index < rating ? "text-yellow-400" : "text-gray-300"}
                size={14}
            />
        ));
    };

    const getResolutionTimeColor = (time: string) => {
        const hours = parseInt(time);
        if (hours <= 24) return "text-green-600";
        if (hours <= 48) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-almost-black">Resolved Issues</h1>
                    <p className="text-neutral-text mt-1">
                        Successfully completed issues with citizen feedback
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {filteredIssues.length} Issues
                    </span>
                    <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" size={16} />
                        <span className="text-sm font-medium">
                            {(filteredIssues.reduce((sum, issue) => sum + issue.citizenRating, 0) / filteredIssues.length).toFixed(1)} avg
                        </span>
                    </div>
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
                        <option value="Vandalism">Vandalism</option>
                        <option value="Roads">Roads</option>
                        <option value="Parks">Parks</option>
                        <option value="Infrastructure">Infrastructure</option>
                    </select>

                    {/* Rating Filter */}
                    <select
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value)}
                        className="px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                    >
                        <option value="all">All Ratings</option>
                        <option value="high">High Rated (4-5★)</option>
                        <option value="low">Low Rated (1-3★)</option>
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
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-light-gray hover:border-green-300 bg-white'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                        <FaCheck className="text-green-600" size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-almost-black text-sm truncate">
                                                {issue.title}
                                            </h3>
                                            <span
                                                className="px-2 py-1 text-xs font-medium rounded-full shrink-0"
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
                                        
                                        {/* Rating */}
                                        <div className="flex items-center gap-1 mb-2">
                                            {renderStars(issue.citizenRating)}
                                            <span className="text-xs text-neutral-text ml-1">
                                                ({issue.citizenRating}/5)
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-neutral-text">
                                            <div className="flex items-center gap-1">
                                                <FaMapMarkerAlt size={10} />
                                                <span className="truncate">{issue.location}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-neutral-text mt-1">
                                            <FaCalendarAlt size={10} />
                                            <span>{new Date(issue.resolvedAt).toLocaleDateString()}</span>
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
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                                <FaCheck className="text-green-600" size={20} />
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
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                                                ✓ Resolved
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 mb-2">
                                            {renderStars(selectedIssue.citizenRating)}
                                        </div>
                                        <p className="text-sm text-neutral-text">
                                            Resolved in <span className={`font-medium ${getResolutionTimeColor(selectedIssue.resolutionTime)}`}>
                                                {selectedIssue.resolutionTime}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Resolution Summary */}
                                <div className="bg-green-50 rounded-xl p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                            <FaThumbsUp className="text-white" size={14} />
                                        </div>
                                        <h3 className="font-semibold text-almost-black">Resolution Summary</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-neutral-text">Resolved by:</span>
                                            <p className="font-medium text-almost-black">{selectedIssue.resolvedBy}</p>
                                        </div>
                                        <div>
                                            <span className="text-neutral-text">Resolution time:</span>
                                            <p className={`font-medium ${getResolutionTimeColor(selectedIssue.resolutionTime)}`}>
                                                {selectedIssue.resolutionTime}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-neutral-text">Completed on:</span>
                                            <p className="font-medium text-almost-black">
                                                {new Date(selectedIssue.resolvedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Citizen Feedback */}
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                            <FaComments className="text-white" size={14} />
                                        </div>
                                        <h3 className="font-semibold text-almost-black">Citizen Feedback</h3>
                                        <div className="flex items-center gap-1 ml-auto">
                                            {renderStars(selectedIssue.citizenRating)}
                                            <span className="text-sm font-medium ml-1">
                                                {selectedIssue.citizenRating}/5
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-neutral-text italic">"{selectedIssue.citizenFeedback}"</p>
                                    <p className="text-sm text-neutral-text mt-2">
                                        - {selectedIssue.reportedBy.name}
                                    </p>
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
                                    <h3 className="font-semibold text-almost-black mb-3">Complete Timeline</h3>
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
                                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                <FaCheck className="text-white" size={12} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-almost-black">Issue Resolved</p>
                                                <p className="text-sm text-neutral-text">{formatDate(selectedIssue.resolvedAt)}</p>
                                                <p className="text-xs text-neutral-text">by {selectedIssue.resolvedBy}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <div>
                                    <h3 className="font-semibold text-almost-black mb-3">Resolution Progress</h3>
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
                                    </div>
                                </div>

                                {/* Before/After Images */}
                                {selectedIssue.images && selectedIssue.images.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-almost-black mb-3">Before & After</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedIssue.images.map((image, index) => (
                                                <div key={index} className="space-y-2">
                                                    <div className="aspect-video bg-light-gray rounded-lg flex items-center justify-center">
                                                        <FaEye className="text-neutral-text" size={24} />
                                                    </div>
                                                    <p className="text-sm text-center text-neutral-text">
                                                        {index === 0 ? 'Before' : 'After'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-light-gray p-12 text-center">
                            <FaCheck className="mx-auto text-neutral-text mb-4" size={48} />
                            <h3 className="text-lg font-semibold text-almost-black mb-2">Select an Issue</h3>
                            <p className="text-neutral-text">Choose an issue from the list to view its details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
