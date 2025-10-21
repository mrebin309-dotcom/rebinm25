import { useState, useEffect } from 'react';
import { BarChart3, Package, Home, ShoppingCart, RotateCcw, Settings as SettingsIcon, Bell, FileText, Users, Smartphone, Receipt, TrendingUp, RefreshCw, AlertTriangle, Upload, LogOut } from 'lucide-react';
import { Award } from 'lucide-react';
import { PinAccess } from './components/PinAccess';
import { useInventorySupabase } from './hooks/useInventorySupabase';
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
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileQuickActions } from './components/MobileQuickActions';
import { Product, Sale } from './types';
import { formatDateWithSettings } from './utils/dateFormat';

type View = 'dashboard' | 'products' | 'sales' | 'returns' | 'reports' | 'advanced-reports' | 'sellers' | 'users' | 'mobile' | 'settings';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showEnvError, setShowEnvError] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING',
      keyValue: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING'
    });
    if (!supabaseUrl || !supabaseKey) {
      setShowEnvError(true);
    }
  }, []);

  useEffect(() => {
    const verified = sessionStorage.getItem('pin-verified');
    if (verified === 'true') {
      setShowLoadingScreen(true);
      setTimeout(() => {
        setIsAuthenticated(true);
        setShowLoadingScreen(false);
      }, 2000);
    }
  }, []);

  const handlePinSuccess = () => {
    setShowLoadingScreen(true);
    setTimeout(() => {
      setIsAuthenticated(true);
      setShowLoadingScreen(false);
    }, 2000);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('pin-verified');
    setIsAuthenticated(false);
  };

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
    loading,
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
    refreshData,
  } = useInventorySupabase();

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
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');

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

  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      setIsImporting(true);
      setImportProgress(0);
      setImportStatus('Reading file...');

      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        console.log('Importing data:', data);

        setImportProgress(20);
        setImportStatus('Preparing data...');
        await new Promise(resolve => setTimeout(resolve, 300));

        setImportProgress(40);
        setImportStatus('Importing to database...');
        await importData(data);

        setImportProgress(70);
        setImportStatus('Processing...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        setImportProgress(85);
        setImportStatus('Refreshing data...');
        await refreshData();

        setImportProgress(100);
        setImportStatus('Complete!');
        await new Promise(resolve => setTimeout(resolve, 500));

        setIsImporting(false);
        setImportProgress(0);
        setImportStatus('');

        alert('Data imported successfully! All data has been restored.');
      } catch (error) {
        console.error('Error importing data:', error);
        alert(`Error importing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsImporting(false);
        setImportProgress(0);
        setImportStatus('');
      }
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
      setIsImporting(false);
      setImportProgress(0);
      setImportStatus('');
    };
    reader.readAsText(file);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex p-4 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl shadow-lg mb-4 animate-pulse">
            <BarChart3 className="w-12 h-12 text-white" />
          </div>
          <p className="text-slate-600 font-medium">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 overflow-x-hidden">
      {/* Import Loading Overlay */}
      {isImporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-2xl text-center max-w-md w-full mx-4">
            <div className="inline-flex p-4 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl shadow-lg mb-4 animate-pulse">
              <Upload className="w-12 h-12 text-white" />
            </div>
            <p className="text-slate-900 font-bold text-xl mb-2">Restoring Backup</p>
            <p className="text-slate-600 mb-6">{importStatus}</p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${importProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-500 font-medium">{importProgress}%</p>
          </div>
        </div>
      )}

      {/* Environment Variable Error Banner */}
      {showEnvError && (
        <div className="bg-red-600 text-white px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Configuration Error: Missing Supabase Environment Variables</p>
              <p className="text-sm text-red-100 mt-1">
                Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Cloudflare Pages environment variables, then redeploy.
              </p>
            </div>
            <button
              onClick={() => setShowEnvError(false)}
              className="text-white hover:bg-red-700 px-3 py-1 rounded"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl shadow-2xl border-b border-slate-200/60 md:sticky md:top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-5">
            {/* Mobile Layout */}
            <div className="flex items-center space-x-3 md:hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl blur opacity-60 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-cyan-500 p-2.5 rounded-2xl shadow-xl">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent">{settings.companyName}</h1>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center space-x-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl blur-md opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-cyan-500 p-3 rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent">{settings.companyName}</h1>
                <p className="text-sm text-slate-600 font-medium">Inventory Management System</p>
              </div>
            </div>

            {/* Right side - Mobile */}
            <div className="flex items-center space-x-2 md:hidden">
              <button
                onClick={refreshData}
                className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
                title="Sync"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <NotificationCenter
                notifications={notifications}
                settings={settings}
                onMarkRead={markNotificationRead}
                onClearAll={handleClearNotifications}
              />
            </div>

            {/* Right side - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all transform group-hover:-translate-y-0.5">
                    <span className="text-lg font-bold text-white">{products.length}</span>
                    <span className="text-xs text-blue-100 ml-1.5 font-medium">Products</span>
                  </div>
                </div>
                {products.filter(p => p.stock <= p.minStock).length > 0 && (
                  <div className="relative group animate-pulse-slow">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl blur opacity-40"></div>
                    <div className="relative px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg">
                      <span className="text-lg font-bold text-white">{products.filter(p => p.stock <= p.minStock).length}</span>
                      <span className="text-xs text-orange-100 ml-1.5 font-medium">Low Stock</span>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={refreshData}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 hover:text-blue-600 bg-slate-100/80 hover:bg-blue-50 rounded-2xl transition-all duration-300 hover:shadow-lg group backdrop-blur-sm"
                title="Sync data from cloud"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Sync
              </button>
              <NotificationCenter
                notifications={notifications}
                settings={settings}
                onMarkRead={markNotificationRead}
                onClearAll={handleClearNotifications}
              />
              {isAuthenticated && (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50/80 hover:bg-red-100 rounded-2xl transition-all duration-300 hover:shadow-lg backdrop-blur-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Lock
                </button>
              )}
              {currentView === 'products' && isAuthenticated && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <button
                    onClick={handleAddProduct}
                    className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-semibold"
                  >
                    <Package className="w-5 h-5" />
                    Add Product
                  </button>
                </div>
              )}
              {currentView === 'sales' && isAuthenticated && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <button
                    onClick={() => setShowSalesForm(true)}
                    className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-semibold"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    New Sale
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 pb-24 md:pb-10">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
          {/* Sidebar Navigation - Hidden on Mobile */}
          <nav className="hidden md:block lg:w-80 space-y-3">
            <div className="bg-gradient-to-br from-white/90 to-slate-50/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-4">
              {navigation.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as View)}
                    className={`w-full flex items-center space-x-4 px-5 py-4 text-left rounded-2xl transition-all duration-300 group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl shadow-blue-500/40 scale-105 transform'
                        : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 hover:shadow-lg hover:scale-102'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                      isActive ? 'bg-white/25 shadow-lg' : 'bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-blue-50 group-hover:to-cyan-50'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-base">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-white/70 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      </div>
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
                onQuickSale={isAuthenticated ? () => setShowSalesForm(true) : undefined}
                onAddProduct={isAuthenticated ? handleAddProduct : () => {}}
              />
            )}
            {currentView === 'products' && (
              <ProductList
                products={products}
                categories={categories}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onAdd={handleAddProduct}
                isAuthenticated={isAuthenticated}
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
                isAuthenticated={isAuthenticated}
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
                onExport={handleExportData}
                onImport={handleImportData}
                onResetSalesHistory={resetSalesHistory}
                onResetAllData={resetAllData}
                isAuthenticated={isAuthenticated}
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
                onImportMobile={async (data) => {
                  await importData(data);
                  alert('Mobile data imported successfully!');
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

      {/* PIN Access Screen */}
      {!isAuthenticated && !showLoadingScreen && (
        <PinAccess onSuccess={handlePinSuccess} />
      )}

      {/* Loading Screen After PIN */}
      {showLoadingScreen && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center z-50">
          <div className="text-center animate-fade-in">
            <div className="inline-flex p-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl shadow-2xl mb-6 animate-pulse">
              <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-white mb-3 animate-slide-up">
              Access Granted
            </h2>
            <p className="text-lg text-blue-200 animate-slide-up-delay">
              Loading your dashboard...
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={setCurrentView}
        productCount={products.length}
        lowStockCount={products.filter(p => p.stock <= p.minStock).length}
      />

      {/* Mobile Quick Actions */}
      <MobileQuickActions
        onAddProduct={handleAddProduct}
        onNewSale={() => setShowSalesForm(true)}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}

export default App;