export default function OrdersPage() {
  const orders = [
    { id: 'ord-1001', company: 'Apex Logistics', status: 'Processing', amount: 6800, method: 'Delivery', deliveryDate: '2026-06-02' },
    { id: 'ord-1002', company: 'NorthStar Industries', status: 'Delivered', amount: 2140, method: 'Pickup', deliveryDate: '2026-05-18' },
    { id: 'ord-1003', company: 'Bayfield Enterprises', status: 'Scheduled', amount: 12500, method: 'Delivery', deliveryDate: '2026-06-05' }
  ];

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <h1 className="text-3xl font-semibold text-slate-900">Company orders</h1>
        <p className="mt-2 text-slate-600">Review enterprise sales, delivery preferences, and order fulfillment status.</p>
      </div>
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{order.company}</p>
                <p className="text-sm text-slate-600">Order #{order.id}</p>
                <p className="text-sm text-slate-600">Delivery: {order.deliveryDate}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                <span className="rounded-full bg-slate-100 px-3 py-1">{order.method}</span>
                <span className={`rounded-full px-3 py-1 ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span>
                <span>M{order.amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
