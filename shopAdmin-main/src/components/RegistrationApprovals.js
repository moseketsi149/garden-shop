import { useState, useEffect, Fragment } from 'react';
import { Check, X, Eye, AlertCircle, Users, UserCheck, UserX, Clock } from 'react-feather';
import { db } from '../firebase/config';
import { collection, doc, updateDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-toastify';

const RegistrationApprovals = () => {
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const regs = [];
          snapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            if (data.approvalStatus === 'pending' || 
                data.approvalStatus === 'approved' || 
                data.approvalStatus === 'rejected') {
              regs.push({
                id: docSnapshot.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null
              });
            }
          });
          setRegistrations(regs);
          filterRegistrations(regs, filter);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error fetching registrations:', error);
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [filter]);

  const filterRegistrations = (regs, filterType) => {
    if (filterType === 'all') {
      setFilteredRegistrations(regs);
    } else {
      setFilteredRegistrations(regs.filter(r => r.approvalStatus === filterType));
    }
  };

  const handleApprove = async (registration) => {
    if (!window.confirm('Are you sure you want to approve ' + (registration.fullName || registration.name) + "'s registration?")) {
      return;
    }

    setProcessing(true);
    try {
      const userRef = doc(db, 'users', registration.id);
      await updateDoc(userRef, {
        approvalStatus: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: 'admin',
        updatedAt: new Date().toISOString()
      });

      toast.success('Registration approved for ' + (registration.fullName || registration.name));
      setShowModal(false);
      setSelectedRegistration(null);
    } catch (error) {
      console.error('Error approving registration:', error);
      toast.error('Failed to approve registration');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (registration) => {
    if (!window.confirm('Are you sure you want to reject ' + (registration.fullName || registration.name) + "'s registration?")) {
      return;
    }

    setProcessing(true);
    try {
      const userRef = doc(db, 'users', registration.id);
      await updateDoc(userRef, {
        approvalStatus: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: 'admin',
        updatedAt: new Date().toISOString()
      });

      toast.success('Registration rejected for ' + (registration.fullName || registration.name));
      setShowModal(false);
      setSelectedRegistration(null);
    } catch (error) {
      console.error('Error rejecting registration:', error);
      toast.error('Failed to reject registration');
    } finally {
      setProcessing(false);
    }
  };

  const StatusBadge = ({ status }) => {
    if (status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
          <Clock size={12} /> Pending
        </span>
      );
    }
    if (status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <Check size={12} /> Approved
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
          <X size={12} /> Rejected
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300">
        Unknown
      </span>
    );
  };

  const RoleBadge = ({ role }) => {
    const roleColors = {
      'customer': 'from-blue-500 to-cyan-500',
      'company-admin': 'from-purple-500 to-pink-500',
      'individual-seller': 'from-green-500 to-emerald-500',
      'employee': 'from-orange-500 to-yellow-500'
    };

    const roleName = role ? role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
    return (
      <span className={'px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ' + (roleColors[role] || 'from-slate-500 to-slate-600') + ' text-white'}>
        {roleName}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    pending: registrations.filter(r => r.approvalStatus === 'pending').length,
    approved: registrations.filter(r => r.approvalStatus === 'approved').length,
    rejected: registrations.filter(r => r.approvalStatus === 'rejected').length,
    total: registrations.length
  };

  const tabButtons = [
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'approved', label: 'Approved', count: stats.approved },
    { id: 'rejected', label: 'Rejected', count: stats.rejected },
    { id: 'all', label: 'All', count: stats.total }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-8 border border-white/10">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Users size={32} />
          Registration Approvals
        </h2>
        <p className="mt-2 text-white/60">Review and manage user registration requests from the marketplace</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl backdrop-blur-md bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Pending Reviews</p>
              <p className="text-3xl font-bold text-yellow-300 mt-1">{stats.pending}</p>
            </div>
            <Clock size={32} className="text-yellow-400" />
          </div>
        </div>

        <div className="rounded-2xl backdrop-blur-md bg-gradient-to-br from-emerald-500/20 to-green-500/20 p-6 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Approved</p>
              <p className="text-3xl font-bold text-emerald-300 mt-1">{stats.approved}</p>
            </div>
            <UserCheck size={32} className="text-emerald-400" />
          </div>
        </div>

        <div className="rounded-2xl backdrop-blur-md bg-gradient-to-br from-red-500/20 to-rose-500/20 p-6 border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Rejected</p>
              <p className="text-3xl font-bold text-red-300 mt-1">{stats.rejected}</p>
            </div>
            <UserX size={32} className="text-red-400" />
          </div>
        </div>

        <div className="rounded-2xl backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Registrations</p>
              <p className="text-3xl font-bold text-blue-300 mt-1">{stats.total}</p>
            </div>
            <Users size={32} className="text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-white/10">
        {tabButtons.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={'px-4 py-3 border-b-2 font-medium transition-all flex items-center gap-2 ' + (
              filter === tab.id
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white/80'
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={'px-2 py-0.5 rounded-full text-xs ' + (
                filter === tab.id
                  ? 'bg-white text-slate-900'
                  : 'bg-white/10 text-white'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Registrations List */}
      <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
        {loading ? (
          <div className="text-center py-12 text-white/60">Loading registrations...</div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No {filter === 'all' ? '' : filter} registrations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-white/70 font-semibold">User</th>
                  <th className="text-left py-4 px-4 text-white/70 font-semibold">Email</th>
                  <th className="text-left py-4 px-4 text-white/70 font-semibold">Role</th>
                  <th className="text-left py-4 px-4 text-white/70 font-semibold">Registered</th>
                  <th className="text-left py-4 px-4 text-white/70 font-semibold">Status</th>
                  <th className="text-left py-4 px-4 text-white/70 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="border-b border-white/10 hover:bg-white/5 transition-all">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                          {(reg.fullName || reg.name || reg.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{reg.fullName || reg.name || 'N/A'}</p>
                          {reg.accountType && (
                            <p className="text-xs text-white/50 capitalize">{reg.accountType}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white/70 font-mono text-xs">{reg.email}</td>
                    <td className="py-4 px-4"><RoleBadge role={reg.role} /></td>
                    <td className="py-4 px-4 text-white/70 text-xs">{formatDate(reg.createdAt)}</td>
                    <td className="py-4 px-4"><StatusBadge status={reg.approvalStatus} /></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRegistration(reg);
                            setShowModal(true);
                          }}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {reg.approvalStatus === 'pending' && (
                          <Fragment>
                            <button
                              onClick={() => handleApprove(reg)}
                              className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-all"
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(reg)}
                              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all"
                              title="Reject"
                            >
                              <X size={16} />
                            </button>
                          </Fragment>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-white/20 p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Registration Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl">
                  {(selectedRegistration.fullName || selectedRegistration.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">{selectedRegistration.fullName || selectedRegistration.name}</h4>
                  <p className="text-white/60">{selectedRegistration.email}</p>
                  <div className="mt-2 flex gap-2">
                    <RoleBadge role={selectedRegistration.role} />
                    <StatusBadge status={selectedRegistration.approvalStatus} />
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                  <p className="text-white/60 text-sm">Account Type</p>
                  <p className="text-white font-medium capitalize">{selectedRegistration.accountType || 'N/A'}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                  <p className="text-white/60 text-sm">Registered On</p>
                  <p className="text-white font-medium">{formatDate(selectedRegistration.createdAt)}</p>
                </div>
                {selectedRegistration.fullPhoneNumber && (
                  <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                    <p className="text-white/60 text-sm">Phone Number</p>
                    <p className="text-white font-medium">{selectedRegistration.fullPhoneNumber}</p>
                  </div>
                )}
                {selectedRegistration.address && (
                  <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                    <p className="text-white/60 text-sm">Address</p>
                    <p className="text-white font-medium">{selectedRegistration.address}</p>
                  </div>
                )}
                {selectedRegistration.referralSource && (
                  <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                    <p className="text-white/60 text-sm">Heard About Us</p>
                    <p className="text-white font-medium capitalize">{selectedRegistration.referralSource}</p>
                  </div>
                )}
                {selectedRegistration.companyName && (
                  <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                    <p className="text-white/60 text-sm">Company Name</p>
                    <p className="text-white font-medium">{selectedRegistration.companyName}</p>
                  </div>
                )}
                {selectedRegistration.websiteName && (
                  <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                    <p className="text-white/60 text-sm">Website/Brand</p>
                    <p className="text-white font-medium">{selectedRegistration.websiteName}</p>
                  </div>
                )}
                {selectedRegistration.paymentStatus && (
                  <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                    <p className="text-white/60 text-sm">Payment Status</p>
                    <p className="text-white font-medium capitalize">{selectedRegistration.paymentStatus}</p>
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              {selectedRegistration.approvalStatus !== 'pending' && (
                <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                  <p className="text-white/60 text-sm mb-3">Status History</p>
                  {selectedRegistration.approvalStatus === 'approved' && selectedRegistration.approvedAt && (
                    <div className="flex items-center gap-2 text-emerald-300">
                      <Check size={16} />
                      <span>Approved on {formatDate(selectedRegistration.approvedAt)}</span>
                    </div>
                  )}
                  {selectedRegistration.approvalStatus === 'rejected' && (
                    <div className="flex items-center gap-2 text-red-300">
                      <X size={16} />
                      <span>Rejected on {formatDate(selectedRegistration.rejectedAt)}</span>
                    </div>
                  )}
                  {selectedRegistration.rejectionReason && (
                    <div className="mt-2 text-white/60 text-sm">
                      <p className="font-medium">Reason:</p>
                      <p>{selectedRegistration.rejectionReason}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              {selectedRegistration.approvalStatus === 'pending' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(selectedRegistration)}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
                  >
                    <Check size={18} />
                    {processing ? 'Processing...' : 'Approve Registration'}
                  </button>
                  <button
                    onClick={() => handleReject(selectedRegistration)}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium hover:from-red-600 hover:to-rose-600 transition-all disabled:opacity-50"
                  >
                    <X size={18} />
                    {processing ? 'Processing...' : 'Reject Registration'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationApprovals;