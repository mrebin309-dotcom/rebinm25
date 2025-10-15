import { useState } from 'react';
import { BarChart3, Package, Home, ShoppingCart, RotateCcw, Settings as SettingsIcon, Bell, FileText, Users, Smartphone, Receipt, TrendingUp, LogIn, LogOut, User } from 'lucide-react';
import { Award } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { useInventory } from './hooks/useInventory';
import { Dashboard } from './components/Dashboard';
import { ProductList } from './components/ProductList';
import { ProductForm } from './components/ProductForm';
import { SalesForm } from './components/SalesForm';
import { Returns } from './components/Returns';
import { NotificationCenter } from './components/NotificationCenter';
import { Settings } from './components/Settings';
import { Reports } from './components/Reports';
import { UserManagement } from './components/UserManagement';
import { SellerReports } from './components/SellerReports';
import { MobileSync } from './components/MobileSync';
import { InvoiceGenerator } from './components/InvoiceGenerator';
import { AdvancedReports } from './components/AdvancedReports';
import { Product, Sale } from './types';
import { formatDateWithSettings } from './utils/dateFormat';

type View = 'dashboard' | 'products' | 'sales' | 'returns' | 'reports' | 'advanced-reports' | 'sellers' | 'users' | 'mobile' | 'settings';

