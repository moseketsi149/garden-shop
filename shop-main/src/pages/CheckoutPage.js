import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import ShopHeader from '../components/ShopHeader';
import { createOrder } from '../features/order/orderSlice';
import { clearCart } from '../features/cart/cartSlice';

const paymentMethods = [
  { id: 'mpesa', name: 'M-Pesa', description: 'Pay via M-Pesa mobile wallet in Lesotho or South Africa' },
  { id: 'ecocash', name: 'EcoCash', description: 'Pay via EcoCash mobile money in Lesotho or South Africa' },
  { id: 'fnb', name: 'FNB Transfer', description: 'Pay via FNB bank transfer in Lesotho or South Africa' },
  { id: 'standard-bank', name: 'Standard Bank Transfer', description: 'Pay via Standard Bank transfer in Lesotho or South Africa' },
];

export default function CheckoutPage() {
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.user.user);
  const profile = useSelector((state) => state.user.user) || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('mpesa');
  const [paymentDetails, setPaymentDetails] = useState({
    phoneNumber: '',
    bankName: '',
    accountNumber: '',
    reference: '',
  });
  const [placing, setPlacing] = useState(false);

  const orderItems = cartItems.map((item) => {
    const unitPrice = Number(item.product.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return {
      ...item,
      unitPrice,
      totalPrice: unitPrice * quantity,
      quantity,
    };
  });

  const total = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const persistOrder = async () => {
    const orderRef = doc(collection(db, 'orders'));
    const payload = {
      id: orderRef.id,
      items: orderItems.map((item) => ({
        name: item.product.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      })),
      total,
      deliveryMethod,
      deliveryDate: deliveryMethod === 'delivery' ? deliveryDate : null,
      paymentMethod: selectedPaymentMethod,
      paymentDetails: {
        phoneNumber: paymentDetails.phoneNumber,
        bankName: paymentDetails.bankName,
        accountNumber: paymentDetails.accountNumber,
        reference: paymentDetails.reference || `REF-${Date.now()}`,
      },
      paymentStatus: 'pending',
      customer: {
        uid: user?.uid || profile?.uid,
        name: user?.displayName || profile?.name || 'Guest',
        email: user?.email || profile?.email || '',
        companyName: profile?.companyName || '',
        websiteName: profile?.websiteName || '',
      },
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    await setDoc(orderRef, payload);
    
    await addDoc(collection(db, 'orders', orderRef.id, 'messages'), {
      from: 'system',
      sender: 'System',
      message: `New order placed by ${payload.customer.name} for ${payload.items.map(i => i.name).join(', ')}. Total: M${total.toFixed(2)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      timestamp: serverTimestamp(),
    });

    return orderRef.id;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (cartItems.length === 0) {
      toast.warn('🛒 Your cart is empty. Add items before checking out.');
      return;
    }
    if (deliveryMethod === 'delivery' && !deliveryDate) {
      toast.error('📅 Please choose a delivery date for your order.');
      return;
    }
    if (!selectedPaymentMethod) {
      toast.error("💳 Please select how you'd like to pay.");
      return;
    }
    if (['mpesa', 'ecocash'].includes(selectedPaymentMethod) && !paymentDetails.phoneNumber.trim()) {
      toast.error('📱 Please enter your mobile number to complete payment.');
      return;
    }
    if (['fnb', 'standard-bank'].includes(selectedPaymentMethod) && !paymentDetails.accountNumber.trim()) {
      toast.error('🏦 Please enter your bank account number.');
      return;
    }

    try {
      setPlacing(true);
      await persistOrder();
      dispatch(createOrder({ items: orderItems, total, deliveryMethod, deliveryDate, customer: user, paymentMethod: selectedPaymentMethod }));
      dispatch(clearCart());
      toast.success('✅ Order placed successfully! Check your profile for order details.');
      navigate('/profile');
    } catch (error) {
      toast.error('Order failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div>
      <ShopHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Go Back</span>
        </button>
        <h2 className="text-3xl font-semibold text-slate-900">Checkout</h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl bg-white p-8 shadow-card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Delivery method</label>
                <select
                  value={deliveryMethod}
                  onChange={(event) => setDeliveryMethod(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <option value="pickup">Store pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
              {deliveryMethod === 'delivery' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Preferred delivery date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(event) => setDeliveryDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  />
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Payment method</label>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label key={method.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={(event) => setSelectedPaymentMethod(event.target.value)}
                        className="mt-1 h-4 w-4"
                      />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{method.name}</div>
                        <p className="text-sm text-slate-600">{method.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              {['mpesa', 'ecocash'].includes(selectedPaymentMethod) && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Mobile wallet phone number</label>
                  <input
                    type="tel"
                    value={paymentDetails.phoneNumber}
                    onChange={(event) => setPaymentDetails({ ...paymentDetails, phoneNumber: event.target.value })}
                    placeholder="Enter mobile number"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  />
                </div>
              )}
              {['fnb', 'standard-bank'].includes(selectedPaymentMethod) && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Bank name</label>
                    <input
                      type="text"
                      value={paymentDetails.bankName}
                      onChange={(event) => setPaymentDetails({ ...paymentDetails, bankName: event.target.value })}
                      placeholder="FNB or Standard Bank"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Account number</label>
                    <input
                      type="text"
                      value={paymentDetails.accountNumber}
                      onChange={(event) => setPaymentDetails({ ...paymentDetails, accountNumber: event.target.value })}
                      placeholder="Enter account number"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Payment reference</label>
                <input
                  type="text"
                  value={paymentDetails.reference}
                  onChange={(event) => setPaymentDetails({ ...paymentDetails, reference: event.target.value })}
                  placeholder="Optional payment reference"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                />
              </div>
              <button type="submit" className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-800 disabled:opacity-70" disabled={placing}>
                {placing ? 'Placing order…' : `Place order (M${total.toFixed(2)})`}
              </button>
            </form>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-card">
            <h3 className="text-xl font-semibold text-slate-900">Order summary</h3>
            <div className="mt-6 space-y-4">
              {orderItems.map((item) => (
                <div key={item.product.id} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="font-medium text-slate-900">{item.product.name}</p>
                    <p className="text-sm text-slate-500">{item.quantity} × M{item.unitPrice.toFixed(2)}</p>
                  </div>
                  <p className="font-semibold text-slate-900">M{item.totalPrice.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-semibold">
              <span>Total</span>
              <span>M{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
