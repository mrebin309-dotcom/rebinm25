import { TrendingUp, Package, AlertTriangle, DollarSign, Users, ShoppingCart, RotateCcw, TrendingDown, Download, AlertOctagon } from 'lucide-react';
import { Plus, Zap } from 'lucide-react';
import { Product, Sale, Return, Settings } from '../types';
import { format, subDays, isAfter } from 'date-fns';
import { getProductsNeedingAttention, getStockSummary } from '../utils/stockAlerts';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  returns: Return[];
  settings: Settings;
  onQuickSale?: () => void;
  onAddProduct: () => void;
}

export function Dashboard({ products, sales, returns, settings, onQuickSale, onAddProduct }: DashboardProps) {
  const convertCurrency = (amount: number) => {
    if (settings.currency === 'IQD') {
      return amount * settings.usdToIqdRate;
    }
    return amount;
  };

  const formatCurrency = (amount: number) => {
    const converted = convertCurrency(amount);
    const symbol = settings.currency === 'USD' ? '$' : 'IQD ';
    return settings.currency === 'USD' 
      ? `${symbol}${converted.toFixed(2)}`
      : `${symbol}${converted.toLocaleString()}`;
  };

  // Calculate stats
  const totalProducts = products.length;
  const totalCost = products.reduce((sum, product) => sum + (product.cost * product.stock), 0);

  // Enhanced stock alerts using the new system
  const stockSummary = getStockSummary(products, settings.lowStockThreshold);
  const productsNeedingAttention = getProductsNeedingAttention(products, settings.lowStockThreshold).slice(0, 10);
  
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
  const totalReturns = returns.reduce((sum, ret) => sum + ret.refundAmount, 0);
  
  // Calculate net values (after returns)
  const returnAdjustments = sales.filter(sale => sale.id.startsWith('return-'));
  const netRevenue = totalRevenue; // Already includes return adjustments
  const netProfit = totalProfit; // Already includes return adjustments
  
  // Calculate total cost of goods sold (COGS)
  const totalCOGS = sales.reduce((sum, sale) => {
    const product = products.find(p => p.id === sale.productId);
    return sum + (product ? product.cost * sale.quantity : 0);
  }, 0);

  // Get recent data (last 7 days)
  const recentSales = sales.filter(sale => isAfter(sale.date, subDays(new Date(), 7)));
  const recentRevenue = recentSales.reduce((sum, sale) => sum + sale.total, 0);

  // Last selling products (most recent sales)
  const lastSales = [...sales]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);


  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-white/95 to-slate-50/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8">
        <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent mb-8">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {onQuickSale && (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-300 animate-pulse-slow"></div>
              <button
                onClick={onQuickSale}
                className="relative flex items-center justify-center space-x-4 p-8 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 overflow-hidden w-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <div className="relative p-3 bg-white/20 rounded-xl shadow-lg backdrop-blur-sm">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <span className="relative text-xl font-extrabold text-white">Quick Sale</span>
              </button>
            </div>
          )}

          {onQuickSale && (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-300 animate-pulse-slow"></div>
              <button
                onClick={onAddProduct}
                className="relative flex items-center justify-center space-x-4 p-8 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 overflow-hidden w-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <div className="relative p-3 bg-white/20 rounded-xl shadow-lg backdrop-blur-sm">
                  <Plus className="h-7 w-7 text-white" />
                </div>
                <span className="relative text-xl font-extrabold text-white">Add Product</span>
              </button>
            </div>
          )}
          
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-300 animate-pulse-slow"></div>
            <button
              onClick={() => {
                const data = {
                  products,
                  categories: [],
                  sales,
                  returns,
                  customers,
                  sellers: [],
                  alertRules: [],
                  notifications: [],
                  settings,
                  metadata: {
                    exportDate: new Date().toISOString(),
                    version: '1.0.0',
                    totalProducts: products.length,
                    totalSales: sales.length,
                  }
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `quick-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="relative flex items-center justify-center space-x-4 p-8 bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 overflow-hidden w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <div className="relative p-3 bg-white/20 rounded-xl shadow-lg backdrop-blur-sm">
                <Download className="h-7 w-7 text-white" />
              </div>
              <span className="relative text-xl font-extrabold text-white">Quick Backup</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards - In one line below Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-white/95 to-emerald-50/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-7 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-700/80 mb-2 uppercase tracking-wide">Total Income</p>
                <p className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">{formatCurrency(netRevenue)}</p>
                <p className="text-xs text-slate-600 font-semibold">
                  Net revenue {returnAdjustments.length > 0 ? '(after returns)' : ''}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-white/95 to-blue-50/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-7 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-700/80 mb-2 uppercase tracking-wide">Inventory Cost</p>
                <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">{formatCurrency(totalCost)}</p>
                <p className="text-xs text-slate-600 font-semibold">{totalProducts} products</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Package className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-white/95 to-orange-50/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-7 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-bold text-orange-700/80 mb-2 uppercase tracking-wide">Cost of Goods Sold</p>
                <p className="text-4xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">{formatCurrency(totalCOGS)}</p>
                <p className="text-xs text-slate-600 font-semibold">Returns: {formatCurrency(totalReturns)}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <ShoppingCart className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>


        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-400 to-purple-400 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-white/95 to-violet-50/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-7 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-bold text-violet-700/80 mb-2 uppercase tracking-wide">Total Profit</p>
                <p className="text-4xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">{formatCurrency(netProfit)}</p>
                <p className="text-xs text-slate-600 font-semibold">
                  Margin: {netRevenue > 0 ? ((netProfit / netRevenue) * 100).toFixed(1) : 0}%
                  {returnAdjustments.length > 0 ? ' (net)' : ''}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stock Status Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Status Alert - Enhanced */}
        {productsNeedingAttention.length > 0 && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-lg">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Stock Alerts</h3>
                    <p className="text-sm text-slate-600">{stockSummary.totalNeedingAttention} items need attention</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {stockSummary.outOfStock > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                      {stockSummary.outOfStock} Out
                    </span>
                  )}
                  {stockSummary.low > 0 && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                      {stockSummary.low} Low
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {productsNeedingAttention.map(product => {
                  const status = product.stockStatus;
                  return (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between p-4 ${status.bgColor} border ${status.borderColor} rounded-lg transition-all hover:shadow-md`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {status.level === 'out' && <AlertOctagon className="h-5 w-5 text-red-600 flex-shrink-0" />}
                        {status.level === 'low' && <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />}

                        {product.image && (
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold ${status.textColor} truncate`}>{product.name}</h4>
                          <p className="text-xs text-gray-600 truncate">SKU: {product.sku} • {product.category}</p>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 ${status.bgColor} ${status.textColor} text-xs font-bold rounded-full border ${status.borderColor}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className={`text-lg font-black ${status.textColor} mt-1`}>{product.stock}</p>
                        <p className="text-xs text-gray-500">Min: {product.minStock}</p>
                      </div>
                    </div>
                  );
                })}</div>
            </div>
          </div>
        )}
        
        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Sales</h3>
          <div className="space-y-3">
            {lastSales.length > 0 ? (
              lastSales.map((sale, index) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{sale.productName}</p>
                    <p className="text-xs text-gray-500">
                      {format(sale.date, settings.dateFormat)} • Qty: {sale.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">{formatCurrency(sale.total)}</p>
                    {sale.sellerName && (
                      <p className="text-xs text-gray-500">{sale.sellerName}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No sales yet</p>
            )}
          </div>
        </div>
        
        {/* Enhanced Stock Summary - Always visible when needed */}
        {productsNeedingAttention.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Stock Status Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-green-900">Well Stocked</span>
                </div>
                <span className="text-lg font-bold text-green-700">{stockSummary.good} items</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-semibold text-yellow-900">Low Stock</span>
                </div>
                <span className="text-lg font-bold text-yellow-700">{stockSummary.low} items</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-semibold text-red-900">Out of Stock</span>
                </div>
                <span className="text-lg font-bold text-red-700">{stockSummary.outOfStock} items</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Stock Overview</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-black text-green-600">{stockSummary.good}</div>
                <div className="text-xs font-medium text-green-700 mt-1">Well Stocked</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-black text-yellow-600">{stockSummary.low}</div>
                <div className="text-xs font-medium text-yellow-700 mt-1">Low Stock</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-black text-red-600">{stockSummary.outOfStock}</div>
                <div className="text-xs font-medium text-red-700 mt-1">Out of Stock</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-2xl font-black text-slate-600">{products.length}</div>
                <div className="text-xs font-medium text-slate-700 mt-1">Total Items</div>
              </div>
            </div>
            {stockSummary.outOfStock > 0 && (
              <div className="mt-4 p-4 bg-red-100 rounded-lg border-2 border-red-300">
                <div className="flex items-center justify-center gap-2">
                  <AlertOctagon className="h-5 w-5 text-red-600" />
                  <span className="font-bold text-red-900">{stockSummary.outOfStock} items OUT OF STOCK</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}