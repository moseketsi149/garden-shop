import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'react-feather';
import { toast } from 'react-toastify';

const ORDERS_STORAGE_KEY = 'shopAdminOrders';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.warn('Failed to parse saved orders:', error);
        }
      }
    }
    return [
      { id: 'ord-1001', company: 'Apex Logistics', status: 'Processing', amount: 6800, method: 'Delivery', deliveryDate: '2026-06-02' },
      { id: 'ord-1002', company: 'NorthStar Industries', status: 'Delivered', amount: 2140, method: 'Pickup', deliveryDate: '2026-05-18' },
      { id: 'ord-1003', company: 'Bayfield Enterprises', status: 'Scheduled', amount: 12500, method: 'Delivery', deliveryDate: '2026-06-05' }
    ];
  });
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    status: 'Processing',
    amount: '',
    method: 'Delivery',
    deliveryDate: ''
  });

  const statuses = ['Processing', 'Delivered', 'Scheduled', 'Pending', 'Cancelled'];
  const methods = ['Delivery', 'Pickup'];

  const resetForm = () => {
    setFormData({
      company: '',
      status: 'Processing',
      amount: '',
      method: 'Delivery',
      deliveryDate: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    }));
  };

  const handleEdit = (order) => {
    setFormData({
      company: order.company,
      status: order.status,
      amount: order.amount,
      method: order.method,
      deliveryDate: order.deliveryDate
    });
    setEditingId(order.id);
    setShowForm(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    if (!formData.company || !formData.amount || !formData.deliveryDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingId) {
      setOrders(prev => prev.map(order =>
        order.id === editingId
          ? { ...order, ...formData }
          : order
      ));
      toast.success('Order updated successfully');
    } else {
      const newOrder = {
        id: `ord-${Date.now()}`,
        ...formData
      };
      setOrders(prev => [newOrder, ...prev]);
      toast.success('Order added successfully');
    }
    resetForm();
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    }
  }, [orders]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setOrders(prev => prev.filter(order => order.id !== id));
      toast.success('Order deleted successfully');
    }
  };

  return (
    <section className="space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Go Back</span>
      </button>
      
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Company orders</h1>
            <p className="mt-2 text-slate-600">Review enterprise sales, delivery preferences, and order fulfillment status.</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Add Order
          </button>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-8 shadow-card w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">
                {editingId ? 'Edit Order' : 'Add New Order'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Name *</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Method</label>
                  <select
                    name="method"
                    value={formData.method}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2"
                  >
                    {methods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Amount (M) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Date *</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
                >
                  <Save size={18} />
                  Save Order
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              <p>No orders yet. Click "Add Order" to create one.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{order.company}</p>
                  <p className="text-sm text-slate-600">Order #{order.id}</p>
                  <p className="text-sm text-slate-600">Delivery: {order.deliveryDate}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                  <span className="rounded-full bg-slate-100 px-3 py-1">{order.method}</span>
                  <span className={`rounded-full px-3 py-1 ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {order.status}
                  </span>
                  <span className="font-semibold">M{order.amount.toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(order)}
                    className="p-2 rounded-lg hover:bg-blue-100 text-blue-600"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
