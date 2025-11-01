import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Download, Upload, Save, Lock, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Settings as SettingsType, AlertRule, Product, Sale, Customer, Seller } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsProps {
  settings: SettingsType;
  alertRules: AlertRule[];
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  sellers: Seller[];
  onUpdateSettings: (settings: SettingsType) => void;
  onUpdateAlertRules: (rules: AlertRule[]) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onResetSalesHistory: (restoreInventory?: boolean) => void;
  onResetAllData: () => void;
  isAuthenticated?: boolean;
}

export function Settings({ settings, alertRules, products, sales, customers, sellers, onUpdateSettings, onUpdateAlertRules, onExport, onImport, onResetSalesHistory, onResetAllData, isAuthenticated = false }: SettingsProps) {
  const [formData, setFormData] = useState(settings);
  const [rules, setRules] = useState(alertRules);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);

  useEffect(() => {
    const loadCurrentPin = async () => {
      try {
        const { data } = await supabase
          .from('pin_settings')
          .select('pin')
          .maybeSingle();
        if (data) {
          setCurrentPin(data.pin);
        }
      } catch (err) {
        console.error('Error loading PIN:', err);
      }
    };
    loadCurrentPin();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    onUpdateAlertRules(rules);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleRuleChange = (id: string, field: string, value: any) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  const handleResetSales = () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: Are you sure you want to reset all sales history?\n\n' +
      'This will permanently delete:\n' +
      '• All sales records\n' +
      '• All returns\n' +
      '• Seller reports\n\n' +
      'This action CANNOT be undone!'
    );

    if (confirmed) {
      const restoreInventory = window.confirm(
        'Do you want to restore all sold items back to inventory?\n\n' +
        'Click OK to restore inventory\n' +
        'Click Cancel to delete sales without restoring inventory'
      );
      onResetSalesHistory(restoreInventory);
    }
  };

  const handleResetAll = () => {
    const confirmed = window.confirm(
      '🚨 CRITICAL WARNING: Are you sure you want to reset ALL data?\n\n' +
      'This will permanently delete:\n' +
      '• All products\n' +
      '• All sales records\n' +
      '• All customers\n' +
      '• All sellers\n' +
      '• All returns\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Type YES in the next prompt to confirm.'
    );

    if (confirmed) {
      const finalConfirm = window.prompt('Type YES to confirm complete data deletion:');
      if (finalConfirm === 'YES') {
        onResetAllData();
      } else {
        alert('Reset cancelled. Data was not deleted.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        {isAuthenticated && (
          <div className="flex items-center space-x-2">
            <label className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 cursor-pointer">
              <Download className="h-4 w-4" />
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
            <button
              onClick={onExport}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Export Data
            </button>
          </div>
        )}
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
        
        {/* Auto-Backup Status */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📊 Current Data Status</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-blue-600">{products.length}</div>
              <div className="text-blue-700">Products</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">{sales.length}</div>
              <div className="text-green-700">Sales</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-purple-600">{customers.length}</div>
              <div className="text-purple-700">Customers</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-orange-600">{sellers.length}</div>
              <div className="text-orange-700">Sellers</div>
            </div>
          </div>
          <div className="mt-3 text-sm text-blue-700">
            💡 <strong>Tip:</strong> Export your data regularly to prevent loss!
          </div>
        </div>

        {/* Quick Backup */}
        {isAuthenticated && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-900">🔄 Quick Backup</h4>
                <p className="text-sm text-green-700">Download your current data as backup</p>
              </div>
              <button
                onClick={onExport}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Backup Now
              </button>
            </div>
          </div>
        )}

        {isAuthenticated && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="font-medium text-red-900">Reset Sales History</h4>
                <p className="text-sm text-red-700">This will permanently delete all sales data, returns, and seller reports</p>
              </div>
              <button
                type="button"
                onClick={handleResetSales}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Reset Sales
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <div>
                <h4 className="font-medium text-yellow-900">Reset All Data</h4>
                <p className="text-sm text-yellow-700">This will delete everything: products, sales, customers, sellers</p>
              </div>
              <button
                type="button"
                onClick={handleResetAll}
                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
              >
                Reset All
              </button>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="IQD">Iraqi Dinar (IQD)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                USD to IQD Exchange Rate
              </label>
              <input
                type="number"
                name="usdToIqdRate"
                value={formData.usdToIqdRate}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                name="taxRate"
                value={formData.taxRate * 100}
                onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) / 100 || 0 }))}
                min="0"
                max="100"
                step="0.1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Low Stock Threshold
              </label>
              <input
                type="number"
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Format
              </label>
              <select
                name="dateFormat"
                value={formData.dateFormat}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                <option value="yyyy-MM-dd">yyyy-MM-dd</option>
              </select>
            </div>

          </div>
        </div>

        {/* Alert Rules */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Rules</h3>
          
          <div className="space-y-4">
            {rules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => handleRuleChange(rule.id, 'enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {rule.type === 'low_stock' && 'Low Stock Alert'}
                      {rule.type === 'out_of_stock' && 'Out of Stock Alert'}
                      {rule.type === 'high_value_sale' && 'High Value Sale Alert'}
                    </p>
                    <p className="text-sm text-gray-600">{rule.message}</p>
                  </div>
                </div>
                
                {rule.threshold !== undefined && (
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Threshold:</label>
                    <input
                      type="number"
                      value={rule.threshold}
                      onChange={(e) => handleRuleChange(rule.id, 'threshold', parseFloat(e.target.value) || 0)}
                      min="0"
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Currency Converter */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Currency Converter</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                USD Amount
              </label>
              <input
                type="number"
                placeholder="Enter USD amount"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  const usd = parseFloat(e.target.value) || 0;
                  const iqd = usd * formData.usdToIqdRate;
                  const iqdInput = document.getElementById('iqd-input') as HTMLInputElement;
                  if (iqdInput) iqdInput.value = iqd.toLocaleString();
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IQD Amount
              </label>
              <input
                id="iqd-input"
                type="text"
                placeholder="IQD equivalent"
                readOnly
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus:outline-none"
              />
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-2">
            Current rate: 1 USD = {formData.usdToIqdRate.toLocaleString()} IQD
          </p>
        </div>

        {/* PIN Management */}
        {isAuthenticated && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              PIN Management
            </h3>

            {pinSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                PIN updated successfully!
              </div>
            )}

            {pinError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {pinError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={7}
                  value={isChangingPin ? '' : '••••••'}
                  onChange={(e) => setIsChangingPin(true)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current PIN"
                  disabled={!isChangingPin}
                />
              </div>

              {isChangingPin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New PIN
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={7}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter new PIN"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New PIN
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={7}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm new PIN"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        setPinError('');
                        setPinSuccess(false);

                        if (newPin.length < 4) {
                          setPinError('PIN must be at least 4 digits');
                          return;
                        }

                        if (newPin !== confirmPin) {
                          setPinError('PINs do not match');
                          return;
                        }

                        try {
                          const { data: currentPinData } = await supabase
                            .from('pin_settings')
                            .select('pin')
                            .maybeSingle();

                          if (currentPinData) {
                            const { error } = await supabase
                              .from('pin_settings')
                              .update({ pin: newPin, updated_at: new Date().toISOString() })
                              .eq('pin', currentPinData.pin);

                            if (error) throw error;

                            setCurrentPin(newPin);
                            setNewPin('');
                            setConfirmPin('');
                            setPinSuccess(true);
                            setIsChangingPin(false);

                            setTimeout(() => setPinSuccess(false), 3000);
                          }
                        } catch (err) {
                          setPinError('Failed to update PIN. Please try again.');
                        }
                      }}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Key className="h-4 w-4" />
                      Update PIN
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPin(false);
                        setNewPin('');
                        setConfirmPin('');
                        setPinError('');
                        setPinSuccess(false);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {!isChangingPin && (
                <button
                  type="button"
                  onClick={() => setIsChangingPin(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Key className="h-4 w-4" />
                  Change PIN
                </button>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        {isAuthenticated ? (
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Settings
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            <div className="bg-gray-100 text-gray-600 px-6 py-2 rounded-md text-sm">
              Sign in to modify settings
            </div>
          </div>
        )}
      </form>
    </div>
  );
}