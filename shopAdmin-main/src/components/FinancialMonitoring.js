import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Download, Eye } from 'react-feather';

const FinancialMonitoring = ({ enterprises, billing }) => {
  const [timeRange, setTimeRange] = useState('6m');

  // Financial data
  const monthlyData = [
    { month: 'January', revenue: 45000, expenses: 12000, profit: 33000 },
    { month: 'February', revenue: 52000, expenses: 13500, profit: 38500 },
    { month: 'March', revenue: 48000, expenses: 12800, profit: 35200 },
    { month: 'April', revenue: 61000, expenses: 14200, profit: 46800 },
    { month: 'May', revenue: 55000, expenses: 13000, profit: 42000 },
    { month: 'June', revenue: 67000, expenses: 15000, profit: 52000 }
  ];

  const industryData = [
    { name: 'Horticulture', revenue: 185000, enterprises: 28 },
    { name: 'Retail', revenue: 142000, enterprises: 15 },
    { name: 'Distribution', revenue: 98000, enterprises: 12 },
    { name: 'Agriculture', revenue: 76000, enterprises: 8 }
  ];

  const revenueByPlan = [
    { name: 'Starter', value: 43056, fill: '#3b82f6' },
    { name: 'Professional', value: 268416, fill: '#10b981' },
    { name: 'Enterprise', value: 119952, fill: '#f59e0b' },
    { name: 'Custom', value: 89970, fill: '#8b5cf6' }
  ];

  const stats = [
    { label: 'Total Platform Revenue', value: 'M521,394', monthly: 'M67,000', trend: '+12.2%' },
    { label: 'Monthly Recurring Revenue', value: 'M56,947', quarterly: '+8.5%', trend: '+8.5%' },
    { label: 'Total Profit Margin', value: '78%', target: '80%', trend: '-2%' },
    { label: 'Average Transaction Value', value: 'M1,847', vs: 'vs M1,650 last month', trend: '+11.9%' }
  ];

  const expenseBreakdown = [
    { category: 'Infrastructure', amount: 28500, percentage: 38 },
    { category: 'Personnel', amount: 32000, percentage: 43 },
    { category: 'Marketing', amount: 8000, percentage: 11 },
    { category: 'Operations', amount: 5500, percentage: 7 }
  ];

  const StatCard = ({ label, value, secondary, trend }) => (
    <div className="rounded-2xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10 hover:border-white/20 transition-all">
      <p className="text-sm font-medium text-white/70 uppercase tracking-wider">{label}</p>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
      {secondary && <p className="mt-2 text-sm text-white/60">{secondary}</p>}
      {trend && <p className="mt-3 text-sm font-medium text-emerald-400">{trend}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-8 border border-white/10">
        <h2 className="text-3xl font-bold text-white">Financial Monitoring</h2>
        <p className="mt-2 text-white/60">Comprehensive financial analytics and revenue tracking across the platform</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 flex-wrap">
        {['1m', '3m', '6m', '1y', 'ytd', 'all'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === range
                ? 'bg-white/20 text-white border border-white/30'
                : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
            }`}
          >
            {range.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Key Financial Metrics */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <StatCard 
            key={idx}
            label={stat.label}
            value={stat.value}
            secondary={stat.monthly || stat.quarterly || stat.vs}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Revenue & Profit Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Revenue & Profit Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
              <Area type="monotone" dataKey="profit" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Subscription Plan */}
        <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Revenue by Plan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueByPlan}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: M${(value / 1000).toFixed(1)}K`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueByPlan.map((entry, index) => (
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

      {/* Industry Revenue Breakdown */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">Revenue by Industry</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={industryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Expense Breakdown */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">Expense Breakdown (Monthly)</h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="space-y-3">
            {expenseBreakdown.map((expense) => (
              <div key={expense.category} className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">{expense.category}</p>
                   <p className="text-white font-bold">M{expense.amount.toLocaleString()}</p>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-red-400 h-full rounded-full"
                    style={{ width: `${expense.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-white/60 mt-2">{expense.percentage}% of total</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <p className="text-sm text-white/70 font-medium mb-4">Summary</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Total Expenses</span>
                <span className="text-2xl font-bold text-white">M74,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Profit Margin</span>
                <span className="text-2xl font-bold text-emerald-400">78%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Cost per Enterprise</span>
                <span className="text-2xl font-bold text-blue-400">M1,850</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-white/70">ROI</span>
                <span className="text-2xl font-bold text-purple-400">318%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Forecast */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Next 12-Month Forecast</h3>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/20">
            <Download size={16} /> Export Report
          </button>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[
            { month: 'Jul 2026', revenue: 'M72,500', change: '+8.2%' },
            { month: 'Aug 2026', revenue: 'M79,200', change: '+9.3%' },
            { month: 'Sep 2026', revenue: 'M85,800', change: '+8.4%' },
            { month: 'Oct 2026', revenue: 'M92,100', change: '+7.3%' }
          ].map((forecast) => (
            <div key={forecast.month} className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 p-4">
              <p className="text-sm text-white/70 font-medium">{forecast.month}</p>
              <p className="mt-2 text-2xl font-bold text-emerald-400">{forecast.revenue}</p>
              <p className="text-xs text-emerald-300 mt-1">Projected {forecast.change}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialMonitoring;
