import { useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import API from '../services/api';
import ProductCard from './ProductCard';
import { toast } from 'react-hot-toast';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'All' },
  { key: 'Electronics', label: 'Electronics', icon: 'EL' },
  { key: 'Fashion-Men', label: "Men's Fashion", icon: 'MN' },
  { key: 'Fashion-Women', label: "Women's Fashion", icon: 'WM' },
  { key: 'Food', label: 'Food & Grocery', icon: 'FD' },
  { key: 'Beauty', label: 'Beauty', icon: 'BT' },
  { key: 'Home', label: 'Home & Kitchen', icon: 'HM' },
  { key: 'Accessories', label: 'Accessories', icon: 'AC' },
  { key: 'Sports', label: 'Sports', icon: 'SP' },
  { key: 'Books', label: 'Books', icon: 'BK' },
];

export { CATEGORIES };

function CategoryBadge({ cat, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-all ${
        active
          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
      }`}
    >
      <span
        className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[10px] font-bold ${
          active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {cat.icon}
      </span>
      {cat.label}
    </button>
  );
}

function ProductCatalog({ searchQuery = '' }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const fetchProducts = async (category = 'all') => {
    setLoading(true);
    try {
      const url = category === 'all' ? '/products' : `/products?category=${category}`;
      const response = await API.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Could not load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    if (searchQuery.trim() && activeCategory !== 'all') {
      setActiveCategory('all');
    }
  }, [activeCategory, searchQuery]);

  const activeMeta = CATEGORIES.find((category) => category.key === activeCategory);
  const trimmedSearch = searchQuery.trim();
  const visibleProducts = useMemo(() => {
    if (!trimmedSearch) {
      return products;
    }

    const fuse = new Fuse(products, {
      keys: ['name', 'description', 'category'],
      threshold: 0.35,
      ignoreLocation: true,
    });

    return fuse.search(trimmedSearch).map((result) => result.item);
  }, [products, trimmedSearch]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map((cat) => (
          <CategoryBadge
            key={cat.key}
            cat={cat}
            active={activeCategory === cat.key}
            onClick={() => setActiveCategory(cat.key)}
          />
        ))}
      </div>

      {activeCategory === 'all' && (
        <section>
          <p className="mb-3 text-sm font-semibold text-slate-700">Shop by category</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.slice(1).map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className="group flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                  {cat.icon}
                </span>
                <span className="text-xs font-medium leading-tight text-slate-600 group-hover:text-blue-700">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-800">
            {activeCategory === 'all'
              ? `All Products (${visibleProducts.length})`
              : `${activeMeta?.label} - ${visibleProducts.length} items`}
          </p>
          <p className="text-sm text-slate-400">
            {trimmedSearch
              ? `Search results for "${trimmedSearch}"`
              : 'Browse fresh products from your microservice catalog.'}
          </p>
        </div>
        {activeCategory !== 'all' && (
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Back to all
          </button>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white" />
          ))}
        </div>
      )}

      {!loading && visibleProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-500 shadow-sm">
            {activeMeta?.icon || 'NA'}
          </span>
          <p className="text-sm font-semibold text-slate-600">
            {trimmedSearch ? 'No matching products found.' : 'No products in this category yet.'}
          </p>
          <p className="max-w-sm text-xs text-slate-400">
            {trimmedSearch
              ? 'Try searching by product name, category, or description.'
              : 'Add products through the admin panel, then they will appear here automatically.'}
          </p>
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="mt-2 rounded-lg border border-blue-600 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Browse all products
          </button>
        </div>
      )}

      {!loading && visibleProducts.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOrderPlaced={() => fetchProducts(activeCategory)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductCatalog;
