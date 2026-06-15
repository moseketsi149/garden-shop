import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import { auth, db, googleProvider } from '../firebase/config';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [websiteName, setWebsiteName] = useState('');
  const [accountType, setAccountType] = useState('customer');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateLogin = async (user) => {
    try {
      const snapshot = await getDoc(doc(db, 'users', user.uid));
      const profile = snapshot.exists() ? snapshot.data() : {};
      
      if (profile.approvalStatus === 'pending') {
        throw new Error('Your registration is pending admin approval. Please wait for approval before logging in.');
      }
      if (profile.approvalStatus === 'rejected') {
        throw new Error('Your registration was rejected. Please contact support for more information.');
      }
      
      if (!companyName && !websiteName) return true;
      
      if (profile.companyName?.toLowerCase() !== companyName.trim().toLowerCase()) {
        throw new Error('Company name does not match this account.');
      }
      if (profile.websiteName?.toLowerCase() !== websiteName.trim().toLowerCase()) {
        throw new Error('Website name does not match this account.');
      }
      
      // Verify account type matches the user's existing profile role
      const userRole = profile.role || 'customer';
      if (accountType === 'company' && userRole !== 'company-admin') {
        throw new Error('This account is registered as a customer. For company access, please register a company account.');
      }
      if (accountType === 'company' && profile.paymentStatus !== 'paid') {
        throw new Error('Your company subscription payment is pending. Please complete the subscription to access your account.');
      }
      if (accountType === 'customer' && userRole !== 'customer' && userRole !== 'individual-seller') {
        throw new Error('This account is registered as a company admin. Please select the Company option to log in.');
      }
      return true;
    } catch (error) {
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        console.warn('Network unavailable during login verification. Proceeding with limited profile data.');
        return true;
      }
      throw error;
    }
  };

  const getRedirectPath = () => {
    return '/';
  };

  const validateLoginAsync = async (user) => {
    try {
      await validateLogin(user);
    } catch (error) {
      toast.error(error.message || 'Unable to validate login.');
      await signOut(auth);
      navigate('/login', { replace: true });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success(accountType === 'company' ? '👋 Welcome back! Your company dashboard is ready.' : '👋 Welcome back! Start shopping now.');
      navigate(getRedirectPath(), { replace: true });
      validateLoginAsync(result.user);
    } catch (error) {
      const friendlyMsg = error.code === 'auth/user-not-found' ? 'Email not found. Please check and try again.' 
        : error.code === 'auth/wrong-password' ? 'Incorrect password. Please try again.' 
        : error.message || 'Login failed. Please try again.';
      toast.error(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      toast.success(accountType === 'company' ? '👋 Welcome! Your company dashboard is ready.' : '👋 Welcome! Start shopping now.');
      navigate(getRedirectPath(), { replace: true });
      validateLoginAsync(result.user);
    } catch (error) {
      toast.error('Google login failed. Please try again or use email instead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-lg">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Go Back</span>
        </button>
        <div className="rounded-[2rem] bg-white p-10 shadow-card">
          <h2 className="text-3xl font-semibold text-slate-900">Login</h2>
        <p className="mt-3 text-slate-600">Sign in as a company admin or customer. Your role is determined by your account type.</p>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-8 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 hover:bg-slate-100"
        >
          Continue with Google
        </button>
        <div className="relative my-6 text-center text-sm text-slate-500">
          <span className="bg-white px-3">or</span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200" />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Account type</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { value: 'company', label: 'Company' },
              { value: 'customer', label: 'Customer' }
            ].map((option) => (
              <label key={option.value} className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition ${accountType === option.value ? 'border-slate-900 bg-slate-900/5 text-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-900'}`}>
                <span>{option.label}</span>
                <input
                  type="radio"
                  name="loginType"
                  value={option.value}
                  checked={accountType === option.value}
                  onChange={(event) => setAccountType(event.target.value)}
                  className="h-4 w-4 accent-slate-900"
                />
              </label>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {accountType !== 'customer' && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Company name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  required
                  placeholder="Enter your company name"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Website name</label>
                <input
                  type="text"
                  value={websiteName}
                  onChange={(event) => setWebsiteName(event.target.value)}
                  required
                  placeholder="Enter the website name or brand"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                />
                <p className="mt-2 text-xs text-slate-500">Use the website or brand name for multi-site registration.</p>
              </div>
            </>
          )}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-800"
          >
            Sign in
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link className="text-slate-900 underline font-medium" to="/register/customer">
              Register as Customer
            </Link>
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Want to sell?{' '}
            <Link className="text-emerald-700 underline font-medium" to="/register">
              Register as Seller
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
