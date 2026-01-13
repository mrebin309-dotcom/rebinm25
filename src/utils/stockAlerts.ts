import { Product, Notification, Settings, ColorVariant } from '../types';

export type StockLevel = 'low' | 'good' | 'out';

export interface ColorStockAlert {
  color: string;
  colorCode: string;
  stock: number;
  status: StockLevel;
}

export interface StockStatus {
  level: StockLevel;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  label: string;
  percentage: number;
  needsAttention: boolean;
  colorAlerts?: ColorStockAlert[];
}

/**
 * Calculates the stock status for a product based on current stock and minimum stock threshold
 * @param product - The product to check
 * @param globalThreshold - Optional global low stock threshold from settings
 * @returns Stock status with level, colors, and metadata
 */
export function getStockStatus(product: Product, globalThreshold?: number): StockStatus {
  const { stock, minStock, colorVariants, stockWarningLevel } = product;

  // Check color variants if they exist
  const colorAlerts: ColorStockAlert[] = [];
  let hasColorIssues = false;

  if (colorVariants && colorVariants.length > 0) {
    colorVariants.forEach((variant) => {
      // For Back Glass category, only alert when completely out of stock
      if (variant.stock === 0) {
        colorAlerts.push({
          color: variant.color,
          colorCode: variant.colorCode,
          stock: variant.stock,
          status: 'out',
        });
        hasColorIssues = true;
      }
    });
  }

  // Out of stock - show status but only trigger warnings if enabled
  if (stock === 0) {
    return {
      level: 'out',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-300',
      label: 'Out of Stock',
      percentage: 0,
      needsAttention: stockWarningLevel !== 'disabled',
      colorAlerts: colorAlerts.length > 0 ? colorAlerts : undefined,
    };
  }

  // If we have out of stock colors, mark as needing attention only if warnings enabled
  if (hasColorIssues && colorAlerts.length > 0) {
    return {
      level: 'out',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-300',
      label: 'Colors Out of Stock',
      percentage: 50,
      needsAttention: stockWarningLevel !== 'disabled',
      colorAlerts,
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

  // Low: At or below minimum stock threshold - only alert if warnings enabled for low stock
  if (stock <= threshold) {
    return {
      level: 'low',
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-400',
      label: 'Low Stock',
      percentage,
      needsAttention: stockWarningLevel === 'all',
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
    if (product.stockWarningLevel === 'disabled') return;

    const status = getStockStatus(product, settings.lowStockThreshold);

    if (!status.needsAttention) return;

    let type: 'error' | 'warning' | 'info' = 'info';
    let title = '';
    let message = '';

    // If there are color alerts, create specific notifications (only for out of stock)
    if (status.colorAlerts && status.colorAlerts.length > 0) {
      const outOfStockColors = status.colorAlerts.filter(a => a.status === 'out');

      if (outOfStockColors.length > 0) {
        type = 'error';
        title = '🚨 Color Out of Stock';
        const colorNames = outOfStockColors.map(c => c.color).join(', ');
        message = `${product.name} - Out of stock colors: ${colorNames}`;

        notifications.push({
          id: `stock-alert-color-out-${product.id}-${now.getTime()}`,
          type,
          title,
          message,
          date: now,
          read: false,
          actionUrl: `/products?id=${product.id}`,
        });
      }
    } else {
      // Regular stock alerts
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
    }
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
        if (status.needsAttention) {
          summary.totalNeedingAttention++;
        }
        break;
      case 'low':
        summary.low++;
        if (status.needsAttention) {
          summary.totalNeedingAttention++;
        }
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
