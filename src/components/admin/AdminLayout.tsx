"use client";
import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FaHome, FaBuilding, FaExclamationTriangle, FaUsers, 
  FaCog, FaSignOutAlt, FaBars, FaTimes,
  FaCheckCircle, FaUserShield
} from 'react-icons/fa';
import { userAPI } from '@/lib/api';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminData, setAdminData] = useState<{ fullName: string; email: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const fetchAdminData = async () => {
    try {
      const profileResponse = await userAPI.getProfile();
      if (profileResponse.success) {
        setAdminData(profileResponse.user);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: FaHome },
    { name: 'Agency Management', href: '/admin/agencies', icon: FaBuilding },
    { name: 'Issue Management', href: '/admin/issues', icon: FaExclamationTriangle },
    { name: 'User Management', href: '/admin/users', icon: FaUsers },
    { name: 'Template Builder', href: '/admin/templates', icon: FaCog },
  ];

  const handleLogout = () => {
    // Clear tokens and user data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
    }
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-almost-black text-white transition-all duration-300 flex flex-col`}>
        {/* Logo & Toggle */}
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <FaUserShield className="text-accent2 text-2xl" />
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-accent2 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                title={!sidebarOpen ? item.name : ''}
              >
                <item.icon className="text-xl  shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-700">
          <div className={`flex items-center gap-3 px-4 py-3 mb-2 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-10 h-10 bg-accent2 rounded-full flex items-center justify-center  shrink-0">
              <FaUserShield className="text-lg" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {adminData?.fullName || 'Administrator'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {adminData?.email || 'admin@civicsignal.rw'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200 ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <FaSignOutAlt className="text-xl  shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-almost-black">
                {navigation.find(item => item.href === pathname)?.name || 'Admin Panel'}
              </h2>
              <p className="text-sm text-neutral-text mt-1">
                Manage and oversee all CivicSignal operations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <FaCheckCircle className="text-green-600" />
                <span className="text-sm font-medium text-green-700">System Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
