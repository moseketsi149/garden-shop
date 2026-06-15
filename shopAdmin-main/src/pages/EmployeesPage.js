import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { X, Eye, Edit2, Trash2, Upload, FileText, ArrowLeft } from 'react-feather';

const EMPLOYEES_STORAGE_KEY = 'shopAdminEmployees';

const initialEmployees = [
  {
    id: 'e1',
    name: 'Mamello Mosola',
    position: 'Inventory Manager',
    contract: 'Permanent',
    contractFile: null,
    salary: 'M3,200',
    performance: 'Excellent',
    tenure: '4 years',
    email: 'mamello@example.com',
    phone: '+266 5800 0001',
    startDate: '2022-01-15',
    department: 'Operations'
  },
  {
    id: 'e2',
    name: 'Sello Mokone',
    position: 'Sales Specialist',
    contract: 'Contract',
    contractFile: null,
    salary: 'M2,800',
    performance: 'Strong',
    tenure: '2 years',
    email: 'sello@example.com',
    phone: '+266 5800 0002',
    startDate: '2024-03-01',
    department: 'Sales'
  },
  {
    id: 'e3',
    name: 'Tshepo Nkosi',
    position: 'Customer Support',
    contract: 'Permanent',
    contractFile: null,
    salary: 'M2,500',
    performance: 'Good',
    tenure: '3 years',
    email: 'tshepo@example.com',
    phone: '+266 5800 0003',
    startDate: '2023-06-10',
    department: 'Support'
  }
];

