import { Link, useLocation } from 'react-router-dom';

function Breadcrumb() {
  const location = useLocation();
  const pathname = location.pathname;
  
  console.log('Current pathname:', pathname); // Debug log
  
  // Define breadcrumb items based on current path
 // Update the getBreadcrumbItems function
const getBreadcrumbItems = () => {
  // Dashboard main page - no breadcrumb
  if (pathname === '/dashboard' || pathname === '/') {
    return [];
  }
  
  // Cart page
  if (pathname === '/cart') {
    return [{ name: 'Shopping Cart', path: '/cart' }];
  }
  
  // Checkout page - show Cart as parent
  if (pathname === '/checkout') {
    return [
      { name: 'Shopping Cart', path: '/cart' },
      { name: 'Checkout', path: '/checkout' }
    ];
  }
  
  // Order Confirmation page - show full trail
  if (pathname.startsWith('/order-confirmation/')) {
    return [
      { name: 'Shopping Cart', path: '/cart' },
      { name: 'Checkout', path: '/checkout' },
      { name: 'Order Confirmation', path: pathname }
    ];
  }
  
  // My Orders page
  if (pathname === '/orders') {
    return [{ name: 'My Orders', path: '/orders' }];
  }
  
  // Track Order page
  if (pathname.startsWith('/track-order/')) {
    const orderId = pathname.split('/')[2];
    return [
      { name: 'My Orders', path: '/orders' },
      { name: `Track Order #${orderId}`, path: pathname }
    ];
  }
  
  return [];
};

  const items = getBreadcrumbItems();
  
  console.log('Breadcrumb items:', items); // Debug log
  
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm py-3 px-4 bg-gray-50 rounded-lg mb-4 overflow-x-auto">
      <Link 
        to="/dashboard" 
        className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <span>🏠</span>
        <span className="hidden sm:inline">Home</span>
      </Link>

      {items.map((item, index) => (
        <div key={item.path} className="flex items-center gap-2">
          <span className="text-gray-400">›</span>
          {index === items.length - 1 ? (
            <span className="text-indigo-600 font-medium truncate max-w-[200px]">
              {item.name}
            </span>
          ) : (
            <Link 
              to={item.path} 
              className="text-gray-500 hover:text-indigo-600 transition-colors truncate max-w-[150px]"
            >
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

export default Breadcrumb;