import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Package } from "lucide-react";

const ComingSoonCarousel = ({ products }) => {
  const comingSoonProducts = products.filter((p) => p.comingSoon);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(
    comingSoonProducts.length === 0,
  );

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % comingSoonProducts.length);
  }, [comingSoonProducts.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + comingSoonProducts.length) % comingSoonProducts.length,
    );
  }, [comingSoonProducts.length]);

  useEffect(() => {
    if (!isHovering && comingSoonProducts.length > 1) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [isHovering, nextSlide, comingSoonProducts.length]);

  useEffect(() => {
    setShowPlaceholder(comingSoonProducts.length === 0);
  }, [products]);

  if (showPlaceholder) {
    return (
      <section className="mt-12 rounded-[2rem] border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-amber-600" />
              <p className="text-sm uppercase tracking-[0.24em] text-amber-600 font-semibold">
                Coming Soon
              </p>
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Products arriving soon
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Exciting new items joining our marketplace shortly.
            </p>

            <div className="flex items-center gap-4 p-4 bg-amber-100/50 rounded-2xl">
              <div className="h-20 w-20 rounded-2xl bg-amber-200 flex items-center justify-center flex-shrink-0">
                <Package size={32} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  New products coming soon
                </h3>
                <p className="text-sm text-slate-600">
                  Check back later for exciting new arrivals!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentProduct = comingSoonProducts[currentIndex];
  const remainingCount = comingSoonProducts.length - 1;

  return (
    <section
      className="mt-12 rounded-[2rem] border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-8 shadow-sm"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-amber-600" />
            <p className="text-sm uppercase tracking-[0.24em] text-amber-600 font-semibold">
              Coming Soon
            </p>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Products arriving soon
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Exciting new items joining our marketplace shortly.
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentProduct.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md flex-shrink-0">
                  <img
                    src={currentProduct.image}
                    alt={currentProduct.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
                          <rect width="800" height="600" fill="#fef3c7"/>
                          <text x="400" y="300" text-anchor="middle" font-size="32" fill="#92400e">${currentProduct.name}</text>
                        </svg>
                      `)}`;
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {currentProduct.name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {currentProduct.company}
                  </p>
                  <div className="mt-1">
                    <span className="inline-block bg-amber-200 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                      Arriving Soon
                    </span>
                  </div>
                </div>
              </div>

              {currentProduct.expectedArrival && (
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Expected arrival:</span>{" "}
                  {currentProduct.expectedArrival}
                </p>
              )}

              {currentProduct.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentProduct.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {comingSoonProducts.length > 1 && (
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={prevSlide}
                className="rounded-full bg-white border border-amber-300 p-2 text-amber-700 hover:bg-amber-100 transition"
                aria-label="Previous product"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex-1 flex justify-center gap-2">
                {comingSoonProducts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? "w-8 bg-amber-600"
                        : "w-2 bg-amber-300 hover:bg-amber-400"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={nextSlide}
                className="rounded-full bg-white border border-amber-300 p-2 text-amber-700 hover:bg-amber-100 transition"
                aria-label="Next product"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {remainingCount > 0 && (
          <div className="text-center lg:text-right">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-600 text-white">
              <span className="text-2xl font-bold">
                {comingSoonProducts.length}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">Products</p>
            <p className="text-xs text-slate-500">waiting to arrive</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ComingSoonCarousel;
