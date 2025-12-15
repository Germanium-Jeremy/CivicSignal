"use client";
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminAPI, userAPI } from '@/lib/api';
import { Issue } from '@/lib/types/api';
import { getCategoryById, ISSUE_CATEGORIES } from '@/config/issueCategories';
import { 
  FaBuilding, FaExclamationTriangle, FaUsers, FaCheckCircle,
  FaClock, FaTimes, FaChartLine, FaTasks, FaEye, FaFilter
} from 'react-icons/fa';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import Link from 'next/link';

interface DashboardStats {
  agencies: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  issues: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  users: {
    total: number;
    citizens: number;
    officers: number;
    active: number;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    agencies: { total: 0, pending: 0, approved: 0, rejected: 0 },
    issues: { total: 0, open: 0, inProgress: 0, resolved: 0 },
    users: { total: 0, citizens: 0, officers: 0, active: 0 }
  });
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [adminData, setAdminData] = useState<{ fullName: string } | null>(null);
  const [trends, setTrends] = useState({
    agencies: { value: 0, period: 'week' },
    issues: { value: 0, period: 'today' },
    users: { value: 0, period: 'week' }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch admin profile data
      const profileResponse = await userAPI.getProfile();
      if (profileResponse.success) {
        setAdminData(profileResponse.user);
      }

      // Fetch real issues data
      const issuesResponse = await adminAPI.getIssues({ page: 1, limit: 100 });
      const issues = issuesResponse.data?.issues || [];
      
      // Calculate real issues statistics
      const issuesStats = {
        total: issues.length,
        open: issues.filter((issue: any) => issue.status === 'submitted').length,
        inProgress: issues.filter((issue: any) => ['acknowledged', 'pending'].includes(issue.status)).length,
        resolved: issues.filter((issue: any) => issue.status === 'resolved').length
      };
      
      // Get recent issues (last 5)
      const recent = issues.slice(0, 5);
      setRecentIssues(recent);
      
      // Fetch other stats (agencies, users)
      const dashboardResponse = await adminAPI.getDashboardStats();
      
      if (dashboardResponse.success) {
        const currentStats = {
          ...dashboardResponse.stats,
          issues: issuesStats
        };
        setStats(currentStats);
        
        // Calculate trends based on recent activity
        const today = new Date();
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // For demo purposes, calculate simple trends based on current data
        setTrends({
          agencies: { 
            value: Math.floor(Math.random() * 10) - 5, // Random between -5 and +5
            period: 'week' 
          },
          issues: { 
            value: issues.filter((issue: any) => {
              const issueDate = new Date(issue.submittedAt || issue.createdAt);
              return issueDate.toDateString() === today.toDateString();
            }).length,
            period: 'today' 
          },
          users: { 
            value: Math.floor(Math.random() * 20) - 10, // Random between -10 and +10
            period: 'week' 
          }
        });
      } else {
        // Fallback to issues-only stats if dashboard API fails
        setStats({
          agencies: { total: 0, pending: 0, approved: 0, rejected: 0 },
          issues: issuesStats,
          users: { total: 0, citizens: 0, officers: 0, active: 0 }
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default values on error
      setStats({
        agencies: { total: 0, pending: 0, approved: 0, rejected: 0 },
        issues: { total: 0, open: 0, inProgress: 0, resolved: 0 },
        users: { total: 0, citizens: 0, officers: 0, active: 0 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    subtitle,
    trend 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    color: string; 
    subtitle?: string;
    trend?: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="text-white text-xl" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-almost-black mb-1">{value.toLocaleString()}</h3>
      <p className="text-sm text-neutral-text">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );

  const DetailCard = ({ 
    title, 
    items 
  }: { 
    title: string; 
    items: { label: string; value: number; color: string; icon: any }[] 
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-almost-black mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <item.icon className={`${item.color} text-lg`} />
              <span className="text-sm text-neutral-text">{item.label}</span>
            </div>
            <span className="text-sm font-semibold text-almost-black">
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

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
        {/* Welcome Section */}
        <div className="bg-linear-to-r from-accent2 to-accent rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {adminData?.fullName || 'Administrator'}!
          </h1>
          <p className="text-white/90">
            Here's what's happening with CivicSignal today.
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Agencies"
            value={stats.agencies.total}
            icon={FaBuilding}
            color="bg-blue-500"
            subtitle={`${stats.agencies.pending} pending approval`}
            trend={`${trends.agencies.value >= 0 ? '+' : ''}${trends.agencies.value} this ${trends.agencies.period}`}
          />
          <StatCard 
            title="Total Issues"
            value={stats.issues.total}
            icon={FaExclamationTriangle}
            color="bg-orange-500"
            subtitle={`${stats.issues.open} need attention`}
            trend={`${trends.issues.value >= 0 ? '+' : ''}${trends.issues.value} ${trends.issues.period}`}
          />
          <StatCard 
            title="Total Users"
            value={stats.users.total}
            icon={FaUsers}
            color="bg-green-500"
            subtitle={`${stats.users.active} active now`}
            trend={`${trends.users.value >= 0 ? '+' : ''}${trends.users.value} this ${trends.users.period}`}
          />
          <StatCard 
            title="System Health"
            value={98}
            icon={FaChartLine}
            color="bg-purple-500"
            subtitle="Uptime percentage"
            trend="Excellent"
          />
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DetailCard 
            title="Agency Status"
            items={[
              { label: 'Pending Approval', value: stats.agencies.pending, color: 'text-yellow-500', icon: FaClock },
              { label: 'Approved', value: stats.agencies.approved, color: 'text-green-500', icon: FaCheckCircle },
              { label: 'Rejected', value: stats.agencies.rejected, color: 'text-red-500', icon: FaTimes }
            ]}
          />
          
          <DetailCard 
            title="Issue Status"
            items={[
              { label: 'Open', value: stats.issues.open, color: 'text-red-500', icon: FaExclamationTriangle },
              { label: 'In Progress', value: stats.issues.inProgress, color: 'text-yellow-500', icon: FaTasks },
              { label: 'Resolved', value: stats.issues.resolved, color: 'text-green-500', icon: FaCheckCircle }
            ]}
          />
          
          <DetailCard 
            title="User Distribution"
            items={[
              { label: 'Citizens', value: stats.users.citizens, color: 'text-blue-500', icon: FaUsers },
              { label: 'Agency Officers', value: stats.users.officers, color: 'text-purple-500', icon: FaBuilding },
              { label: 'Active Users', value: stats.users.active, color: 'text-green-500', icon: FaCheckCircle }
            ]}
          />
        </div>

        {/* Recent Issues */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-almost-black">Recent Issues</h3>
            <Link 
              href="/admin/issues"
              className="text-accent2 hover:text-accent2/80 text-sm font-medium flex items-center gap-1"
            >
              View All <FaEye className="text-xs" />
            </Link>
          </div>
          
          {recentIssues.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm">No issues reported yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentIssues.map((issue) => {
                const categoryInfo = getCategoryById(issue.category) || { name: 'Other', color: '#999' };
                
                return (
                  <div key={issue._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                        style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
                      >
                        {issue.trackingNumber ? issue.trackingNumber.split('-')[1] : 'N/A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-almost-black truncate">
                          {issue.title || 'Untitled Issue'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
                          >
                            {categoryInfo.name}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span>{new Date(issue.submittedAt || issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        issue.status === 'submitted' ? 'bg-red-100 text-red-700' :
                        issue.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700' :
                        issue.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {issue.status === 'submitted' ? 'Open' :
                         issue.status === 'acknowledged' ? 'In Review' :
                         issue.status === 'pending' ? 'In Progress' :
                         'Resolved'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-almost-black mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => window.location.href = '/admin/agencies'}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-accent2 hover:bg-accent2/5 transition-all"
            >
              <FaBuilding className="text-accent2 text-2xl" />
              <div className="text-left">
                <p className="font-semibold text-almost-black">Review Agencies</p>
                <p className="text-xs text-neutral-text">{stats.agencies.pending} pending</p>
              </div>
            </button>
            
            <button 
              onClick={() => window.location.href = '/admin/issues'}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-accent2 hover:bg-accent2/5 transition-all"
            >
              <FaExclamationTriangle className="text-accent2 text-2xl" />
              <div className="text-left">
                <p className="font-semibold text-almost-black">Manage Issues</p>
                <p className="text-xs text-neutral-text">{stats.issues.open} open</p>
              </div>
            </button>
            
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-accent2 hover:bg-accent2/5 transition-all"
            >
              <FaUsers className="text-accent2 text-2xl" />
              <div className="text-left">
                <p className="font-semibold text-almost-black">View Users</p>
                <p className="text-xs text-neutral-text">{stats.users.total} total</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
