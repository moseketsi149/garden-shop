import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShopHeader from '../components/ShopHeader';

export default function HomePage() {
  const { user } = useAuth();
  const displayName = typeof user?.displayName === 'string' ? user.displayName : typeof user?.email === 'string' ? user.email : '';

  return (
    <div>
      <ShopHeader />
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-6xl px-6 pt-10"
      >
        {displayName && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <p className="text-sm font-medium">Welcome back, <span className="font-semibold">{displayName}</span>.</p>
            <p className="text-xs text-emerald-800/80">You’re signed in. Continue exploring the marketplace.</p>
          </div>
        )}
      </motion.section>
      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-600">Premium Horticulture and Processing Marketplace</p>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-900">Cultivate your perfect garden with premium plants, tools, and expert guidance.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">Login to access exclusive gardening supplies, track your plant orders, schedule deliveries, and join our community of passionate gardeners.</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/shop" className="rounded-full bg-emerald-700 px-6 py-3 text-slate-900 shadow hover:bg-emerald-800">Browse Garden Supplies</Link>
              <Link to="/register" className="rounded-full border border-slate-300 px-6 py-3 text-slate-900 hover:bg-slate-50">Join Our Garden</Link>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] bg-emerald-800 p-10 text-slate-900 shadow-xl"
          >
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Garden highlights</p>
              <ul className="space-y-3 text-emerald-100">
                <li> Fresh seasonal plants and seeds</li>
                <li> Premium gardening tools and equipment</li>
                <li> Expert tips and growing guides</li>
                <li> Flexible delivery scheduling</li>
              </ul>
            </div>
          </motion.div>
        </section>

        {/* Featured companies */}
        <section className="mt-12 rounded-[2rem] border border-emerald-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Featured growers</p>
              <h2 className="text-2xl font-semibold text-slate-900">Trusted nurseries powering our marketplace</h2>
            </div>
            <Link to="/shop" className="inline-flex items-center rounded-full bg-emerald-700 px-6 py-3 text-slate-900 hover:bg-emerald-800">Explore all products</Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                name: 'Green Valley Farms',
                description: 'Fresh organic vegetables, heirloom tomatoes, and seasonal crop boxes delivered weekly.',
                tags: ['tomatoes', 'vegetables', 'organic']
              },
              {
                name: 'Harvest Fresh Co-op',
                description: 'Farm-fresh salad greens, culinary herbs, and mixed vegetable bundles from local farmers.',
                tags: ['salad', 'herbs', 'fresh']
              },
              {
                name: 'Root & Stem Farms',
                description: 'Specialty root vegetables, heirloom carrots, and colorful bell peppers grown sustainably.',
                tags: ['carrots', 'peppers', 'heirloom']
              }
            ].map((partner) => (
              <div key={partner.name} className="rounded-3xl border border-slate-200 p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">{partner.name}</p>
                <p className="mt-3 text-sm text-slate-600">{partner.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
{partner.tags.map((tag) => (
                   <Link
                     key={`${partner.name}-${tag}`}
                     to={`/shop?query=${encodeURIComponent(tag)}&company=${encodeURIComponent(partner.name)}`}
                     className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                   >
                     {tag}
                   </Link>
                 ))}
              </div>
<Link
                 to={`/shop?query=${encodeURIComponent(partner.name)}&company=${encodeURIComponent(partner.name)}`}
                 className="mt-6 inline-flex rounded-full border border-emerald-700 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
               >
                 Browse {partner.name}
               </Link>
            </div>
            ))}
          </div>
        </section>
        
        {/* Registration & Pricing Section */}
        <section className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Sell Your Produce on Our Platform</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl mx-auto">
              To list your vegetables, crops, or garden products for sale, you must register and maintain an active subscription. 
              This ensures quality control, reliable supply, and fair pricing for all customers.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-emerald-300 p-6 bg-white shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">For Companies & Cooperatives</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Commercial Growers</h3>
                  <p className="mt-1 text-sm text-slate-500">Farms, nurseries, and agricultural cooperatives</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-emerald-700">M1,000.00</div>
                  <div className="text-sm text-slate-500">per month</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                <p className="text-xs text-emerald-800 font-medium">Why this price?</p>
                <ul className="mt-2 text-xs text-slate-600 space-y-1">
                  <li> Access to bulk buyers and wholesale markets</li>
                  <li> List unlimited products with priority placement</li>
                  <li> Advanced inventory and order management</li>
                  <li> Dedicated account manager and priority support</li>
                  <li> Monthly sales analytics and market insights</li>
                </ul>
              </div>
              <div className="mt-6">
                <Link to="/register" className="inline-block w-full text-center rounded-full bg-emerald-700 px-5 py-3 text-white font-medium hover:bg-emerald-800">Register Your Business</Link>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-emerald-300 p-6 bg-white shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">For Individual Sellers</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Home Gardeners</h3>
                  <p className="mt-1 text-sm text-slate-500">Small-scale growers and hobby farmers</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-emerald-700">M750.00</div>
                  <div className="text-sm text-slate-500">per month</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                <p className="text-xs text-emerald-800 font-medium">Why this price?</p>
                <ul className="mt-2 text-xs text-slate-600 space-y-1">
                  <li> Sell surplus produce from your garden</li>
                  <li> List up to 50 products per month</li>
                  <li> Access to local customer base</li>
                  <li> Standard support and community forums</li>
                  <li> Basic sales tracking and payment processing</li>
                </ul>
              </div>
              <div className="mt-6">
                <Link to="/register" className="inline-block w-full text-center rounded-full bg-emerald-700 px-5 py-3 text-white font-medium hover:bg-emerald-800">Start Selling Today</Link>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-800">Important Subscription Information</h4>
                <ul className="mt-2 text-sm text-amber-700 space-y-1">
                  <li> <strong>Monthly billing only</strong>  No annual plans available. Subscriptions renew automatically each month.</li>
                  <li> <strong>Product approval required</strong>  All listed products must meet our quality and safety standards before going live.</li>
                  <li> <strong>Active subscription required</strong>  Your products will be hidden if your subscription lapses.</li>
                  <li> <strong>Cancel anytime</strong>  No long-term commitments, but no prorated refunds for partial months.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}





