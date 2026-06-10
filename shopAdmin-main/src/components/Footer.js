export default function Footer() {
  return (
    <footer className="border-t border-emerald-200 bg-emerald-50 px-6 py-8 text-sm text-slate-600">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-emerald-800 font-semibold">🌿 Garden Admin</p>
          <p>Admin portal for managing garden inventory, orders, and horticulture operations.</p>
        </div>
        <div className="space-y-1">
          <p>Powered by Firebase, React, and garden management analytics.</p>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Garden Admin. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
