import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, AlertTriangle } from 'lucide-react';

const svgImage = (label) => {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="#e2e8f0"/>
      <text x="400" y="300" text-anchor="middle"
        font-size="40" fill="#334155">${label}</text>
    </svg>
  `)}`;
};

export const ProductImage = ({ src, alt, size = 'large', className = '' }) => {
  const [failed, setFailed] = useState(false);

  const imageSrc = !failed && src ? src : svgImage(alt || 'Product');

  const sizeClasses =
    size === 'card'
      ? 'h-48 w-full rounded-2xl'
      : 'h-24 w-24 rounded-3xl';

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${sizeClasses} ${className} object-cover bg-slate-200`}
      onError={() => setFailed(true)}
      loading={size === 'card' ? 'lazy' : undefined}
    />
  );
};

/**
 * Product Card
 */
export default function ProductCard({ product, onTagClick }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card hover:-translate-y-1 hover:shadow-xl transition">

      {/* Image */}
      <Link to={`/product/${product.id}`}>
        <ProductImage
          src={product.image}
          alt={product.name}
          size="card"
        />
      </Link>

      {/* Badges */}
      {(product.isNew || product.discount || product.package) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {product.isNew && (
            <span className="badge bg-emerald-100 text-emerald-700">
              New
            </span>
          )}

          {product.discount && (
            <span className="badge bg-rose-100 text-rose-700">
              -{product.discount}%
            </span>
          )}

          {product.package && (
            <span className="badge bg-sky-100 text-sky-700">
              Package
            </span>
          )}
        </div>
      )}

      {/* Title + price */}
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-sm text-slate-500">{product.company}</p>
        </div>

        <span className="font-bold">
          M{Number(product.price).toFixed(2)}
        </span>
      </div>

      {/* Stock */}
      <div className="mt-3 flex justify-between text-sm text-slate-600">
        <span>{product.stock} in stock</span>

        {product.stock <= 100 && (
          <span className="flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
            <AlertTriangle size={14} />
            Low stock
          </span>
        )}
      </div>

      {/* Tags */}
      {product.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick?.(tag)}
              className="text-xs px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Button */}
      <div className="mt-5">
        <Link
          to={`/product/${product.id}`}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white py-2 rounded-xl hover:bg-slate-700"
        >
          <ShoppingCart size={16} />
          View Product
        </Link>
      </div>
    </div>
  );
}