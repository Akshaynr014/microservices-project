import { useEffect, useState } from 'react';
import API from '../services/api';
import ProductCard from './ProductCard';
import { toast } from 'react-hot-toast';

const CATEGORIES = [
  { key: 'all',           label: 'All',             icon: '🏪' },
  { key: 'Electronics',   label: 'Electronics',     icon: '📱' },
  { key: 'Fashion-Men',   label: "Men's Fashion",   icon: '👔' },
  { key: 'Fashion-Women', label: "Women's Fashion", icon: '👗' },
  { key: 'Food',          label: 'Food & Grocery',  icon: '🍕' },
  { key: 'Beauty',        label: 'Beauty',          icon: '💄' },
  { key: 'Home',          label: 'Home & Kitchen',  icon: '🏠' },
  { key: 'Accessories',   label: 'Accessories',     icon: '⌚' },
  { key: 'Sports',        label: 'Sports',          icon: '⚽' },
  { key: 'Books',         label: 'Books',           icon: '📚' },
];

export { CATEGORIES };

function ProductCatalog() {
  const [products, setProducts]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const fetchProducts = async (category = 'all') => {
    setLoading(true);
    try {
      const url = category === 'all'
        ? '/products'
        : `/products?category=${category}`;
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

  const activeMeta = CATEGORIES.find(c => c.key === activeCategory);

  return (
    <div className="space-y-5">

      {/* ── Category pill bar ── */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs whitespace-nowrap transition-all
              ${activeCategory === cat.key
                ? 'border-[#2874f0] bg-blue-50 text-[#2874f0] font-medium'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
          >
            <span className="text-xl">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Category tiles grid — only on "All" view ── */}
      {activeCategory === 'all' && (
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">Shop by category</p>
          <div className="grid grid-cols-5 gap-3">
            {CATEGORIES.slice(1).map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-[#2874f0] hover:bg-blue-50 hover:shadow-sm transition-all group"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-xs text-slate-600 group-hover:text-[#2874f0] text-center leading-tight transition-colors">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Section heading ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">
          {activeCategory === 'all'
            ? `All Products (${products.length})`
            : `${activeMeta?.icon} ${activeMeta?.label} — ${products.length} items`}
        </p>
        {activeCategory !== 'all' && (
          <button
            onClick={() => setActiveCategory('all')}
            className="text-xs text-[#2874f0] hover:underline flex items-center gap-1"
          >
            ← Back to all
          </button>
        )}
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 h-64 animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <span className="text-5xl">{activeMeta?.icon || '🔍'}</span>
          <p className="text-sm font-medium text-slate-500">No products in this category yet.</p>
          <p className="text-xs text-slate-400">Add products via the Admin panel with this category selected.</p>
          <button
            onClick={() => setActiveCategory('all')}
            className="mt-2 text-xs text-[#2874f0] border border-[#2874f0] px-4 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            ← Browse all products
          </button>
        </div>
      )}

      {/* ── Product grid ── */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
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