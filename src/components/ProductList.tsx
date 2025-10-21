import { useState, useEffect } from 'react';
import { CreditCard as Edit2, Trash2, Plus, Search, Filter, Package, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Product, Category } from '../types';
import { SearchWithSuggestions } from './SearchWithSuggestions';
import { getStockStatus as getEnhancedStockStatus } from '../utils/stockAlerts';
import { MobileProductCard } from './MobileProductCard';

interface ProductListProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  isAuthenticated?: boolean;
}

export function ProductList({ products, categories, onEdit, onDelete, onAdd, isAuthenticated = false }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debug: Log categories when component renders
  console.log('ProductList - Categories received:', categories.length, categories);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());

    // Match by category name
    const matchesCategory = selectedCategory === '' ||
                           product.category?.trim() === selectedCategory.trim();

    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'stock':
        aValue = a.stock;
        bValue = b.stock;
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Calculate category statistics
  const categoryStats = {
    totalProducts: filteredProducts.length,
    totalValue: filteredProducts.reduce((sum, p) => sum + (p.price * p.stock), 0),
    totalCost: filteredProducts.reduce((sum, p) => sum + (p.cost * p.stock), 0),
    lowStock: filteredProducts.filter(p => p.stock <= p.minStock && p.stock > 0).length,
    outOfStock: filteredProducts.filter(p => p.stock === 0).length,
  };
  // This is replaced by the enhanced stock status utility

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        <button
          onClick={onAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Category Summary */}
      {selectedCategory && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            📂 {categories.find(c => c.id === selectedCategory)?.name || selectedCategory} Category Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{categoryStats.totalProducts}</div>
              <div className="text-sm text-blue-700">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${categoryStats.totalValue.toFixed(2)}</div>
              <div className="text-sm text-green-700">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">${categoryStats.totalCost.toFixed(2)}</div>
              <div className="text-sm text-orange-700">Total Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{categoryStats.lowStock}</div>
              <div className="text-sm text-yellow-700">Low Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{categoryStats.outOfStock}</div>
              <div className="text-sm text-red-700">Out of Stock</div>
            </div>
          </div>
        </div>
      )}
      {/* Filters */}
      <div className="bg-gradient-to-br from-white/95 to-slate-50/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-5">
          <SearchWithSuggestions
            products={products}
            value={searchTerm}
            onChange={setSearchTerm}
            onSelectProduct={(product) => {
              setSearchTerm('');
              onEdit(product);
            }}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white hover:border-slate-300 transition-all duration-200 font-medium cursor-pointer ${
              selectedCategory ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700' : 'border-slate-200 text-slate-700'
            }`}
            style={{ direction: 'ltr' }}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'stock' | 'price')}
            className="border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white hover:border-slate-300 transition-all duration-200 font-medium text-slate-700 cursor-pointer"
            style={{ direction: 'ltr' }}
          >
            <option value="name">Sort by Name</option>
            <option value="stock">Sort by Stock</option>
            <option value="price">Sort by Price</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white hover:border-slate-300 transition-all duration-200 font-medium text-slate-700 cursor-pointer"
            style={{ direction: 'ltr' }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-400 to-slate-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSortBy('name');
                setSortOrder('asc');
              }}
              className="relative flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 w-full"
            >
              <Filter className="h-5 w-5" />
              Clear
            </button>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {(searchTerm || selectedCategory) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="text-sm font-medium text-gray-700 mr-2">Active Filters:</div>
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                📂 Category: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            <span className="text-sm text-gray-600">
              📊 Showing {filteredProducts.length} of {products.length} products
              {selectedCategory && (
                <span className="ml-2 text-green-600 font-medium">
                  (filtered by {selectedCategory})
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {isMobile ? (
        <div className="space-y-3">
          {sortedProducts.map(product => (
            <MobileProductCard
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sortedProducts.map(product => {
          const stockStatus = getEnhancedStockStatus(product);
          const profitMargin = product.price > 0 ? ((product.price - product.cost) / product.price) * 100 : 0;

          return (
            <div key={product.id} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-white via-white to-slate-50/50 rounded-3xl shadow-xl overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 border border-white/60">
              {/* Product Image */}
              <div className="h-56 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
                    <div className="p-4 bg-white/40 backdrop-blur-sm rounded-2xl">
                      <Package className="h-20 w-20 text-blue-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                )}

                {/* Enhanced Stock Status Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {stockStatus.level === 'out' && <AlertOctagon className="h-5 w-5 text-red-600" />}
                  {stockStatus.level === 'low' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-extrabold ${stockStatus.bgColor} ${stockStatus.textColor} border-2 ${stockStatus.borderColor} shadow-lg backdrop-blur-sm`}>
                    {stockStatus.label}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-extrabold text-slate-900 truncate">{product.name}</h3>
                  {stockStatus.needsAttention && (
                    <div className="flex-shrink-0 ml-2">
                      {stockStatus.level === 'out' && <AlertOctagon className="h-5 w-5 text-red-600" />}
                      {stockStatus.level === 'low' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SKU:</span>
                  <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{product.sku}</span>
                </div>
                <div className="inline-block px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full mb-4 shadow-md">{product.category}</div>

                {/* Price and Stock Info */}
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-700 uppercase">Price:</span>
                    <span className="text-lg font-extrabold text-emerald-600">${product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                    <span className="text-xs font-bold text-orange-700 uppercase">Cost:</span>
                    <span className="text-lg font-extrabold text-orange-600">${product.cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <span className="text-xs font-bold text-blue-700 uppercase">Stock:</span>
                    <span className={`text-lg font-extrabold ${stockStatus.color}`}>
                      {product.stock} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                    <span className="text-xs font-bold text-violet-700 uppercase">Margin:</span>
                    <span className={`text-lg font-extrabold ${profitMargin >= 20 ? 'text-green-600' : profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {profitMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {isAuthenticated ? (
                  <div className="flex gap-3">
                    <div className="flex-1 relative group/edit">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-40 group-hover/edit:opacity-70 transition-opacity"></div>
                      <button
                        onClick={() => onEdit(product)}
                        className="relative w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                    </div>
                    <div className="relative group/delete">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl blur opacity-40 group-hover/delete:opacity-70 transition-opacity"></div>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="relative bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-3 rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 px-4 py-3 rounded-xl text-sm text-center font-bold border border-slate-300">
                    Sign in to edit or delete
                  </div>
                )}
              </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Empty State */}
      {sortedProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm || selectedCategory ? 'No products found' : 'No products yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first product.'
            }
          </p>
          {!searchTerm && !selectedCategory && (
            <div className="mt-6">
              <button
                onClick={onAdd}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Add Your First Product
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {products.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {selectedCategory ? `${selectedCategory} Category` : 'Total Inventory'} Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{categoryStats.totalProducts}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${categoryStats.totalValue.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {categoryStats.lowStock}
              </div>
              <div className="text-sm text-gray-600">Low Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {categoryStats.outOfStock}
              </div>
              <div className="text-sm text-gray-600">Out of Stock</div>
            </div>
          </div>
          {selectedCategory && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ${categoryStats.totalCost.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">Total Cost Investment</div>
                <div className="text-xs text-gray-500 mt-1">
                  Profit Potential: ${(categoryStats.totalValue - categoryStats.totalCost).toFixed(0)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}