import { useMemo, useState, useEffect } from 'react';
import AsyncImage from '../components/AsyncImage';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Save, X, Plus, ArrowLeft } from 'react-feather';
import { toast } from 'react-toastify';

const companies = ['Green Valley Farms', 'Harvest Fresh Co-op', 'Trader', 'Root & Stem Farms'];
const INVENTORY_STORAGE_KEY = 'shopAdminInventoryProducts';

const initialProducts = [
  {
    id: 'prod-001',
    name: 'Fresh Organic Tomatoes',
    company: 'Green Valley Farms',
    price: 250,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcccf?auto=format&fit=crop&w=600&q=80',
    tags: ['tomatoes', 'organic', 'fresh'],
    discount: 5,
    package: null,
    isNew: false
  },
  {
    id: 'prod-002',
    name: 'Premium Mixed Salad Greens',
    company: 'Harvest Fresh Co-op',
    price: 180,
    stock: 3,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    tags: ['salad', 'greens', 'vegetables'],
    discount: 0,
    package: null,
    isNew: true
  },
  {
    id: 'prod-003',
    name: 'Heirloom Carrots Bundle',
    company: 'Root & Stem Farms',
    price: 320,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd64b73?auto=format&fit=crop&w=600&q=80',
    tags: ['carrots', 'heirloom', 'vegetables'],
    discount: 10,
    package: 'Carrots + Radishes bundle',
    isNew: false
  }
];

export default function InventoryPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.warn('Failed to parse saved inventory:', error);
        }
      }
    }
    return initialProducts;
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: companies[0],
    price: '',
    stock: '',
    image: '',
    tags: '',
    discount: '',
    package: '',
    isNew: false
  });

  const lowStockAlerts = useMemo(() => products.filter((product) => product.stock <= 5).length, [products]);
  const totalValue = useMemo(() => products.reduce((sum, p) => sum + (p.price * p.stock), 0), [products]);
  const newProducts = useMemo(() => products.filter(p => p.isNew).length, [products]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      company: product.company,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image: product.image || '',
      tags: product.tags ? product.tags.join(', ') : '',
      discount: product.discount ? product.discount.toString() : '',
      package: product.package || '',
      isNew: product.isNew || false
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      name: '',
      company: companies[0],
      price: '',
      stock: '',
      image: '',
      tags: '',
      discount: '',
      package: '',
      isNew: false
    });
  };

  const handleCancel = resetForm;

  const handleSave = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.company || !formData.price || !formData.stock) {
      toast.error('Name, company, price, and stock are required');
      return;
    }

    const productData = {
      name: formData.name,
      company: formData.company,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      image: formData.image || 'https://images.unsplash.com/photo-1513708923604-5b1247324237?auto=format&fit=crop&w=600&q=80',
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      discount: formData.discount ? parseFloat(formData.discount) : 0,
      package: formData.package || null,
      isNew: formData.isNew,
    };

    if (editingId) {
      setProducts((prev) => prev.map((product) => (
        product.id === editingId ? { ...product, ...productData } : product
      )));
      toast.success('Product updated successfully');
    } else {
      const newProduct = {
        id: `prod-${Date.now()}`,
        ...productData
      };
      setProducts((prev) => [newProduct, ...prev]);
      toast.success('Product added successfully');
    }
    resetForm();
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(products));
    }
  }, [products]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts((prev) => prev.filter((product) => product.id !== id));
      toast.success('Product deleted successfully');
      if (editingId === id) {
        resetForm();
      }
    }
  };

  return (
    <section className="space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Go Back</span>
      </button>
      {/* Header */}
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Inventory Management</h1>
            <p className="mt-2 text-slate-600">Track stock, supplier companies, prices, and product alerts in your enterprise ERP dashboard.</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-3xl bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total Products</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{products.length}</p>
          </div>
          <div className="rounded-3xl bg-amber-50 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-600">Low Stock Alerts</p>
            <p className="mt-2 text-3xl font-semibold text-amber-900">{lowStockAlerts}</p>
          </div>
          <div className="rounded-3xl bg-emerald-50 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">New Arrivals</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-900">{newProducts}</p>
          </div>
          <div className="rounded-3xl bg-violet-50 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-violet-600">Inventory Value</p>
            <p className="mt-2 text-3xl font-semibold text-violet-900">M{totalValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      {(showForm || editingId) && (
        <div className="rounded-[2rem] bg-white p-8 shadow-card border-2 border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={handleCancel}
              className="rounded-full p-2 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Company / Supplier *</label>
              <select
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                required
              >
                {companies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Price (M) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="0"
                min="0"
                max="100"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                name="isNew"
                id="isNew"
                checked={formData.isNew}
                onChange={handleInputChange}
                className="h-5 w-5 rounded border-slate-300 text-slate-900"
              />
              <label htmlFor="isNew" className="text-sm font-medium text-slate-700">Mark as New Arrival</label>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="e.g., tomatoes, fruits, organic, vegetables, fresh"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Package Deal Description</label>
              <input
                type="text"
                name="package"
                value={formData.package}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="e.g., Tomatoes + basil bundle for pasta sauce"
              />
            </div>

            <div className="md:col-span-2 flex gap-3 pt-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-800"
              >
                <Save size={18} />
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-3xl border border-slate-200 px-6 py-3 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <h2 className="text-2xl font-semibold text-slate-900">Current Inventory</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 text-slate-900">
              <tr>
                <th className="py-4">Product</th>
                <th className="py-4">Supplier</th>
                <th className="py-4">Price</th>
                <th className="py-4">Stock</th>
                <th className="py-4">Status</th>
                <th className="py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.map((product) => (
                <tr key={product.id} className={editingId === product.id ? 'bg-slate-50' : ''}>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <AsyncImage
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 rounded-xl object-cover"
                        fallback={`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e2e8f0"/><text x="50" y="55" text-anchor="middle" font-size="12" fill="%2364748b">No image</text></svg>`)}`}
                      />
                      <div>
                        <div className="font-medium text-slate-900">{product.name}</div>
                        {product.tags && product.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {product.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[10px] rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4">{product.company}</td>
                  <td className="py-4">
                    <div className="font-medium">M{product.price.toFixed(2)}</div>
                    {product.discount > 0 && (
                      <div className="text-xs text-emerald-600">{product.discount}% off</div>
                    )}
                  </td>
                  <td className="py-4">{product.stock}</td>
                  <td className="py-4">
                    <div className="flex flex-wrap gap-2">
                      {product.stock <= 5 && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                          Low stock
                        </span>
                      )}
                      {product.isNew && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                          New
                        </span>
                      )}
                      {product.package && (
                        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800">
                          Package
                        </span>
                      )}
                      {product.stock > 5 && !product.isNew && !product.package && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                          In stock
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        title="Edit product"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="rounded-full p-2 text-rose-600 hover:bg-rose-50"
                        title="Delete product"
                      >
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
    </section>
  );
}