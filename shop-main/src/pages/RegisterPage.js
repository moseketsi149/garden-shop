import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import { auth, db } from '../firebase/config';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [websiteName, setWebsiteName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [accountType, setAccountType] = useState('individual');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const subscriptionFees = {
    company: { amount: 1000, label: 'M1,000.00' },
    individual: { amount: 750, label: 'M750.00' }
  };

   const handleSubmit = async (event) => {
     event.preventDefault();
     try {
       setLoading(true);
       const credential = await createUserWithEmailAndPassword(auth, email, password);
       await updateProfile(credential.user, { displayName: name });
       
       // Show immediate notification for account creation
       toast.info('Setting up your seller account...');

       const role = accountType === 'company' ? 'company-admin' : 'individual-seller';

       // Create initial user profile; sellers require payment to complete registration
       const pendingUid = credential.user.uid;
       const pendingData = {
         pendingUid,
         accountType,
         email,
         name,
         websiteName,
         companyName,
         websiteUrl
       };

       try {
         await setDoc(doc(db, 'users', pendingUid), {
           email,
           name,
           companyName,
           websiteName,
           websiteUrl,
           role,
           accountType,
           paymentStatus: 'pending',
           approvalStatus: 'pending',
           tenant: websiteName || companyName || 'default',
           createdAt: serverTimestamp()
         });
       } catch (docError) {
         console.error('Failed to create seller user profile before payment:', docError);
         toast.warning('⚠️ Account created, but profile setup failed. Proceeding to payment.');
       }

       if (accountType === 'company' || accountType === 'individual') {
         window.sessionStorage.setItem('sellerRegistrationPending', JSON.stringify(pendingData));
         toast.success('✅ Account created! Please complete your subscription payment to start selling.');
         navigate('/register/payment', {
           state: pendingData
         });
         return;
       }

        toast.success('✅ Account created successfully!');
        navigate('/');
     } catch (error) {
       console.error('Seller registration failed:', error);
       const friendlyMsg = error.code === 'auth/email-already-in-use' ? '📧 This email is already registered.'
         : error.code === 'auth/weak-password' ? '🔐 Password must be at least 6 characters.'
         : error.code === 'auth/invalid-email' ? '📧 Please use a valid email address.'
         : error.code === 'auth/operation-not-allowed' ? '🔐 Email/password signup is disabled in Firebase.'
         : `Account creation failed: ${error.message || 'Please try again.'}`;
       toast.error(friendlyMsg);
     } finally {
       setLoading(false);
     }
   };

  return (
    <div className="min-h-screen bg-emerald-50/30 px-6 py-12">
      <div className="mx-auto max-w-lg">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Go Back</span>
        </button>
        <div className="rounded-[2rem] bg-white p-10 shadow-card">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-slate-900">🌿 Register as a Seller</h2>
          <p className="mt-3 text-slate-600">Join our horticulture marketplace and start selling your fresh produce.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Seller Type</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { value: 'company', label: 'Company / Cooperative', fee: 'M1,000/mo', description: 'Farms, nurseries, cooperatives' },
                { value: 'individual', label: 'Individual Seller', fee: 'M750/mo', description: 'Home gardeners, small-scale growers' }
              ].map((option) => (
                <label key={option.value} className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border px-4 py-4 transition text-center ${accountType === option.value ? 'border-emerald-600 bg-emerald-100 text-emerald-900' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400'}`}>
                  <span className="font-semibold">{option.label}</span>
                  <span className="text-xs text-slate-500 mt-1">{option.description}</span>
                  <span className="text-lg font-bold text-emerald-700 mt-2">{option.fee}</span>
                  <input
                    type="radio"
                    name="accountType"
                    value={option.value}
                    checked={accountType === option.value}
                    onChange={(event) => setAccountType(event.target.value)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {accountType === 'company' ? 'Company / Cooperative Name *' : 'Farm / Garden Name *'}
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              required
              placeholder={accountType === 'company' ? 'e.g., Green Valley Farms' : 'e.g., My Home Garden'}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Brand / Business Name *</label>
            <input
              type="text"
              value={websiteName}
              onChange={(event) => setWebsiteName(event.target.value)}
              required
              placeholder="e.g., Fresh Veggies Co-op"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
            <p className="mt-2 text-xs text-slate-500">This will be your seller name on the marketplace.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Website or Social Media URL</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              placeholder="https:// or leave blank if none"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength="6"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              placeholder="Create a secure password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-700 px-6 py-4 text-white font-medium hover:bg-emerald-800 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : `Continue to Payment (${accountType === 'company' ? 'M1,000' : 'M750'}/month)`}
          </button>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              By registering, you agree to our Terms of Service and understand that you must pay the monthly subscription to list products.
            </p>
            <p className="text-sm text-slate-600 mt-4">
              Just want to shop?{' '}
              <Link className="text-emerald-700 underline font-medium" to="/register/customer">
                Register as Customer
              </Link>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
