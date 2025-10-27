"use client";
import { useState } from "react";
import { 
    FaUser, 
    FaBuilding, 
    FaEnvelope, 
    FaPhone, 
    FaMapMarkerAlt,
    FaGlobe,
    FaIdCard,
    FaEdit,
    FaSave,
    FaTimes,
    FaUpload,
    FaDownload,
    FaEye,
    FaTrash,
    FaCheckCircle,
    FaExclamationTriangle,
    FaShieldAlt
} from "react-icons/fa";

// Mock data for agency profile
const mockProfileData = {
    officer: {
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@citymunicorp.gov",
        phone: "+1-555-0123",
        position: "Chief Operations Officer",
        employeeId: "EMP-2024-001"
    },
    agency: {
        name: "City Municipal Corporation",
        type: "Municipal Corporation",
        registrationNumber: "MUN-2024-NYC-001",
        website: "https://www.citymunicorp.gov",
        address: "123 City Hall Plaza, New York, NY 10001",
        district: "Metropolitan Area",
        sector: "Urban Core",
        description: "The City Municipal Corporation is responsible for providing essential public services to residents including infrastructure maintenance, public safety coordination, and community development initiatives.",
        serviceDomains: ["Infrastructure & Roads", "Public Safety & Security", "Utilities", "Parks & Recreation"],
        establishedDate: "1995-03-15",
        employeeCount: "250-500",
        budgetRange: "$10M - $50M"
    },
    verification: {
        status: "verified",
        verifiedAt: "2024-01-10T14:30:00Z",
        verifiedBy: "Admin Sarah Johnson",
        verificationNotes: "All documents verified successfully. Agency credentials confirmed."
    },
    documents: [
        {
            id: "doc-1",
            name: "Business License",
            type: "license",
            uploadedAt: "2024-01-05T10:00:00Z",
            size: "2.4 MB",
            status: "verified"
        },
        {
            id: "doc-2",
            name: "Tax Exemption Certificate",
            type: "certificate",
            uploadedAt: "2024-01-05T10:15:00Z",
            size: "1.8 MB",
            status: "verified"
        },
        {
            id: "doc-3",
            name: "Insurance Certificate",
            type: "insurance",
            uploadedAt: "2024-01-05T10:30:00Z",
            size: "3.1 MB",
            status: "pending"
        }
    ]
};

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(mockProfileData);
    const [activeTab, setActiveTab] = useState("overview");
    const [uploadingDocument, setUploadingDocument] = useState(false);

    const handleSave = () => {
        // Here you would save the changes to the backend
        console.log("Saving profile changes:", editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData(mockProfileData);
        setIsEditing(false);
    };

    const handleInputChange = (section: string, field: string, value: string) => {
        setEditData(prev => ({
            ...prev,
            [section]: {
                ...prev[section as keyof typeof prev],
                [field]: value
            }
        }));
    };

    const handleDocumentUpload = () => {
        setUploadingDocument(true);
        // Simulate upload process
        setTimeout(() => {
            setUploadingDocument(false);
            console.log("Document uploaded successfully");
        }, 2000);
    };

    const handleDocumentDelete = (docId: string) => {
        console.log("Deleting document:", docId);
        // Here you would delete the document
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDocumentIcon = (type: string) => {
        switch (type) {
            case 'license': return FaIdCard;
            case 'certificate': return FaCheckCircle;
            case 'insurance': return FaShieldAlt;
            default: return FaUpload;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified': return 'text-green-600 bg-green-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'rejected': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-almost-black">Agency Profile</h1>
                    <p className="text-neutral-text mt-1">
                        Manage your agency information and documentation
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {mockProfileData.verification.status === 'verified' && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <FaCheckCircle size={14} />
                            Verified Agency
                        </div>
                    )}
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-accent2 text-white rounded-lg hover:bg-accent transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                        >
                            <FaEdit size={14} />
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                            >
                                <FaSave size={14} />
                                Save Changes
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 border border-light-gray text-neutral-text rounded-lg hover:border-red-300 hover:text-red-600 transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                            >
                                <FaTimes size={14} />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-light-gray">
                <div className="flex border-b border-light-gray">
                    {[
                        { id: "overview", label: "Overview", icon: FaUser },
                        { id: "agency", label: "Agency Details", icon: FaBuilding },
                        { id: "documents", label: "Documents", icon: FaUpload }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-300 ${
                                    activeTab === tab.id
                                        ? 'text-accent2 border-b-2 border-accent2'
                                        : 'text-neutral-text hover:text-accent2'
                                }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            {/* Officer Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-almost-black mb-4">Officer Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">
                                                First Name
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editData.officer.firstName}
                                                    onChange={(e) => handleInputChange('officer', 'firstName', e.target.value)}
                                                    className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                                />
                                            ) : (
                                                <p className="text-neutral-text">{mockProfileData.officer.firstName}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">
                                                Email Address
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    value={editData.officer.email}
                                                    onChange={(e) => handleInputChange('officer', 'email', e.target.value)}
                                                    className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <FaEnvelope className="text-neutral-text" size={16} />
                                                    <p className="text-neutral-text">{mockProfileData.officer.email}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">
                                                Position
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editData.officer.position}
                                                    onChange={(e) => handleInputChange('officer', 'position', e.target.value)}
                                                    className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                                />
                                            ) : (
                                                <p className="text-neutral-text">{mockProfileData.officer.position}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">
                                                Last Name
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editData.officer.lastName}
                                                    onChange={(e) => handleInputChange('officer', 'lastName', e.target.value)}
                                                    className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                                />
                                            ) : (
                                                <p className="text-neutral-text">{mockProfileData.officer.lastName}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">
                                                Phone Number
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    value={editData.officer.phone}
                                                    onChange={(e) => handleInputChange('officer', 'phone', e.target.value)}
                                                    className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <FaPhone className="text-neutral-text" size={16} />
                                                    <p className="text-neutral-text">{mockProfileData.officer.phone}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">
                                                Employee ID
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <FaIdCard className="text-neutral-text" size={16} />
                                                <p className="text-neutral-text">{mockProfileData.officer.employeeId}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Status */}
                            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <FaCheckCircle className="text-white" size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-green-800">Account Verified</h4>
                                        <p className="text-green-700 text-sm mt-1">
                                            Your agency account was verified on {formatDate(mockProfileData.verification.verifiedAt)}
                                        </p>
                                        <p className="text-green-600 text-xs mt-2">
                                            Verified by: {mockProfileData.verification.verifiedBy}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Agency Details Tab */}
                    {activeTab === "agency" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-almost-black mb-4">Agency Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">
                                                Agency Name
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editData.agency.name}
                                                    onChange={(e) => handleInputChange('agency', 'name', e.target.value)}
                                                    className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <FaBuilding className="text-neutral-text" size={16} />
                                                    <p className="text-neutral-text">{mockProfileData.agency.name}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">
                                                Agency Type
                                            </label>
                                            <p className="text-neutral-text">{mockProfileData.agency.type}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">
                                                Registration Number
                                            </label>
                                            <p className="text-neutral-text">{mockProfileData.agency.registrationNumber}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">
                                                Website
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="url"
                                                    value={editData.agency.website}
                                                    onChange={(e) => handleInputChange('agency', 'website', e.target.value)}
                                                    className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <FaGlobe className="text-neutral-text" size={16} />
                                                    <a 
                                                        href={mockProfileData.agency.website} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-accent2 hover:text-accent"
                                                    >
                                                        {mockProfileData.agency.website}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">
                                                Service District
                                            </label>
                                            <p className="text-neutral-text">{mockProfileData.agency.district}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">
                                                Service Sector
                                            </label>
                                            <p className="text-neutral-text">{mockProfileData.agency.sector}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">
                                                Established Date
                                            </label>
                                            <p className="text-neutral-text">{formatDate(mockProfileData.agency.establishedDate)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">
                                                Employee Count
                                            </label>
                                            <p className="text-neutral-text">{mockProfileData.agency.employeeCount}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-almost-black mb-2">
                                    Office Address
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={editData.agency.address}
                                        onChange={(e) => handleInputChange('agency', 'address', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2 resize-none"
                                    />
                                ) : (
                                    <div className="flex items-start gap-2">
                                        <FaMapMarkerAlt className="text-neutral-text mt-1" size={16} />
                                        <p className="text-neutral-text">{mockProfileData.agency.address}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-almost-black mb-2">
                                    Agency Description
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={editData.agency.description}
                                        onChange={(e) => handleInputChange('agency', 'description', e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2 resize-none"
                                    />
                                ) : (
                                    <p className="text-neutral-text leading-relaxed">{mockProfileData.agency.description}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-almost-black mb-3">
                                    Service Domains
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {mockProfileData.agency.serviceDomains.map((domain, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-accent2/10 text-accent2 text-sm font-medium rounded-full"
                                        >
                                            {domain}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === "documents" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-almost-black">Agency Documents</h3>
                                <button
                                    onClick={handleDocumentUpload}
                                    disabled={uploadingDocument}
                                    className="px-4 py-2 bg-accent2 text-white rounded-lg hover:bg-accent transition-colors duration-300 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                                >
                                    <FaUpload size={14} />
                                    {uploadingDocument ? 'Uploading...' : 'Upload Document'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {mockProfileData.documents.map((doc) => {
                                    const DocIcon = getDocumentIcon(doc.type);
                                    return (
                                        <div key={doc.id} className="bg-light-gray/30 rounded-xl p-4 border border-light-gray">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-accent2/10 rounded-lg flex items-center justify-center">
                                                        <DocIcon className="text-accent2" size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-almost-black">{doc.name}</h4>
                                                        <div className="flex items-center gap-4 text-sm text-neutral-text">
                                                            <span>{doc.size}</span>
                                                            <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                                                        {doc.status}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <button className="p-2 text-neutral-text hover:text-accent2 transition-colors">
                                                            <FaEye size={14} />
                                                        </button>
                                                        <button className="p-2 text-neutral-text hover:text-accent2 transition-colors">
                                                            <FaDownload size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDocumentDelete(doc.id)}
                                                            className="p-2 text-neutral-text hover:text-red-600 transition-colors"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Upload Area */}
                            <div className="border-2 border-dashed border-light-gray rounded-xl p-8 text-center">
                                <FaUpload className="mx-auto text-neutral-text mb-4" size={32} />
                                <h4 className="font-medium text-almost-black mb-2">Upload Additional Documents</h4>
                                <p className="text-neutral-text text-sm mb-4">
                                    Drag and drop files here, or click to browse
                                </p>
                                <button className="px-4 py-2 border border-accent2 text-accent2 rounded-lg hover:bg-accent2 hover:text-white transition-colors duration-300 text-sm font-medium">
                                    Choose Files
                                </button>
                                <p className="text-xs text-neutral-text mt-2">
                                    Supported formats: PDF, JPG, PNG (Max 10MB)
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
