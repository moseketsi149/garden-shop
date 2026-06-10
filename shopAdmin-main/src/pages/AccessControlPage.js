import { useMemo, useState } from 'react';

const roleTemplates = {
  Owner: {
    specialties: ['Platform strategy', 'Governance', 'Executive oversight'],
    dashboards: ['Executive', 'Access Control', 'Compliance']
  },
  Admin: {
    specialties: ['Operations', 'Systems management', 'User provisioning'],
    dashboards: ['Admin overview', 'Inventory', 'Orders']
  },
  'HR Officer': {
    specialties: ['Recruitment', 'Benefits', 'Payroll'],
    dashboards: ['HR dashboard', 'People analytics']
  },
  'Sales Manager': {
    specialties: ['Pipeline', 'Revenue', 'Client engagement'],
    dashboards: ['Sales dashboard', 'Orders']
  },
  Support: {
    specialties: ['Tickets', 'Customer success', 'Knowledge base'],
    dashboards: ['Support dashboard']
  }
};

export default function AccessControlPage() {
  const [users, setUsers] = useState([
    {
      id: 'u1',
      email: 'admin@enterprise.com',
      role: 'Owner',
      tenant: 'GlobalFarm',
      status: 'Active',
      specialties: roleTemplates.Owner.specialties,
      dashboards: roleTemplates.Owner.dashboards
    },
    {
      id: 'u2',
      email: 'hr@enterprise.com',
      role: 'HR Officer',
      tenant: 'GlobalFarm',
      status: 'Active',
      specialties: roleTemplates['HR Officer'].specialties,
      dashboards: roleTemplates['HR Officer'].dashboards
    },
    {
      id: 'u3',
      email: 'sales@enterprise.com',
      role: 'Sales Manager',
      tenant: 'GlobalFarm',
      status: 'Suspended',
      specialties: roleTemplates['Sales Manager'].specialties,
      dashboards: roleTemplates['Sales Manager'].dashboards
    }
  ]);
  const [selectedUserId, setSelectedUserId] = useState('u1');
  const roles = ['Owner', 'Admin', 'HR Officer', 'Sales Manager', 'Support'];

  const selectedUser = users.find((user) => user.id === selectedUserId) || users[0];

  const stats = useMemo(() => {
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return {
      total: users.length,
      active: users.filter((user) => user.status === 'Active').length,
      suspended: users.filter((user) => user.status !== 'Active').length,
      roleCounts
    };
  }, [users]);

  const getTemplate = (role) => roleTemplates[role] || {
    specialties: ['General operations'],
    dashboards: ['Admin overview']
  };

  const handleRoleChange = (userId, newRole) => {
    const template = getTemplate(newRole);
    setUsers((current) => current.map((user) => (user.id === userId ? {
      ...user,
      role: newRole,
      specialties: template.specialties,
      dashboards: template.dashboards
    } : user)));
  };

  const handleRemoveUser = (userId) => {
    setUsers((current) => current.filter((user) => user.id !== userId));
    if (selectedUserId === userId) {
      setSelectedUserId(users.find((user) => user.id !== userId)?.id || '');
    }
  };

  const handleToggleSpecialty = (specialty) => {
    setUsers((current) => current.map((user) => {
      if (user.id !== selectedUserId) return user;
      return {
        ...user,
        specialties: user.specialties.includes(specialty)
          ? user.specialties.filter((item) => item !== specialty)
          : [...user.specialties, specialty]
      };
    }));
  };

  const handleToggleDashboard = (dashboard) => {
    setUsers((current) => current.map((user) => {
      if (user.id !== selectedUserId) return user;
      return {
        ...user,
        dashboards: user.dashboards.includes(dashboard)
          ? user.dashboards.filter((item) => item !== dashboard)
          : [...user.dashboards, dashboard]
      };
    }));
  };

  const availableActivities = selectedUser ? getTemplate(selectedUser.role).specialties : [];
  const availableDashboards = selectedUser ? getTemplate(selectedUser.role).dashboards : [];

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Access control</h1>
            <p className="mt-2 text-slate-600">Assign roles, activity specializations, and dashboard access for your admin team.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-5 text-slate-700">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total admins</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.total}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 text-slate-700">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Active accounts</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.active}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 text-slate-700">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Suspended</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.suspended}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <h2 className="text-2xl font-semibold text-slate-900">Role distribution</h2>
          <div className="mt-6 space-y-4">
            {Object.entries(stats.roleCounts).map(([role, count]) => (
              <div key={role} className="rounded-3xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-slate-900">{role}</p>
                  <span className="text-sm text-slate-500">{count} user{count !== 1 ? 's' : ''}</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900"
                    style={{ width: `${(count / Math.max(stats.total, 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <h2 className="text-2xl font-semibold text-slate-900">Quick analysis</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="font-medium text-slate-900">Active ratio</p>
              <p className="mt-2">{stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(0) : 0}% of admin accounts are active.</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="font-medium text-slate-900">Top role</p>
              <p className="mt-2">{Object.keys(stats.roleCounts).sort((a, b) => stats.roleCounts[b] - stats.roleCounts[a])[0] || 'N/A'}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="font-medium text-slate-900">Next action</p>
              <p className="mt-2">Select a user to manage their dashboards, specialization areas, and role-based access.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 text-slate-900">
            <tr>
              <th className="py-4">Email</th>
              <th className="py-4">Role</th>
              <th className="py-4">Tenant</th>
              <th className="py-4">Status</th>
              <th className="py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr
                key={user.id}
                className={user.id === selectedUserId ? 'bg-slate-50' : ''}
              >
                <td className="py-4 font-medium text-slate-900">{user.email}</td>
                <td className="py-4">
                  <select
                    value={user.role}
                    onChange={(event) => handleRoleChange(user.id, event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </td>
                <td className="py-4">{user.tenant}</td>
                <td className="py-4">
                  <span className={`rounded-full px-3 py-1 text-sm ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(user.id)}
                    className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Select
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveUser(user.id)}
                    className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold text-slate-900">{selectedUser.email} profile</h2>
              <p className="mt-2 text-slate-600">Role-based activities, dashboard access, and specialization settings for the selected admin.</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6 text-slate-700">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Assigned role</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{selectedUser.role}</p>
            </div>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 p-6">
              <h3 className="text-xl font-semibold text-slate-900">Specialization areas</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {selectedUser.specialties.map((specialty) => (
                  <span key={specialty} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{specialty}</span>
                ))}
              </div>
              <div className="mt-5 space-y-3">
                <p className="text-sm font-semibold text-slate-900">Customize specialty areas</p>
                {availableActivities.map((activity) => (
                  <label key={activity} className="flex items-center gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedUser.specialties.includes(activity)}
                      onChange={() => handleToggleSpecialty(activity)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900"
                    />
                    {activity}
                  </label>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 p-6">
              <h3 className="text-xl font-semibold text-slate-900">Dashboard access</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {selectedUser.dashboards.map((dashboard) => (
                  <span key={dashboard} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{dashboard}</span>
                ))}
              </div>
              <div className="mt-5 space-y-3">
                <p className="text-sm font-semibold text-slate-900">Enable dashboards</p>
                {availableDashboards.map((dashboard) => (
                  <label key={dashboard} className="flex items-center gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedUser.dashboards.includes(dashboard)}
                      onChange={() => handleToggleDashboard(dashboard)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900"
                    />
                    {dashboard}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
