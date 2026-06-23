import { useSelector } from "react-redux";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Fuse from "fuse.js";
import ShopHeader from "../components/ShopHeader";
import ProductCard from "../components/ProductCard";
import ComingSoonCompact from "../components/ComingSoonCompact";

export default function ShopPage() {
  const products = useSelector((state) => state.order.products);
const loading = useSelector((state) => state.order.loading);
const error = useSelector((state) => state.order.error);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(() => searchParams.get("query") || "");
  const [companyFilter, setCompanyFilter] = useState(
    () => searchParams.get("company") || "all",
  );
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [imageSearchPreview, setImageSearchPreview] = useState("");
  const [imageSearchHash, setImageSearchHash] = useState(null);
  const [imageSearchError, setImageSearchError] = useState("");
  const [productImageHashes, setProductImageHashes] = useState({});
  const [activeCategory, setActiveCategory] = useState("all");
  const recognitionRef = useRef(null);

  useEffect(() => {
  console.log("ShopPage Products:", products);
  console.log("ShopPage Count:", products.length);
  console.log("ShopPage Loading:", loading);
  console.log("ShopPage Error:", error);
}, [products, loading, error]);

  const companies = useMemo(() => {
    const setCompanies = new Set(
      products.map((p) => p.company).filter(Boolean),
    );
    return ["All Companies", ...Array.from(setCompanies)];
  }, [products]);

  const categories = [
    { id: "all", label: "All Products" },
    { id: "fruits-vegetables", label: "Fruits & Vegetables" },
    { id: "processing", label: "Processing" },
    { id: "nutrition", label: "Nutrition" },
  ];

  const categorizeProduct = (product) => {
    const text =
      `${product.name || ""} ${product.tags?.join(" ") || ""} ${product.company || ""}`.toLowerCase();
    if (
      [
        "pack",
        "dried",
        "canned",
        "preserved",
        "juice",
        "sauce",
        "processing",
        "packaged",
      ].some((word) => text.includes(word))
    ) {
      return "processing";
    }
    if (
      [
        "fertilizer",
        "nutrients",
        "supplements",
        "soil",
        "nutrition",
        "plant",
        "care",
      ].some((word) => text.includes(word))
    ) {
      return "nutrition";
    }
if (
       [
         "tomatoes",
         "carrots",
         "salad",
         "greens",
         "vegetables",
         "fruits",
         "organic",
         "fresh",
         "herbs",
         "produce",
         "apples",
         "strawberries",
         "berries",
       ].some((word) => text.includes(word))
     ) {
      return "fruits-vegetables";
    }
    return "fruits-vegetables";
  };

  const categorizedProducts = useMemo(() => {
    const base =
      companyFilter === "all"
        ? products
        : products.filter((p) => p.company === companyFilter);
    if (activeCategory === "all") return base;
    return base.filter((p) => categorizeProduct(p) === activeCategory);
  }, [products, companyFilter, activeCategory]);

  useEffect(() => {
    const queryParam = searchParams.get("query") || "";
    const companyParam = searchParams.get("company") || "all";
    setQuery(queryParam);
    setCompanyFilter(companyParam);
  }, [searchParams]);

  useEffect(() => {
    const params = {};
    if (query) params.query = query;
    if (companyFilter !== "all") params.company = companyFilter;
    setSearchParams(params);
  }, [query, companyFilter, setSearchParams]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
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
      image.crossOrigin = "Anonymous";
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });

  const computeAverageColor = (image) => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d");
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
      hashA.reduce(
        (sum, value, index) => sum + Math.pow((value - hashB[index]) / 255, 2),
        0,
      ),
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
        }),
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
      setImageSearchError("");
      return;
    }

    let active = true;
    setImageSearchHash(null);
    setImageSearchError("");

    getImageHash(imageSearchPreview)
      .then((hash) => {
        if (active) {
          setImageSearchHash(hash);
        }
      })
      .catch(() => {
        if (active) {
          setImageSearchError("Unable to analyze the selected image.");
        }
      });

    return () => {
      active = false;
    };
  }, [imageSearchPreview]);

  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: ["name", "company", "tags", "image"],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [products]);

  const promotions = useMemo(() => {
    return products.flatMap((product) => {
      const alerts = [];
      if (product.isNew) {
        alerts.push({
          id: `${product.id}-new`,
          label: "New arrival",
          description: `${product.name} is newly available from ${product.company}.`,
          action: () => setQuery(product.name),
        });
      }
      if (product.discount) {
        alerts.push({
          id: `${product.id}-discount`,
          label: `${product.discount}% off`,
          description: `${product.name} is discounted now.`,
          action: () => {
            setCompanyFilter("all");
            setQuery(product.name);
          },
        });
      }
      if (product.package) {
        alerts.push({
          id: `${product.id}-package`,
          label: "Package deal",
          description: product.package,
          action: () => {
            setCompanyFilter("all");
            setQuery(product.name);
          },
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
            distance: getImageDistance(
              imageSearchHash,
              productImageHashes[product.id],
            ),
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
    const matched = results.filter((p) =>
      activeCategory === "all" ? true : categorizeProduct(p) === activeCategory,
    );

    if (imageSearchHash) {
      return matched
        .map((product) => ({
          product,
          distance: getImageDistance(
            imageSearchHash,
            productImageHashes[product.id],
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .map((item) => item.product);
    }

    return matched;
  }, [
    products,
    query,
    companyFilter,
    fuse,
    imageSearchHash,
    productImageHashes,
    activeCategory,
  ]);

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
      console.error("Voice search failed to start", error);
      setIsListening(false);
    }
  };

  return (
    <div>
      <ShopHeader />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Go Back</span>
        </button>
        {promotions.length > 0 && (
          <div className="mb-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                  Alerts
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Latest deals and new arrivals
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Guests can see promotions immediately while browsing the
                  store.
                </p>
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
                    setCompanyFilter("all");
                    setQuery("");
                  }}
                  className="rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800"
                >
                  View all deals
                </button>
              </div>
            </div>
          </div>
        )}
        <ComingSoonCompact products={products} />
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
              Catalog
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

  {loading ? (
    <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold">
        Loading Products...
      </h2>
    </div>
  ) : error ? (
    <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <h2 className="text-lg font-semibold text-red-700">
        Firestore Error
      </h2>

      <p className="mt-2 text-red-600">
        {error}
      </p>
    </div>
  ) : filtered.length > 0 ? (
    filtered.map((product) => (
      <ProductCard
        key={product.id}
        product={product}
        onTagClick={handleTagClick}
      />
    ))
  ) : (
    <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold">
        No Products Found
      </h2>

      <p className="mt-2 text-slate-600">
        Products in Redux: {products.length}
      </p>

      <p className="mt-2 text-slate-600">
        Products after filtering: {filtered.length}
      </p>

      <p className="mt-2 text-slate-600">
        Search query: "{query}"
      </p>
    </div>
  )}

</div>
      </main>
    </div>
  );
}