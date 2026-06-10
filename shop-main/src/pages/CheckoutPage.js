import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import ShopHeader from '../components/ShopHeader';
import { createOrder } from '../features/order/orderSlice';
import { clearCart } from '../features/cart/cartSlice';

export default function CheckoutPage() {
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.user.user);
  const profile = useSelector((state) => state.user.user) || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [placing, setPlacing] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const persistOrder = async () => {
    const orderRef = doc(collection(db, 'orders'));
    const payload = {
      id: orderRef.id,
      items: cartItems.map((item) => ({
        name: item.product.name,
        unitPrice: item.product.price,
        quantity: item.quantity,
        totalPrice: item.product.price * item.quantity,
      })),
      total,
      deliveryMethod,
      deliveryDate: deliveryMethod === 'delivery' ? deliveryDate : null,
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
      toast.warn('Your cart is empty.');
      return;
    }
    if (deliveryMethod === 'delivery' && !deliveryDate) {
      toast.error('Please select a delivery date.');
      return;
    }

    try {
      setPlacing(true);
      await persistOrder();
      dispatch(createOrder({ items: cartItems, total, deliveryMethod, deliveryDate, customer: user }));
      dispatch(clearCart());
      toast.success('Your order has been placed successfully.');
      navigate('/profile');
    } catch (error) {
      toast.error(error.message || 'Order failed.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div>
      <ShopHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
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
                <button type="submit" className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-800">
                  Place order (M{total.toFixed(2)})
                </button>
            </form>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-card">
            <h3 className="text-xl font-semibold text-slate-900">Order summary</h3>
            <div className="mt-6 space-y-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between">
                  <p>{item.product.name} x{item.quantity}</p>
                  <p>M{(item.product.price * item.quantity).toFixed(2)}</p>
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
