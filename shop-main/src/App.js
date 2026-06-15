import { useEffect, useRef } from 'react';
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
import { startProductsListener } from './features/order/orderSlice';
import { startLocationsListener as startLocationsListenerAction } from './features/locations/locationsSlice';
import { seedSampleProducts } from './api/seedProducts';

function App() {
  const dispatch = useDispatch();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    try {
      dispatch(startProductsListener());
      dispatch(startLocationsListenerAction());
      seedSampleProducts();
    } catch (error) {
      console.error('Failed to start app:', error);
    }
  }, [dispatch]);

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
