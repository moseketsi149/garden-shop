import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSelector } from 'react-redux';

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const profile = useSelector((state) => state.user.user) || {};
  const role = profile.role || 'customer';

  if (loading) {
    return <div className="min-h-screen bg-slate-50 px-6 py-20 text-center text-slate-700">Loading account , Please Wait...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/shop" replace />;
  }

  return children;
}
