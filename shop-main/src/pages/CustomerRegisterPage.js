import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import { auth, db } from '../firebase/config';
import { toast } from 'react-toastify';

export default function CustomerRegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    countryCode: 'lesotho',
    phoneNumber: '',
    referralSource: ''
  });
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const countryCodes = {
    lesotho: '+266',
    'south africa': '+27'
  };

  const referralOptions = [
    { value: '', label: 'Select how you heard about us' },
    { value: 'social media', label: 'Social Media (Facebook, Instagram, etc.)' },
    { value: 'friend family', label: 'Friend or Family' },
    { value: 'google search', label: 'Google Search' },
    { value: 'advertisement', label: 'Online Advertisement' },
    { value: 'radio tv', label: 'Radio or TV' },
    { value: 'newspaper', label: 'Newspaper or Magazine' },
    { value: 'community event', label: 'Community Event or Market' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

   const handleSubmit = async (e) => {
     e.preventDefault();
     
     // Validation
     if (formData.password !== formData.confirmPassword) {
       toast.error("🔐 Passwords don't match. Please try again.");
       return;
     }
     
     if (formData.password.length < 6) {
       toast.error('🔐 Password must be at least 6 characters long.');
       return;
     }
     
     if (!termsAccepted) {
       toast.error('📋 Please accept the Terms of Service to continue.');
       return;
     }

     try {
       setLoading(true);
       
       // Create user account
       const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
       const user = userCredential.user;
       
       // Update display name
       await updateProfile(user, {
         displayName: formData.fullName
       });
       
       // Show immediate notification for account creation
       toast.info('Setting up your account...');

       // Store additional user data in Firestore
       await setDoc(doc(db, 'users', user.uid), {
         email: formData.email,
         fullName: formData.fullName,
         address: formData.address,
         countryCode: formData.countryCode,
         phoneNumber: formData.phoneNumber,
         fullPhoneNumber: `${countryCodes[formData.countryCode]} ${formData.phoneNumber}`,
         referralSource: formData.referralSource,
         role: 'customer',
         accountType: 'customer',
         paymentStatus: 'not_applicable',
         approvalStatus: 'pending',
         createdAt: serverTimestamp(),
         updatedAt: serverTimestamp()
       });

        toast.success('✅ Welcome! Your account is ready. You can now sign in and start shopping.');
        navigate('/');
     } catch (error) {
       console.error('Registration error:', error);
       if (error.code === 'auth/email-already-in-use') {
         toast.error('📧 This email is already registered. Log in instead or use a different email.');
       } else if (error.code === 'auth/invalid-email') {
         toast.error('📧 Please enter a valid email address (e.g., name@example.com).');
       } else if (error.code === 'auth/weak-password') {
         toast.error('🔐 Use a stronger password (at least 6 characters with letters and numbers).');
       } else {
         toast.error('Unable to create your account. Please try again or contact support.');
       }
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
          <h2 className="text-3xl font-semibold text-slate-900">🛒 Create Customer Account</h2>
          <p className="mt-3 text-slate-600">Join our marketplace and start shopping for fresh produce.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Full Names *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              placeholder="Enter your full names"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              placeholder="your@email.com"
            />
          </div>

          {/* Address */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Where do you live? *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows="3"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 resize-none"
              placeholder="Enter your full address (street, area, city/town)"
            />
          </div>

          {/* Country Code & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="mb-2 block text-sm font-medium text-slate-700">Country Code *</label>
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <option value="lesotho">🇱🇸 Lesotho (+266)</option>
                <option value="south africa">🇿🇦 South Africa (+27)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Contact Number *</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                pattern="[0-9\s\-]+"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                placeholder="Enter your phone number"
              />
              <p className="mt-1 text-xs text-slate-500">
                Format: {countryCodes[formData.countryCode]} XXX XXX XXX
              </p>
            </div>
          </div>

          {/* Referral Source */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">How did you hear about us? *</label>
            <select
              name="referralSource"
              value={formData.referralSource}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              {referralOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              placeholder="Create a secure password (min 6 characters)"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              placeholder="Confirm your password"
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-slate-700">
                I agree to the <a href="#" className="text-emerald-600 hover:underline">Terms of Service</a> and <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-700 px-6 py-4 text-white font-medium hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link className="text-emerald-700 hover:underline font-medium" to="/login">
                Sign in here
              </Link>
            </p>
            <p className="text-sm text-slate-600 mt-3">
              Want to sell your products?{' '}
              <Link className="text-emerald-700 hover:underline font-medium" to="/register">
                Register as Seller
              </Link>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
