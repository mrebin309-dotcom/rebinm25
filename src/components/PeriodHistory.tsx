import { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, Users, ShoppingCart, Download } from 'lucide-react';
import { getPeriodHistory, getCurrentPeriodInfo } from '../utils/periodReset';

interface PeriodHistoryRecord {
  id: string;
  period_type: 'cost' | 'profit';
  period_start: string;
  period_end: string;
  total_cost: number;
  total_profit: number;
  total_sales: number;
  seller_breakdown: Record<string, { cost: number; profit: number; sales: number }>;
  created_at: string;
}

export function PeriodHistory() {
  const [history, setHistory] = useState<PeriodHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'cost' | 'profit'>('all');
  const [selectedRecord, setSelectedRecord] = useState<PeriodHistoryRecord | null>(null);
  const periodInfo = getCurrentPeriodInfo();

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getPeriodHistory(
        filter === 'all' ? undefined : filter,
        50
      );
      setHistory(data as PeriodHistoryRecord[]);
    } catch (error) {
      console.error('Error loading period history:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (history.length === 0) return;

    const headers = ['Period Type', 'Start Date', 'End Date', 'Total Cost', 'Total Profit', 'Total Sales', 'Archived Date'];
    const rows = history.map(record => [
      record.period_type,
      record.period_start,
      record.period_end,
      record.total_cost.toFixed(2),
      record.total_profit.toFixed(2),
      record.total_sales,
      new Date(record.created_at).toLocaleString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `period-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Period History</h2>
        <button
          onClick={exportToCSV}
          disabled={history.length === 0}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Current Period</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm opacity-90">Period</span>
            </div>
            <p className="text-xl font-bold">
              {periodInfo.currentPeriod === 'first-half' ? '1st - 15th' : '16th - End'}
            </p>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm opacity-90">Period Dates</span>
            </div>
            <p className="text-sm font-semibold">
              {periodInfo.periodStart.toLocaleDateString()} - {periodInfo.periodEnd.toLocaleDateString()}
            </p>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm opacity-90">Next Cost Reset</span>
            </div>
            <p className="text-sm font-semibold">
              {periodInfo.nextCostReset.toLocaleDateString()}
            </p>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm opacity-90">Next Profit Reset</span>
            </div>
            <p className="text-sm font-semibold">
              {periodInfo.nextProfitReset.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Archived Periods</h3>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('cost')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'cost'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cost
            </button>
            <button
              onClick={() => setFilter('profit')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'profit'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Profit
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading period history...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No archived periods yet</p>
            <p className="text-sm mt-1">Period history will appear here after you reset cost or profit</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Archived
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.period_type === 'cost'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {record.period_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.period_start).toLocaleDateString()} - {new Date(record.period_end).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${record.total_cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${record.total_profit.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.total_sales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Period Details</h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Period Type</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{selectedRecord.period_type}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Period Dates</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(selectedRecord.period_start).toLocaleDateString()} - {new Date(selectedRecord.period_end).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                    <p className="text-sm text-orange-600">Total Cost</p>
                  </div>
                  <p className="text-xl font-bold text-orange-700">${selectedRecord.total_cost.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-600">Total Profit</p>
                  </div>
                  <p className="text-xl font-bold text-green-700">${selectedRecord.total_profit.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-blue-600">Total Sales</p>
                  </div>
                  <p className="text-xl font-bold text-blue-700">{selectedRecord.total_sales}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Archived On</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(selectedRecord.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {Object.keys(selectedRecord.seller_breakdown).length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-gray-700" />
                    <h4 className="text-lg font-semibold text-gray-900">Seller Breakdown</h4>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-sm font-medium text-gray-600">Seller</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-600">Cost</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-600">Profit</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-600">Sales</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selectedRecord.seller_breakdown).map(([seller, data]) => (
                          <tr key={seller} className="border-b border-gray-100">
                            <td className="py-2 text-sm text-gray-900">{seller}</td>
                            <td className="text-right py-2 text-sm text-gray-900">${data.cost.toFixed(2)}</td>
                            <td className="text-right py-2 text-sm text-gray-900">${data.profit.toFixed(2)}</td>
                            <td className="text-right py-2 text-sm text-gray-900">{data.sales}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
