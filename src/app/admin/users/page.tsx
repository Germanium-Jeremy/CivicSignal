'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiUserPlus, FiEdit2, FiTrash2, FiEye, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import AdminLayout from '@/components/admin/AdminLayout';
import { User } from '@/lib/types/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { adminAPI } from '@/lib/api';

const UsersPage = () => {
     const [users, setUsers] = useState<User[]>([]);
     const [loading, setLoading] = useState(true);
     const [searchTerm, setSearchTerm] = useState('');
     const [page, setPage] = useState(1);
     const [selectedRole, setSelectedRole] = useState('all');
     const [selectedStatus, setSelectedStatus] = useState('all');
     const [itemsPerpage, setItemsPerPage] = useState(10);
     const [paginationData, setPaginationData] = useState({total: 0, totalPages: 0, page: 1, limit: 10 });

     // Fetch users from API
     useEffect(() => {
          const fetchUsers = async () => {
               try {
                    setLoading(true);
                    const response = await adminAPI.getUsers({ 
                         page, 
                         limit: itemsPerpage,
                         search: searchTerm || undefined,
                         status: selectedStatus !== 'all' ? selectedStatus : undefined,
                         role: selectedRole !== 'all' ? selectedRole : undefined
                    });
                    console.log("User response: ", response)
                    setUsers(response.data?.users || []);
                    setPaginationData({
                         total: response.data?.pagination?.total || 0,
                         totalPages: response.data?.pagination?.totalPages || 0,
                         page: response.data?.pagination?.page || 1,
                         limit: response.data?.pagination?.limit || itemsPerpage
                    });
               } catch (error) {
                    console.error('Error fetching users:', error);
               } finally {
                    setLoading(false);
               }
          };
          fetchUsers();
     }, [page, searchTerm, selectedStatus, selectedRole, itemsPerpage]);

     // Reset page when filters change
     useEffect(() => {
          setPage(1);
     }, [searchTerm, selectedStatus, selectedRole, itemsPerpage]);

     const handleStatusToggle = async (userId: string, isActive: boolean) => {
          try {
               await adminAPI.toggleUserStatus(userId, isActive);
               setUsers(users.map(user => user._id === userId ? { ...user, isActive } : user));
          } catch (error) {
               console.error('Error toggling user status:', error);
          }
     };

     const handleDelete = async (userId: string) => {
          if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
               try {
                    await adminAPI.deleteUser(userId)
                    toast.success('User deleted successfully');
                    setUsers(users.map(user => user._id === userId ? { ...user } : user));
               } catch (error) {
                    console.error('Error deleting user:', error);
                    toast.error(error instanceof Error ? error.message : 'Failed to delete user');
               }
          }
     };

     return (
          <AdminLayout>
               <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                         <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                         <div className="flex items-center gap-3">
                              <div className="text-sm text-gray-600">{paginationData.total} {paginationData.total === 1 ? 'user' : 'users'} found</div>
                              <Link href="/admin/users/new"
                                   className="bg-accent2 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-accent2/90 transition-colors text-sm sm:text-base"
                              >
                                   <FiUserPlus /> Add User
                              </Link>
                         </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                         <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                              <div className="relative w-full md:w-80">
                                   <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                   <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent2/50"
                                   />
                              </div>
            
                              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                   <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
                                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent2/50 w-full sm:w-32"
                                   >
                                        <option value="all">All Roles</option>
                                        <option value="admin">Admin</option>
                                        <option value="user">User</option>
                                        <option value="agency">Agency</option>
                                   </select>
                                   <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent2/50 w-full sm:w-32"
                                   >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                   </select>
                                   <select value={itemsPerpage} onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent2/50 w-full sm:w-32"
                                   >
                                        <option value={5}>5 per page</option>
                                        <option value={10}>10 per page</option>
                                        <option value={25}>25 per page</option>
                                        <option value={50}>50 per page</option>
                                   </select>
              
                                   <button 
                                        className="border border-gray-200 rounded-lg px-4 py-2 text-sm flex items-center justify-center gap-2 hover:bg-gray-50 w-full sm:w-auto"
                                        onClick={() => {
                                             setSearchTerm('');
                                             setSelectedRole('all');
                                             setSelectedStatus('all');
                                             setItemsPerPage(10);
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
                         ) : users.length === 0 ? (
                              <div className="text-center py-10 text-gray-500">
                                   <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                                   <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                                   <p className="mt-1 text-sm text-gray-500">
                                        {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all' 
                                        ? 'Try adjusting your search or filter to find what you\'re looking for.'
                                        : 'There are currently no users to display.'}
                                   </p>
                              </div>
                         ) : (
                              <>
                                        <div className="overflow-x-auto">
                                             <table className="min-w-full divide-y divide-gray-200">
                                                  <thead className="bg-gray-50">
                                                       <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                       </tr>
                                                  </thead>
                 
                                                  <tbody className="bg-white divide-y divide-gray-200">
                                                       {users.map((user) => (
                                                            <tr key={user._id} className="hover:bg-gray-50">
                                                                 <td className="px-6 py-4 whitespace-nowrap">
                                                                      <div className="flex items-center">
                                                                           <div className="shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                                <span className="text-gray-600">{user.fullName.charAt(0)}</span>
                                                                           </div>
                                                                           <div className="ml-4">
                                                                                <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                                                           </div>
                                                                      </div>
                                                                 </td>
                                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || 'N/A'}</td>
                                                                 <td className="px-6 py-4 whitespace-nowrap">
                                                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                           user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                                           user.role === 'agency_officer' ? 'bg-blue-100 text-blue-800' :
                                                                           'bg-green-100 text-green-800'
                                                                      }`}>
                                                                           {user.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                                      </span>
                                                                 </td>
                                                                 <td className="px-6 py-4 whitespace-nowrap">
                                                                      <span onClick={() => handleStatusToggle(user._id, user.isActive)}
                                                                           className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                                                                                user.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                                           }`}
                                                                      >
                                                                           {user.isActive ? 'Active' : 'Inactive'}
                                                                      </span>
                                                                 </td>
                                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                      <div className="flex justify-end space-x-3">
                                                                           <Link href={`/admin/users/${user._id}`} className="text-blue-600 hover:text-blue-900" title="View"> <FiEye /> </Link>
                                                                           <Link href={`/admin/users/${user._id}/edit`} className="text-yellow-600 hover:text-yellow-900" title="Edit"> <FiEdit2 /> </Link>
                                                                           <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(user._id)} title="Delete"> <FiTrash2 /> </button>
                                                                      </div>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>

                                        {paginationData.totalPages > 1 && (
                                             <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                                                  <div className="text-sm text-gray-700">
                                                       Showing {((paginationData.page - 1) * paginationData.limit) + 1} to {Math.min(paginationData.page * paginationData.limit, paginationData.total)} of {paginationData.total} users
                                                  </div>
                                                  <div className="flex items-center space-x-2">
                                                       <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                                            className={`px-3 py-2 border rounded-lg ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                                       >
                                                            Previous
                                                       </button>
                                                  
                                                  {/* Page Numbers */}
                                                  <div className="flex items-center space-x-1">
                                                       {(() => {
                                                            const pages = [];
                                                            const maxVisiblePages = 5;
                                                            let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
                                                            let endPage = Math.min(paginationData.totalPages, startPage + maxVisiblePages - 1);
                                                            
                                                            if (endPage - startPage + 1 < maxVisiblePages) {
                                                                 startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                                            }
                              
                                                            // Show first page if not in range
                                                            if (startPage > 1) {
                                                                 pages.push(
                                                                      <button key={1} onClick={() => setPage(1)}
                                                                           className={`px-3 py-2 border rounded ${page === 1 ? 'bg-blue-50 border-blue-500 text-blue-600' : 'hover:bg-gray-50'}`}
                                                                      >
                                                                           1
                                                                      </button>
                                                                 );
                                                                 if (startPage > 2) {
                                                                      pages.push(<span key="ellipsis-start" className="px-2">...</span>);
                                                                 }
                                                            }
                         
                                                            // Show page range
                                                            for (let i = startPage; i <= endPage; i++) {
                                                                 pages.push(
                                                                      <button key={i} onClick={() => setPage(i)} className={`px-3 py-2 border rounded ${page === i ? 'bg-blue-50 border-blue-500 text-blue-600' : 'hover:bg-gray-50'}`}>{i}</button>
                                                                 );
                                                            }
                         
                                                            // Show last page if not in range
                                                            if (endPage < paginationData.totalPages) {
                                                                 if (endPage < paginationData.totalPages - 1) {
                                                                      pages.push(<span key="ellipsis-end" className="px-2">...</span>);
                                                                 }
                                                                 pages.push(
                                                                      <button key={paginationData.totalPages} className={`px-3 py-2 border rounded ${page === paginationData.totalPages ? 'bg-blue-50 border-blue-500 text-blue-600' : 'hover:bg-gray-50'}`} onClick={() => setPage(paginationData.totalPages)}>
                                                                           {paginationData.totalPages}
                                                                      </button>
                                                                 );
                                                            }
                                                            
                                                            return pages;
                                                       })()}
                                                  </div>
                    
                                                  <button 
                                                  className={`px-3 py-2 border rounded-lg ${page === paginationData.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                                  onClick={() => setPage(p => Math.min(paginationData.totalPages, p + 1))} disabled={page === paginationData.totalPages}
                                                  >
                                                       Next
                                                  </button>
                                             </div>
                                        </div>
                                   )}
                              </>
                         )}
                    </div>
               </div>
          </AdminLayout>
     );
};

export default UsersPage;
