import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { db } from '../firebase/config';

const paymentMethods = [
  {
    id: 'mpesa',
    name: 'M-Pesa',
    description: 'Pay via M-Pesa mobile wallet in Lesotho or South Africa',
    icon: '📱',
    countries: ['Lesotho', 'South Africa']
  },
  {
    id: 'ecocash',
    name: 'EcoCash',
    description: 'Pay via EcoCash mobile money in Lesotho & South Africa',
    icon: '📲',
    countries: ['Lesotho', 'South Africa']
  },
  {
    id: 'fnb',
    name: 'FNB Transfer',
    description: 'Pay via FNB bank transfer in Lesotho or South Africa',
    icon: '🏦',
    countries: ['Lesotho', 'South Africa']
  },
  {
    id: 'standard-bank',
    name: 'Standard Bank Transfer',
    description: 'Pay via Standard Bank transfer in Lesotho or South Africa',
    icon: '🏦',
    countries: ['Lesotho', 'South Africa']
  }
];

export default function RegisterPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingUid, setPendingUid] = useState(null);
  const [accountType, setAccountType] = useState('individual');
  const [userProfile, setUserProfile] = useState({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    phoneNumber: '',
    bankName: '',
    accountNumber: '',
    reference: ''
  });
  const [processing, setProcessing] = useState(false);

  const subscriptionFees = {
    company: { amount: 1000, label: 'M1,000.00' },
    individual: { amount: 750, label: 'M750.00' }
  };

  useEffect(() => {
    const stateData = location.state?.pendingUid && location.state?.accountType ? location.state : null;
    const savedData = !stateData ? window.sessionStorage.getItem('sellerRegistrationPending') : null;

    if (stateData) {
      setPendingUid(stateData.pendingUid);
      setAccountType(stateData.accountType);
      setUserProfile({
        email: stateData.email || '',
        name: stateData.name || '',
        companyName: stateData.companyName || '',
        websiteName: stateData.websiteName || '',
        websiteUrl: stateData.websiteUrl || ''
      });
      return;
    }

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed?.pendingUid && parsed?.accountType) {
          setPendingUid(parsed.pendingUid);
          setAccountType(parsed.accountType);
          setUserProfile({
            email: parsed.email || '',
            name: parsed.name || '',
            companyName: parsed.companyName || '',
            websiteName: parsed.websiteName || '',
            websiteUrl: parsed.websiteUrl || ''
          });
          return;
        }
      } catch (err) {
        console.warn('Failed to parse saved seller payment state:', err);
      }
    }

    navigate('/register');
  }, [location.state, navigate]);

  useEffect(() => {
    if (!pendingUid) return;

    const fetchUser = async () => {
      try {
        const userRef = doc(db, 'users', pendingUid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          setUserProfile((prev) => ({ ...prev, ...snapshot.data() }));
        }
      } catch (err) {
        console.warn('Unable to load pending registration user profile:', err);
      }
    };

    fetchUser();
  }, [pendingUid]);

  const handleConfirmPayment = async () => {
    if (!pendingUid || !selectedPaymentMethod) {
      toast.error('💳 Please choose a payment method to complete registration.');
      return;
    }

    if (['mpesa', 'ecocash'].includes(selectedPaymentMethod) && !paymentDetails.phoneNumber.trim()) {
      toast.error('📱 Please enter your mobile number for mobile money payment.');
      return;
    }

    if (['fnb', 'standard-bank'].includes(selectedPaymentMethod) && !paymentDetails.accountNumber.trim()) {
      toast.error('🏦 Please enter your bank account number.');
      return;
    }

    setProcessing(true);
    try {
      const fee = accountType === 'company' ? subscriptionFees.company : subscriptionFees.individual;

      await setDoc(doc(db, 'users', pendingUid), {
        paymentStatus: 'paid',
        paymentAmount: fee.amount,
        paymentCurrency: 'LSL',
        paymentMethod: selectedPaymentMethod,
        paymentDetails: {
          phoneNumber: paymentDetails.phoneNumber,
          bankName: paymentDetails.bankName,
          accountNumber: paymentDetails.accountNumber,
          reference: paymentDetails.reference || `PAY-${Date.now()}`
        },
        paymentDate: serverTimestamp(),
        subscriptionType: 'monthly',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }, { merge: true });

      toast.success('✅ Payment recorded! Your seller account is now active.');
      window.sessionStorage.removeItem('sellerRegistrationPending');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/30 px-6 py-12">
      <div className="mx-auto max-w-xl">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="rounded-[2rem] bg-white p-10 shadow-card">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-slate-900">💳 Seller Payment</h2>
            <p className="mt-3 text-slate-600">
              Complete your {accountType === 'company' ? 'company' : 'individual'} seller subscription and activate your account.
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 mb-8">
            <p className="text-sm text-slate-600">Payment amount</p>
            <p className="text-3xl font-bold text-emerald-700">
              {accountType === 'company' ? 'M1,000.00' : 'M750.00'} <span className="text-base font-medium text-slate-500">/ month</span>
            </p>
          </div>

          <div className="mb-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-700">Seller details</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p><strong>Name:</strong> {userProfile.name || '—'}</p>
              <p><strong>Brand:</strong> {userProfile.websiteName || userProfile.companyName || '—'}</p>
              <p><strong>Email:</strong> {userProfile.email || '—'}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Choose payment method</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label key={method.id} className={`flex items-start gap-4 rounded-3xl border p-4 ${selectedPaymentMethod === method.id ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-400'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedPaymentMethod === method.id}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="mt-1 h-4 w-4 accent-emerald-600"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{method.name}</p>
                    <p className="text-sm text-slate-500">{method.description}</p>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400 mt-1">Available in: {method.countries.join(', ')}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedPaymentMethod && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Payment details</h3>

              {(selectedPaymentMethod === 'mpesa' || selectedPaymentMethod === 'ecocash') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mobile number</label>
                  <input
                    type="tel"
                    value={paymentDetails.phoneNumber}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, phoneNumber: e.target.value })}
                    placeholder="e.g., +266 123 4567"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  />
                </div>
              )}

              {(selectedPaymentMethod === 'fnb' || selectedPaymentMethod === 'standard-bank') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Account number</label>
                    <input
                      type="text"
                      value={paymentDetails.accountNumber}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNumber: e.target.value })}
                      placeholder="Enter your account number"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                    />
                  </div>
                  <div className="bg-amber-50 rounded-2xl p-4 text-xs text-amber-800">
                    <p><strong>Bank transfer instructions</strong></p>
                    <p className="mt-2">Transfer {accountType === 'company' ? 'M1,000.00' : 'M750.00'} to:</p>
                    <p>Bank: {selectedPaymentMethod === 'fnb' ? 'FNB' : 'Standard Bank'}</p>
                    <p>Account Name: Garden Shop Marketplace</p>
                    <p>Account Number: 3-4-5-6-7-8-9</p>
                    <p>Reference: {pendingUid?.slice(0, 8) || 'REG'}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment reference (optional)</label>
                <input
                  type="text"
                  value={paymentDetails.reference}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, reference: e.target.value })}
                  placeholder="Enter a reference if needed"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-slate-700 hover:bg-slate-50"
            >
              Edit registration
            </button>
            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={processing || !selectedPaymentMethod}
              className="rounded-2xl bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : `Pay ${accountType === 'company' ? 'M1,000.00' : 'M750.00'}`}
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-6 text-center">
            Enter payment details above and confirm to complete your seller registration.
          </p>
        </div>
      </div>
    </div>
  );
}
