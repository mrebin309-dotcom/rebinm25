import { DollarSign, Package, ShoppingCart, TrendingUp, Zap, Plus, Download, AlertTriangle } from 'lucide-react';
import { Product, Sale, Return, Settings } from '../types';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  returns: Return[];
  customers: any[];
  onQuickSale?: () => void;
  onAddProduct: () => void;
  settings: Settings;
}

export function Dashboard({ products, sales, returns, customers, onQuickSale, onAddProduct, settings }: DashboardProps) {
  const totalCost = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalCOGS = sales.reduce((sum, sale) => sum + (sale.items.reduce((s, item) => s + (item.cost * item.quantity), 0)), 0);
  const totalReturns = returns.reduce((sum, ret) => sum + ret.totalAmount, 0);
  const totalProducts = products.length;

  // Calculate return adjustments
  const returnAdjustments = returns.map(ret => {
    const sale = sales.find(s => s.id === ret.saleId);
    if (!sale) return { revenue: 0, cogs: 0 };

    return {
      revenue: ret.totalAmount,
      cogs: ret.items.reduce((sum, item) => {
        const saleItem = sale.items.find(si => si.productId === item.productId);
        return sum + ((saleItem?.cost || 0) * item.quantity);
      }, 0)
    };
  });

  const returnRevenueAdjustment = returnAdjustments.reduce((sum, adj) => sum + adj.revenue, 0);
  const returnCOGSAdjustment = returnAdjustments.reduce((sum, adj) => sum + adj.cogs, 0);

  // Net values after returns
  const netRevenue = totalRevenue - returnRevenueAdjustment;
  const netCOGS = totalCOGS - returnCOGSAdjustment;
  const netProfit = netRevenue - netCOGS;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD'
    }).format(amount);
  };

  // Get low stock products
  const lowStockProducts = products.filter(p => p.stock <= (p.lowStockThreshold || 10) && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {onQuickSale && (
            <button
              onClick={onQuickSale}
              className="flex items-center gap-3 p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white"
            >
              <div className="p-2 bg-white/20 rounded-lg">
                <Zap className="h-5 w-5" />
              </div>
              <span className="font-semibold">Quick Sale</span>
            </button>
          )}

          {onQuickSale && (
            <button
              onClick={onAddProduct}
              className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
            >
              <div className="p-2 bg-white/20 rounded-lg">
                <Plus className="h-5 w-5" />
              </div>
              <span className="font-semibold">Add Product</span>
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
            className="flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors text-white"
          >
            <div className="p-2 bg-white/20 rounded-lg">
              <Download className="h-5 w-5" />
            </div>
            <span className="font-semibold">Quick Backup</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Total Income</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(netRevenue)}</p>
          <p className="text-xs text-slate-500 mt-2">
            Net revenue {returnAdjustments.length > 0 ? '(after returns)' : ''}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Inventory Cost</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalCost)}</p>
          <p className="text-xs text-slate-500 mt-2">{totalProducts} products</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Cost of Goods Sold</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalCOGS)}</p>
          <p className="text-xs text-slate-500 mt-2">Returns: {formatCurrency(totalReturns)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Total Profit</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(netProfit)}</p>
          <p className="text-xs text-slate-500 mt-2">
            Margin: {netRevenue > 0 ? ((netProfit / netRevenue) * 100).toFixed(1) : 0}%
            {returnAdjustments.length > 0 ? ' (net)' : ''}
          </p>
        </div>
      </div>

      {/* Stock Alerts and Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Stock Alerts</h3>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-semibold">
                {outOfStockProducts.length} Out
              </span>
              <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-semibold">
                {lowStockProducts.length} Low
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {outOfStockProducts.length === 0 && lowStockProducts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No stock alerts</p>
            ) : (
              <>
                {outOfStockProducts.slice(0, 5).map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                      Out of Stock
                    </span>
                  </div>
                ))}

                {lowStockProducts.slice(0, 5).map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                      {product.stock} left
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Sales</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sales.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No sales yet</p>
            ) : (
              sales.slice(-10).reverse().map(sale => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {sale.customerName || 'Walk-in Customer'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(sale.date).toLocaleDateString()} • Qty: {sale.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(sale.total)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
