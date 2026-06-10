import { Link, NavLink } from 'react-router-dom';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ShopHeader() {
  const { user } = useAuth();

  const cartCount = useSelector(
    (state) => state?.cart?.items?.length || 0
  );

  const products = useSelector(
    (state) => state?.order?.products || []
  );

  const profile = useSelector((state) => state.user.user) || {};
  const role = profile.role || 'customer';
  const isCustomer = role === 'customer';

  const [isBellOpen, setIsBellOpen] = useState(false);
  const bellRef = useRef(null);

  const notifications = useMemo(() => {
    if (!Array.isArray(products)) return [];

    const alerts = [];

    products.forEach((product) => {
      if (!product || typeof product !== 'object') return;

      if (product.isNew) {
        alerts.push({
          id: `${product.id}-new`,
          title: 'New Arrival',
          message: `${product.name || 'Product'} is now available.`,
        });
      }

      if (product.discount) {
        alerts.push({
          id: `${product.id}-discount`,
          title: 'Discount',
          message: `${product.discount}% off ${
            product.name || 'Product'
          }`,
        });
      }

      if (product.package) {
        alerts.push({
          id: `${product.id}-package`,
          title: 'Package Deal',
          message: String(product.package),
        });
      }
    });

    return alerts;
  }, [products]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setIsBellOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  const displayName =
    typeof user?.displayName === 'string'
      ? user.displayName
      : typeof user?.email === 'string'
      ? user.email
      : '';

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-2xl font-bold text-green-700"
          >
            🌿 Garden Shop
          </Link>

          {displayName && (
            <span className="px-3 py-1 rounded-full bg-slate-100 text-sm">
              {displayName}
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex items-center flex-wrap gap-4">

          <NavLink to="/Home">
               Home
            </NavLink>

          <NavLink to="/shop">
            Shop
          </NavLink>

           <NavLink to="/locations">
             Locations
           </NavLink>

           <NavLink to="/weather">
             Weather
           </NavLink>

            <NavLink to="/testimonial">
               Testimonials
            </NavLink>

          {/* Notifications */}
          <div
            className="relative"
            ref={bellRef}
          >
            <button
              type="button"
              onClick={() =>
                setIsBellOpen((prev) => !prev)
              }
              className="relative p-2 border rounded-full"
            >
              <Bell size={18} />

              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                  {notifications.length}
                </span>
              )}
            </button>

            {isBellOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
                <div className="p-3 border-b font-semibold">
                  Notifications
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 border-b"
                      >
                        <p className="font-medium text-sm">
                          {item.title}
                        </p>

                        <p className="text-sm text-gray-600">
                          {item.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart */}
          <NavLink to="/cart">
            Cart ({cartCount})
          </NavLink>

          {/* Auth */}
{user ? (
             <>
               <NavLink to="/profile">
                 Profile
               </NavLink>

              <Link
                to="/logout"
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded"
              >
                <LogOut size={16} />
                Logout
              </Link>
            </>
          ) : (
            <NavLink to="/login">
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
