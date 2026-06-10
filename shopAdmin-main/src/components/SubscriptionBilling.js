import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CreditCard, TrendingUp, AlertCircle, CheckCircle, Clock, Download, Plus } from 'react-feather';

const SubscriptionBilling = ({ billing, setBilling }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [showAddBillingModal, setShowAddBillingModal] = useState(false);
  const [newBilling, setNewBilling] = useState({
    company: '',
    amount: '',
    status: 'Paid',
    dueDate: ''
  });

  const billingData = [
    { month: 'Jan', paid: 45000, pending: 5000, failed: 2000 },
    { month: 'Feb', paid: 52000, pending: 3000, failed: 1500 },
    { month: 'Mar', paid: 48000, pending: 6000, failed: 2500 },
    { month: 'Apr', paid: 61000, pending: 4000, failed: 1000 },
    { month: 'May', paid: 55000, pending: 7000, failed: 2000 },
    { month: 'Jun', paid: 67000, pending: 5000, failed: 1200 }
  ];

  const subscriptionPlans = [
    { name: 'Starter', price: 299, enterprises: 12, mrr: 3588 },
    { name: 'Professional', price: 799, enterprises: 28, mrr: 22372 },
    { name: 'Enterprise', price: 1999, enterprises: 8, mrr: 15992 },
    { name: 'Custom', price: 2999, enterprises: 5, mrr: 14995 }
  ];

  const paymentMethods = [
    { method: 'Credit Card', successful: 320, failed: 8, percentage: 97.5 },
    { method: 'Bank Transfer', successful: 156, failed: 4, percentage: 97.5 },
    { method: 'M-Pesa', successful: 89, failed: 3, percentage: 96.7 },
    { method: 'EcoCash', successful: 34, failed: 2, percentage: 94.4 }
  ];

  const stats = [
    { label: 'Total MRR', value: 'M56,947', trend: '+12%', icon: CreditCard, color: 'from-green-500 to-emerald-500' },
    { label: 'Paid Invoices', value: `${billing.filter(b => b.status === 'Paid').length}`, trend: '+8%', icon: CheckCircle, color: 'from-blue-500 to-cyan-500' },
    { label: 'Pending Payments', value: `${billing.filter(b => b.status === 'Pending').length}`, trend: '+5%', icon: Clock, color: 'from-yellow-500 to-orange-500' },
    { label: 'Failed Payments', value: `${billing.filter(b => b.status === 'Past due').length}`, trend: '-2%', icon: AlertCircle, color: 'from-red-500 to-rose-500' }
  ];

  const StatBox = ({ icon: Icon, label, value, trend, color }) => (
    <div className={`rounded-2xl backdrop-blur-md bg-gradient-to-br ${color} bg-opacity-10 p-6 border border-white/10 hover:border-white/20 transition-all`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/70 uppercase tracking-wider">{label}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
          <p className={`mt-3 text-sm font-medium ${trend.includes('-') ? 'text-rose-400' : 'text-emerald-400'}`}>{trend}</p>
        </div>
        <div className={`rounded-xl p-3 bg-gradient-to-br ${color} bg-opacity-20`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-8 border border-white/10">
        <h2 className="text-3xl font-bold text-white">Subscription & Billing</h2>
        <p className="mt-2 text-white/60">Monitor revenue, payments, and subscription plans across all enterprises</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <StatBox 
            key={idx}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            trend={stat.trend}
            color={stat.color}
          />
        ))}
      </div>

      {/* Billing Trends Chart */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Billing Trends</h3>
          <div className="flex gap-2">
            {['6m', '1y', 'ytd'].map(period => (
              <button
                key={period}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedPeriod === period 
                    ? 'bg-white/20 text-white border border-white/30' 
                    : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                }`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={billingData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="paid" stackId="a" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="pending" stackId="a" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            <Bar dataKey="failed" stackId="a" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Subscription Plans */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">Subscription Plans Performance</h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {subscriptionPlans.map((plan) => (
            <div key={plan.name} className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:border-white/20 transition-all">
              <h4 className="text-lg font-bold text-white">{plan.name}</h4>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-sm text-white/60">Monthly Price</p>
                  <p className="text-2xl font-bold text-emerald-400">M{plan.price}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Active Enterprises</p>
                  <p className="text-xl font-bold text-blue-400">{plan.enterprises}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Monthly Revenue</p>
                   <p className="text-xl font-bold text-purple-400">M{plan.mrr.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full rounded-full transition-all"
                    style={{ width: `${(plan.enterprises / 30) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">Payment Methods Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-white/70 font-semibold">Payment Method</th>
                <th className="text-right py-4 px-4 text-white/70 font-semibold">Successful</th>
                <th className="text-right py-4 px-4 text-white/70 font-semibold">Failed</th>
                <th className="text-right py-4 px-4 text-white/70 font-semibold">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map((method) => (
                <tr key={method.method} className="border-b border-white/10 hover:bg-white/5 transition-all">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                        {method.method.charAt(0)}
                      </div>
                      <span className="text-white font-medium">{method.method}</span>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4 text-emerald-400 font-medium">{method.successful}</td>
                  <td className="text-right py-4 px-4 text-rose-400 font-medium">{method.failed}</td>
                  <td className="text-right py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-white/10 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full rounded-full"
                          style={{ width: `${method.percentage}%` }}
                        />
                      </div>
                      <span className="text-white font-medium min-w-max">{method.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Recent Invoices</h3>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/20">
            <Download size={16} /> Export
          </button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {billing.slice(0, 10).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex-1">
                <p className="text-white font-medium">{item.company}</p>
                <p className="text-sm text-white/60">{item.dueDate}</p>
              </div>
              <div className="text-right">
                 <p className="text-white font-bold">M{item.amount.toLocaleString()}</p>
                <span className={`text-sm font-medium ${
                  item.status === 'Paid' ? 'text-emerald-400' : 
                  item.status === 'Pending' ? 'text-yellow-400' : 
                  'text-rose-400'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBilling;
