import { useState } from 'react';
import { RotateCcw, Plus, Eye, Check, X, Search } from 'lucide-react';
import { Return, Sale, Product, Settings } from '../types';
import { format } from 'date-fns';
import { formatDateWithSettings, formatDateTimeWithSettings } from '../utils/dateFormat';

interface ReturnsProps {
  returns: Return[];
  sales: Sale[];
  products: Product[];
  settings: Settings;
  onAddReturn: (returnData: Omit<Return, 'id' | 'date'>) => void;
  onUpdateReturn: (id: string, data: Partial<Return>) => void;
  isAuthenticated?: boolean;
}

export function Returns({ returns, sales, products, settings, onAddReturn, onUpdateReturn, isAuthenticated = false }: ReturnsProps) {
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    saleId: '',
    reason: '',
    quantity: 1,
  });

  const formatCurrency = (amount: number) => {
    const converted = settings.currency === 'IQD' ? amount * settings.usdToIqdRate : amount;
    const symbol = settings.currency === 'USD' ? '$' : 'IQD ';
    return settings.currency === 'USD'
      ? `${symbol}${converted.toFixed(2)}`
      : `${symbol}${converted.toLocaleString()}`;
  };

  const completedSales = sales
    .filter(sale => sale.status === 'completed')
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const filteredSales = completedSales.filter(sale => {
    const searchLower = searchTerm.toLowerCase();
    return (
      sale.productName.toLowerCase().includes(searchLower) ||
      sale.id.toLowerCase().includes(searchLower) ||
      (sale.customerName && sale.customerName.toLowerCase().includes(searchLower)) ||
      (sale.sellerName && sale.sellerName.toLowerCase().includes(searchLower))
    );
  });

  const handleSelectSale = (sale: Sale) => {
    setSelectedSale(sale);
    setFormData(prev => ({ ...prev, saleId: sale.id, quantity: 1 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sale = sales.find(s => s.id === formData.saleId);
    if (!sale) return;

    if (formData.quantity > sale.quantity) {
      alert('Return quantity cannot exceed sale quantity');
      return;
    }
    const returnData: Omit<Return, 'id' | 'date'> = {
      saleId: formData.saleId,
      productId: sale.productId,
      productName: sale.productName,
      quantity: formData.quantity,
      reason: formData.reason,
      refundAmount: (sale.unitPrice * formData.quantity) - (sale.discount * formData.quantity / sale.quantity),
      status: 'pending',
    };

    onAddReturn(returnData);
    setShowReturnForm(false);
    setFormData({ saleId: '', reason: '', quantity: 1 });
    setSelectedSale(null);
    setSearchTerm('');
  };

  const handleStatusUpdate = (returnId: string, status: 'approved' | 'rejected') => {
    onUpdateReturn(returnId, { status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Returns Management</h2>
        {isAuthenticated && (
          <button
            onClick={() => setShowReturnForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Process Return
          </button>
        )}
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refund Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {returns.map(returnItem => (
                <tr key={returnItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{returnItem.id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {returnItem.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {returnItem.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${returnItem.refundAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {returnItem.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateWithSettings(returnItem.date, settings.dateFormat)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(returnItem.status)}`}>
                      {returnItem.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setSelectedReturn(returnItem)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {isAuthenticated && returnItem.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(returnItem.id, 'approved')}
                            className="text-green-600 hover:text-green-900 transition-colors"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(returnItem.id, 'rejected')}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {returns.length === 0 && (
          <div className="text-center py-12">
            <RotateCcw className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No returns</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by processing your first return.</p>
          </div>
        )}
      </div>

      {/* Return Form Modal */}
      {showReturnForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Process Return</h3>
              <button
                onClick={() => {
                  setShowReturnForm(false);
                  setSelectedSale(null);
                  setSearchTerm('');
                  setFormData({ saleId: '', reason: '', quantity: 1 });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                {/* Search Bar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Recent Sales *
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by product, sale ID, customer, or seller..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Sales List */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select a Sale to Return {selectedSale && '✓'}
                  </label>
                  <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
                    {filteredSales.length > 0 ? (
                      filteredSales.map(sale => (
                        <div
                          key={sale.id}
                          onClick={() => handleSelectSale(sale)}
                          className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors ${
                            selectedSale?.id === sale.id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{sale.productName}</p>
                              <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-600">
                                <span>ID: #{sale.id.slice(-8)}</span>
                                <span>•</span>
                                <span>Qty: {sale.quantity}</span>
                                <span>•</span>
                                <span>{formatDateWithSettings(sale.date, settings)}</span>
                              </div>
                              {(sale.customerName || sale.sellerName) && (
                                <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                                  {sale.customerName && <span>Customer: {sale.customerName}</span>}
                                  {sale.sellerName && <span>Seller: {sale.sellerName}</span>}
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-semibold text-emerald-600">{formatCurrency(sale.total)}</p>
                              <p className="text-xs text-gray-500">{formatCurrency(sale.unitPrice)}/unit</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <p>No sales found matching your search</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity and Reason - Only show when sale is selected */}
                {selectedSale && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity to Return *
                        </label>
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                          min="1"
                          max={selectedSale.quantity}
                          required
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Max: {selectedSale.quantity} units</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estimated Refund
                        </label>
                        <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                          <p className="font-semibold text-emerald-600">
                            {formatCurrency((selectedSale.unitPrice * formData.quantity) - (selectedSale.discount * formData.quantity / selectedSale.quantity))}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Return *
                      </label>
                      <textarea
                        value={formData.reason}
                        onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                        required
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the reason for return..."
                      />
                    </div>
                  </>
                )}
              </div>
            </form>

            {/* Footer with buttons */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReturnForm(false);
                    setSelectedSale(null);
                    setSearchTerm('');
                    setFormData({ saleId: '', reason: '', quantity: 1 });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedSale || !formData.reason}
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Process Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Details Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Return Details</h3>
              <button
                onClick={() => setSelectedReturn(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Return ID</label>
                <p className="text-sm text-gray-900">#{selectedReturn.id.slice(-6)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <p className="text-sm text-gray-900">{selectedReturn.productName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <p className="text-sm text-gray-900">{selectedReturn.quantity}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Refund Amount</label>
                <p className="text-sm text-gray-900">${selectedReturn.refundAmount.toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <p className="text-sm text-gray-900">{selectedReturn.reason}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <p className="text-sm text-gray-900">{formatDateTimeWithSettings(selectedReturn.date, settings.dateFormat)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReturn.status)}`}>
                  {selectedReturn.status}
                </span>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setSelectedReturn(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}