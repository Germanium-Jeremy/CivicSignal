"use client";
import { useState, useEffect } from "react";
import { agencyAPI } from "@/lib/api";
import { FaUser, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaIdCard, FaEdit, FaSave, FaTimes, FaUpload, FaDownload, FaEye, FaTrash, FaCheckCircle, FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";

interface ProfileData {
    officer: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    agency: {
        name: string;
        type: string;
        registrationNumber: string;
        website?: string;
        address: string;
        district: string;
        sector: string;
        description?: string;
        serviceDomains: string[];
        createdAt: string;
    };
    verification: {
        status: string;
        verifiedAt?: string;
        verificationNotes?: string;
    };
}

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [editData, setEditData] = useState<ProfileData | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [uploadingDocument, setUploadingDocument] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const response = await agencyAPI.getDashboardData();
            
            if (response.success) {
                // Parse fullName into firstName and lastName
                const nameParts = response.user.fullName.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                const data: ProfileData = {
                    officer: {
                        firstName,
                        lastName,
                        email: response.user.email,
                        phone: response.user.phone
                    },
                    agency: {
                        name: response.agency.name,
                        type: response.agency.type,
                        registrationNumber: response.agency.registrationNumber,
                        website: response.agency.website,
                        address: response.agency.address,
                        district: response.agency.district,
                        sector: response.agency.sector,
                        description: response.agency.description,
                        serviceDomains: response.agency.serviceDomains || [],
                        createdAt: response.agency.createdAt
                    },
                    verification: {
                        status: response.agency.verificationStatus,
                        verifiedAt: response.agency.verifiedAt,
                        verificationNotes: response.agency.verificationNotes
                    }
                };

                setProfileData(data);
                setEditData(data);
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        // Here you would save the changes to the backend
        console.log("Saving profile changes:", editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData(profileData);
        setIsEditing(false);
    };

    const handleInputChange = (section: string, field: string, value: string) => {
        if (!editData) return;
        
        setEditData({
            ...editData,
            [section]: {
                ...editData[section as keyof ProfileData],
                [field]: value
            }
        } as ProfileData);
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent2 mx-auto"></div>
                    <p className="mt-4 text-neutral-text">Loading profile data...</p>
                </div>
            </div>
        );
    }

    if (!profileData || !editData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-neutral-text">No profile data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-almost-black">Agency Profile</h1>
                    <p className="text-neutral-text mt-1">Manage your agency information and documentation</p>
                </div>
                <div className="flex items-center gap-3">
                    {profileData.verification.status === 'approved' && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <FaCheckCircle size={14} />
                            Verified Agency
                        </div>
                    )}
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-accent2 text-white rounded-lg hover:bg-accent transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                        >
                            <FaEdit size={14} />
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={handleSave}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 text-sm font-medium flex items-center gap-2"
                            >
                                <FaSave size={14} />
                                Save Changes
                            </button>
                            <button onClick={handleCancel}
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
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-300 ${
                                    activeTab === tab.id ? 'text-accent2 border-b-2 border-accent2' : 'text-neutral-text hover:text-accent2'
                                }`}>
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
                                            <label className="block text-sm font-medium text-almost-black mb-2">First Name</label>
                                            {isEditing ? (
                                                <input type="text" value={editData.officer.firstName} onChange={(e) => handleInputChange('officer', 'firstName', e.target.value)}
                                                    className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                                />
                                            ) : (
                                                <p className="text-neutral-text">{profileData.officer.firstName}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">Email Address</label>
                                            {isEditing ? (
                                                <input type="email" value={editData.officer.email} onChange={(e) => handleInputChange('officer', 'email', e.target.value)}
                                                    className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <FaEnvelope className="text-neutral-text" size={16} />
                                                    <p className="text-neutral-text">{profileData.officer.email}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">Last Name</label>
                                            {isEditing ? (
                                                <input type="text" value={editData.officer.lastName} onChange={(e) => handleInputChange('officer', 'lastName', e.target.value)}
                                                    className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                                />
                                            ) : (
                                                <p className="text-neutral-text">{profileData.officer.lastName}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">Phone Number</label>
                                            {isEditing ? (
                                                <input type="tel" value={editData.officer.phone} onChange={(e) => handleInputChange('officer', 'phone', e.target.value)}
                                                    className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <FaPhone className="text-neutral-text" size={16} />
                                                    <p className="text-neutral-text">{profileData.officer.phone}</p>
                                                </div>
                                            )}
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
                                            Your agency account was verified on {profileData.verification.verifiedAt ? formatDate(profileData.verification.verifiedAt) : 'N/A'}
                                        </p>
                                        <p className="text-green-600 text-xs mt-2">
                                            {profileData.verification.verificationNotes || 'Verified by administrator'}
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
                                            <label className="block text-sm font-medium text-almost-black mb-2">Agency Name</label>
                                            {isEditing ? (
                                                <input type="text" value={editData.agency.name} onChange={(e) => handleInputChange('agency', 'name', e.target.value)}
                                                    className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <FaBuilding className="text-neutral-text" size={16} />
                                                    <p className="text-neutral-text">{profileData.agency.name}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">Agency Type</label>
                                            <p className="text-neutral-text">{profileData.agency.type}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">Registration Number</label>
                                            <p className="text-neutral-text">{profileData.agency.registrationNumber}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">Website</label>
                                            {isEditing ? (
                                                <input type="url" value={editData.agency.website} onChange={(e) => handleInputChange('agency', 'website', e.target.value)}
                                                    className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <FaGlobe className="text-neutral-text" size={16} />
                                                    <a href={profileData.agency.website} target="_blank" rel="noopener noreferrer" className="text-accent2 hover:text-accent">{profileData.agency.website}</a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">Service District</label>
                                            <p className="text-neutral-text">{profileData.agency.district}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">Service Sector</label>
                                            <p className="text-neutral-text">{profileData.agency.sector}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-almost-black mb-2">Created Date</label>
                                            <p className="text-neutral-text">{formatDate(profileData.agency.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-almost-black mb-2">Office Address</label>
                                {isEditing ? (
                                    <textarea value={editData.agency.address} rows={3}
                                        onChange={(e) => handleInputChange('agency', 'address', e.target.value)}
                                        className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2 resize-none"
                                    />
                                ) : (
                                    <div className="flex items-start gap-2">
                                        <FaMapMarkerAlt className="text-neutral-text mt-1" size={16} />
                                        <p className="text-neutral-text">{profileData.agency.address}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-almost-black mb-2">Agency Description</label>
                                {isEditing ? (
                                    <textarea value={editData.agency.description} rows={4}
                                        onChange={(e) => handleInputChange('agency', 'description', e.target.value)}
                                        className="w-full px-4 py-2 border border-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2 resize-none"
                                    />
                                ) : (
                                    <p className="text-neutral-text leading-relaxed">{profileData.agency.description || 'No description provided'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-almost-black mb-3">Service Domains</label>
                                <div className="flex flex-wrap gap-2">
                                    {profileData.agency.serviceDomains.map((domain: string, index: number) => (
                                        <span key={index} className="px-3 py-1 bg-accent2/10 text-accent2 text-sm font-medium rounded-full">{domain}</span>
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
                                <button onClick={handleDocumentUpload} disabled={uploadingDocument}
                                    className="px-4 py-2 bg-accent2 text-white rounded-lg hover:bg-accent transition-colors duration-300 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                                >
                                    <FaUpload size={14} />
                                    {uploadingDocument ? 'Uploading...' : 'Upload Document'}
                                </button>
                            </div>

                            <div className="text-center py-12">
                                <FaUpload className="mx-auto text-neutral-text mb-4" size={48} />
                                <p className="text-neutral-text">Document management coming soon</p>
                                <p className="text-sm text-neutral-text/70 mt-2">Upload and manage your agency documents here</p>
                            </div>

                            <div className="border-2 border-dashed border-light-gray rounded-xl p-8 text-center">
                                <FaUpload className="mx-auto text-neutral-text mb-4" size={32} />
                                <h4 className="font-medium text-almost-black mb-2">Upload Additional Documents</h4>
                                <p className="text-neutral-text text-sm mb-4">Drag and drop files here, or click to browse</p>
                                <button className="px-4 py-2 border border-accent2 text-accent2 rounded-lg hover:bg-accent2 hover:text-white transition-colors duration-300 text-sm font-medium">Choose Files</button>
                                <p className="text-xs text-neutral-text mt-2">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
