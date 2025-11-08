"use client";
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminAPI } from '@/lib/api';
import { FaCheckCircle, FaTimes, FaClock, FaEye, FaTrash, FaSearch, FaFilter, FaBuilding, FaExclamationTriangle } from 'react-icons/fa';

interface Agency {
    _id: string;
    name: string;
    type: string;
    registrationNumber: string;
    address: string;
    district: string;
    sector: string;
    serviceDomains: string[];
    primaryOfficer: {
        fullName: string;
        email: string;
        phone: string;
    };
    verificationStatus: 'pending' | 'approved' | 'rejected';
    isVerified: boolean;
    createdAt: string;
}

export default function AgencyManagementPage() {
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchAgencies();
    }, []);

    useEffect(() => {
        filterAgencies();
    }, [agencies, filterStatus, searchQuery]);

    const fetchAgencies = async () => {
        try {
            const response = await adminAPI.getAllAgencies();
            
            if (response.success) {
                setAgencies(response.agencies);
            }
        } catch (error) {
            console.error('Error fetching agencies:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterAgencies = () => {
        let filtered = agencies;

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(agency => agency.verificationStatus === filterStatus);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(agency => 
                agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                agency.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                agency.primaryOfficer.fullName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredAgencies(filtered);
    };

    const handleApprove = async (agencyId: string) => {
        setActionLoading(true);
        try {
            const response = await adminAPI.approveAgency(agencyId);
            
            if (response.success) {
                // Update local state
                setAgencies(prev => prev.map(agency => 
                    agency._id === agencyId 
                        ? { ...agency, verificationStatus: 'approved', isVerified: true }
                        : agency
                ));
                
                setShowModal(false);
                setSelectedAgency(null);
            }
        } catch (error: any) {
            console.error('Error approving agency:', error);
            alert(error.message || 'Failed to approve agency');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (agencyId: string) => {
        setActionLoading(true);
        try {
            const response = await adminAPI.rejectAgency(agencyId);
            
            if (response.success) {
                // Update local state
                setAgencies(prev => prev.map(agency => 
                    agency._id === agencyId 
                        ? { ...agency, verificationStatus: 'rejected', isVerified: false }
                        : agency
                ));
                
                setShowModal(false);
                setSelectedAgency(null);
            }
        } catch (error: any) {
            console.error('Error rejecting agency:', error);
            alert(error.message || 'Failed to reject agency');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (agencyId: string) => {
        if (!confirm('Are you sure you want to delete this agency? This action cannot be undone.')) {
            return;
        }

        setActionLoading(true);
        try {
            const response = await adminAPI.deleteAgency(agencyId);
            
            if (response.success) {
                // Remove from local state
                setAgencies(prev => prev.filter(agency => agency._id !== agencyId));
                
                setShowModal(false);
                setSelectedAgency(null);
            }
        } catch (error: any) {
            console.error('Error deleting agency:', error);
            alert(error.message || 'Failed to delete agency');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        <FaClock /> Pending
                    </span>
                );
            case 'approved':
                return (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <FaCheckCircle /> Approved
                    </span>
                );
            case 'rejected':
                return (
                    <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        <FaTimes /> Rejected
                    </span>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="w-12 h-12 border-4 border-accent2/30 border-t-accent2 rounded-full animate-spin"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header with Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-neutral-text">Total Agencies</p>
                        <p className="text-2xl font-bold text-almost-black">{agencies.length}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <p className="text-sm text-yellow-700">Pending</p>
                        <p className="text-2xl font-bold text-yellow-800">
                            {agencies.filter(a => a.verificationStatus === 'pending').length}
                        </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-sm text-green-700">Approved</p>
                        <p className="text-2xl font-bold text-green-800">
                            {agencies.filter(a => a.verificationStatus === 'approved').length}
                        </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <p className="text-sm text-red-700">Rejected</p>
                        <p className="text-2xl font-bold text-red-800">
                            {agencies.filter(a => a.verificationStatus === 'rejected').length}
                        </p>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input type="text" placeholder="Search by agency name, registration number, or officer..."
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <FaFilter className="text-gray-400" />
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Agencies List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {filteredAgencies.length === 0 ? (
                        <div className="p-8 text-center">
                            <FaBuilding className="mx-auto text-4xl text-gray-300 mb-4" />
                            <p className="text-neutral-text">No agencies found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Officer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredAgencies.map((agency) => (
                                        <tr key={agency._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-almost-black">{agency.name}</div>
                                                    <div className="text-xs text-neutral-text">{agency.registrationNumber}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-neutral-text capitalize">{agency.type}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm text-almost-black">{agency.primaryOfficer.fullName}</div>
                                                    <div className="text-xs text-neutral-text">{agency.primaryOfficer.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(agency.verificationStatus)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-text">
                                                {new Date(agency.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => { setSelectedAgency(agency); setShowModal(true); }} className="text-accent2 hover:text-accent mr-3">
                                                    <FaEye className="inline" /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {showModal && selectedAgency && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-almost-black">Agency Details</h2>
                                    <button onClick={() => { setShowModal(false); setSelectedAgency(null) }} className="text-gray-400 hover:text-gray-600">
                                        <FaTimes className="text-xl" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Agency Info */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Agency Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-neutral-text">Agency Name</p>
                                            <p className="text-sm font-medium text-almost-black">{selectedAgency.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-text">Type</p>
                                            <p className="text-sm font-medium text-almost-black capitalize">{selectedAgency.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-text">Registration Number</p>
                                            <p className="text-sm font-medium text-almost-black">{selectedAgency.registrationNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-text">Status</p>
                                            <div className="mt-1">{getStatusBadge(selectedAgency.verificationStatus)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Location</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs text-neutral-text">District</p>
                                            <p className="text-sm font-medium text-almost-black">{selectedAgency.district}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-text">Sector</p>
                                            <p className="text-sm font-medium text-almost-black">{selectedAgency.sector}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-text">Address</p>
                                            <p className="text-sm font-medium text-almost-black">{selectedAgency.address}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Primary Officer */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Primary Officer</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs text-neutral-text">Full Name</p>
                                            <p className="text-sm font-medium text-almost-black">{selectedAgency.primaryOfficer.fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-text">Email</p>
                                            <p className="text-sm font-medium text-almost-black">{selectedAgency.primaryOfficer.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-text">Phone</p>
                                            <p className="text-sm font-medium text-almost-black">{selectedAgency.primaryOfficer.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Service Domains */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Service Domains</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAgency.serviceDomains.map((domain, index) => (
                                            <span key={index}
                                                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium capitalize"
                                            >
                                                {domain}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    {selectedAgency.verificationStatus === 'pending' && (
                                        <>
                                            <button onClick={() => handleApprove(selectedAgency._id)} disabled={actionLoading}
                                                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {actionLoading ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                ) : (
                                                    <>
                                                        <FaCheckCircle /> Approve
                                                    </>
                                                )}
                                            </button>
                                            <button onClick={() => handleReject(selectedAgency._id)} disabled={actionLoading}
                                                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {actionLoading ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                ) : (
                                                    <>
                                                        <FaTimes /> Reject
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}

                                    <button onClick={() => handleDelete(selectedAgency._id)} disabled={actionLoading}
                                        className="flex items-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
