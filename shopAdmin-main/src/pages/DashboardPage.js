import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const performanceData = [
  { month: 'Jan', revenue: 32000 },
  { month: 'Feb', revenue: 41000 },
  { month: 'Mar', revenue: 38000 },
  { month: 'Apr', revenue: 52000 },
  { month: 'May', revenue: 61000 }
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'super-admin';

  if (isSuperAdmin) {
    return (
      <section className="space-y-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Go Back</span>
        </button>
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">🌿 Garden Platform Overview</h1>
              <p className="mt-2 text-slate-600">Monitor nurseries, subscriptions, gardeners, and platform health from the super-admin console.</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 px-6 py-4 text-emerald-800">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Access level</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">Super Admin</p>
            </div>
          </div>
        </div>
        <div className="grid gap-6 xl:grid-cols-6">
          <div className="rounded-[2rem] bg-white p-8 shadow-card xl:col-span-2">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total Nurseries</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">128</p>
          </div>
          <div className="rounded-[2rem] bg-white p-8 shadow-card xl:col-span-2">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Active Gardeners</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">426</p>
          </div>
          <div className="rounded-[2rem] bg-white p-8 shadow-card xl:col-span-2">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Monthly Revenue</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">M132,000</p>
          </div>
        </div>
        <div className="grid gap-6 xl:grid-cols-4">
          <div className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Expired Subscriptions</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">14</p>
          </div>
          <div className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total Staff</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">1,320</p>
          </div>
          <div className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total Orders</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">5,640</p>
          </div>
          <div className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">System Alerts</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">12</p>
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <h2 className="text-2xl font-semibold text-slate-900">Garden Admin Actions</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl bg-emerald-50 p-6">
              <p className="font-semibold text-emerald-900">Nursery Approvals</p>
              <p className="mt-3 text-sm text-slate-600">Approve or suspend nursery accounts and view their growing activity.</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-6">
              <p className="font-semibold text-emerald-900">Subscription Control</p>
              <p className="mt-3 text-sm text-slate-600">Manage billing plans, renewals, expired accounts, and garden memberships.</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-6">
              <p className="font-semibold text-emerald-900">Greenhouse Monitoring</p>
              <p className="mt-3 text-sm text-slate-600">Track inventory levels, plant health alerts, and support requests across the platform.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Go Back</span>
      </button>
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">🌱 Garden Center Overview</h1>
            <p className="mt-2 text-slate-600">Monitor sales, plant inventory, staff performance, and growing operations across your garden center.</p>
          </div>
          <div className="rounded-3xl bg-emerald-50 px-6 py-4 text-emerald-800">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Subscription health</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">Active</p>
          </div>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Active Gardens</p>
          <p className="mt-4 text-4xl font-bold text-slate-900">24</p>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Low Stock Alerts</p>
          <p className="mt-4 text-4xl font-bold text-amber-600">6</p>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Pending Orders</p>
          <p className="mt-4 text-4xl font-bold text-slate-900">18</p>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Revenue Today</p>
          <p className="mt-4 text-4xl font-bold text-emerald-600">M15,400</p>
        </div>
      </div>
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <h2 className="text-2xl font-semibold text-slate-900">Revenue growth</h2>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#475569" />
              <YAxis stroke="#475569" />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#0f172a" fill="url(#revenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
