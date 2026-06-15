import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

function CartIcon() {
  const { cartCount } = useCart();
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/cart')}
      className="relative rounded-full p-2 text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
      aria-label="Open cart"
    >
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M6 21h.01M18 21h.01" />
      </svg>
      
      {cartCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-slate-950 ring-2 ring-blue-600">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </button>
  );
}

export default CartIcon;
