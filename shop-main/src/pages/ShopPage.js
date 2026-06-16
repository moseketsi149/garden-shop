import { useSelector } from 'react-redux';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Fuse from 'fuse.js';
import ShopHeader from '../components/ShopHeader';
import ProductCard from '../components/ProductCard';

export default function ShopPage() {
  const products = useSelector((state) => state.order.products);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(() => searchParams.get('query') || '');
  const [companyFilter, setCompanyFilter] = useState(() => searchParams.get('company') || 'all');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [imageSearchPreview, setImageSearchPreview] = useState('');
  const [imageSearchHash, setImageSearchHash] = useState(null);
  const [imageSearchError, setImageSearchError] = useState('');
  const [productImageHashes, setProductImageHashes] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const recognitionRef = useRef(null);

  const companies = useMemo(() => {
    const setCompanies = new Set(products.map((p) => p.company).filter(Boolean));
    return ['All Companies', ...Array.from(setCompanies)];
  }, [products]);

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'fruits-vegetables', label: 'Fruits & Vegetables' },
    { id: 'processing', label: 'Processing' },
    { id: 'nutrition', label: 'Nutrition' },
  ];

  const categorizeProduct = (product) => {
    const text = `${product.name || ''} ${product.tags?.join(' ') || ''} ${product.company || ''}`.toLowerCase();
    if (['pack', 'dried', 'canned', 'preserved', 'juice', 'sauce', 'processing', 'packaged'].some((word) => text.includes(word))) {
      return 'processing';
    }
    if (['fertilizer', 'nutrients', 'supplements', 'soil', 'nutrition', 'plant', 'care'].some((word) => text.includes(word))) {
      return 'nutrition';
    }
    if (['tomatoes', 'carrots', 'salad', 'greens', 'vegetables', 'fruits', 'organic', 'fresh', 'herbs', 'produce'].some((word) => text.includes(word))) {
      return 'fruits-vegetables';
    }
    return 'fruits-vegetables';
  };

  const categorizedProducts = useMemo(() => {
    const base = companyFilter === 'all' ? products : products.filter((p) => p.company === companyFilter);
    if (activeCategory === 'all') return base;
    return base.filter((p) => categorizeProduct(p) === activeCategory);
  }, [products, companyFilter, activeCategory]);

  useEffect(() => {
    const queryParam = searchParams.get('query') || '';
    const companyParam = searchParams.get('company') || 'all';
    setQuery(queryParam);
    setCompanyFilter(companyParam);
  }, [searchParams]);

  useEffect(() => {
    const params = {};
    if (query) params.query = query;
    if (companyFilter !== 'all') params.company = companyFilter;
    setSearchParams(params);
  }, [query, companyFilter, setSearchParams]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setQuery(transcript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);
  }, []);

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'Anonymous';
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });

  const computeAverageColor = (image) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let r = 0;
    let g = 0;
    let b = 0;
    const count = pixels.length / 4;

    for (let i = 0; i < pixels.length; i += 4) {
      r += pixels[i];
      g += pixels[i + 1];
      b += pixels[i + 2];
    }

    return [r / count, g / count, b / count];
  };

  const getImageHash = async (src) => {
    const image = await loadImage(src);
    return computeAverageColor(image);
  };

  const getImageDistance = (hashA, hashB) => {
    if (!hashA || !hashB) return Number.POSITIVE_INFINITY;
    return Math.sqrt(
      hashA.reduce((sum, value, index) => sum + Math.pow((value - hashB[index]) / 255, 2), 0)
    );
  };

  useEffect(() => {
    let active = true;
    const loadHashes = async () => {
      const entries = await Promise.all(
        products.map(async (product) => {
          try {
            const hash = await getImageHash(product.image);
            return [product.id, hash];
          } catch {
            return [product.id, null];
          }
        })
      );

      if (active) {
        setProductImageHashes(Object.fromEntries(entries));
      }
    };

    loadHashes();
    return () => {
      active = false;
    };
  }, [products]);

  useEffect(() => {
    if (!imageSearchPreview) {
      setImageSearchHash(null);
      setImageSearchError('');
      return;
    }

    let active = true;
    setImageSearchHash(null);
    setImageSearchError('');

    getImageHash(imageSearchPreview)
      .then((hash) => {
        if (active) {
          setImageSearchHash(hash);
        }
      })
      .catch(() => {
        if (active) {
          setImageSearchError('Unable to analyze the selected image.');
        }
      });

    return () => {
      active = false;
    };
  }, [imageSearchPreview]);

  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: ['name', 'company', 'tags', 'image'],
      threshold: 0.3,
      ignoreLocation: true
    });
  }, [products]);

  const promotions = useMemo(() => {
    return products.flatMap((product) => {
      const alerts = [];
      if (product.isNew) {
        alerts.push({
          id: `${product.id}-new`,
          label: 'New arrival',
          description: `${product.name} is newly available from ${product.company}.`,
          action: () => setQuery(product.name)
        });
      }
      if (product.discount) {
        alerts.push({
          id: `${product.id}-discount`,
          label: `${product.discount}% off`,
          description: `${product.name} is discounted now.`,
          action: () => {
            setCompanyFilter('all');
            setQuery(product.name);
          }
        });
      }
      if (product.package) {
        alerts.push({
          id: `${product.id}-package`,
          label: 'Package deal',
          description: product.package,
          action: () => {
            setCompanyFilter('all');
            setQuery(product.name);
          }
        });
      }
      return alerts;
    });
  }, [products]);

  const filtered = useMemo(() => {
    const base = categorizedProducts;
    const q = query.trim();
    const imageResults = imageSearchHash
      ? base
          .map((product) => ({
            product,
            distance: getImageDistance(imageSearchHash, productImageHashes[product.id])
          }))
          .filter((item) => item.distance < 0.45)
          .sort((a, b) => a.distance - b.distance)
          .map((item) => item.product)
      : [];

    if (imageSearchHash && !q) {
      return imageResults.length > 0 ? imageResults : base;
    }

    if (!q) return base;

    const results = fuse.search(q).map((r) => r.item);
    const matched = results.filter((p) => (activeCategory === 'all' ? true : categorizeProduct(p) === activeCategory));

    if (imageSearchHash) {
      return matched
        .map((product) => ({
          product,
          distance: getImageDistance(imageSearchHash, productImageHashes[product.id])
        }))
        .sort((a, b) => a.distance - b.distance)
        .map((item) => item.product);
    }

    return matched;
  }, [products, query, companyFilter, fuse, imageSearchHash, productImageHashes, activeCategory]);

  const handleTagClick = (tag) => {
    setQuery(tag);
  };

  const handleVoiceSearch = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      return;
    }

    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error('Voice search failed to start', error);
      setIsListening(false);
    }
  };

  return (
    <div>
      <ShopHeader />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Go Back</span>
        </button>
        {promotions.length > 0 && (
          <div className="mb-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Alerts</p>
                <h2 className="text-2xl font-semibold text-slate-900">Latest deals and new arrivals</h2>
                <p className="mt-2 text-sm text-slate-600">Guests can see promotions immediately while browsing the store.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {promotions.slice(0, 3).map((promo) => (
                  <button
                    key={promo.id}
                    type="button"
                    onClick={promo.action}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                  >
                    {promo.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCompanyFilter('all');
                    setQuery('');
                  }}
                  className="rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800"
                >
                  View all deals
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Catalog</p>
            <h2 className="text-3xl font-semibold text-slate-900">Available products</h2>
            <p className="mt-1 text-sm text-slate-600">Live inventory from Enterprises and Small Businesses. New items appear automatically.</p>
          </div>
          <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-slate-600 mr-4">Orders will show stock warnings when inventory is low.</p>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                    <input
                      aria-label="Search products"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by name, company, tags, or image URL"
                      className="min-w-0 flex-1 border-none bg-transparent px-1 text-sm outline-none"
                    />
                    {speechSupported && (
                      <button
                        type="button"
                        onClick={handleVoiceSearch}
                        className={`rounded-full px-3 py-2 text-sm font-medium transition ${isListening ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
                      >
                        {isListening ? 'Listening…' : '🎤'}
                      </button>
                    )}
                  </div>
                  <select
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="all">All Companies</option>
                    {companies.slice(1).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) {
                          setImageSearchPreview('');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (loadEvent) => {
                          setImageSearchPreview(loadEvent.target?.result || '');
                          setQuery('');
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    📷 Upload image to search
                  </label>
                  {imageSearchPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageSearchPreview('');
                        setImageSearchHash(null);
                        setImageSearchError('');
                      }}
                      className="text-sm font-medium text-slate-700 underline-offset-4 transition hover:text-slate-900"
                    >
                      Clear image search
                    </button>
                  )}
                </div>
                {imageSearchPreview && (
                  <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                    <img src={imageSearchPreview} alt="Search preview" className="h-20 w-20 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">Image search enabled</p>
                      {imageSearchHash ? (
                        <p className="text-sm text-slate-600">Showing visually similar products.</p>
                      ) : imageSearchError ? (
                        <p className="text-sm text-rose-600">{imageSearchError}</p>
                      ) : (
                        <p className="text-sm text-slate-600">Analyzing image…</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500">Tip: search with keywords like <span className="font-medium">tomatoes</span>, <span className="font-medium">salad</span>, <span className="font-medium">carrots</span>, or upload an image to find visually similar fresh produce.</p>
            </div>
</div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.length > 0 ? (
             filtered.map((product) => <ProductCard key={product.id} product={product} onTagClick={handleTagClick} />)
           ) : (
             <div className="col-span-full space-y-6">
               <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                 <p className="text-lg font-semibold text-slate-900">No results for "{query}"</p>
                 <p className="mt-2 text-sm text-slate-600">Try these suggestions or browse popular items:</p>
                 <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                   {products.slice(0, 3).map((p) => (
                     <button
                       key={`s-${p.id}`}
                       onClick={() => { setQuery(p.name); setCompanyFilter('all'); }}
                       className="rounded-full border px-4 py-2 text-sm hover:bg-slate-50"
                     >
                       {p.name}
                     </button>
                   ))}
                   {Array.from(new Set(products.map((p) => p.company))).slice(0, 3).map((c) => (
                     <button
                       key={`c-${c}`}
                       onClick={() => { setCompanyFilter(c); setQuery(''); }}
                       className="rounded-full border px-4 py-2 text-sm hover:bg-slate-50"
                     >
                       {c}
                     </button>
                   ))}
                 </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
   );
}