export default function EmployeesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(EMPLOYEES_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.warn('Failed to parse saved employees:', error);
        }
      }
    }
    return initialEmployees;
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    startDate: '',
    contract: 'Permanent',
    contractFile: null,
    contractFilePreview: null,
    salary: '',
    performance: 'Good',
    tenure: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
    }
  }, [employees]);

  const resetForm = () => {
    setNewEmployee({
      name: '',
      position: '',
      department: '',
      email: '',
      phone: '',
      startDate: '',
      contract: 'Permanent',
      contractFile: null,
      contractFilePreview: null,
      salary: '',
      performance: 'Good',
      tenure: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setNewEmployee(prev => ({
      ...prev,
      contractFile: file,
      contractFilePreview: file ? URL.createObjectURL(file) : null
    }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.position || !newEmployee.salary) {
      toast.error('Please fill in all required fields');
      return;
    }
    const newId = `e${Date.now()}`;
    const employeeToAdd = {
      id: newId,
      name: newEmployee.name,
      position: newEmployee.position,
      department: newEmployee.department,
      email: newEmployee.email,
      phone: newEmployee.phone,
      startDate: newEmployee.startDate,
      contract: newEmployee.contract,
      contractFile: newEmployee.contractFile ? newEmployee.contractFile.name : null,
      contractFilePreview: newEmployee.contractFilePreview,
      salary: `M${newEmployee.salary}`,
      performance: newEmployee.performance,
      tenure: `${newEmployee.tenure} years`
    };
    setEmployees(prev => [...prev, employeeToAdd]);
    resetForm();
    setShowAddModal(false);
    toast.success('Employee added successfully');
  };

  const handleEditClick = (employee) => {
    setEditingId(employee.id);
    setNewEmployee({
      name: employee.name,
      position: employee.position,
      department: employee.department || '',
      email: employee.email || '',
      phone: employee.phone || '',
      startDate: employee.startDate || '',
      contract: employee.contract,
      contractFile: null,
      contractFilePreview: employee.contractFilePreview || null,
      salary: employee.salary.replace('M', ''),
      performance: employee.performance,
      tenure: employee.tenure ? employee.tenure.replace(' years', '') : ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.position || !newEmployee.salary) {
      toast.error('Please fill in all required fields');
      return;
    }
    const updatedEmployee = {
      ...newEmployee,
      contractFile: newEmployee.contractFile ? newEmployee.contractFile.name : null,
      contractFilePreview: newEmployee.contractFilePreview,
      salary: `M${newEmployee.salary}`,
      tenure: `${newEmployee.tenure} years`
    };
    setEmployees(prev => prev.map(emp => emp.id === editingId ? { ...emp, ...updatedEmployee } : emp));
    setShowEditModal(false);
    setEditingId(null);
    resetForm();
    toast.success('Employee updated successfully');
  };

  const handleViewClick = (employee) => {
    setViewingEmployee(employee);
    setShowViewModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      if (viewingEmployee?.id === id) {
        setShowViewModal(false);
        setViewingEmployee(null);
      }
      toast.success('Employee removed');
    }
  };

  const handleContractUpload = (employeeId, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          contractFile: file.name,
          contractFilePreview: preview
        };
      }
      return emp;
    }));
    if (viewingEmployee?.id === employeeId) {
      setViewingEmployee(prev => ({ ...prev, contractFile: file.name, contractFilePreview: preview }));
    }
    toast.success('Contract uploaded');
  };

  const EmployeeFormFields = ({ isEdit = false }) => (
    <form onSubmit={isEdit ? handleEditSubmit : handleAddSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
        <input
          type="text"
          name="name"
          value={newEmployee.name}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Position *</label>
        <input
          type="text"
          name="position"
          value={newEmployee.position}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
        <input
          type="text"
          name="department"
          value={newEmployee.department}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={newEmployee.email}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={newEmployee.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
        <input
          type="date"
          name="startDate"
          value={newEmployee.startDate}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Contract Type</label>
        <select
          name="contract"
          value={newEmployee.contract}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="Permanent">Permanent</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
          <option value="Part-time">Part-time</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {isEdit ? 'Replace Contract (PDF/DOC)' : 'Upload Contract (PDF/DOC)'}
        </label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
        {(newEmployee.contractFilePreview || newEmployee.contractFile) && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
            <FileText size={16} />
            <span className="truncate">
              {typeof newEmployee.contractFile === 'string' ? newEmployee.contractFile : newEmployee.contractFile?.name || 'Contract file selected'}
            </span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Salary (Monthly) *</label>
        <input
          type="number"
          name="salary"
          value={newEmployee.salary}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Performance Rating</label>
        <select
          name="performance"
          value={newEmployee.performance}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="Excellent">Excellent</option>
          <option value="Strong">Strong</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="Poor">Poor</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Tenure (Years)</label>
        <input
          type="number"
          name="tenure"
          value={newEmployee.tenure}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            resetForm();
          }}
          className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-[2rem] bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-white font-medium hover:opacity-90 transition-all"
        >
          {isEdit ? 'Save Changes' : 'Add Employee'}
        </button>
      </div>
    </form>
  );

  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return (
      <section className="min-h-screen px-6 py-12 bg-gradient-to-br from-slate-950 to-slate-900">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl backdrop-blur-md bg-gradient-to-br from-slate-900/50 to-slate-800/50 p-12 border border-white/10 text-center">
            <h1 className="text-4xl font-bold text-white">Access Denied</h1>
            <p className="mt-4 text-white/60 text-lg">You need Admin or Super Admin privileges to view this page.</p>
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
      <div className="flex justify-between items-center">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <h1 className="text-3xl font-semibold text-slate-900">Employee directory</h1>
          <p className="mt-2 text-slate-600">Store employee records, job descriptions, contract type, and monthly performance metrics.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="rounded-[2rem] bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-white font-medium hover:opacity-90 transition-all"
        >
          Add Employee
        </button>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">Add New Employee</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            {EmployeeFormFields({ isEdit: false })}
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">Edit Employee</h2>
              <button onClick={() => { setShowEditModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            {EmployeeFormFields({ isEdit: true })}
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {showViewModal && viewingEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">Employee Details</h2>
              <button onClick={() => { setShowViewModal(false); setViewingEmployee(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xl font-bold">
                  {viewingEmployee.name?.charAt(0) || 'E'}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{viewingEmployee.name}</h3>
                  <p className="text-sm text-slate-600">{viewingEmployee.position}</p>
                  <p className="text-xs text-slate-500">{viewingEmployee.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Email</p>
                  <p className="text-sm text-slate-900 mt-1">{viewingEmployee.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Phone</p>
                  <p className="text-sm text-slate-900 mt-1">{viewingEmployee.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Start Date</p>
                  <p className="text-sm text-slate-900 mt-1">{viewingEmployee.startDate || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Tenure</p>
                  <p className="text-sm text-slate-900 mt-1">{viewingEmployee.tenure || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Contract</p>
                  <p className="text-sm text-slate-900 mt-1">{viewingEmployee.contract}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Salary</p>
                  <p className="text-sm text-slate-900 mt-1">{viewingEmployee.salary}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Performance</p>
                  <p className="text-sm text-slate-900 mt-1">{viewingEmployee.performance}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500 mb-2">Employment Contract</p>
                {viewingEmployee.contractFile || viewingEmployee.contractFilePreview ? (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <FileText size={24} className="text-emerald-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {viewingEmployee.contractFile || 'contract.pdf'}
                      </p>
                      {viewingEmployee.contractFilePreview ? (
                        <a
                          href={viewingEmployee.contractFilePreview}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-emerald-700 hover:underline"
                        >
                          View contract
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">File uploaded</span>
                      )}
                    </div>
                    <label className="cursor-pointer rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800">
                      <Upload size={16} className="inline mr-1" />
                      Replace
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => handleContractUpload(viewingEmployee.id, e.target.files?.[0])}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                    <Upload size={20} className="text-slate-400" />
                    <span className="text-sm text-slate-600">Click to upload contract</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => handleContractUpload(viewingEmployee.id, e.target.files?.[0])}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-6">
              <button
                onClick={() => handleDelete(viewingEmployee.id)}
                className="rounded-xl border border-rose-200 text-rose-700 px-4 py-2 hover:bg-rose-50"
              >
                Remove Employee
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowViewModal(false); handleEditClick(viewingEmployee); }}
                  className="rounded-xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => { setShowViewModal(false); setViewingEmployee(null); }}
                  className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {employees.map((employee) => (
          <div key={employee.id} className="rounded-[2rem] bg-white p-6 shadow-card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                  {employee.name?.charAt(0) || 'E'}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">{employee.name}</p>
                  <p className="text-sm text-slate-600">{employee.position}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p>Contract: {employee.contract}</p>
              <p>Salary: {employee.salary}</p>
              <p>Performance: {employee.performance}</p>
              <p>Tenure: {employee.tenure}</p>
              {employee.contractFile && (
                <div className="flex items-center gap-2 text-xs text-slate-600 pt-2">
                  <FileText size={14} className="text-emerald-600" />
                  <span className="truncate">{employee.contractFile}</span>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button
                onClick={() => handleViewClick(employee)}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Eye size={16} />
                View
              </button>
              <button
                onClick={() => handleEditClick(employee)}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(employee.id)}
                className="inline-flex items-center justify-center gap-1 rounded-xl border border-rose-200 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
