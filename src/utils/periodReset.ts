import { supabase } from '../lib/supabase';

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

    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString());

    if (salesError) throw salesError;

    const totalCost = sales?.reduce((sum, sale) => sum + (sale.unit_cost * sale.quantity), 0) || 0;
    const totalProfit = sales?.reduce((sum, sale) => sum + sale.profit, 0) || 0;
    const totalSales = sales?.length || 0;

    const sellerBreakdown: Record<string, { cost: number; profit: number; sales: number }> = {};

    sales?.forEach(sale => {
      const seller = sale.seller || 'Unknown';
      if (!sellerBreakdown[seller]) {
        sellerBreakdown[seller] = { cost: 0, profit: 0, sales: 0 };
      }
      sellerBreakdown[seller].cost += sale.unit_cost * sale.quantity;
      sellerBreakdown[seller].profit += sale.profit;
      sellerBreakdown[seller].sales += 1;
    });

    const { error: insertError } = await supabase
      .from('period_history')
      .insert({
        period_type: type,
        period_start: startDate.toISOString().split('T')[0],
        period_end: endDate.toISOString().split('T')[0],
        total_cost: totalCost,
        total_profit: totalProfit,
        total_sales: totalSales,
        seller_breakdown: sellerBreakdown
      });

    if (insertError) throw insertError;

    return { success: true, totalCost, totalProfit, totalSales };
  } catch (error) {
    console.error('Error archiving period:', error);
    return { success: false, error };
  }
};

export const performReset = async (
  type: 'cost' | 'profit',
  customStartDate?: Date,
  customEndDate?: Date
) => {
  try {
    const archiveResult = await archiveCurrentPeriod(type, customStartDate, customEndDate);

    if (!archiveResult.success) {
      return { success: false, error: 'Failed to archive data' };
    }

    const now = new Date();
    const nextReset = type === 'cost'
      ? (now.getDate() <= 15
          ? new Date(now.getFullYear(), now.getMonth(), 15)
          : new Date(now.getFullYear(), now.getMonth() + 1, 0))
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { error: trackingError } = await supabase
      .from('reset_tracking')
      .insert({
        reset_type: type,
        reset_date: now.toISOString().split('T')[0],
        next_reset_date: nextReset.toISOString().split('T')[0]
      });

    if (trackingError) {
      console.error('Error tracking reset:', trackingError);
    }

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
    return { success: false, error };
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

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting last reset:', error);
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

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting period history:', error);
    return [];
  }
};
