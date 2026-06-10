import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Trash2, Eye, Play, Image as ImageIcon, FileText, Clock, AlertCircle, Upload } from 'react-feather';
import { db, storage } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-800 border-rose-200',
};

const statusLabels = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

const typeIcons = {
  text: FileText,
  picture: ImageIcon,
  video: Play,
};

export default function TestimonialsPage() {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    type: 'text',
    title: '',
    description: '',
    testimonialText: '',
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [adding, setAdding] = useState(false);

  const isSuperAdmin = user?.role === 'super-admin';

  useEffect(() => {
    const testimonialsRef = collection(db, 'testimonials');
    const q = query(testimonialsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTestimonials(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = [...testimonials];

    if (filter !== 'all') {
      result = result.filter((t) => t.status === filter);
    }

    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    setFilteredTestimonials(result);
  }, [testimonials, filter, typeFilter]);

  const handleApprove = async (id) => {
    try {
      await updateDoc(doc(db, 'testimonials', id), {
        status: 'approved',
        approvedAt: new Date().toISOString(),
      });
      toast.success('Testimonial approved successfully');
    } catch (error) {
      console.error('Error approving testimonial:', error);
      toast.error('Failed to approve testimonial');
    }
  };

  const handleReject = async (id) => {
    try {
      await updateDoc(doc(db, 'testimonials', id), {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
      });
      toast.success('Testimonial rejected');
    } catch (error) {
      console.error('Error rejecting testimonial:', error);
      toast.error('Failed to reject testimonial');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      await deleteDoc(doc(db, 'testimonials', id));
      toast.success('Testimonial deleted successfully');
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  const viewTestimonial = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTestimonial(null);
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTypeChange = (type) => {
    setAddForm((prev) => ({ ...prev, type }));
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleAddFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleRemoveAddMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    if (!addForm.title.trim() || !addForm.testimonialText.trim()) {
      toast.error('Title and testimonial text are required');
      return;
    }
    if ((addForm.type === 'picture' || addForm.type === 'video') && !mediaFile) {
      toast.error('Please upload a file');
      return;
    }
    setAdding(true);
    try {
      let mediaUrl = '';
      if (mediaFile) {
        const extension = mediaFile.name.split('.').pop();
        const storageRef = ref(storage, `testimonials/${Date.now()}.${extension}`);
        await uploadBytes(storageRef, mediaFile);
        mediaUrl = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, 'testimonials'), {
        type: addForm.type,
        title: addForm.title,
        description: addForm.description,
        testimonialText: addForm.testimonialText,
        mediaUrl,
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || user.email || 'Super Admin',
        status: 'approved',
        createdAt: serverTimestamp(),
      });
      toast.success('Testimonial added successfully');
      setAddForm({ type: 'text', title: '', description: '', testimonialText: '' });
      handleRemoveAddMedia();
      setShowAddForm(false);
    } catch (error) {
      toast.error('Failed to add testimonial');
    } finally {
      setAdding(false);
    }
  };

  const stats = {
    total: testimonials.length,
    pending: testimonials.filter((t) => t.status === 'pending').length,
    approved: testimonials.filter((t) => t.status === 'approved').length,
    rejected: testimonials.filter((t) => t.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-slate-500">Loading testimonials...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">Testimonials</h1>
        <p className="mt-2 text-slate-600">
          Review and manage customer and company testimonials for the app.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Total</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-1 text-3xl font-semibold text-amber-600">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Approved</p>
          <p className="mt-1 text-3xl font-semibold text-emerald-600">{stats.approved}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Rejected</p>
          <p className="mt-1 text-3xl font-semibold text-rose-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Status:</span>
          <div className="flex rounded-2xl border border-slate-200 overflow-hidden">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm font-medium transition ${
                  filter === status
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                } ${status !== 'all' ? 'border-l border-slate-200' : ''}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Type:</span>
          <div className="flex rounded-2xl border border-slate-200 overflow-hidden">
            {['all', 'text', 'picture', 'video'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2 text-sm font-medium transition ${
                  typeFilter === type
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                } ${type !== 'all' ? 'border-l border-slate-200' : ''}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Super Admin Add Testimonial */}
      {isSuperAdmin && (
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            {showAddForm ? 'Cancel' : '+ Add Testimonial'}
          </button>
        </div>
      )}

      {showAddForm && isSuperAdmin && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Add New Testimonial</h2>
          <form onSubmit={handleAddTestimonial} className="space-y-4">
            <input
              type="text"
              name="title"
              value={addForm.title}
              onChange={handleAddFormChange}
              placeholder="Title"
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            />
            <div className="flex gap-2">
              {['text', 'picture', 'video'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleAddTypeChange(type)}
                  className={`rounded-xl border px-4 py-2 text-sm ${addForm.type === type ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200'}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            {(addForm.type === 'picture' || addForm.type === 'video') && (
              <div>
                {mediaPreview ? (
                  <div className="relative">
                    {addForm.type === 'picture' ? (
                      <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-xl object-cover" />
                    ) : (
                      <video src={mediaPreview} controls className="max-h-48 rounded-xl" />
                    )}
                    <button type="button" onClick={handleRemoveAddMedia} className="absolute right-2 top-2 rounded-full bg-white/90 p-1">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-6">
                    <Upload size={24} className="text-slate-400" />
                    <span className="text-sm text-slate-600">Upload {addForm.type}</span>
                    <input type="file" hidden accept={addForm.type === 'picture' ? 'image/*' : 'video/*'} onChange={handleAddFileChange} />
                  </label>
                )}
              </div>
            )}
            <input
              type="text"
              name="description"
              value={addForm.description}
              onChange={handleAddFormChange}
              placeholder="Description (optional)"
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            />
            <textarea
              name="testimonialText"
              value={addForm.testimonialText}
              onChange={handleAddFormChange}
              placeholder="Testimonial content"
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            />
            <button type="submit" disabled={adding} className="rounded-2xl bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700 disabled:opacity-50">
              {adding ? 'Adding...' : 'Add Testimonial'}
            </button>
          </form>
        </div>
      )}

      {/* Testimonials List */}
      {filteredTestimonials.length === 0 ? (
        <div>
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-4 text-lg font-medium text-slate-900">No testimonials found</p>
            <p className="mt-2 text-slate-600">
              {filter === 'pending'
                ? 'All testimonials have been reviewed.'
                : 'No testimonials match the current filters.'}
            </p>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border bg-emerald-100 text-emerald-800 border-emerald-200">Approved</span>
                <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"><FileText size={12} />Text</span>
              </div>
              <div className="mt-4">
                <p className="font-medium text-slate-900">Sample Customer</p>
                <p className="text-sm text-slate-500">sample@example.com</p>
              </div>
              <p className="mt-3 text-slate-700 line-clamp-3">
                <span className="font-medium text-slate-900">Fresh Harvest Every Week</span><br />
                The quality of produce here is exceptional! I've been ordering for my family every week and the vegetables are always fresh and tasty.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border bg-emerald-100 text-emerald-800 border-emerald-200">Approved</span>
                <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"><ImageIcon size={12} />Picture</span>
              </div>
              <div className="mt-4">
                <p className="font-medium text-slate-900">Sample Customer</p>
                <p className="text-sm text-slate-500">sample@example.com</p>
              </div>
              <p className="mt-3 text-slate-700 line-clamp-3">
                <span className="font-medium text-slate-900">Beautiful Garden Setup</span><br />
                Our backyard transformation was amazing! See the before and after photos.
              </p>
              <div className="mt-4">
                <img src="https://images.unsplash.com/photo-1416879840080-6f13b5ac3b68?w=500" alt="Garden" className="max-h-48 rounded-xl object-cover bg-slate-100" style={{ minHeight: '180px' }} />
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border bg-emerald-100 text-emerald-800 border-emerald-200">Approved</span>
                <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"><Play size={12} />Video</span>
              </div>
              <div className="mt-4">
                <p className="font-medium text-slate-900">Sample Customer</p>
                <p className="text-sm text-slate-500">sample@example.com</p>
              </div>
              <p className="mt-3 text-slate-700 line-clamp-3">
                <span className="font-medium text-slate-900">Customer Stories</span><br />
                Watch Maria's story about how our organic seeds helped her harvest the best tomatoes.
              </p>
              <div className="mt-4">
                <video src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" controls className="max-h-48 rounded-xl bg-slate-100" style={{ minHeight: '180px' }} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredTestimonials.map((testimonial) => {
              const TypeIcon = typeIcons[testimonial.type] || FileText;
              return (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${statusColors[testimonial.status]}`}
                        >
                          {testimonial.status === 'pending' && <Clock size={12} className="mr-1" />}
                          {statusLabels[testimonial.status]}
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          <TypeIcon size={12} />
                          {testimonial.type.charAt(0).toUpperCase() + testimonial.type.slice(1)}
                        </span>
                        {testimonial.customerType === 'company' && (
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                            Company
                          </span>
                        )}
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center gap-3">
                          {testimonial.userPhoto ? (
                            <img
                              src={testimonial.userPhoto}
                              alt={testimonial.userName}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200">
                              <span className="text-sm font-medium text-slate-600">
                                {testimonial.userName?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{testimonial.userName}</p>
                            <p className="text-sm text-slate-500">{testimonial.userEmail}</p>
                          </div>
                        </div>
                      </div>

                      {testimonial.companyName && (
                        <p className="mt-2 text-sm text-slate-600">
                          <span className="font-medium">Company:</span> {testimonial.companyName}
                        </p>
                      )}

                      {testimonial.description && (
                        <p className="mt-2 text-sm text-slate-600">
                          <span className="font-medium">Description:</span> {testimonial.description}
                        </p>
                      )}

                      <p className="mt-3 text-slate-700 line-clamp-3">
                        <span className="font-medium text-slate-900">{testimonial.title || testimonial.adminTitle}</span>
                        <br /><span>{testimonial.testimonialText}</span>
                      </p>

                      {testimonial.mediaUrl && (
                        <div className="mt-4">
                          {testimonial.type === 'picture' ? (
                            <img
                              src={testimonial.mediaUrl}
                              alt="Testimonial"
                              className="max-h-48 rounded-xl object-cover"
                            />
                          ) : testimonial.type === 'video' ? (
                            <video
                              src={testimonial.mediaUrl}
                              controls
                              className="max-h-48 rounded-xl"
                            />
                          ) : null}
                        </div>
                      )}

                      <p className="mt-3 text-xs text-slate-400">
                        Submitted: {testimonial.createdAt?.toDate().toLocaleString() || 'Unknown'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:flex-col">
                      <button
                        onClick={() => viewTestimonial(testimonial)}
                        className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      {testimonial.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(testimonial.id)}
                            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                          >
                            <Check size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(testimonial.id)}
                            className="flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                          >
                            <X size={16} />
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal for viewing full testimonial */}
      {showModal && selectedTestimonial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${statusColors[selectedTestimonial.status]}`}
                  >
                    {statusLabels[selectedTestimonial.status]}
                  </span>
                  {selectedTestimonial.customerType === 'company' && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      Company
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  {selectedTestimonial.userPhoto ? (
                    <img
                      src={selectedTestimonial.userPhoto}
                      alt={selectedTestimonial.userName}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
                      <span className="text-sm font-medium text-slate-600">
                        {selectedTestimonial.userName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{selectedTestimonial.userName}</p>
                    <p className="text-sm text-slate-500">{selectedTestimonial.userEmail}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6">
              {selectedTestimonial.companyName && (
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Company:</span> {selectedTestimonial.companyName}
                </p>
              )}
              {selectedTestimonial.description && (
                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-medium">Description:</span> {selectedTestimonial.description}
                </p>
              )}
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-lg font-medium text-slate-800">{selectedTestimonial.title || selectedTestimonial.adminTitle}</p>
                <p className="mt-2 text-slate-800">{selectedTestimonial.testimonialText}</p>
              </div>
              {selectedTestimonial.mediaUrl && (
                <div className="mt-4">
                  {selectedTestimonial.type === 'picture' ? (
                    <img
                      src={selectedTestimonial.mediaUrl}
                      alt="Testimonial"
                      className="w-full rounded-xl"
                    />
                  ) : selectedTestimonial.type === 'video' ? (
                    <video src={selectedTestimonial.mediaUrl} controls className="w-full rounded-xl" />
                  ) : null}
                </div>
              )}
              <p className="mt-4 text-xs text-slate-400">
                Submitted: {selectedTestimonial.createdAt?.toDate().toLocaleString() || 'Unknown'}
              </p>
            </div>

            {selectedTestimonial.status === 'pending' && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    handleApprove(selectedTestimonial.id);
                    closeModal();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700"
                >
                  <Check size={18} />
                  Approve
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedTestimonial.id);
                    closeModal();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-rose-200 px-6 py-3 text-rose-600 hover:bg-rose-50"
                >
                  <X size={18} />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}