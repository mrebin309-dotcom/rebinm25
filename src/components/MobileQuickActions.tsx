import { useState } from 'react';
import { Plus, Package, ShoppingCart, X, Zap } from 'lucide-react';

interface MobileQuickActionsProps {
  onAddProduct: () => void;
  onNewSale: () => void;
  isAuthenticated: boolean;
}

export function MobileQuickActions({ onAddProduct, onNewSale, isAuthenticated }: MobileQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <>
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        {isOpen && (
          <div className="absolute bottom-16 right-0 space-y-3 mb-4">
            <button
              onClick={() => {
                onAddProduct();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 bg-blue-500 text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-all transform hover:scale-105 whitespace-nowrap"
            >
              <Package className="h-5 w-5" />
              <span className="font-medium">Add Product</span>
            </button>

            <button
              onClick={() => {
                onNewSale();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 bg-green-500 text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-green-600 transition-all transform hover:scale-105 whitespace-nowrap"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium">New Sale</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all transform ${
            isOpen
              ? 'bg-gray-600 hover:bg-gray-700 rotate-45'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
          } hover:scale-110`}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Zap className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
