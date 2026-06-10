import { useState } from 'react';
import {
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  Lock,
  Unlock,
  Upload,
  FileText,
} from 'react-feather';

const UserRoleManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@devsolution.com',
      role: 'Super Admin',
      status: 'Active',
      joinDate: '2025-01-10',
      lastLogin: '2026-05-27 14:32',
    },
    {
      id: 2,
      name: 'Enterprise Manager',
      email: 'manager@enterprise1.com',
      role: 'Admin',
      status: 'Active',
      joinDate: '2025-03-15',
      lastLogin: '2026-05-27 13:15',
    },
    {
      id: 3,
      name: 'Support Agent',
      email: 'support@devsolution.com',
      role: 'Support',
      status: 'Active',
      joinDate: '2025-02-20',
      lastLogin: '2026-05-27 12:00',
    },
    {
      id: 4,
      name: 'Analytics User',
      email: 'analytics@devsolution.com',
      role: 'Analyst',
      status: 'Inactive',
      joinDate: '2025-04-05',
      lastLogin: '2026-05-15 09:30',
    },
    {
      id: 5,
      name: 'Finance Manager',
      email: 'finance@enterprise2.com',
      role: 'Finance',
      status: 'Active',
      joinDate: '2025-05-12',
      lastLogin: '2026-05-26 16:45',
    },
  ]);

  const [roles] = useState([
    {
      id: 1,
      name: 'Super Admin',
      permissions: [
        'Full Access',
        'User Management',
        'Billing',
        'Security',
        'System Config',
      ],
      users: 1,
      color: 'from-red-500 to-rose-500',
    },
    {
      id: 2,
      name: 'Admin',
      permissions: [
        'Enterprise Management',
        'User Management',
        'Support',
        'Reports',
      ],
      users: 15,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 3,
      name: 'Support',
      permissions: ['Support Tickets', 'View Enterprises', 'Reports'],
      users: 8,
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 4,
      name: 'Analyst',
      permissions: ['View Reports', 'Analytics', 'Export Data'],
      users: 5,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 5,
      name: 'Finance',
      permissions: ['Billing', 'Invoices', 'Reports'],
      users: 3,
      color: 'from-yellow-500 to-orange-500',
    },
  ]);

  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [uploadedContract, setUploadedContract] = useState(null);

  const permissions = [
    {
      id: 'full_access',
      name: 'Full Access',
      description: 'Complete platform control',
    },
    {
      id: 'user_mgmt',
      name: 'User Management',
      description: 'Create, edit, delete users',
    },
    {
      id: 'enterprise_mgmt',
      name: 'Enterprise Management',
      description: 'Manage enterprises',
    },
    {
      id: 'billing',
      name: 'Billing Management',
      description: 'Handle subscriptions and payments',
    },
    {
      id: 'security',
      name: 'Security Management',
      description: 'Manage security and threats',
    },
    {
      id: 'system_config',
      name: 'System Configuration',
      description: 'Configure platform settings',
    },
    {
      id: 'support',
      name: 'Support',
      description: 'Manage support tickets',
    },
    {
      id: 'reports',
      name: 'Reports',
      description: 'Generate and view reports',
    },
    {
      id: 'view_analytics',
      name: 'View Analytics',
      description: 'Access platform analytics',
    },
    {
      id: 'export_data',
      name: 'Export Data',
      description: 'Export platform data',
    },
  ];

  const toggleUserStatus = (userId) => {
    setUsers(
      users.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: u.status === 'Active' ? 'Inactive' : 'Active',
            }
          : u
      )
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-8 border border-white/10">
          <h2 className="text-3xl font-bold text-white">
            User & Role Management
          </h2>

          <p className="mt-2 text-white/60">
            Manage administrators, permissions, and role-based access control
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-white/10">
          <button className="px-4 py-3 border-b-2 border-white text-white font-medium">
            Users
          </button>

          <button className="px-4 py-3 border-b-2 border-transparent text-white/60 font-medium hover:text-white/80 transition-all">
            Roles
          </button>

          <button className="px-4 py-3 border-b-2 border-transparent text-white/60 font-medium hover:text-white/80 transition-all">
            Permissions
          </button>
        </div>

        {/* Users Section */}
        <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">
                Platform Users
              </h3>

              <p className="mt-1 text-white/60">
                Manage all users and their access levels
              </p>
            </div>

            <button
              onClick={() => {
                setShowNewUserModal(true);
                setSelectedUser(null);
                setUploadedContract(null);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-all"
            >
              <Plus size={18} />
              Add User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-white/70 font-semibold">
                    Name
                  </th>

                  <th className="text-left py-4 px-4 text-white/70 font-semibold">
                    Email
                  </th>

                  <th className="text-left py-4 px-4 text-white/70 font-semibold">
                    Role
                  </th>

                  <th className="text-left py-4 px-4 text-white/70 font-semibold">
                    Last Login
                  </th>

                  <th className="text-left py-4 px-4 text-white/70 font-semibold">
                    Status
                  </th>

                  <th className="text-left py-4 px-4 text-white/70 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/10 hover:bg-white/5 transition-all"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>

                        <span className="text-white font-medium">
                          {user.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-white/70 font-mono text-xs">
                      {user.email}
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30">
                        {user.role}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-white/70 text-xs">
                      {user.lastLogin}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                          user.status === 'Active'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                        >
                          {user.status === 'Active' ? (
                            <Lock size={16} />
                          ) : (
                            <Unlock size={16} />
                          )}
                        </button>

                        <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
                          <Edit size={16} />
                        </button>

                        <button className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Roles Section */}
        <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              System Roles
            </h3>

            <button
              onClick={() => setShowNewRoleModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium"
            >
              <Plus size={18} />
              Create Role
            </button>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() =>
                  setSelectedRole(
                    selectedRole?.id === role.id ? null : role
                  )
                }
                className="rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all p-4 cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${role.color}`}
                  />

                  <h4 className="text-white font-bold">{role.name}</h4>
                </div>

                <p className="text-sm text-white/60 mb-3">
                  {role.users} user{role.users !== 1 ? 's' : ''}
                </p>

                <div
                  className={`space-y-2 transition-all max-h-0 overflow-hidden ${
                    selectedRole?.id === role.id ? 'max-h-96' : ''
                  }`}
                >
                  <p className="text-xs text-white/50 font-semibold uppercase tracking-wider">
                    Permissions:
                  </p>

                  {role.permissions.map((perm) => (
                    <div
                      key={perm}
                      className="text-xs text-white/70 flex items-center gap-2"
                    >
                      <Check
                        size={12}
                        className="text-emerald-400"
                      />
                      {perm}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">
            Permission System
          </h3>

          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {permissions.map((perm) => (
              <div
                key={perm.id}
                className="rounded-xl bg-white/5 border border-white/10 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-medium">
                      {perm.name}
                    </p>

                    <p className="text-sm text-white/60 mt-1">
                      {perm.description}
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    className="rounded border-white/20 mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New User Modal */}
      {showNewUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 border border-white/10 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white">
              Add New User
            </h3>

            <p className="mt-2 text-white/60">
              Enter user details and upload contract
            </p>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-white/70 font-medium">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter full name"
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-white/70 font-medium">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-white/70 font-medium">
                  Role
                </label>

                <select className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
                  <option className="bg-slate-900">
                    Select Role
                  </option>

                  {roles.map((role) => (
                    <option
                      key={role.id}
                      className="bg-slate-900"
                    >
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload */}
              <div className="space-y-2">
                <label className="text-white/70 font-medium">
                  Employee Contract
                </label>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/70 font-medium cursor-pointer">
                    <Upload size={20} />
                    <span>Click to upload</span>

                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          const file = e.target.files[0];

                          setUploadedContract({
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            url: URL.createObjectURL(file),
                          });
                        }
                      }}
                    />
                  </label>

                  {uploadedContract && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex-shrink-0">
                        {(() => {
                          const ext = uploadedContract.name
                            .split('.')
                            .pop()
                            .toLowerCase();

                          if (ext === 'pdf') {
                            return (
                              <FileText
                                size={24}
                                className="text-blue-500"
                              />
                            );
                          }

                          if (
                            ext === 'doc' ||
                            ext === 'docx'
                          ) {
                            return (
                              <FileText
                                size={24}
                                className="text-green-500"
                              />
                            );
                          }

                          if (
                            ext === 'jpg' ||
                            ext === 'jpeg' ||
                            ext === 'png'
                          ) {
                            return (
                              <Upload
                                size={24}
                                className="text-purple-500"
                              />
                            );
                          }

                          return (
                            <FileText
                              size={24}
                              className="text-gray-500"
                            />
                          );
                        })()}
                      </div>

                      <div>
                        <p className="text-white font-medium">
                          {uploadedContract.name}
                        </p>

                        <p className="text-white/60 text-sm">
                          {(uploadedContract.size / 1024).toFixed(1)} KB •{' '}
                          {uploadedContract.type}
                        </p>
                      </div>

                      <button
                        onClick={() => setUploadedContract(null)}
                        className="ml-auto p-1 rounded-lg hover:bg-white/10 text-white/50"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <p className="text-white/50 text-xs">
                    Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowNewUserModal(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowNewUserModal(false);

                  alert(
                    `User added successfully! Contract: ${
                      uploadedContract
                        ? uploadedContract.name
                        : 'None'
                    }`
                  );
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserRoleManagement;