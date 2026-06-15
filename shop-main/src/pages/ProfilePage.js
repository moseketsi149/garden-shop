import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ShopHeader from '../components/ShopHeader';
import { setUser } from '../features/auth/userSlice';
import { db } from '../firebase/config';

const paymentMethods = [
  { id: 'mpesa', name: 'M-Pesa', description: 'Pay via M-Pesa mobile wallet in Lesotho or South Africa' },
  { id: 'ecocash', name: 'EcoCash', description: 'Pay via EcoCash mobile money in Lesotho or South Africa' },
  { id: 'fnb', name: 'FNB Transfer', description: 'Pay via FNB bank transfer in Lesotho or South Africa' },
  { id: 'standard-bank', name: 'Standard Bank Transfer', description: 'Pay via Standard Bank transfer in Lesotho or South Africa' },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.user.user);
  const orders = useSelector((state) => state.order.history);
  const navigate = useNavigate();

  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(profile?.paymentMethod || 'mpesa');
  const [paymentDetails, setPaymentDetails] = useState({
    phoneNumber: profile?.paymentDetails?.phoneNumber || '',
    bankName: profile?.paymentDetails?.bankName || '',
    accountNumber: profile?.paymentDetails?.accountNumber || '',
    reference: profile?.paymentDetails?.reference || ''
  });
  const [processingSubscription, setProcessingSubscription] = useState(false);

  const isSellerAccount = ['company-admin', 'individual-seller'].includes(profile?.role);
  const subscriptionAmount = profile?.role === 'company-admin' ? 1000 : profile?.role === 'individual-seller' ? 750 : null;
  const subscriptionLabel = profile?.role === 'company-admin' ? 'M1,000.00 / month' : 'M750.00 / month';
  const paymentStatus = profile?.paymentStatus || 'unpaid';
  const paymentDateLabel = profile?.paymentDate ? new Date(profile.paymentDate).toLocaleDateString() : null;
  const nextBillingLabel = profile?.nextBillingDate ? new Date(profile.nextBillingDate).toLocaleDateString() : null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSubscriptionPayment = async () => {
    if (!selectedPaymentMethod) {
      return toast.warn('💳 Please choose a payment method to update your subscription.');
    }

    if (['mpesa', 'ecocash'].includes(selectedPaymentMethod) && !paymentDetails.phoneNumber.trim()) {
      return toast.error('📱 Enter your mobile number to complete the payment.');
    }

    if (['fnb', 'standard-bank'].includes(selectedPaymentMethod) && (!paymentDetails.bankName.trim() || !paymentDetails.accountNumber.trim())) {
      return toast.error('🏦 Enter your bank details (name and account number).');
    }

    setProcessingSubscription(true);

    try {
      const userRef = doc(db, 'users', profile.uid);
      const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const paymentReference = paymentDetails.reference || `SUBS-${Date.now()}`;

      await updateDoc(userRef, {
        paymentStatus: 'paid',
        paymentMethod: selectedPaymentMethod,
        paymentAmount: subscriptionAmount,
        paymentCurrency: 'LSL',
        paymentDetails: {
          phoneNumber: paymentDetails.phoneNumber,
          bankName: paymentDetails.bankName,
          accountNumber: paymentDetails.accountNumber,
          reference: paymentReference
        },
        paymentDate: serverTimestamp(),
        subscriptionType: 'monthly',
        nextBillingDate
      });

      dispatch(setUser({
        ...profile,
        paymentStatus: 'paid',
        paymentMethod: selectedPaymentMethod,
        paymentAmount: subscriptionAmount,
        paymentCurrency: 'LSL',
        paymentDetails: {
          ...paymentDetails,
          reference: paymentReference
        },
        paymentDate: new Date().toISOString(),
        subscriptionType: 'monthly',
        nextBillingDate
      }));

      setShowSubscriptionForm(false);
      toast.success('✅ Subscription updated! Your payment has been recorded.');
    } catch (error) {
      console.error('Subscription update failed:', error);
      toast.error('Could not complete the subscription payment. Please try again.');
    } finally {
      setProcessingSubscription(false);
    }
  };

  return (
    <div>
      <ShopHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Go Back</span>
        </button>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white p-8 shadow-card">
            <h2 className="text-3xl font-semibold text-slate-900">My profile</h2>
            <p className="mt-4 text-slate-600">{profile?.name || user?.displayName || user?.email}</p>
            <p className="mt-2 text-sm text-slate-500">Role: {profile?.role || 'Customer'}</p>
            {profile?.companyName && <p className="mt-2 text-sm text-slate-500">Company: {profile.companyName}</p>}
            {profile?.websiteName && <p className="mt-2 text-sm text-slate-500">Website: {profile.websiteName}</p>}
            {profile?.websiteUrl && <p className="mt-2 text-sm text-slate-500">URL: {profile.websiteUrl}</p>}
            <button
              onClick={handleLogout}
              className="mt-8 rounded-2xl bg-rose-600 px-6 py-3 text-white hover:bg-rose-500"
            >
              Logout
            </button>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-card">
            <h3 className="text-2xl font-semibold text-slate-900">Subscription</h3>
            <p className="mt-4 text-slate-600">
              {isSellerAccount
                ? 'Manage your monthly seller subscription and choose an available payment method below.'
                : 'Subscription access is only available for sellers and company accounts.'}
            </p>

            {isSellerAccount && (
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Plan</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{subscriptionLabel}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Status</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{paymentStatus === 'paid' ? 'Active' : 'Pending payment'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Next billing</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{nextBillingLabel || 'Not scheduled'}</p>
                  </div>
                </div>

                {profile?.paymentMethod && (
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Last payment method</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{profile.paymentMethod}</p>
                    {paymentDateLabel && <p className="mt-1 text-sm text-slate-600">Paid on {paymentDateLabel}</p>}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowSubscriptionForm((prev) => !prev)}
                  className="mt-2 inline-flex items-center justify-center rounded-2xl bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800"
                >
                  {showSubscriptionForm ? 'Hide payment options' : paymentStatus === 'paid' ? 'Update payment details' : 'Complete subscription payment'}
                </button>

                {showSubscriptionForm && (
                  <div className="mt-6 space-y-5 rounded-3xl border border-slate-200 bg-white p-6">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Choose payment method</p>
                      <div className="mt-3 space-y-3">
                        {paymentMethods.map((method) => (
                          <label
                            key={method.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4 transition ${selectedPaymentMethod === method.id ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-emerald-400'}`}
                          >
                            <input
                              type="radio"
                              name="subscriptionPaymentMethod"
                              value={method.id}
                              checked={selectedPaymentMethod === method.id}
                              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                              className="h-4 w-4 accent-emerald-600"
                            />
                            <div>
                              <p className="font-medium text-slate-900">{method.name}</p>
                              <p className="text-sm text-slate-500">{method.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {(selectedPaymentMethod === 'mpesa' || selectedPaymentMethod === 'ecocash') && (
                      <div>
                        <label className="text-sm font-medium text-slate-700">Mobile wallet phone number</label>
                        <input
                          type="tel"
                          value={paymentDetails.phoneNumber}
                          onChange={(event) => setPaymentDetails({ ...paymentDetails, phoneNumber: event.target.value })}
                          placeholder="Enter phone number"
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                        />
                      </div>
                    )}

                    {(selectedPaymentMethod === 'fnb' || selectedPaymentMethod === 'standard-bank') && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-slate-700">Bank name</label>
                          <input
                            type="text"
                            value={paymentDetails.bankName}
                            onChange={(event) => setPaymentDetails({ ...paymentDetails, bankName: event.target.value })}
                            placeholder="Bank name"
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">Account number</label>
                          <input
                            type="text"
                            value={paymentDetails.accountNumber}
                            onChange={(event) => setPaymentDetails({ ...paymentDetails, accountNumber: event.target.value })}
                            placeholder="Account number"
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-slate-700">Payment reference</label>
                      <input
                        type="text"
                        value={paymentDetails.reference}
                        onChange={(event) => setPaymentDetails({ ...paymentDetails, reference: event.target.value })}
                        placeholder="Optional reference"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowSubscriptionForm(false)}
                        className="rounded-2xl border border-slate-200 px-6 py-3 text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSubscriptionPayment}
                        disabled={processingSubscription}
                        className="rounded-2xl bg-emerald-700 px-6 py-3 text-white hover:bg-emerald-800 disabled:opacity-50"
                      >
                        {processingSubscription ? 'Saving...' : `Pay ${subscriptionLabel}`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <h3 className="text-2xl font-semibold text-slate-900">Order history</h3>
            <div className="mt-6 space-y-4">
              {orders.length === 0 ? (
                <p className="text-slate-600">No orders yet.</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="rounded-3xl border border-slate-200 p-4">
                    <p className="font-semibold">Order #{order.id}</p>
                    <p className="text-sm text-slate-600">Method: {order.deliveryMethod}</p>
                    <p className="text-sm text-slate-600">Total: M{order.total.toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
