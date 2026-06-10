import { useMemo, useState, useEffect } from 'react';
import { Edit2, Trash2, Save, X, Plus, Package } from 'react-feather';
import { toast } from 'react-toastify';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

const companies = ['Green Valley Farms', 'Harvest Fresh Co-op', 'Trader', 'Root & Stem Farms'];

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(items);
      setLoading(false);
    }, (err) => {
      console.error('Product listener error:', err);
      setLoading(false);
    });
    return unsub;
  }, []);

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
  };

  const handleCancel = () => {
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

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.company || !formData.price || !formData.stock) {
      toast.error('Name, company, price, and stock are required');
      return;
    }

    const productData = {
      name: formData.name,
      company: formData.company,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      image: formData.image || 'https://images.unsplash.com/photo-1513708923604-5b1247324237?auto=format&fit=crop&w=600&q=80',
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      discount: formData.discount ? parseFloat(formData.discount) : 0,
      package: formData.package || null,
      isNew: formData.isNew
    };

    if (editingId) {
      await updateDoc(doc(db, 'products', editingId), productData);
      toast.success('Product updated successfully');
    } else {
      await addDoc(collection(db, 'products'), { ...productData, createdAt: serverTimestamp() });
      toast.success('Product added successfully');
    }

    handleCancel();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product');
      }
      if (editingId === id) {
        handleCancel();
      }
    }
  };

  if (loading) {
    return <section className="min-h-screen px-6 py-12"><div className="mx-auto max-w-7xl text-center text-slate-600">Loading inventory...</div></section>;
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Inventory Management</h1>
            <p className="mt-2 text-slate-600">Track stock, supplier companies, prices, and product alerts in your enterprise ERP dashboard.</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
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
                placeholder="e.g., tomatoes, organic, vegetables, fresh"
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
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="h-12 w-12 rounded-xl object-cover"
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