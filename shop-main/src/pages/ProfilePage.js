import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import ShopHeader from '../components/ShopHeader';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const profile = useSelector((state) => state.user.user);
  const orders = useSelector((state) => state.order.history);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div>
      <ShopHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white p-8 shadow-card">
            <h2 className="text-3xl font-semibold text-slate-900">My profile</h2>
            <p className="mt-4 text-slate-600">{profile?.name || user?.displayName || user?.email}</p>
            <p className="mt-2 text-sm text-slate-500">Role: {profile?.role || 'Customer'}</p>
            {profile?.companyName && <p className="mt-2 text-sm text-slate-500">Company: {profile.companyName}</p>}
            {profile?.websiteName && <p className="mt-2 text-sm text-slate-500">Website: {profile.websiteName}</p>}
            {profile?.websiteUrl && <p className="mt-2 text-sm text-slate-500">URL: {profile.websiteUrl}</p>}
            <button
              onClick={handleLogout}
              className="mt-8 rounded-2xl bg-rose-600 px-6 py-3 text-white hover:bg-rose-500"
            >
              Logout
            </button>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-card">
            <h3 className="text-2xl font-semibold text-slate-900">Order history</h3>
            <div className="mt-6 space-y-4">
              {orders.length === 0 ? (
                <p className="text-slate-600">No orders yet.</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="rounded-3xl border border-slate-200 p-4">
                    <p className="font-semibold">Order #{order.id}</p>
                    <p className="text-sm text-slate-600">Method: {order.deliveryMethod}</p>
                    <p className="text-sm text-slate-600">Total: M{order.total.toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
