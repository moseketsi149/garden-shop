import { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, AlertCircle, Zap, Shield } from 'react-feather';

const DashboardOverview = ({ enterprises, billing }) => {
  const revenueData = [
    { month: 'Jan', revenue: 45000, target: 50000 },
    { month: 'Feb', revenue: 52000, target: 50000 },
    { month: 'Mar', revenue: 48000, target: 50000 },
    { month: 'Apr', revenue: 61000, target: 60000 },
    { month: 'May', revenue: 55000, target: 60000 },
    { month: 'Jun', revenue: 67000, target: 65000 }
  ];

  const enterpriseStatusData = [
    { name: 'Active', value: enterprises.filter(e => e.status === 'Active').length, fill: '#10b981' },
    { name: 'Suspended', value: enterprises.filter(e => e.status === 'Suspended').length, fill: '#f59e0b' },
    { name: 'Expired', value: enterprises.filter(e => e.status === 'Expired').length, fill: '#ef4444' }
  ];

  const paymentMethodsData = [
    { method: 'Credit Card', amount: 125000, percentage: 45 },
    { method: 'Bank Transfer', amount: 98000, percentage: 35 },
    { method: 'M-Pesa', amount: 42000, percentage: 15 },
    { method: 'Other', amount: 15000, percentage: 5 }
  ];

  const stats = useMemo(() => ({
    totalEnterprises: enterprises.length,
    activeEnterprises: enterprises.filter(e => e.status === 'Active').length,
    suspendedEnterprises: enterprises.filter(e => e.status === 'Suspended').length,
    totalUsers: enterprises.reduce((sum, e) => sum + (e.users || 0), 0),
    totalRevenue: enterprises.reduce((sum, e) => sum + (e.revenue || 0), 0),
    monthlyRecurring: 67000,
    failedPayments: billing.filter(b => b.status === 'Past due').length,
    activeSessions: 2340,
    apiUsage: 87,
    supportTickets: 24,
    systemHealth: 99
  }), [enterprises, billing]);

  const StatCard = ({ icon: Icon, label, value, trend, trendUp = true, bgColor }) => (
    <div className={`rounded-2xl backdrop-blur-md ${bgColor} p-6 border border-white/10 hover:border-white/20 transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/70 uppercase tracking-wider">{label}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
          {trend && (
            <div className={`mt-3 flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trendUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{trend}% {trendUp ? 'increase' : 'decrease'}</span>
            </div>
          )}
        </div>
        <div className={`rounded-xl p-3 ${bgColor === 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20' ? 'bg-blue-500/20' : bgColor === 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' ? 'bg-emerald-500/20' : bgColor === 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' ? 'bg-purple-500/20' : 'bg-orange-500/20'}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-8 border border-white/10">
        <h2 className="text-4xl font-bold text-white mb-2">Platform Analytics</h2>
        <p className="text-white/60">Real-time insights into your SaaS ecosystem</p>
      </div>

      {/* Primary Metrics */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={Users} 
          label="Total Enterprises" 
          value={stats.totalEnterprises}
          trend={12}
          trendUp={true}
          bgColor="bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
        />
        <StatCard 
          icon={Activity} 
          label="Active Enterprises" 
          value={stats.activeEnterprises}
          trend={8}
          trendUp={true}
          bgColor="bg-gradient-to-br from-emerald-500/20 to-teal-500/20"
        />
        <StatCard 
          icon={AlertCircle} 
          label="Suspended" 
          value={stats.suspendedEnterprises}
          trend={2}
          trendUp={false}
          bgColor="bg-gradient-to-br from-orange-500/20 to-red-500/20"
        />
        <StatCard 
          icon={Shield} 
          label="System Health" 
          value={`${stats.systemHealth}%`}
          bgColor="bg-gradient-to-br from-purple-500/20 to-pink-500/20"
        />
      </div>

      {/* Revenue and Users */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <StatCard 
          icon={DollarSign} 
          label="Total Revenue" 
          value={`M${(stats.totalRevenue / 1000).toFixed(1)}K`}
          trend={15}
          trendUp={true}
          bgColor="bg-gradient-to-br from-green-500/20 to-emerald-500/20"
        />
        <StatCard 
          icon={DollarSign} 
          label="Monthly Recurring" 
          value={`M${(stats.monthlyRecurring / 1000).toFixed(1)}K`}
          trend={9}
          trendUp={true}
          bgColor="bg-gradient-to-br from-indigo-500/20 to-blue-500/20"
        />
        <StatCard 
          icon={Users} 
          label="Platform Users" 
          value={(stats.totalUsers / 1000).toFixed(1)}
          trend={18}
          trendUp={true}
          bgColor="bg-gradient-to-br from-violet-500/20 to-purple-500/20"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="target" stroke="rgba(255,255,255,0.3)" fillOpacity={0} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Enterprise Status Distribution */}
        <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Enterprise Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={enterpriseStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {enterpriseStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                labelStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <StatCard 
          icon={AlertCircle} 
          label="Failed Payments" 
          value={stats.failedPayments}
          bgColor="bg-gradient-to-br from-red-500/20 to-rose-500/20"
        />
        <StatCard 
          icon={Zap} 
          label="Active Sessions" 
          value={stats.activeSessions.toLocaleString()}
          trend={5}
          trendUp={true}
          bgColor="bg-gradient-to-br from-yellow-500/20 to-orange-500/20"
        />
        <StatCard 
          icon={Users} 
          label="Support Tickets" 
          value={stats.supportTickets}
          bgColor="bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
        />
      </div>

      {/* Payment Methods Breakdown */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">Payment Methods Breakdown</h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {paymentMethodsData.map((method) => (
            <div key={method.method} className="rounded-2xl bg-white/5 p-4 border border-white/10">
              <p className="text-sm text-white/70 font-medium">{method.method}</p>
               <p className="mt-2 text-2xl font-bold text-white">M{(method.amount / 1000).toFixed(1)}K</p>
              <div className="mt-3 bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full rounded-full"
                  style={{ width: `${method.percentage}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-white/50">{method.percentage}% of total</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
