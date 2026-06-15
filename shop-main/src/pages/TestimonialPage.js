import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Play, FileText, Image, X, Upload, ArrowLeft } from 'lucide-react';

import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { db, storage } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useSelector } from 'react-redux';
import ShopHeader from '../components/ShopHeader';

export default function TestimonialPage() {
  const { user } = useAuth();
  const profile = useSelector((state) => state.user.user) || {};
  const role = profile.role || 'customer';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: 'text',
    description: '',
    testimonialText: '',
    adminTitle: '',
  });

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [approved, setApproved] = useState([]);
  const [loadingApproved, setLoadingApproved] = useState(true);
  const [filter, setFilter] = useState('all');

  const isAdmin = ['admin', 'super-admin', 'company-admin'].includes(role);

  useEffect(() => {
    const q = query(collection(db, 'testimonials'), where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setApproved(items);
      setLoadingApproved(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    return () => {
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
    };
  }, [mediaPreview]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, type }));
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
  };

  const validateForm = () => {
    if (!formData.adminTitle.trim()) {
      toast.error('Please enter a title');
      return false;
    }
    if (!formData.testimonialText.trim()) {
      toast.error('Please enter your testimonial');
      return false;
    }
    if ((formData.type === 'picture' || formData.type === 'video') && !mediaFile) {
      toast.error('Please upload a file');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login first');
      return;
    }
    if (!isAdmin) {
      toast.error('Admin access required to add testimonials');
      return;
    }
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      let mediaUrl = '';
      if (mediaFile) {
        const extension = mediaFile.name.split('.').pop();
        const fileName = `testimonials/${Date.now()}.${extension}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, mediaFile);
        mediaUrl = await getDownloadURL(storageRef);
      }

      const safeUserName =
        typeof user?.displayName === 'string'
          ? user.displayName
          : typeof user?.email === 'string'
          ? user.email
          : 'Admin';

      await addDoc(collection(db, 'testimonials'), {
        type: formData.type,
        description: formData.description,
        testimonialText: formData.testimonialText,
        title: formData.adminTitle,
        mediaUrl,
        userId: user.uid,
        userEmail: user.email || '',
        userName: safeUserName,
        status: 'approved',
        createdAt: serverTimestamp(),
      });

      toast.success('Testimonial added successfully');
      setFormData({ type: 'text', description: '', testimonialText: '', adminTitle: '' });
      removeMedia();
    } catch (error) {
      console.error('Submit Error:', error);
      toast.error('Failed to add testimonial');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApproved = filter === 'all' ? approved : approved.filter((item) => item.type === filter);

  return (
    <div>
      <ShopHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Go Back</span>
        </button>
        <div className="space-y-8">
          {isAdmin && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h1 className="text-3xl font-semibold text-slate-900">Add Testimonial</h1>
              <p className="mt-2 text-sm text-slate-600">Admin: Create testimonials with text, picture, or video.</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <input
                  type="text"
                  name="adminTitle"
                  value={formData.adminTitle}
                  onChange={handleInputChange}
                  placeholder="Title"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />

                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => handleTypeChange('text')} className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${formData.type === 'text' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200'}`}>
                    <FileText size={16} /> Text
                  </button>
                  <button type="button" onClick={() => handleTypeChange('picture')} className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${formData.type === 'picture' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200'}`}>
                    <Image size={16} /> Picture
                  </button>
                  <button type="button" onClick={() => handleTypeChange('video')} className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${formData.type === 'video' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200'}`}>
                    <Play size={16} /> Video
                  </button>
                </div>

                {(formData.type === 'picture' || formData.type === 'video') && (
                  <div>
                    {mediaPreview ? (
                      <div className="relative">
                        {formData.type === 'picture' ? (
                          <img src={mediaPreview} alt="Preview" className="max-h-64 rounded-xl object-cover" />
                        ) : (
                          <video src={mediaPreview} controls className="max-h-64 rounded-xl" />
                        )}
                        <button type="button" onClick={removeMedia} className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-900 shadow-sm">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-6">
                        <Upload size={26} className="text-slate-400" />
                        <span className="text-sm text-slate-600">Upload {formData.type}</span>
                        <input type="file" hidden accept={formData.type === 'picture' ? 'image/*' : 'video/*'} onChange={handleFileChange} />
                      </label>
                    )}
                  </div>
                )}

                <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="Short description" className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" />

                <textarea name="testimonialText" value={formData.testimonialText} onChange={handleInputChange} placeholder="Testimonial content..." rows={5} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />

                <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-70">
                  {submitting ? 'Adding...' : 'Add Testimonial'}
                </button>
              </form>
            </section>
          )}

          {!isAdmin && (
            <section className="rounded-2xl border border-slate-200 bg-white p-8">
              <h1 className="text-3xl font-semibold text-slate-900">Customer Testimonials</h1>
              <p className="mt-2 text-sm text-slate-600">Browse approved testimonials from our community.</p>
            </section>
          )}

          <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Testimonials</h2>
                <p className="text-sm text-slate-600">Approved stories and experiences.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', 'text', 'picture', 'video'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition ${
                      filter === item ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {loadingApproved ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">Loading testimonials...</div>
            ) : filteredApproved.length === 0 ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">No approved testimonials yet.</div>
                <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
                  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Fresh Harvest Every Week</p>
                        <p className="text-xs text-slate-500">Customer favorite since 2023</p>
                      </div>
                      <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 capitalize">text</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">The quality of produce here is exceptional! I've been ordering for my family every week and the vegetables are always fresh and tasty. The delivery is prompt and the staff are friendly.</p>
                  </article>
                  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Beautiful Garden Setup</p>
                        <p className="text-xs text-slate-500">Summer garden makeover</p>
                      </div>
                      <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 capitalize">picture</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">Our backyard transformation was amazing! See the before and after photos of our new vegetable garden.</p>
                    <div className="mt-4">
                      <img 
                        src="https://images.unsplash.com/photo-1416879840080-6f13b5ac3b68?w=500&auto=format&fit=crop" 
                        alt="Garden" 
                        className="max-h-56 w-full rounded-xl object-cover bg-slate-200" 
                        style={{ minHeight: '200px' }}
                      />
                    </div>
                  </article>
                  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Customer Stories</p>
                        <p className="text-xs text-slate-500">Video testimonials</p>
                      </div>
                      <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 capitalize">video</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">Watch Maria's story about how our organic seeds helped her harvest the best tomatoes in her neighborhood.</p>
                    <div className="mt-4">
                      <video 
                        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" 
                        controls 
                        className="max-h-56 w-full rounded-xl bg-slate-200"
                        style={{ minHeight: '200px' }}
                      />
                    </div>
                  </article>
                </div>
              </div>
            ) : (
              <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
                {filteredApproved.map((item) => {
                  const itemType = item.type || 'text';
                  return (
                    <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.title || item.userName || 'Anonymous'}</p>
                          {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                        </div>
                        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 capitalize">{itemType}</span>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-slate-700">{item.testimonialText || ''}</p>

                      {itemType === 'picture' && item.mediaUrl && (
                        <div className="mt-4">
                          <img src={item.mediaUrl} alt="Testimonial" className="max-h-56 w-full rounded-xl object-cover bg-slate-200" style={{ minHeight: '200px' }} />
                        </div>
                      )}

                      {itemType === 'video' && item.mediaUrl && (
                        <div className="mt-4">
                          <video src={item.mediaUrl} controls className="max-h-56 w-full rounded-xl bg-slate-200" style={{ minHeight: '200px' }} />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}