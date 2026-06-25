import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerRegisterPage from './pages/CustomerRegisterPage';
import ProfilePage from './pages/ProfilePage';
import LocationsPage from './pages/LocationsPage';
import TestimonialPage from './pages/TestimonialPage';
import LogoutPage from './pages/LogoutPage';
import WeatherPage from './pages/WeatherPage';
import PrivateRoute from './components/PrivateRoute';
import Footer from './components/Footer';
import BackButton from './components/BackButton';
import { AuthProvider } from './context/AuthContext';
import { startProductsListener, stopProductsListener } from './features/order/orderSlice';
import { startLocationsListener, stopLocationsListener } from './features/locations/locationsSlice';

import { deduplicateProducts } from './api/seedProducts';
import { db } from './firebase/config';

function App() {
  const dispatch = useDispatch();
  const [initError, setInitError] = useState(null);

useEffect(() => {
    const init = async () => {
   try {
     console.log("Starting product deduplication...");
     const snapshot = await deduplicateProducts();

     console.log("Product deduplication completed, starting listeners...");

     dispatch(startProductsListener());
     dispatch(startLocationsListener());
   } catch (error) {
     console.error("Failed to start app:", error.message || error);
     setInitError(error?.message || "Failed to initialize app");
   }
 };

    init();

    return () => {
      dispatch(stopProductsListener());
      dispatch(stopLocationsListener());
    };
  }, [dispatch]);

  if (typeof window !== 'undefined' && !window.__firebaseUtilsExposed) {
    window.__firebaseUtilsExposed = true;
    window.__firebaseUtils = { db, deduplicateProducts };
  }

  if (initError) {
    return (
      <AuthProvider>
        <div className="min-h-screen bg-sky-50/30 text-slate-900 flex items-center justify-center">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-900">Initialization Error</h2>
            <p className="mt-2 text-sm text-red-700">{initError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-sky-50/30 text-slate-900">
        <BackButton />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/testimonial" element={<TestimonialPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/logout" element={<PrivateRoute><LogoutPage /></PrivateRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/customer" element={<CustomerRegisterPage />} />
        </Routes>
        <Footer />
        <ToastContainer position="top-right" theme="colored" />
      </div>
    </AuthProvider>
  );
}
export default App;
