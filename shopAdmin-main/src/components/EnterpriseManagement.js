import { useState } from 'react';
import { ChevronDown, Search, Filter, Download, Plus, Trash2, Pause, PlayCircle, Eye, MoreVertical } from 'react-feather';

const EnterpriseManagement = ({ enterprises, onStatusChange, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [showNewModal, setShowNewModal] = useState(false);

  const filteredEnterprises = enterprises
    .filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || e.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'revenue') return b.revenue - a.revenue;
      if (sortBy === 'users') return b.users - a.users;
      return 0;
    });

  const StatusBadge = ({ status }) => {
    const styles = {
      Active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      Suspended: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      Expired: 'bg-red-500/20 text-red-300 border-red-500/30',
      Pending: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status] || styles.Pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-8 border border-white/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Enterprise Management</h2>
            <p className="mt-2 text-white/60">Manage, monitor, and control all registered enterprises</p>
          </div>
          <button 
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-all"
          >
            <Plus size={20} /> New Enterprise
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-3.5 text-white/40" size={20} />
          <input
            type="text"
            placeholder="Search enterprises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-all backdrop-blur-md"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-3.5 text-white/40" size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 transition-all backdrop-blur-md appearance-none"
          >
            <option value="All" className="bg-slate-900">All Status</option>
            <option value="Active" className="bg-slate-900">Active</option>
            <option value="Suspended" className="bg-slate-900">Suspended</option>
            <option value="Expired" className="bg-slate-900">Expired</option>
            <option value="Pending" className="bg-slate-900">Pending</option>
          </select>
          <ChevronDown className="absolute right-4 top-3.5 text-white/40 pointer-events-none" size={20} />
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex gap-2">
        {['name', 'revenue', 'users'].map(option => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              sortBy === option 
                ? 'bg-white/20 text-white border border-white/30' 
                : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
            }`}
          >
            Sort by {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {/* Enterprises List */}
      <div className="space-y-4">
        {filteredEnterprises.length > 0 ? (
          filteredEnterprises.map(enterprise => (
            <div key={enterprise.id} className="rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all p-6 group">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{enterprise.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{enterprise.name}</h3>
                      <p className="text-sm text-white/60">{enterprise.industry || 'Enterprise'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <StatusBadge status={enterprise.status} />
                  
                  <div className="text-right">
                    <p className="text-sm text-white/60">Revenue</p>
                    <p className="text-lg font-bold text-emerald-400">${enterprise.revenue.toLocaleString()}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-white/60">Users</p>
                    <p className="text-lg font-bold text-blue-400">{enterprise.users}</p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="mt-4 grid gap-2 md:grid-cols-4 text-sm">
                <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                  <p className="text-white/60">Registration Date</p>
                  <p className="mt-1 font-medium text-white">{enterprise.registrationDate || '2025-01-15'}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                  <p className="text-white/60">Subscription Plan</p>
                  <p className="mt-1 font-medium text-white">{enterprise.plan || 'Professional'}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                  <p className="text-white/60">Last Payment</p>
                  <p className="mt-1 font-medium text-white">{enterprise.lastPayment || '2026-05-20'}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                  <p className="text-white/60">Next Billing</p>
                  <p className="mt-1 font-medium text-white">{enterprise.nextBilling || '2026-06-20'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => onStatusChange(enterprise.id, enterprise.status === 'Active' ? 'Suspended' : 'Active')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 font-medium transition-all"
                >
                  {enterprise.status === 'Active' ? (
                    <>
                      <Pause size={16} /> Suspend
                    </>
                  ) : (
                    <>
                      <PlayCircle size={16} /> Activate
                    </>
                  )}
                </button>

                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 font-medium transition-all">
                  <Eye size={16} /> View Details
                </button>

                <button
                  onClick={() => onDelete(enterprise.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 font-medium transition-all"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 p-12 text-center">
            <p className="text-lg font-medium text-white/60">No enterprises found</p>
            <p className="mt-2 text-white/40">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* New Enterprise Modal (Basic) */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 border border-white/10 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white">Register New Enterprise</h3>
            <p className="mt-2 text-white/60">Add a new enterprise to the platform</p>
            
            <div className="mt-6 space-y-4">
              <input type="text" placeholder="Enterprise Name" className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40" />
              <input type="email" placeholder="Admin Email" className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40" />
              <select className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/40">
                <option className="bg-slate-900">Select Industry</option>
                <option className="bg-slate-900">Horticulture</option>
                <option className="bg-slate-900">Retail</option>
                <option className="bg-slate-900">Distribution</option>
                <option className="bg-slate-900">Agriculture</option>
              </select>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 border border-white/20 font-medium transition-all">
                Cancel
              </button>
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-all">
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseManagement;
