"use client";
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminAPI } from '@/lib/api';
import { 
  FaBuilding, FaExclamationTriangle, FaUsers, FaCheckCircle,
  FaClock, FaTimes, FaChartLine, FaTasks
} from 'react-icons/fa';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      
      if (response.success) {
        setStats(response.stats);
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
        <div className="bg-gradient-to-r from-accent2 to-accent rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back, Administrator!</h1>
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
            trend="+5 this week"
          />
          <StatCard 
            title="Total Issues"
            value={stats.issues.total}
            icon={FaExclamationTriangle}
            color="bg-orange-500"
            subtitle={`${stats.issues.open} need attention`}
            trend="+12 today"
          />
          <StatCard 
            title="Total Users"
            value={stats.users.total}
            icon={FaUsers}
            color="bg-green-500"
            subtitle={`${stats.users.active} active now`}
            trend="+24 this week"
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
