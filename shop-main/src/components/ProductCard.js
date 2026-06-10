import { Link } from 'react-router-dom';
import { ShoppingCart, AlertTriangle } from 'lucide-react';

export default function ProductCard({ product, onTagClick }) {
   return (
    <div className="rounded-3xl bg-white p-5 shadow-card hover:-translate-y-1 hover:shadow-xl transition min-w-0">
      <Link to={`/product/${product.id}`}>
<img
  src={product.image || 'https://blogchef.net/wp-content/uploads/2022/05/How-to-Cook-Fresh-Carrots-2-scaled.jpg'}
  alt={product.name}
  className="h-48 w-full rounded-2xl object-cover bg-slate-200"
  loading="lazy"
  onError={(e) => {
    e.target.src = "https://picsum.photos/400/300";
  }}
/>
      </Link>
      {(product.isNew || product.discount || product.package) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {product.isNew && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">New</span>
          )}
          {product.discount && (
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">-{product.discount}%</span>
          )}
          {product.package && (
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">Package</span>
          )}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{product.company}</p>
        </div>
        <span className="text-lg font-bold text-slate-900">M{product.price.toFixed(2)}</span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600">
        <span>{product.stock} in stock</span>
        {product.stock <= 5 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-800">
            <AlertTriangle size={14} /> Low stock
          </span>
        )}
      </div>
      {product.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick?.(tag)}
              className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <Link
          to={`/product/${product.id}`}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          <ShoppingCart size={16} /> View
        </Link>
      </div>
    </div>
  );
}
