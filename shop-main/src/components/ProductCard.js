import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, AlertTriangle } from 'lucide-react';

const allowedProductImageUrls = [
  'https://tse1.mm.bing.net/th/id/OIP.dN_LpFidwiVxOr8n4tOnWQHaHS?rs=1&pid=ImgDetMain&o=7&rm=3',
  'https://tse2.mm.bing.net/th/id/OIP.rS-9eitV7kTv0jtchCN1TQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
  'https://therootedfarmhouse.com/wp-content/uploads/2023/10/Easy-Tomatoes-Sauce-Recipe-The-Best-Tomatoes-for-Canning-4-682x1024.webp',
  'https://minnetonkaorchards.com/wp-content/uploads/2022/06/Ind-2.jpg',
];

const unstableImageMarkers = [
  'picsum.photos',
  'images.unsplash.com',
  'source.unsplash.com',
  'tse',
  'bing.net/th',
  'random',
  'loremflickr',
];

const svgImage = (label, bgStart, bgEnd, accent, artwork) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgStart}"/>
        <stop offset="100%" stop-color="${bgEnd}"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" rx="48" fill="url(#bg)"/>
    <circle cx="115" cy="115" r="95" fill="${accent}" opacity="0.12"/>
    <circle cx="700" cy="500" r="130" fill="${accent}" opacity="0.1"/>
    <g>
      ${artwork}
    </g>
    <text x="400" y="540" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#0f172a">${label}</text>
  </svg>
`)}`;

const fallbackProductImage = (product) => {
  const label = product?.name || 'Product';
  const searchable = `${label} ${(product?.tags || []).join(' ')}`.toLowerCase();
  const common = {
    red: ['#fee2e2', '#fecdd3', '#e11d48'],
    orange: ['#ffedd5', '#fed7aa', '#f97316'],
    green: ['#ecfdf5', '#bbf7d0', '#16a34a'],
    yellow: ['#fef3c7', '#fde68a', '#f59e0b'],
    blue: ['#dbeafe', '#bfdbfe', '#2563eb'],
    brown: ['#fef3c7', '#fde68a', '#92400e'],
  };

  if (searchable.includes('tomato') || searchable.includes('strawberry')) {
    const [bgStart, bgEnd, accent] = common.red;
    return svgImage(label, bgStart, bgEnd, accent, `
      <circle cx="310" cy="330" r="118" fill="${accent}"/>
      <circle cx="455" cy="335" r="132" fill="${accent}"/>
      <path d="M360 205 C395 135 455 125 520 160 C470 185 415 190 360 205Z" fill="#166534"/>
      <path d="M405 190 C415 120 450 85 500 70 C485 145 460 175 405 190Z" fill="#22c55e"/>
    `);
  }

  if (searchable.includes('carrot')) {
    const [bgStart, bgEnd, accent] = common.orange;
    return svgImage(label, bgStart, bgEnd, accent, `
      <path d="M250 315 C330 245 445 215 590 205 L540 300 C430 315 340 355 250 430Z" fill="${accent}"/>
      <path d="M250 315 L190 260 M275 335 L205 320 M300 355 L235 390" stroke="#166534" stroke-width="18" stroke-linecap="round"/>
    `);
  }

  if (searchable.includes('salad') || searchable.includes('green') || searchable.includes('spinach') || searchable.includes('vegetable')) {
    const [bgStart, bgEnd, accent] = common.green;
    return svgImage(label, bgStart, bgEnd, accent, `
      <ellipse cx="400" cy="365" rx="240" ry="70" fill="#ffffff" opacity="0.75"/>
      <path d="M235 335 C215 250 280 190 360 215 C420 235 420 315 360 360 C305 340 270 330 235 335Z" fill="${accent}"/>
      <path d="M365 340 C350 250 420 185 505 210 C560 230 565 310 505 360 C450 335 405 325 365 340Z" fill="#15803d"/>
    `);
  }

  if (searchable.includes('mango') || searchable.includes('banana') || searchable.includes('fruit')) {
    const [bgStart, bgEnd, accent] = common.yellow;
    return svgImage(label, bgStart, bgEnd, accent, `
      <ellipse cx="390" cy="310" rx="145" ry="105" fill="${accent}" transform="rotate(-20 390 310)"/>
      <path d="M455 205 C520 145 590 135 640 165 C580 190 535 210 455 205Z" fill="#16a34a"/>
    `);
  }

  if (searchable.includes('fertilizer') || searchable.includes('nutrition') || searchable.includes('soil') || searchable.includes('plant')) {
    const [bgStart, bgEnd, accent] = searchable.includes('nutrition') ? common.blue : common.brown;
    return svgImage(label, bgStart, bgEnd, accent, `
      <rect x="275" y="190" width="250" height="280" rx="34" fill="${accent}"/>
      <rect x="305" y="235" width="190" height="135" rx="24" fill="#ffffff" opacity="0.9"/>
      <path d="M350 300 C380 250 450 250 475 300 C450 350 380 350 350 300Z" fill="#22c55e"/>
    `);
  }

  const [bgStart, bgEnd, accent] = common.green;
  return svgImage(label, bgStart, bgEnd, accent, `
    <rect x="260" y="210" width="280" height="220" rx="42" fill="${accent}"/>
    <rect x="305" y="255" width="190" height="130" rx="28" fill="#ffffff" opacity="0.85"/>
  `);
};

const isStableProductImage = (src) => {
  if (!src || typeof src !== 'string') return false;
  const normalized = src.trim().toLowerCase();
  if (allowedProductImageUrls.includes(normalized)) return true;
  if (
    !normalized.startsWith('http') &&
    !normalized.startsWith('data:image/') &&
    !normalized.startsWith('/')
  ) {
    return false;
  }
  return !unstableImageMarkers.some((marker) => normalized.includes(marker));
};

export const ProductImage = ({ src, alt, size = 'large', className = '', product }) => {
  const [failed, setFailed] = useState(false);
  const initial = alt ? alt.trim().charAt(0).toUpperCase() : '?';
  const fallbackImage = fallbackProductImage(product);
  const imageSrc = isStableProductImage(src) ? src : fallbackImage;
  const sizeClasses = size === 'small'
    ? 'h-24 w-24 rounded-3xl'
    : size === 'card'
      ? 'h-48 w-full rounded-2xl'
      : 'rounded-[2rem]';

  if (failed || !imageSrc) {
    return (
      <div className={`${sizeClasses} ${className} flex items-center justify-center bg-emerald-50 text-3xl font-semibold text-emerald-800`}>
        {initial}
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${sizeClasses} ${className} object-cover bg-slate-200`}
      loading={size === 'card' ? 'lazy' : undefined}
      onError={() => setFailed(true)}
    />
  );
};

export default function ProductCard({ product, onTagClick }) {
   return (
    <div className="rounded-3xl bg-white p-5 shadow-card hover:-translate-y-1 hover:shadow-xl transition min-w-0">
      <Link to={`/product/${product.id}`}>
        <ProductImage src={product.image} alt={product.name} size="card" product={product} />
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
