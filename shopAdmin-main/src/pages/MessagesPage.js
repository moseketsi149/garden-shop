import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MessagesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="space-y-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Go Back</span>
      </button>

      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Messages</h1>
            <p className="mt-2 text-slate-600">Review incoming messages, support requests, and communication threads from your customers.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-3xl bg-emerald-50 px-5 py-4 text-emerald-800">
            <MessageCircle size={20} />
            <span className="text-sm font-semibold">{user?.role === 'super-admin' ? 'Super Admin View' : 'Admin View'}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Unread Messages</p>
          <p className="mt-4 text-4xl font-bold text-slate-900">18</p>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">High Priority</p>
          <p className="mt-4 text-4xl font-bold text-amber-600">6</p>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Resolved Threads</p>
          <p className="mt-4 text-4xl font-bold text-emerald-800">124</p>
        </div>
      </div>

      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <h2 className="text-2xl font-semibold text-slate-900">Latest Customer Messages</h2>
        <div className="mt-6 space-y-4">
          <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center justify-between gap-4 text-slate-700">
              <div>
                <p className="font-semibold text-slate-900">New order support request</p>
                <p className="text-sm text-slate-500">from sophia@gardenmail.com</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Unread</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">Can you confirm the shipping date for order #8034? I need to schedule the delivery for my greenhouse team.</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center justify-between gap-4 text-slate-700">
              <div>
                <p className="font-semibold text-slate-900">Product guidance request</p>
                <p className="text-sm text-slate-500">from marco@plantpros.com</p>
              </div>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">Pending</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">Looking for advice on the best fertilizer schedule for the new indoor plant collection.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
