import { useSelector, useDispatch } from 'react-redux';
import ShopHeader from '../components/ShopHeader';
import { removeFromCart, updateQuantity } from '../features/cart/cartSlice';

export default function CartPage() {
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div>
      <ShopHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-3xl font-semibold text-slate-900">Your Cart</h2>
        <div className="mt-8 space-y-4">
          {cartItems.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 shadow-card">No items in your cart.</div>
          ) : (
            cartItems.map((item) => (
              <div key={item.product.id} className="rounded-3xl bg-white p-6 shadow-card">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <img src={item.product.image} alt={item.product.name} className="h-24 w-24 rounded-3xl object-cover" />
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{item.product.name}</p>
                      <p className="text-sm text-slate-600">M{item.product.price.toFixed(2)} each</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item.product.id, quantity: item.quantity - 1 }))}
                      className="rounded-full bg-slate-100 px-3 py-2"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item.product.id, quantity: item.quantity + 1 }))}
                      className="rounded-full bg-slate-100 px-3 py-2"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item.product.id))}
                    className="rounded-full bg-rose-100 px-4 py-2 text-rose-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xl font-semibold">Order total</p>
              <p className="text-2xl font-bold text-slate-900">M{total.toFixed(2)}</p>
            </div>
            <div className="mt-6 flex gap-4">
              <a href="/checkout" className="rounded-2xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-800">Checkout</a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
