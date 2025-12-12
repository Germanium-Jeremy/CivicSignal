'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiAlertTriangle, FiEye, FiEdit2, FiTrash2, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import AdminLayout from '@/components/admin/AdminLayout';
import { Issue } from '@/lib/types/api';
import { getCategoryById } from '@/config/issueCategories';
import { adminAPI } from '@/lib/api';

const IssuesPage = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const itemsPerpage = 10;

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getIssues({ 
          page, 
          limit: 10,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined
        });
        setIssues(response.data);
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [page, statusFilter, priorityFilter]);

  const handleStatusUpdate = async (issueId: string, status: Issue['status']) => {
    try {
      const updatedIssue = await adminAPI.updateIssueStatus(issueId, status);
      setIssues(issues.map(issue => 
        issue._id === issueId ? updatedIssue : issue
      ));
    } catch (error) {
      console.error('Error updating issue status:', error);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.reportedBy.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || issue.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const paginatedIssues = filteredIssues.slice(
    (page - 1) * itemsPerpage,
    page * itemsPerpage
  );

  const totalpages = Math.ceil(filteredIssues.length / itemsPerpage);

  const handleDelete = async (issueId: string) => {
    if (confirm('Are you sure you want to delete this issue?')) {
      try {
        // TODO: Implement delete issue API call
        await fetch(`/api/admin/issues/${issueId}`, { method: 'DELETE' });
        setIssues(issues.filter(issue => issue?._id !== issueId));
      } catch (error) {
        console.error('Error deleting issue:', error);
      }
    }
  };

  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      setIssues(issues.map(issue => 
        issue._id === issueId 
          ? { 
              ...issue, 
              status: newStatus == 'resolved' ? 'resolved' : newStatus == 'pending' ? 'pending' : newStatus == 'acknowledged' ? 'acknowledged' : 'submitted',
              resolvedAt: newStatus === 'resolved' || newStatus === 'closed' ? new Date().toISOString() : issue.resolvedAt
            } 
          : issue
      ));
    } catch (error) {
      console.error('Error updating issue status:', error);
    }
  };

  // Format date to relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Get status color and icon
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      submitted: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800',
        icon: <FiAlertTriangle className="mr-1" />
      },
      acknowledged: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800',
        icon: <FiClock className="mr-1" />
      },
      pending: { 
        bg: 'bg-purple-100', 
        text: 'text-purple-800',
        icon: <FiClock className="mr-1" />
      },
      resolved: { 
        bg: 'bg-green-100', 
        text: 'text-green-800',
        icon: <FiCheckCircle className="mr-1" />
      },
      closed: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800',
        icon: <FiCheckCircle className="mr-1" />
      }
    };

    const statusInfo = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FiAlertCircle className="mr-1" /> };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.icon}
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { bg: string; text: string }> = {
      high: { bg: 'bg-red-100', text: 'text-red-800' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      low: { bg: 'bg-green-100', text: 'text-green-800' }
    };

    const { bg, text } = priorityMap[priority] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${bg} ${text}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Issue Management</h1>
            <p className="text-sm text-gray-600 mt-1">Track and manage reported issues</p>
          </div>
          <div className="text-sm text-gray-600">
            {filteredIssues.length} {filteredIssues.length === 1 ? 'issue' : 'issues'} found
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, tracking #, or reporter..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <select 
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent2/50 w-full sm:w-40"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="acknowledged">In Review</option>
                <option value="pending">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select 
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent2/50 w-full sm:w-40"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="roads_infrastructure">Roads & Infrastructure</option>
                <option value="water_supply">Water Supply</option>
                <option value="electricity">Electricity</option>
                <option value="public_safety">Public Safety</option>
                <option value="sanitation_waste">Sanitation & Waste</option>
              </select>
              <button 
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm flex items-center justify-center gap-2 hover:bg-gray-50 w-full sm:w-auto"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setSelectedCategory('all');
                }}
              >
                <FiFilter /> Clear Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent2"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedIssues.map((issue) => {
                      const categoryInfo = getCategoryById(issue.category) || { name: 'Other', color: '#999' };
                      
                      return (
                        <tr key={issue._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${categoryInfo.color}20` }}>
                                <span style={{ color: categoryInfo.color }}>#{issue.trackingNumber.split('-')[1]}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                                <div className="text-xs text-gray-500 truncate max-w-xs">{issue.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                                  style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}>
                              {categoryInfo.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select 
                              className="text-sm border-0 p-0 bg-transparent focus:ring-2 focus:ring-accent2/50 rounded"
                              value={issue.status}
                              onChange={(e) => updateIssueStatus(issue._id, e.target.value)}
                            >
                              <option value="submitted">Submitted</option>
                              <option value="acknowledged">In Review</option>
                              <option value="pending">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getPriorityBadge(issue.priority)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{issue.reportedBy.fullName}</div>
                            <div className="text-xs text-gray-500">{issue.reportedBy.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-3">
                              <button 
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <FiEye />
                              </button>
                              <button 
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Edit"
                              >
                                <FiEdit2 />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDelete(issue._id)}
                                title="Delete"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredIssues.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <FiAlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No issues found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filter to find what you\'re looking for.'
                      : 'There are currently no issues to display.'}
                  </p>
                </div>
              )}

              {totalpages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <button 
                    className={`px-4 py-2 border rounded-lg ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <div className="text-sm text-gray-700">
                    page {page} of {totalpages}
                  </div>
                  <button 
                    className={`px-4 py-2 border rounded-lg ${page === totalpages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    onClick={() => setPage(p => Math.min(totalpages, p + 1))}
                    disabled={page === totalpages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default IssuesPage;
