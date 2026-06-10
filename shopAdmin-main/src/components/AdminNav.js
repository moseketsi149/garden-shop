import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Database, Package, Clipboard, Shield, MessageCircle, Star, MapPin, ThumbsUp, TrendingUp } from 'react-feather';

const links = [
  { path: '/', label: 'Dashboard', icon: Package },
  { path: '/inventory', label: 'Inventory', icon: Database },
  { path: '/locations', label: 'Company Locations', icon: MapPin },
  { path: '/employees', label: 'Employees', icon: Users },
  { path: '/orders', label: 'Orders', icon: Clipboard },
  { path: '/messages', label: 'Messages', icon: MessageCircle },
  { path: '/testimonials', label: 'Testimonials', icon: ThumbsUp },
  { path: '/access-control', label: 'Access control', icon: Shield },
  { path: '/reports', label: 'Reports & Analysis', icon: TrendingUp }
];

export default function AdminNav() {
  const { user } = useAuth();
  const navLinks = [...links];

  if (user?.role === 'super-admin') {
    navLinks.push({ path: '/super-admin', label: 'Super Admin', icon: Star });
  }

  return (
    <aside className="hidden w-72 flex-col gap-4 bg-emerald-900 px-6 py-8 text-slate-100 lg:flex">
      <div className="mb-10 text-2xl font-bold">🌿 Garden Admin</div>
      <nav className="space-y-3 text-sm">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-3xl px-4 py-3 transition ${
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
