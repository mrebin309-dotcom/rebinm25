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

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: 'name' | 'stock' | 'price') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Products</h2>
          <p className="text-slate-600 mt-1">{products.length} total products</p>
        </div>
        {isAuthenticated && (
          <button
            onClick={onAdd}
            className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or SKU..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all appearance-none bg-white"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => toggleSort('name')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              sortBy === 'name'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => toggleSort('stock')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              sortBy === 'stock'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Stock {sortBy === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => toggleSort('price')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              sortBy === 'price'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {isMobile ? (
        <div className="space-y-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {sortedProducts.map(product => {
          const stockStatus = getEnhancedStockStatus(product);
          const profitMargin = product.price > 0 ? ((product.price - product.cost) / product.price) * 100 : 0;

          return (
            <div key={product.id} className="group relative bg-white rounded-xl border border-slate-200 hover:border-slate-300 overflow-hidden transition-all duration-300 hover:shadow-xl">
              {/* Product Image */}
              <div className="h-48 bg-slate-50 relative overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-slate-300" />
                  </div>
                )}

                {/* Stock Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${stockStatus.level === 'out' ? 'bg-red-100 text-red-700' : stockStatus.level === 'low' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {product.stock} in stock
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-slate-500">SKU: {product.sku}</p>
                </div>

                <div className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md mb-4">{product.category}</div>

                {/* Price and Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-slate-900">${product.price.toFixed(2)}</span>
                    <span className={`text-sm font-medium ${profitMargin >= 20 ? 'text-green-600' : profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {profitMargin.toFixed(0)}% margin
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Cost</p>
                      <p className="text-sm font-semibold text-slate-700">${product.cost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Stock</p>
                      <p className="text-sm font-semibold text-slate-700">{product.stock} units</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isAuthenticated ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 text-slate-500 px-4 py-2.5 rounded-lg text-sm text-center font-medium">
                    Sign in to edit or delete
                  </div>
                )}
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
          {!searchTerm && !selectedCategory && isAuthenticated && (
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new product.</p>
          )}
        </div>
      )}
    </div>
  );
}
