import { Product, Notification, Settings } from '../types';

export type StockLevel = 'low' | 'good' | 'out';

export interface StockStatus {
  level: StockLevel;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  label: string;
  percentage: number;
  needsAttention: boolean;
}

/**
 * Calculates the stock status for a product based on current stock and minimum stock threshold
 * @param product - The product to check
 * @param globalThreshold - Optional global low stock threshold from settings
 * @returns Stock status with level, colors, and metadata
 */
export function getStockStatus(product: Product, globalThreshold?: number): StockStatus {
  const { stock, minStock } = product;

  // Out of stock - always show this warning
  if (stock === 0) {
    return {
      level: 'out',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-300',
      label: 'Out of Stock',
      percentage: 0,
      needsAttention: true,
    };
  }

  // If minStock is 0, only warn when out of stock (not for low stock)
  if (minStock === 0) {
    return {
      level: 'good',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-300',
      label: 'In Stock',
      percentage: 100,
      needsAttention: false,
    };
  }

  // Use product's minStock or fallback to global threshold
  const threshold = minStock > 0 ? minStock : (globalThreshold || 10);

  // Calculate percentage of stock remaining
  const percentage = threshold > 0 ? (stock / threshold) * 100 : 100;

  // Low: At or below minimum stock threshold
  if (stock <= threshold) {
    return {
      level: 'low',
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-400',
      label: 'Low Stock',
      percentage,
      needsAttention: true,
    };
  }

  // Good: Above minimum stock
  return {
    level: 'good',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    label: 'In Stock',
    percentage,
    needsAttention: false,
  };
}

/**
 * Generates notifications for products that need attention
 * @param products - List of all products
 * @param settings - Application settings
 * @returns Array of notifications for low stock items
 */
export function generateStockNotifications(
  products: Product[],
  settings: Settings
): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();

  products.forEach((product) => {
    const status = getStockStatus(product, settings.lowStockThreshold);

    if (!status.needsAttention) return;

    let type: 'error' | 'warning' | 'info' = 'info';
    let title = '';
    let message = '';

    switch (status.level) {
      case 'out':
        type = 'error';
        title = '🚨 Out of Stock';
        message = `${product.name} is completely out of stock. Reorder immediately!`;
        break;
      case 'low':
        type = 'warning';
        title = '📦 Low Stock Alert';
        message = `${product.name} has ${product.stock} units, approaching minimum threshold.`;
        break;
    }

    notifications.push({
      id: `stock-alert-${product.id}-${now.getTime()}`,
      type,
      title,
      message,
      date: now,
      read: false,
      actionUrl: `/products?id=${product.id}`,
    });
  });

  return notifications;
}

/**
 * Gets a summary of stock levels across all products
 * @param products - List of all products
 * @param globalThreshold - Global low stock threshold
 * @returns Summary object with counts for each stock level
 */
export function getStockSummary(products: Product[], globalThreshold?: number) {
  const summary = {
    outOfStock: 0,
    low: 0,
    good: 0,
    totalNeedingAttention: 0,
  };

  products.forEach((product) => {
    const status = getStockStatus(product, globalThreshold);

    switch (status.level) {
      case 'out':
        summary.outOfStock++;
        summary.totalNeedingAttention++;
        break;
      case 'low':
        summary.low++;
        summary.totalNeedingAttention++;
        break;
      case 'good':
        summary.good++;
        break;
    }
  });

  return summary;
}

/**
 * Filters products that need attention based on stock levels
 * @param products - List of all products
 * @param globalThreshold - Global low stock threshold
 * @param level - Optional specific level to filter by
 * @returns Filtered and sorted products that need attention
 */
export function getProductsNeedingAttention(
  products: Product[],
  globalThreshold?: number,
  level?: StockLevel
): Array<Product & { stockStatus: StockStatus }> {
  return products
    .map((product) => ({
      ...product,
      stockStatus: getStockStatus(product, globalThreshold),
    }))
    .filter((item) => {
      if (level) {
        return item.stockStatus.level === level;
      }
      return item.stockStatus.needsAttention;
    })
    .sort((a, b) => {
      // Sort by urgency: out -> low
      const order = { out: 0, low: 1, good: 2 };
      const aOrder = order[a.stockStatus.level];
      const bOrder = order[b.stockStatus.level];
      if (aOrder !== bOrder) return aOrder - bOrder;
      // Then by stock quantity (ascending)
      return a.stock - b.stock;
    });
}
