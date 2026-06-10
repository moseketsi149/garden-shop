export default function Footer() {
  return (
    <footer className="border-t border-emerald-200 bg-emerald-50 px-6 py-8 text-sm text-slate-600">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-emerald-800 font-semibold">🌿 Garden Shop</p>
          <p>Your one-stop shop for premium gardening supplies, plants, and horticulture tools.</p>
        </div>
        <div className="space-y-1">
          <p>Built by Liana Rapapa Head digital Director at Development Solutions, Built with React, Tailwind, and Cloudflare-ready functions.</p>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Garden Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
