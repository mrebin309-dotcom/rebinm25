import { TrendingUp, Package, AlertTriangle, DollarSign, Users, ShoppingCart, RotateCcw, TrendingDown, Download, AlertCircle, AlertOctagon } from 'lucide-react';
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

  // Top selling products
  const productSales = sales.reduce((acc, sale) => {
    acc[sale.productId] = (acc[sale.productId] || 0) + sale.quantity;
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(productSales)
    .map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return {
        name: product?.name || 'Unknown',
        value: quantity,
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Group products by urgency level
  const criticalProducts = productsNeedingAttention.filter(p => p.stockStatus.level === 'critical' || p.stockStatus.level === 'out');
  const warningProducts = productsNeedingAttention.filter(p => p.stockStatus.level === 'warning');
  const lowProducts = productsNeedingAttention.filter(p => p.stockStatus.level === 'low');

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {onQuickSale && (
            <button
              onClick={onQuickSale}
              className="group relative flex items-center justify-center space-x-3 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-xl border-2 border-emerald-200 hover:border-emerald-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/30 to-emerald-400/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-emerald-700">Quick Sale</span>
            </button>
          )}

          {onQuickSale && (
            <button
              onClick={onAddProduct}
              className="group relative flex items-center justify-center space-x-3 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/30 to-blue-400/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-blue-700">Add Product</span>
            </button>
          )}
          
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
            className="group relative flex items-center justify-center space-x-3 p-6 bg-gradient-to-br from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 rounded-xl border-2 border-violet-200 hover:border-violet-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400/0 via-violet-400/30 to-violet-400/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg shadow-lg">
              <Download className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-violet-700">Quick Backup</span>
          </button>
        </div>
      </div>

      {/* KPI Cards - In one line below Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-600 mb-2">Total Income</p>
              <p className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">{formatCurrency(netRevenue)}</p>
              <p className="text-xs text-slate-500 font-medium">
                Net revenue {returnAdjustments.length > 0 ? '(after returns)' : ''}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="group bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-600 mb-2">Inventory Cost</p>
              <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">{formatCurrency(totalCost)}</p>
              <p className="text-xs text-slate-500 font-medium">{totalProducts} products</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Package className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="group bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-600 mb-2">Cost of Goods Sold</p>
              <p className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-1">{formatCurrency(totalCOGS)}</p>
              <p className="text-xs text-slate-500 font-medium">Returns: {formatCurrency(totalReturns)}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>


        <div className="group bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-600 mb-2">Total Profit</p>
              <p className="text-3xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-1">{formatCurrency(netProfit)}</p>
              <p className="text-xs text-slate-500 font-medium">
                Margin: {netRevenue > 0 ? ((netProfit / netRevenue) * 100).toFixed(1) : 0}%
                {returnAdjustments.length > 0 ? ' (net)' : ''}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6 text-white" />
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
                  {stockSummary.critical > 0 && (
                    <span className="px-2 py-1 bg-red-200 text-red-800 text-xs font-bold rounded-full">
                      {stockSummary.critical} Critical
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
                        {status.level === 'critical' && <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                        {status.level === 'warning' && <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />}
                        {status.level === 'low' && <Package className="h-5 w-5 text-yellow-500 flex-shrink-0" />}

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
        
        {/* Top Selling Products - Simplified */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{product.name}</span>
                </div>
                <span className="text-sm font-medium text-green-600">{product.value} sold</span>
              </div>
            ))}
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
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="font-semibold text-orange-900">Warning</span>
                </div>
                <span className="text-lg font-bold text-orange-700">{stockSummary.warning} items</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-semibold text-red-900">Critical/Out</span>
                </div>
                <span className="text-lg font-bold text-red-700">{stockSummary.critical + stockSummary.outOfStock} items</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Stock Overview</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-black text-green-600">{stockSummary.good}</div>
                <div className="text-xs font-medium text-green-700 mt-1">Well Stocked</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-black text-yellow-600">{stockSummary.low}</div>
                <div className="text-xs font-medium text-yellow-700 mt-1">Low Stock</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-black text-orange-600">{stockSummary.warning}</div>
                <div className="text-xs font-medium text-orange-700 mt-1">Warning</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-black text-red-600">{stockSummary.critical}</div>
                <div className="text-xs font-medium text-red-700 mt-1">Critical</div>
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