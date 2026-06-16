import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, AlertTriangle } from 'lucide-react';

/**
 * Simple fallback image if product image fails
 */
const fallbackImage =
  'https://via.placeholder.com/600x400.png?text=Product+Image';

/**
 * Product Image Component
 */
function ProductImage({ src, alt }) {
  const [error, setError] = useState(false);

  return (
    <img
      src={error || !src ? fallbackImage : src}
      alt={alt}
      className="h-48 w-full object-cover rounded-2xl bg-slate-200"
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}

/**
 * Product Card
 */
export default function ProductCard({ product, onTagClick }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-md hover:shadow-xl transition">
      
      {/* Image */}
      <Link to={`/product/${product.id}`}>
        <ProductImage src={product.image} alt={product.name} />
      </Link>

      {/* Badges */}
      {(product.isNew || product.discount || product.package) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {product.isNew && (
            <span className="badge bg-green-100 text-green-700">New</span>
          )}

          {product.discount && (
            <span className="badge bg-red-100 text-red-700">
              -{product.discount}%
            </span>
          )}

          {product.package && (
            <span className="badge bg-blue-100 text-blue-700">
              Package
            </span>
          )}
        </div>
      )}

      {/* Title + Price */}
      <div className="mt-4 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-sm text-slate-500">{product.company}</p>
        </div>

        <span className="text-lg font-bold">
          M{Number(product.price).toFixed(2)}
        </span>
      </div>

      {/* Stock */}
      <div className="mt-3 flex justify-between items-center text-sm text-slate-600">
        <span>{product.stock} in stock</span>

        {product.stock <= 5 && (
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