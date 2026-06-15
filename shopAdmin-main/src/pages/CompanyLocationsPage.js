import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Edit2, Trash2, Save, X, Navigation, ArrowLeft } from 'react-feather';
import { toast } from 'react-toastify';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function CompanyLocationsPage() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    description: '',
    phone: '',
    hours: '',
    tags: ''
  });

  useEffect(() => {
    // Try to show cached locations immediately to avoid long loading
    try {
      if (typeof window !== 'undefined') {
        const saved = window.localStorage.getItem('shopAdminLocations');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length) {
            setLocations(parsed);
            setLoading(false);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load cached locations:', e);
    }

    const q = query(collection(db, 'locations'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setLocations(items);
      setLoading(false);
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('shopAdminLocations', JSON.stringify(items));
        }
      } catch (e) {
        // ignore localStorage failures
      }
    }, (err) => {
      console.error('Locations listener error:', err);
      setLoading(false);
    });
    return unsub;
  }, []);

  const stats = useMemo(() => {
    return {
      total: locations.length,
      withCoords: locations.filter(l => l.lat && l.lng).length,
      withoutCoords: locations.filter(l => !l.lat || !l.lng).length
    };
  }, [locations]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (location) => {
    setEditingId(location.id);
    setFormData({
      name: location.name || '',
      address: location.address || '',
      lat: location.lat != null ? String(location.lat) : '',
      lng: location.lng != null ? String(location.lng) : '',
      description: location.description || '',
      phone: location.phone || '',
      hours: location.hours || '',
      tags: Array.isArray(location.tags) ? location.tags.join(', ') : ''
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      name: '',
      address: '',
      lat: '',
      lng: '',
      description: '',
      phone: '',
      hours: '',
      tags: ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address) {
      toast.error('Name and address are required');
      return;
    }

    const locationData = {
      name: formData.name,
      address: formData.address,
      lat: parseFloat(formData.lat) || 0,
      lng: parseFloat(formData.lng) || 0,
      description: formData.description,
      phone: formData.phone,
      hours: formData.hours,
      tags: formData.tags
        ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : []
    };

    if (editingId) {
      await updateDoc(doc(db, 'locations', editingId), locationData);
      toast.success('Location updated successfully');
    } else {
      await addDoc(collection(db, 'locations'), { ...locationData, createdAt: serverTimestamp() });
      toast.success('Location added successfully');
    }

    handleCancel();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteDoc(doc(db, 'locations', id));
        toast.success('Location deleted successfully');
      } catch (error) {
        toast.error('Failed to delete location');
      }
      if (editingId === id) {
        handleCancel();
      }
    }
  };

  if (loading) {
    return <section className="min-h-screen px-6 py-12"><div className="mx-auto max-w-7xl text-center text-slate-600">Loading locations...</div></section>;
  }

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
            <h1 className="text-3xl font-semibold text-slate-900">Company Locations</h1>
            <p className="mt-2 text-slate-600">Manage partner company locations, addresses, and map coordinates for the enterprise marketplace.</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                name: '',
                address: '',
                lat: '',
                lng: '',
                description: '',
                phone: '',
                hours: '',
                tags: ''
              });
            }}
            className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Add Location
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total Locations</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-3xl bg-emerald-50 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">With Coordinates</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-900">{stats.withCoords}</p>
          </div>
          <div className="rounded-3xl bg-amber-50 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-600">Missing Coordinates</p>
            <p className="mt-2 text-3xl font-semibold text-amber-900">{stats.withoutCoords}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      {(showForm || editingId) && (
        <div className="rounded-[2rem] bg-white p-8 shadow-card border-2 border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              {editingId ? 'Edit Location' : 'Add New Location'}
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
              <label className="text-sm font-medium text-slate-700">Company Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="Enter full address"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Latitude</label>
              <input
                type="number"
                name="lat"
                value={formData.lat}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="e.g., -15.4167"
                step="any"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Longitude</label>
              <input
                type="number"
                name="lng"
                value={formData.lng}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="e.g., 28.2833"
                step="any"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="Brief description of the company"
                rows="2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="Contact phone number"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Business Hours</label>
              <input
                type="text"
                name="hours"
                value={formData.hours}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="e.g., Mon-Fri: 8AM-6PM"
              />
            </div>

            <div className="md:col-span-2 flex gap-3 pt-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-3xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-800"
              >
                <Save size={18} />
                {editingId ? 'Update Location' : 'Add Location'}
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

      {/* Locations List */}
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <h2 className="text-2xl font-semibold text-slate-900">Current Locations</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 text-slate-900">
              <tr>
                <th className="py-4">Company</th>
                <th className="py-4">Address</th>
                <th className="py-4">Coordinates</th>
                <th className="py-4">Contact</th>
                <th className="py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {locations.map((location) => (
                <tr key={location.id} className={editingId === location.id ? 'bg-slate-50' : ''}>
                  <td className="py-4">
                    <div className="font-medium text-slate-900">{location.name}</div>
                    {location.description && (
                      <div className="mt-1 text-xs text-slate-500 max-w-xs truncate">{location.description}</div>
                    )}
                  </td>
                  <td className="py-4">{location.address}</td>
                  <td className="py-4">
                    {location.lat && location.lng ? (
                      <div className="flex items-center gap-2">
                        <Navigation size={14} className="text-slate-400" />
                        <span className="text-slate-600">
                          {parseFloat(location.lat).toFixed(4)}, {parseFloat(location.lng).toFixed(4)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-amber-600 text-xs">No coordinates</span>
                    )}
                  </td>
                  <td className="py-4">
                    {location.phone && <div className="text-slate-600">{location.phone}</div>}
                    {location.hours && <div className="text-xs text-slate-500">{location.hours}</div>}
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(location)}
                        className="rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        title="Edit location"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(location.id)}
                        className="rounded-full p-2 text-rose-600 hover:bg-rose-50"
                        title="Delete location"
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

      {/* Map Preview Info */}
      <div className="rounded-[2rem] bg-slate-50 p-8 border border-slate-200">
        <div className="flex items-start gap-4">
          <MapPin className="h-6 w-6 text-slate-700 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Map Integration</h3>
            <p className="mt-2 text-sm text-slate-600">
              Company locations with valid coordinates (latitude and longitude) will be displayed on the 
              interactive map in the <a href="/locations" className="text-slate-900 underline font-medium">Locations page</a> of the main shop. 
              Users can click on map markers to view company details and browse their products.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Tip: Use coordinates from Google Maps or OpenStreetMap for accurate positioning.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}