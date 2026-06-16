import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { addToCart } from '../features/cart/cartSlice';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ShopHeader from '../components/ShopHeader';
import { ProductImage } from '../components/ProductCard';

export default function ProductPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const product = useSelector((state) => state.order.products.find((item) => item.id === id));

  if (!product) {
    return (
      <div>
        <ShopHeader />
        <main className="mx-auto max-w-5xl px-6 py-12">
          <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Go Back</span>
          </button>
          <p>Product not found.</p>
        </main>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please sign in or register to add items to your cart.');
      navigate('/login');
      return;
    }
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success('Item added to cart!');
  };

  return (
    <div>
      <ShopHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Go Back</span>
        </button>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <ProductImage src={product.image} alt={product.name} />
          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-500">{product.company}</p>
              <h1 className="text-4xl font-semibold text-slate-900">{product.name}</h1>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-card">
              <p className="text-2xl font-bold text-slate-900">M{product.price.toFixed(2)}</p>
              <p className="mt-4 text-sm text-slate-600">{product.stock} units available</p>
              {product.stock <= 5 && <p className="mt-3 rounded-full bg-amber-100 px-3 py-2 text-amber-800">Only {product.stock} left — order soon</p>}
              <button
                onClick={handleAddToCart}
                className="mt-6 w-full rounded-2xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-800"
              >
                Add to cart
              </button>
              {!user && (
                <p className="mt-3 text-xs text-center text-slate-500">
                  You must be signed in to add items to your cart.
                </p>
              )}
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-card">
              <h2 className="text-lg font-semibold text-slate-900">Product details</h2>
              <p className="mt-4 text-slate-600">Professional-grade inventory with supplier data, pricing, and delivery options for enterprise customers and company accounts.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
