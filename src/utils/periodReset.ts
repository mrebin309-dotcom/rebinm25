import { supabase } from '../lib/supabase';

const formatErrorMessage = (error: unknown): string => {
  if (!error) return 'Unknown error occurred';

  if (typeof error === 'string') return error;

  if (error instanceof Error) return error.message;

  if (typeof error === 'object') {
    const err = error as any;

    if (err.message) {
      let msg = err.message;
      if (err.details) msg += ` Details: ${err.details}`;
      if (err.hint) msg += ` Hint: ${err.hint}`;
      if (err.code) msg += ` (Code: ${err.code})`;
      return msg;
    }

    if (err.error) {
      return formatErrorMessage(err.error);
    }

    try {
      return JSON.stringify(error);
    } catch {
      return 'Error object (could not stringify)';
    }
  }

  return String(error);
};

export interface PeriodInfo {
  currentPeriod: 'first-half' | 'second-half';
  periodStart: Date;
  periodEnd: Date;
  nextCostReset: Date;
  nextProfitReset: Date;
  canResetCost: boolean;
  canResetProfit: boolean;
}

export const getCurrentPeriodInfo = (): PeriodInfo => {
  const now = new Date();
  const day = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth();

  const isFirstHalf = day <= 15;

  let periodStart: Date;
  let periodEnd: Date;
  let nextCostReset: Date;
  let nextProfitReset: Date;

  if (isFirstHalf) {
    periodStart = new Date(year, month, 1);
    periodEnd = new Date(year, month, 15);
    nextCostReset = new Date(year, month, 15);
  } else {
    periodStart = new Date(year, month, 16);
    periodEnd = new Date(year, month + 1, 0);
    nextCostReset = new Date(year, month + 1, 0);
  }

  nextProfitReset = new Date(year, month + 1, 0);

  const canResetCost = day === 15 || day === new Date(year, month + 1, 0).getDate();
  const canResetProfit = day === new Date(year, month + 1, 0).getDate();

  return {
    currentPeriod: isFirstHalf ? 'first-half' : 'second-half',
    periodStart,
    periodEnd,
    nextCostReset,
    nextProfitReset,
    canResetCost,
    canResetProfit
  };
};

export const archiveCurrentPeriod = async (
  type: 'cost' | 'profit',
  customStartDate?: Date,
  customEndDate?: Date
) => {
  try {
    const periodInfo = getCurrentPeriodInfo();
    const startDate = customStartDate || periodInfo.periodStart;
    const endDate = customEndDate || periodInfo.periodEnd;

    const endDateInclusive = new Date(endDate);
    endDateInclusive.setHours(23, 59, 59, 999);

    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDateInclusive.toISOString());

    if (salesError) {
      console.error('Sales query error:', salesError);
      throw salesError;
    }

    console.log(`Found ${sales?.length || 0} sales for period`);

    const totalCost = sales?.reduce((sum, sale) => {
      const unitCost = Number(sale.unit_cost) || 0;
      const quantity = Number(sale.quantity) || 0;
      return sum + (unitCost * quantity);
    }, 0) || 0;

    const totalProfit = sales?.reduce((sum, sale) => {
      const profit = Number(sale.profit) || 0;
      return sum + profit;
    }, 0) || 0;

    const totalSales = sales?.length || 0;

    const sellerBreakdown: Record<string, { cost: number; profit: number; sales: number }> = {};

    sales?.forEach(sale => {
      const seller = sale.seller_name || 'Unknown';
      if (!sellerBreakdown[seller]) {
        sellerBreakdown[seller] = { cost: 0, profit: 0, sales: 0 };
      }
      const unitCost = Number(sale.unit_cost) || 0;
      const quantity = Number(sale.quantity) || 0;
      const profit = Number(sale.profit) || 0;

      sellerBreakdown[seller].cost += unitCost * quantity;
      sellerBreakdown[seller].profit += profit;
      sellerBreakdown[seller].sales += 1;
    });

    const archiveData = {
      period_type: type,
      period_start: startDate.toISOString().split('T')[0],
      period_end: endDate.toISOString().split('T')[0],
      total_cost: totalCost,
      total_profit: totalProfit,
      total_sales: totalSales,
      seller_breakdown: sellerBreakdown
    };

    console.log('Attempting to archive data:', archiveData);

    const { error: insertError } = await supabase
      .from('period_history')
      .insert(archiveData);

    if (insertError) {
      console.error('Insert error details:', insertError);
      throw insertError;
    }

    console.log('Archive successful');
    return { success: true, totalCost, totalProfit, totalSales };
  } catch (error) {
    console.error('Error archiving period:', error);
    const errorMessage = formatErrorMessage(error);
    console.error('Formatted error:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

export const performReset = async (
  type: 'cost' | 'profit',
  customStartDate?: Date,
  customEndDate?: Date
) => {
  try {
    console.log(`Starting ${type} reset...`);
    const archiveResult = await archiveCurrentPeriod(type, customStartDate, customEndDate);

    if (!archiveResult.success) {
      const errorMsg = typeof archiveResult.error === 'string'
        ? archiveResult.error
        : formatErrorMessage(archiveResult.error);
      console.error('Archive failed with error:', errorMsg);
      return { success: false, error: `Failed to archive data: ${errorMsg}` };
    }

    console.log('Archive completed successfully');

    const now = new Date();
    const nextReset = type === 'cost'
      ? (now.getDate() <= 15
          ? new Date(now.getFullYear(), now.getMonth(), 15)
          : new Date(now.getFullYear(), now.getMonth() + 1, 0))
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    console.log('Updating reset tracking...');
    const { error: trackingError } = await supabase
      .from('reset_tracking')
      .insert({
        reset_type: type,
        reset_date: now.toISOString().split('T')[0],
        next_reset_date: nextReset.toISOString().split('T')[0]
      });

    if (trackingError) {
      console.error('Error tracking reset:', trackingError);
      console.error('Formatted tracking error:', formatErrorMessage(trackingError));
    } else {
      console.log('Reset tracking updated successfully');
    }

    console.log('Reset completed successfully');
    return {
      success: true,
      archived: {
        totalCost: archiveResult.totalCost,
        totalProfit: archiveResult.totalProfit,
        totalSales: archiveResult.totalSales
      }
    };
  } catch (error) {
    console.error('Error performing reset:', error);
    const errorMessage = formatErrorMessage(error);
    console.error('Formatted reset error:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

export const getLastReset = async (type: 'cost' | 'profit') => {
  try {
    const { data, error } = await supabase
      .from('reset_tracking')
      .select('*')
      .eq('reset_type', type)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error querying last reset:', error);
      console.error('Formatted error:', formatErrorMessage(error));
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting last reset:', error);
    console.error('Formatted error:', formatErrorMessage(error));
    return null;
  }
};

export const getPeriodHistory = async (type?: 'cost' | 'profit', limit = 10) => {
  try {
    let query = supabase
      .from('period_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('period_type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error querying period history:', error);
      console.error('Formatted error:', formatErrorMessage(error));
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting period history:', error);
    console.error('Formatted error:', formatErrorMessage(error));
    return [];
  }
};