function App() {
  const { user, signOut } = useAuth();
  const [showAuthForm, setShowAuthForm] = useState(false);

  const {
    products,
    categories,
    sales,
    returns,
    customers,
    sellers,
    alertRules,
    notifications,
    settings,
    addProduct,
    updateProduct,
    deleteProduct,
    addSale,
    addReturn,
    addCustomer,
    addSeller,
    markNotificationRead,
    setSettings,
    updateReturn: updateReturnInHook,
    exportData,
    importData,
    resetSalesHistory,
    resetAllData,
  } = useInventory();

  // Mock data for new features
  const [users, setUsers] = useState([
    {
      id: '1',
      username: 'admin',
      email: 'admin@company.com',
      role: 'admin' as const,
      permissions: [],
      isActive: true,
      createdAt: new Date(),
    }
  ]);
  
  const [activityLogs, setActivityLogs] = useState([]);
  
  const currentUser = users[0];
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<Sale | undefined>();

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleFormSubmit = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setShowProductForm(false);
    setEditingProduct(undefined);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const handleClearNotifications = () => {
    // Mark all notifications as read
    notifications.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  const updateReturn = (id: string, data: any) => {
    updateReturnInHook(id, data);
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'sales', name: 'Sales', icon: ShoppingCart },
    { id: 'returns', name: 'Returns', icon: RotateCcw },
    { id: 'reports', name: 'Reports', icon: FileText },
    { id: 'advanced-reports', name: 'Advanced Analytics', icon: TrendingUp },
    { id: 'sellers', name: 'Seller Reports', icon: Award },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'mobile', name: 'Mobile Sync', icon: Smartphone },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2.5 rounded-xl shadow-lg">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{settings.companyName}</h1>
                <p className="text-xs text-slate-500">Inventory Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                  <span className="text-sm font-semibold text-blue-900">{products.length}</span>
                  <span className="text-xs text-blue-600 ml-1">Products</span>
                </div>
                {products.filter(p => p.stock <= p.minStock).length > 0 && (
                  <div className="px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 animate-pulse">
                    <span className="text-sm font-semibold text-orange-900">{products.filter(p => p.stock <= p.minStock).length}</span>
                    <span className="text-xs text-orange-600 ml-1">Low Stock</span>
                  </div>
                )}
              </div>
              <NotificationCenter
                notifications={notifications}
                settings={settings}
                onMarkRead={markNotificationRead}
                onClearAll={handleClearNotifications}
              />
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 shadow-sm">
                    <div className="p-1.5 bg-blue-600 rounded-lg">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-blue-900">{user.email}</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:shadow-md"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              )}
              {currentView === 'products' && (
                <button
                  onClick={handleAddProduct}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <Package className="w-4 h-4" />
                  Add Product
                </button>
              )}
              {currentView === 'sales' && (
                <button
                  onClick={() => setShowSalesForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <ShoppingCart className="w-4 h-4" />
                  New Sale
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="lg:w-72 space-y-2">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-3">
              {navigation.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as View)}
                    className={`w-full flex items-center space-x-3 px-4 py-3.5 text-left rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                        : 'text-slate-700 hover:bg-slate-100 hover:scale-102'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {currentView === 'dashboard' && (
              <Dashboard 
                products={products} 
                sales={sales} 
                returns={returns} 
                settings={settings}
                onQuickSale={() => setShowSalesForm(true)}
                onAddProduct={handleAddProduct}
              />
            )}
            {currentView === 'products' && (
              <ProductList
                products={products}
                categories={categories}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onAdd={handleAddProduct}
              />
            )}
            {currentView === 'sales' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Sales</h2>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sale ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Profit
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Seller
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sales.map(sale => (
                          <tr key={sale.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{sale.id.slice(-6)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {sale.productName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {sale.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${sale.total.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              ${sale.profit.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {sale.customerName || 'Walk-in'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {sale.sellerName || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDateWithSettings(sale.date, settings.dateFormat)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <button
                                onClick={() => setSelectedSaleForInvoice(sale)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                              >
                                <Receipt className="w-4 h-4" />
                                Invoice
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {sales.length === 0 && (
                    <div className="text-center py-12">
                      <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No sales yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by making your first sale.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {currentView === 'returns' && (
              <Returns
                returns={returns}
                sales={sales}
                products={products}
                settings={settings}
                onAddReturn={addReturn}
                onUpdateReturn={updateReturn}
              />
            )}
            {currentView === 'settings' && (
              <Settings
                settings={settings}
                alertRules={alertRules}
                products={products}
                sales={sales}
                customers={customers}
                sellers={sellers}
                onUpdateSettings={setSettings}
                onUpdateAlertRules={() => {}}
                onExport={exportData}
                onImport={importData}
                onResetSalesHistory={resetSalesHistory}
                onResetAllData={resetAllData}
              />
            )}
            {currentView === 'reports' && (
              <Reports
                products={products}
                sales={sales}
                customers={customers}
                settings={settings}
              />
            )}
            {currentView === 'advanced-reports' && (
              <AdvancedReports
                sales={sales}
                products={products}
                settings={settings}
              />
            )}
            {currentView === 'sellers' && (
              <SellerReports
                sellers={sellers}
                sales={sales}
                products={products}
                settings={settings}
              />
            )}
            {currentView === 'users' && (
              <UserManagement
                users={users}
                activityLogs={activityLogs}
                currentUser={currentUser}
                onAddUser={(user) => setUsers(prev => [...prev, { ...user, id: Date.now().toString(), createdAt: new Date() }])}
                onUpdateUser={(id, userData) => setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u))}
                onDeleteUser={(id) => setUsers(prev => prev.filter(u => u.id !== id))}
              />
            )}
            {currentView === 'mobile' && (
              <MobileSync
                onSync={async () => {
                  // Mock sync implementation
                  await new Promise(resolve => setTimeout(resolve, 2000));
                }}
                onExportMobile={() => {
                  const mobileData = { products, sales, customers, settings };
                  const blob = new Blob([JSON.stringify(mobileData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `mobile-data-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                onImportMobile={(data) => {
                  // Handle mobile data import
                  console.log('Importing mobile data:', data);
                }}
              />
            )}
          </main>
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(undefined);
          }}
        />
      )}

      {/* Sales Form Modal */}
      {showSalesForm && (
        <SalesForm
          products={products}
          categories={categories}
          customers={customers}
          sellers={sellers}
          settings={settings}
          lastSeller={settings.lastSeller}
          onSubmit={addSale}
          onAddSeller={addSeller}
          onClose={() => setShowSalesForm(false)}
        />
      )}

      {/* Invoice Generator Modal */}
      {selectedSaleForInvoice && (
        <InvoiceGenerator
          sale={selectedSaleForInvoice}
          settings={settings}
          onClose={() => setSelectedSaleForInvoice(undefined)}
        />
      )}

      {/* Auth Form Modal */}
      {showAuthForm && (
        <AuthForm onAuthSuccess={() => setShowAuthForm(false)} />
      )}
    </div>
  );
}

export default App;