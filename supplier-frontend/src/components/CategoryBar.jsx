// src/components/CategoryBar.jsx

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

export default function CategoryBar({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {CATEGORIES.map(cat => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs whitespace-nowrap transition-all
            ${active === cat.key
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
        >
          <span className="text-xl">{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}