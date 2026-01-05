import { useState } from 'react';
import { Edit2, Trash2, Package, AlertTriangle, AlertOctagon, Bell, BellOff } from 'lucide-react';
import { Product } from '../types';
import { useSwipe } from '../hooks/useSwipe';
import { getStockStatus } from '../utils/stockAlerts';

interface MobileProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleWarnings?: (productId: string, enabled: boolean) => void;
  isAuthenticated: boolean;
}

export function MobileProductCard({ product, onEdit, onDelete, onToggleWarnings, isAuthenticated }: MobileProductCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);

  const stockStatus = getStockStatus(product);
  const profitMargin = product.price > 0 ? ((product.price - product.cost) / product.price) * 100 : 0;

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (isAuthenticated) {
        setSwipeOffset(-150);
        setIsSwipeActive(true);
      }
    },
    onSwipeRight: () => {
      setSwipeOffset(0);
      setIsSwipeActive(false);
    },
    minSwipeDistance: 30,
  });

  const handleEdit = () => {
    setSwipeOffset(0);
    setIsSwipeActive(false);
    onEdit(product);
  };

  const handleDelete = () => {
    setSwipeOffset(0);
    setIsSwipeActive(false);
    onDelete(product.id);
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-lg shadow-md">
      {isAuthenticated && (
        <div className="absolute right-0 top-0 bottom-0 w-[150px] flex">
          <button
            onClick={handleEdit}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
          >
            <Edit2 className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}

      <div
        {...swipeHandlers}
        className="relative bg-white transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onClick={() => {
          if (isSwipeActive) {
            setSwipeOffset(0);
            setIsSwipeActive(false);
          }
        }}
      >
        <div className="flex gap-4 p-4">
          <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded-lg relative overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                {onToggleWarnings && isAuthenticated && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWarnings(product.id, !product.stockWarningsEnabled);
                    }}
                    className={`p-1.5 rounded-full transition-all duration-200 ${
                      product.stockWarningsEnabled
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                    title={product.stockWarningsEnabled ? 'Warnings enabled' : 'Warnings disabled'}
                  >
                    {product.stockWarningsEnabled ? (
                      <Bell className="h-3 w-3" />
                    ) : (
                      <BellOff className="h-3 w-3" />
                    )}
                  </button>
                )}
                {stockStatus.needsAttention && (
                  <div className="flex-shrink-0">
                    {stockStatus.level === 'out' && <AlertOctagon className="h-4 w-4 text-red-600" />}
                    {stockStatus.level === 'low' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div>
                <span className="text-gray-600">Price:</span>
                <span className="ml-1 font-medium text-green-600">${product.price.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Stock:</span>
                <span className={`ml-1 font-medium ${stockStatus.color}`}>
                  {product.stock}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Cost:</span>
                <span className="ml-1 font-medium">${product.cost.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Margin:</span>
                <span className={`ml-1 font-medium ${profitMargin >= 20 ? 'text-green-600' : profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {profitMargin.toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="mt-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.textColor} border ${stockStatus.borderColor}`}>
                {stockStatus.label}
              </span>
            </div>
          </div>
        </div>

        {isAuthenticated && (
          <div className="px-4 pb-3 text-xs text-gray-400 text-center">
            Swipe left to edit or delete
          </div>
        )}
      </div>
    </div>
  );
}
