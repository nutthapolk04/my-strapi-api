
import Link from 'next/link';
import { fetchAPI, getStrapiMedia } from '@/lib/strapi';

interface Car {
  documentId: string;
  Name: string;
  Brand: string;
  Description: string;
  Price: number;
  CoverImage?: {
    url: string;
  };
}

async function getCars() {
  const data = await fetchAPI('/cars', { populate: '*' }, { cache: 'no-store' });
  return data.data;
}

export default async function Home() {
  const cars = await getCars();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-2">
            Premium Inventory
          </h1>
          <p className="text-lg text-gray-500">Discover your next dream car</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car: Car) => {
            const imageUrl = getStrapiMedia(car.CoverImage?.url);

            return (
              <Link href={`/cars/${car.documentId}`} key={car.documentId} className="group block h-full">
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-64 w-full bg-gray-200 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={car.Name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 font-medium">No Image Available</div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-800 shadow-sm">
                      {car.Brand}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {car.Name}
                      </h2>
                      <p className="text-gray-500 line-clamp-3 mb-4 text-sm leading-relaxed">
                        {car.Description}
                      </p>
                    </div>
                    <div className="flex items-end justify-between pt-4 border-t border-gray-50 mt-4">
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-semibold">Price</span>
                        <div className="text-xl font-bold text-emerald-600">
                          {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(car.Price)}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 bg-indigo-50 group-hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                        View Details
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
