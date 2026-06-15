import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, FileText, Users, Package, ArrowLeft } from 'react-feather';
import { useNavigate } from 'react-router-dom';

// Mock data for monthly product purchases
const monthlyProductPurchases = [
  { month: 'Jan', 'Fresh Organic Tomatoes': 120, 'Premium Mixed Salad Greens': 85, 'Heirloom Carrots Bundle': 95, 'Strawberry Plants': 75, 'Herb Garden Kit': 60 },
  { month: 'Feb', 'Fresh Organic Tomatoes': 135, 'Premium Mixed Salad Greens': 92, 'Heirloom Carrots Bundle': 88, 'Strawberry Plants': 82, 'Herb Garden Kit': 70 },
  { month: 'Mar', 'Fresh Organic Tomatoes': 142, 'Premium Mixed Salad Greens': 105, 'Heirloom Carrots Bundle': 95, 'Strawberry Plants': 95, 'Herb Garden Kit': 80 },
  { month: 'Apr', 'Fresh Organic Tomatoes': 158, 'Premium Mixed Salad Greens': 120, 'Heirloom Carrots Bundle': 110, 'Strawberry Plants': 105, 'Herb Garden Kit': 95 },
  { month: 'May', 'Fresh Organic Tomatoes': 165, 'Premium Mixed Salad Greens': 130, 'Heirloom Carrots Bundle': 125, 'Strawberry Plants': 115, 'Herb Garden Kit': 105 }
];

// Mock data for most purchased products by company
const companyProductData = [
  { company: 'Green Valley Farms', product: 'Fresh Organic Tomatoes', purchases: 245 },
  { company: 'Green Valley Farms', product: 'Premium Mixed Salad Greens', purchases: 180 },
  { company: 'Green Valley Farms', product: 'Heirloom Carrots Bundle', purchases: 165 },
  { company: 'Harvest Fresh Co-op', product: 'Premium Mixed Salad Greens', purchases: 210 },
  { company: 'Harvest Fresh Co-op', product: 'Strawberry Plants', purchases: 195 },
  { company: 'Harvest Fresh Co-op', product: 'Herb Garden Kit', purchases: 175 },
  { company: 'Root & Stem Farms', product: 'Heirloom Carrots Bundle', purchases: 230 },
  { company: 'Root & Stem Farms', product: 'Fresh Organic Tomatoes', purchases: 155 },
  { company: 'Root & Stem Farms', product: 'Herb Garden Kit', purchases: 140 }
];

