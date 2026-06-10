import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminNav from './components/AdminNav';
import Footer from './components/Footer';
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const CompanyLocationsPage = lazy(() => import('./pages/CompanyLocationsPage'));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'));
const AccessControlPage = lazy(() => import('./pages/AccessControlPage'));
const SuperAdminPage = lazy(() => import('./pages/SuperAdminPage'));
const ReportsAndAnalysisPage = lazy(() => import('./pages/ReportsAndAnalysisPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen bg-slate-100 p-12 text-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-emerald-50/30">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[18rem_1fr]">
        <AdminNav />
        <main className="px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="min-h-screen bg-slate-100 p-12 text-center">Loading admin interface...</div>}>
        <ToastContainer position="top-right" theme="colored" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <AdminLayout>
                   <Routes>
                     <Route path="/" element={<DashboardPage />} />
                     <Route path="/inventory" element={<InventoryPage />} />
                     <Route path="/locations" element={<CompanyLocationsPage />} />
                     <Route path="/employees" element={<EmployeesPage />} />
                     <Route path="/orders" element={<OrdersPage />} />
                     <Route path="/messages" element={<MessagesPage />} />
                     <Route path="/testimonials" element={<TestimonialsPage />} />
                     <Route path="/access-control" element={<AccessControlPage />} />
                     <Route path="/super-admin" element={<SuperAdminPage />} />
                     <Route path="/reports" element={<ReportsAndAnalysisPage />} />
                   </Routes>
                  <Footer />
                </AdminLayout>
              </RequireAuth>
            }
          />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
