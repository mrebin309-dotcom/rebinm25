import { Home, Package, ShoppingCart, FileText, Settings } from 'lucide-react';

type View = 'dashboard' | 'products' | 'sales' | 'returns' | 'reports' | 'advanced-reports' | 'sellers' | 'users' | 'mobile' | 'settings';

interface MobileBottomNavProps {
  currentView: View;
  onNavigate: (view: View) => void;
  productCount?: number;
  lowStockCount?: number;
}

export function MobileBottomNav({ currentView, onNavigate, productCount = 0, lowStockCount = 0 }: MobileBottomNavProps) {
  const navItems = [
    { id: 'dashboard' as View, name: 'Home', icon: Home },
    { id: 'products' as View, name: 'Products', icon: Package, badge: lowStockCount },
    { id: 'sales' as View, name: 'Sales', icon: ShoppingCart },
    { id: 'reports' as View, name: 'Reports', icon: FileText },
    { id: 'settings' as View, name: 'Settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center space-y-1 relative ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {item.badge && item.badge > 0 && (
                <span className="absolute top-1 right-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}

              <Icon className={`h-6 w-6 ${isActive ? 'scale-110' : ''} transition-transform`} />

              <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.name}
              </span>

              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