export default function ReportsAndAnalysisPage() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('3months'); // 1month, 3months, 6months, 1year

  // Get the most purchased product overall
  const getMostPurchasedProduct = () => {
    const productTotals = {};
    
    // Sum up purchases for each product across all companies
    companyProductData.forEach(item => {
      if (!productTotals[item.product]) {
        productTotals[item.product] = 0;
      }
      productTotals[item.product] += item.purchases;
    });
    
    // Find the product with maximum purchases
    let mostPurchasedProduct = null;
    let maxPurchases = 0;
    
    for (const [product, purchases] of Object.entries(productTotals)) {
      if (purchases > maxPurchases) {
        maxPurchases = purchases;
        mostPurchasedProduct = product;
      }
    }
    
    return { product: mostPurchasedProduct, purchases: maxPurchases };
  };

  // Get the company that purchased the most of a specific product
  const getTopCompanyForProduct = (product) => {
    const companyPurchases = {};
    
    companyProductData.forEach(item => {
      if (item.product === product) {
        if (!companyPurchases[item.company]) {
          companyPurchases[item.company] = 0;
        }
        companyPurchases[item.company] += item.purchases;
      }
    });
    
    // Find the company with maximum purchases for this product
    let topCompany = null;
    let maxPurchases = 0;
    
    for (const [company, purchases] of Object.entries(companyPurchases)) {
      if (purchases > maxPurchases) {
        maxPurchases = purchases;
        topCompany = company;
      }
    }
    
    return { company: topCompany, purchases: maxPurchases };
  };

  const { product: mostPurchasedProduct, purchases: mostPurchasedCount } = getMostPurchasedProduct();
  const { company: topCompany, purchases: topCompanyCount } = getTopCompanyForProduct(mostPurchasedProduct);

  return (
    <section className="space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Go Back</span>
      </button>
      {/* Header */}
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Reports & Analysis</h1>
            <p className="mt-2 text-slate-600">Monitor purchasing trends, product performance, and supplier analytics.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setTimeRange('1month')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${timeRange === '1month' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              1 Month
            </button>
            <button
              onClick={() => setTimeRange('3months')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${timeRange === '3months' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              3 Months
            </button>
            <button
              onClick={() => setTimeRange('6months')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${timeRange === '6months' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              6 Months
            </button>
            <button
              onClick={() => setTimeRange('1year')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${timeRange === '1year' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              1 Year
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 xl:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Most Purchased Product</p>
          <p className="mt-4 text-2xl font-bold text-slate-900">{mostPurchasedProduct}</p>
          <p className="text-slate-600">{mostPurchasedCount} total purchases</p>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Top Purchasing Company</p>
          <p className="mt-4 text-2xl font-bold text-slate-900">{topCompany}</p>
          <p className="text-slate-600">{topCompanyCount} purchases of {mostPurchasedProduct}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total Products Tracked</p>
          <p className="mt-4 text-2xl font-bold text-slate-900">5</p>
          <p className="text-slate-600">Active inventory items</p>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Active Suppliers</p>
          <p className="mt-4 text-2xl font-bold text-slate-900">3</p>
          <p className="text-slate-600">Companies supplying products</p>
        </div>
      </div>

      {/* Monthly Purchase Trends */}
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <h2 className="text-2xl font-semibold text-slate-900">Monthly Product Purchase Trends</h2>
        <div className="mt-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyProductPurchases}>
              <XAxis dataKey="month" tick={false} />
              <YAxis tick={false} />
              <Tooltip formatter={(value) => `${value} units`} />
              {/* Define colors for each product */}
              <Bar dataKey="Fresh Organic Tomatoes" barSize={20} fill="#10b981" />
              <Bar dataKey="Premium Mixed Salad Greens" barSize={20} fill="#3b82f6" />
              <Bar dataKey="Heirloom Carrots Bundle" barSize={20} fill="#f59e0b" />
              <Bar dataKey="Strawberry Plants" barSize={20} fill="#ec4899" />
              <Bar dataKey="Herb Garden Kit" barSize={20} fill="#8b5cf6" />
              <legend verticalAlign="top" height={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Performance by Company */}
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <h2 className="text-2xl font-semibold text-slate-900">Product Performance by Supplier Company</h2>
        <div className="mt-6">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie data={companyProductData} dataKey="purchases" cx="50%" cy="50%" innerRadius="60%" outerRadius="80%">
                {/* Color mapping for companies */}
                {companyProductData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 3 === 0 ? '#10b981' : index % 3 === 1 ? '#3b82f6' : '#f59e0b'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 space-x-4">
          {/* Legend */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-10b981" />
              <span className="text-slate-600 text-sm">Green Valley Farms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-3b82f6" />
              <span className="text-slate-600 text-sm">Harvest Fresh Co-op</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-f59e0b" />
              <span className="text-slate-600 text-sm">Root & Stem Farms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Table */}
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <h2 className="text-2xl font-semibold text-slate-900">Purchase Analysis Details</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-slate-900 font-medium">Supplier Company</th>
                <th className="px-4 py-3 text-left text-slate-900 font-medium">Product</th>
                <th className="px-4 py-3 text-left text-slate-900 font-medium">Total Purchases</th>
                <th className="px-4 py-3 text-left text-slate-900 font-medium">Average Monthly</th>
                <th className="px-4 py-3 text-left text-slate-900 font-medium">Market Share</th>
              </tr>
            </thead>
            <tbody>
              {companyProductData.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{item.company}</td>
                  <td className="px-4 py-3">{item.product}</td>
                  <td className="px-4 py-3">{item.purchases}</td>
                  <td className="px-4 py-3">{(item.purchases / 5).toFixed(1)}</td>
                  <td className="px-4 py-3">{
                    // Calculate percentage of total purchases for this product
                    ((item.purchases / 
                      companyProductData
                        .filter(i => i.product === item.product)
                        .reduce((sum, i) => sum + i.purchases, 0)) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}