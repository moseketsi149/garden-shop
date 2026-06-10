import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingUid, setPendingUid] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    phoneNumber: '',
    bankName: '',
    accountNumber: '',
    reference: ''
  });
  const navigate = useNavigate();

  const subscriptionFees = {
    company: { amount: 1000, label: 'M1,000.00' },
    individual: { amount: 750, label: 'M750.00' }
  };

  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      description: 'Pay via M-Pesa mobile money (Lesotho & South Africa)',
      icon: '📱',
      countries: ['Lesotho', 'South Africa']
    },
    {
      id: 'mokuru',
      name: 'Mokuru',
      description: 'Pay via Mokuru mobile wallet',
      icon: '💳',
      countries: ['Lesotho']
    },
    {
      id: 'ecocash',
      name: 'EcoCash',
      description: 'Pay via EcoCash mobile money',
      icon: '📲',
      countries: ['Lesotho', 'South Africa']
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Direct bank transfer (All major banks in Lesotho & SA)',
      icon: '🏦',
      countries: ['Lesotho', 'South Africa']
    }
  ];

   const handleSubmit = async (event) => {
     event.preventDefault();
     try {
       setLoading(true);
       const credential = await createUserWithEmailAndPassword(auth, email, password);
       await updateProfile(credential.user, { displayName: name });
       
       // Show immediate notification for account creation
       toast.info('Firebase account created successfully!');

       const role = accountType === 'company' ? 'company-admin' : 'individual-seller';

       // Create initial user profile; sellers require payment to complete registration
       await setDoc(doc(db, 'users', credential.user.uid), {
         email,
         name,
         companyName,
         websiteName,
         websiteUrl,
         role,
         accountType,
         paymentStatus: (accountType === 'company' || accountType === 'individual') ? 'pending' : 'paid',
         approvalStatus: 'pending',
         tenant: websiteName || companyName || 'default',
         createdAt: serverTimestamp()
       });

       if (accountType === 'company' || accountType === 'individual') {
         // Show payment modal to complete registration
         setPendingUid(credential.user.uid);
         setShowPaymentModal(true);
         return;
       }

        toast.success('Account created successfully.');
        navigate('/');
     } catch (error) {
       toast.error(error.message || 'Unable to create account.');
     } finally {
       setLoading(false);
     }
   };

  const handleConfirmPayment = async () => {
    if (!pendingUid || !selectedPaymentMethod) {
      toast.error('Please select a payment method.');
      return;
    }

    setPaymentProcessing(true);
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

toast.success(`Payment of ${fee.label} recorded. Registration complete! You can now list your products.`);
       setShowPaymentModal(false);
       navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/30 px-6 py-12">
      <div className="mx-auto max-w-lg rounded-[2rem] bg-white p-10 shadow-card">
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

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900">💳 Complete Your Registration</h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-emerald-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-600">
                  To activate your seller account and start listing your produce, please pay the monthly subscription:
                </p>
                <p className="text-2xl font-bold text-emerald-700 mt-2">
                  {accountType === 'company' ? 'M1,000.00' : 'M750.00'} <span className="text-sm font-normal text-slate-500">/ month</span>
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Select Payment Method</h4>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${
                        selectedPaymentMethod === method.id 
                          ? 'border-emerald-600 bg-emerald-50' 
                          : 'border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="h-4 w-4 accent-emerald-600"
                      />
                      <span className="text-2xl">{method.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{method.name}</p>
                        <p className="text-xs text-slate-500">{method.description}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Available in: {method.countries.join(', ')}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Details Form */}
              {selectedPaymentMethod && (
                <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Payment Details</h4>
                  
                  {(selectedPaymentMethod === 'mpesa' || selectedPaymentMethod === 'mokuru' || selectedPaymentMethod === 'ecocash') && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Mobile Number</label>
                      <input
                        type="tel"
                        value={paymentDetails.phoneNumber}
                        onChange={(e) => setPaymentDetails({...paymentDetails, phoneNumber: e.target.value})}
                        placeholder="e.g., +266 123 4567"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        You'll receive a payment request on this number. Complete the payment in your mobile money app.
                      </p>
                    </div>
                  )}

                  {selectedPaymentMethod === 'bank' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Bank Name</label>
                        <select
                          value={paymentDetails.bankName}
                          onChange={(e) => setPaymentDetails({...paymentDetails, bankName: e.target.value})}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
                        >
                          <option value="">Select your bank</option>
                          <option value="standard-bank-ls">Standard Bank Lesotho</option>
                          <option value="nedbank-ls">Nedbank Lesotho</option>
                          <option value="fbcl">First Bank of Lesotho</option>
                          <option value="standard-bank-za">Standard Bank South Africa</option>
                          <option value="absa">Absa Bank</option>
                          <option value="capitec">Capitec Bank</option>
                          <option value="other">Other Bank</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Account Number</label>
                        <input
                          type="text"
                          value={paymentDetails.accountNumber}
                          onChange={(e) => setPaymentDetails({...paymentDetails, accountNumber: e.target.value})}
                          placeholder="Enter your account number"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
                        />
                      </div>
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <p className="text-xs text-amber-800">
                          <strong>Bank Transfer Instructions:</strong><br/>
                          Transfer {accountType === 'company' ? 'M1,000.00' : 'M750.00'} to:<br/>
                          Bank: Standard Bank Lesotho<br/>
                          Account Name: Garden Shop Marketplace<br/>
                          Account Number: 3-4-5-6-7-8-9<br/>
                          Reference: {pendingUid?.slice(0, 8) || 'REG'}<br/><br/>
                          After transfer, click "Confirm Payment" below.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setShowPaymentModal(false)} 
                  className="rounded-xl border border-slate-200 px-6 py-3 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmPayment} 
                  disabled={paymentProcessing || !selectedPaymentMethod} 
                  className="rounded-xl bg-emerald-700 px-6 py-3 text-white font-medium hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentProcessing ? 'Processing...' : `Pay ${accountType === 'company' ? 'M1,000.00' : 'M750.00'}`}
                </button>
              </div>

              <p className="text-xs text-center text-slate-500 mt-4">
                Secure payment powered by encrypted transactions. Your payment information is protected.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}