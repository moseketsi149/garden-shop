import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardOverview from '../components/DashboardOverview';
import EnterpriseManagement from '../components/EnterpriseManagement';
import SubscriptionBilling from '../components/SubscriptionBilling';
import SecurityMonitoring from '../components/SecurityMonitoring';
import UserRoleManagement from '../components/UserRoleManagement';
import FinancialMonitoring from '../components/FinancialMonitoring';
import RegistrationApprovals from '../components/RegistrationApprovals';
import { BarChart2, Briefcase, CreditCard, Shield, Users, TrendingUp, Bell, Menu, X, UserPlus, ArrowLeft } from 'react-feather';

const initialEnterprises = [
  { id: 'e1', name: 'Global Farm', status: 'Active', subscriptionStatus: 'Paid', lastPayment: '2026-05-20', users: 112, revenue: 24500, industry: 'Horticulture', plan: 'Enterprise', registrationDate: '2025-01-15', nextBilling: '2026-06-20' },
  { id: 'e2', name: 'Solar Logistics', status: 'Expired', subscriptionStatus: 'Past due', lastPayment: '2026-03-18', users: 68, revenue: 13200, industry: 'Distribution', plan: 'Professional', registrationDate: '2025-02-20', nextBilling: '2026-05-30' },
  { id: 'e3', name: 'HealthWave', status: 'Suspended', subscriptionStatus: 'Suspended', lastPayment: '2026-02-10', users: 39, revenue: 9800, industry: 'Retail', plan: 'Starter', registrationDate: '2025-03-10', nextBilling: '2026-06-10' },
  { id: 'e4', name: 'GreenFields Co', status: 'Active', subscriptionStatus: 'Paid', lastPayment: '2026-05-22', users: 156, revenue: 31200, industry: 'Agriculture', plan: 'Enterprise', registrationDate: '2024-12-01', nextBilling: '2026-06-22' },
  { id: 'e5', name: 'Metro Retail', status: 'Active', subscriptionStatus: 'Paid', lastPayment: '2026-05-21', users: 87, revenue: 18900, industry: 'Retail', plan: 'Professional', registrationDate: '2025-04-05', nextBilling: '2026-06-21' }
];

const initialBilling = [
  { id: 'b1', company: 'Global Farm', amount: 1200, status: 'Paid', dueDate: '2026-06-05' },
  { id: 'b2', company: 'Solar Logistics', amount: 980, status: 'Past due', dueDate: '2026-05-13' },
  { id: 'b3', company: 'HealthWave', amount: 1500, status: 'Pending', dueDate: '2026-06-15' },
  { id: 'b4', company: 'GreenFields Co', amount: 1800, status: 'Paid', dueDate: '2026-06-10' },
  { id: 'b5', company: 'Metro Retail', amount: 950, status: 'Paid', dueDate: '2026-06-08' }
];

export default function SuperAdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [enterprises, setEnterprises] = useState(initialEnterprises);
  const [billing, setBilling] = useState(initialBilling);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user || user.role !== 'super-admin') {
    return (
      <section className="min-h-screen px-6 py-12 bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-12 border border-white/10 text-center">
            <h1 className="text-4xl font-bold text-white">Access Denied</h1>
            <p className="mt-4 text-white/60 text-lg">You need Super Admin privileges to view this dashboard.</p>
          </div>
        </div>
      </section>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: BarChart2 },
    { id: 'approvals', label: 'Approvals', icon: UserPlus },
    { id: 'enterprises', label: 'Enterprises', icon: Briefcase },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'financial', label: 'Financial', icon: TrendingUp }
  ];

  const handleToggleEnterpriseStatus = (enterpriseId, nextStatus) => {
    setEnterprises((current) => current.map((enterprise) => (enterprise.id === enterpriseId ? {
      ...enterprise,
      status: nextStatus
    } : enterprise)));
  };

  const handleDeleteEnterprise = (enterpriseId) => {
    setEnterprises((current) => current.filter((enterprise) => enterprise.id !== enterpriseId));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview enterprises={enterprises} billing={billing} />;
      case 'approvals':
        return <RegistrationApprovals />;
      case 'enterprises':
        return <EnterpriseManagement enterprises={enterprises} onStatusChange={handleToggleEnterpriseStatus} onDelete={handleDeleteEnterprise} />;
      case 'billing':
        return <SubscriptionBilling billing={billing} setBilling={setBilling} />;
      case 'security':
        return <SecurityMonitoring />;
      case 'users':
        return <UserRoleManagement />;
      case 'financial':
        return <FinancialMonitoring enterprises={enterprises} billing={billing} />;
      default:
        return <DashboardOverview enterprises={enterprises} billing={billing} />;
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="flex min-h-screen">
        {/* Floating Header with Notifications */}
        <div className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-slate-950/50 border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-white/10 text-white"
                title="Go Back"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/10 text-white"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Super Admin Platform</h1>
                <p className="text-sm text-white/60">Enterprise SaaS Control Center</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-white/10 text-white transition-all"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-900 font-bold">
                {user?.displayName?.charAt(0) || 'S'}
              </div>
            </div>
          </div>

          {/* Notification Panel */}
          {showNotifications && (
            <div className="px-6 py-4 border-t border-white/10 bg-slate-900/50 backdrop-blur-md space-y-3 max-h-64 overflow-y-auto">
              <div className="rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-sm text-red-200">
                <p className="font-medium">Critical: Solar Logistics subscription expired</p>
                <p className="text-xs text-red-300 mt-1">Action required: 2 hours ago</p>
              </div>
              <div className="rounded-lg bg-yellow-500/20 border border-yellow-500/30 p-3 text-sm text-yellow-200">
                <p className="font-medium">Warning: 3 failed payment attempts detected</p>
                <p className="text-xs text-yellow-300 mt-1">In the last 24 hours</p>
              </div>
              <div className="rounded-lg bg-blue-500/20 border border-blue-500/30 p-3 text-sm text-blue-200">
                <p className="font-medium">Info: System backup completed successfully</p>
                <p className="text-xs text-blue-300 mt-1">1 hour ago</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Navigation */}
        {sidebarOpen && (
          <div className="fixed left-0 top-16 bottom-0 w-64 bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-r border-white/10 backdrop-blur-md overflow-y-auto pt-6">
            <nav className="space-y-2 px-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-white border border-emerald-500/50'
                        : 'text-white/70 hover:bg-white/10 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 pt-24 transition-all ${sidebarOpen ? 'md:ml-64' : ''}`}>
          <div className="px-6 py-8 max-w-7xl mx-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </section>
  );
}
