import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const ComingSoonCompact = ({ products }) => {
  const comingSoonProducts = useMemo(
    () => products.filter((p) => p.comingSoon),
    [products],
  );

  return (
    <div className="mb-8 rounded-3xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Clock size={18} className="text-amber-600" />
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-amber-600">
            Coming Soon
          </p>
          <p className="text-sm text-slate-600">
            {comingSoonProducts.length > 0
              ? `Products arriving soon • ${comingSoonProducts.length} item${comingSoonProducts.length !== 1 ? "s" : ""} pending`
              : "No upcoming arrivals at the moment"}
          </p>
        </div>
      </div>

      {comingSoonProducts.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {comingSoonProducts.map((product, index) => (
            <motion.div
              key={product.id || index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className="flex flex-col items-center bg-white rounded-2xl p-2 border border-amber-100 shadow-sm hover:shadow-md transition"
            >
              <div className="h-14 w-14 rounded-lg overflow-hidden bg-slate-100 mb-1.5">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
                        <rect width="800" height="600" fill="#fef3c7"/>
                        <text x="400" y="300" text-anchor="middle" font-size="24" fill="#92400e">${product.name || "Product"}</text>
                      </svg>
                    `)}`;
                  }}
                />
              </div>
              <span className="text-xs text-center text-slate-700 font-medium truncate w-full px-1 leading-tight">
                {product.name}
              </span>
              {product.expectedArrival && (
                <span className="text-[10px] text-amber-600 mt-0.5">
                  {product.expectedArrival}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComingSoonCompact;
