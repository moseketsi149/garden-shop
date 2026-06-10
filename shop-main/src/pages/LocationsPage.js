import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ShopHeader from '../components/ShopHeader';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { MapPin, Building2, Package, Navigation } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const fallbackLocations = [
  {
    id: 'loc1',
    name: 'Motheo Fresh Supplies',
    address: 'Lesotho, Leribe District, Peka',
    lat: -28.9688,
    lng: 27.7626,
    description: 'Fresh Garden Fruits.',
    tags: ['fruits', 'veges', 'fresh supplies'],
    phone: '+266 53094857',
    hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-1PM'
  },
  {
    id: 'loc2',
    name: 'Wonder Farms',
    address: 'Lesotho, Maseru District, Morija',
    lat: -29.62982,
    lng: 27.51351,
    description: 'A farm for farmers growing together.',
    tags: ['farm', 'farmers', 'crops'],
    phone: '+2656 65093576',
    hours: 'Mon-Fri: 7AM-5PM, Sat: 8AM-12PM'
  },
  {
    id: 'loc3',
    name: 'Hood modern garden',
    address: 'Lesotho, Mafeteng District, Thabana Morena',
    lat: -29.9580,
    lng: 27.4233,
    description: 'Hood modern gardens provided by hard working Hood teams.',
    tags: ['gardens', 'modern garden', 'plots'],
    phone: '+266 59003579',
    hours: 'Mon-Sat: 8AM-7PM'
  }
];

const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function LocationsPage() {
  const products = useSelector((state) => state.order.products || []);
  const locations = useSelector((state) => state.locations?.locations || []);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const activeLocations = locations.length > 0 ? locations : fallbackLocations;

  const companiesWithProducts = useMemo(() => {
    return activeLocations.map((location) => {
      const companyProducts = products.filter((p) => p.company === location.name);
      return {
        ...location,
        productCount: companyProducts.length,
        products: companyProducts,
      };
    });
  }, [products, activeLocations]);

  const center = [-15.4167, 28.2833];
  const zoom = 12;

  return (
    <div>
      <ShopHeader />
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <MapPin className="h-8 w-8 text-slate-900" />
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Company Locations</p>
              <h1 className="text-3xl font-semibold text-slate-900">Find Our Partners</h1>
            </div>
          </div>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl">
            Explore where our partner companies are located. Click on markers to view company details, 
            product offerings, and contact information.
          </p>
        </div>

        {/* Map and List Layout */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Map Section */}
          <div className="rounded-[2rem] overflow-hidden shadow-xl border border-slate-200">
            <div className="h-[500px]">
              <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {companiesWithProducts.map((company) => (
                  <Marker
                    key={company.id}
                    position={[company.lat, company.lng]}
                    icon={customIcon}
                    eventHandlers={{
                      click: () => setSelectedCompany(company)
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-slate-900">{company.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">{company.address}</p>
                        <p className="text-sm text-slate-500 mt-2">{company.description}</p>
                        <Link
                          to={`/shop?company=${encodeURIComponent(company.name)}`}
                          className="mt-3 inline-block rounded-full bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
                        >
                          View Products
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Company List Section */}
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-card border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Partner Companies ({companiesWithProducts.length})
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Click on a company to see details and browse their products.
              </p>
            </div>

            <div className="space-y-4">
              {companiesWithProducts.map((company) => (
                <div
                  key={company.id}
                  className={`rounded-3xl border p-6 transition-all cursor-pointer ${
                    selectedCompany?.id === company.id
                      ? 'border-slate-900 bg-slate-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedCompany(company)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{company.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{company.description}</p>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <MapPin className="h-4 w-4" />
                          <span>{company.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Navigation className="h-4 w-4" />
                          <span>{company.lat.toFixed(4)}, {company.lng.toFixed(4)}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {company.tags.map((tag) => (
                          <Link
                            key={tag}
                            to={`/shop?query=${encodeURIComponent(tag)}&company=${encodeURIComponent(company.name)}`}
                            className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                          >
                            #{tag}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col items-end gap-3">
                      <div className="rounded-2xl bg-slate-100 px-4 py-2 text-center">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Products</p>
                        <p className="text-xl font-semibold text-slate-900">{company.productCount}</p>
                      </div>
                      <Link
                        to={`/shop?company=${encodeURIComponent(company.name)}`}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-900 px-4 py-2 text-sm text-slate-900 hover:bg-slate-50"
                      >
                        <Package className="h-4 w-4" />
                        Browse
                      </Link>
                    </div>
                  </div>

                  {/* Contact Info (shown when selected) */}
                  {selectedCompany?.id === company.id && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Phone</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{company.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Hours</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">{company.hours}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-white hover:bg-slate-800"
          >
            <Package className="h-5 w-5" />
            Browse All Products
          </Link>
        </div>
      </main>
    </div>
  );
}