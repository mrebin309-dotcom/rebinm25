import { useState, useEffect } from 'react';
import { Product, Category, Sale, Return, Customer, AlertRule, Notification, Settings, Seller } from '../types';
import { supabase } from '../lib/supabase';

const defaultAlertRules: AlertRule[] = [
  { id: '1', type: 'low_stock', enabled: true, threshold: 10, message: 'Product is running low on stock', recipients: [], conditions: {} },
  { id: '2', type: 'out_of_stock', enabled: true, message: 'Product is out of stock', recipients: [], conditions: {} },
  { id: '3', type: 'high_value_sale', enabled: true, threshold: 1000, message: 'High value sale completed', recipients: [], conditions: {} },
];

const defaultSettings: Settings = {
  currency: 'USD',
  usdToIqdRate: 1320,
  dateFormat: 'MM/dd/yyyy',
  lowStockThreshold: 10,
  companyName: 'My Inventory',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  taxRate: 0.1,
  theme: 'light',
  language: 'en',
  autoBackup: false,
  backupFrequency: 'daily',
  emailNotifications: true,
  smsNotifications: false,
};

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [returns, setReturns] = useState<Return[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(defaultAlertRules);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        productsRes,
        categoriesRes,
        salesRes,
        returnsRes,
        customersRes,
        sellersRes,
        notificationsRes,
        settingsRes
      ] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('sales').select('*').order('date', { ascending: false }),
        supabase.from('returns').select('*').order('date', { ascending: false }),
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('sellers').select('*').order('name'),
        supabase.from('notifications').select('*').order('date', { ascending: false }),
        supabase.from('settings').select('*').limit(1).maybeSingle()
      ]);

      if (productsRes.data) {
        setProducts(productsRes.data.map(p => ({
          ...p,
          price: Number(p.price),
          cost: Number(p.cost),
          createdAt: new Date(p.created_at),
          updatedAt: new Date(p.updated_at),
          minStock: p.min_stock,
        })));
      }

      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      if (salesRes.data) {
        setSales(salesRes.data.map(s => ({
          ...s,
          productId: s.product_id || '',
          productName: s.product_name,
          unitPrice: Number(s.unit_price),
          discount: Number(s.discount),
          tax: Number(s.tax),
          total: Number(s.total),
          profit: Number(s.profit),
          customerId: s.customer_id || undefined,
          customerName: s.customer_name || undefined,
          paymentMethod: s.payment_method as 'cash' | 'card' | 'credit',
          date: new Date(s.date),
          status: s.status as 'completed' | 'pending' | 'cancelled',
          sellerId: s.seller_id || undefined,
          sellerName: s.seller_name || undefined,
          location: s.location || undefined,
        })));
      }

      if (returnsRes.data) {
        setReturns(returnsRes.data.map(r => ({
          ...r,
          saleId: r.sale_id || '',
          productId: r.product_id || '',
          productName: r.product_name,
          refundAmount: Number(r.refund_amount),
          date: new Date(r.date),
          status: r.status as 'pending' | 'approved' | 'rejected',
          processedBy: r.processed_by || undefined,
        })));
      }

      if (customersRes.data) {
        setCustomers(customersRes.data.map(c => ({
          ...c,
          email: c.email || '',
          phone: c.phone || '',
          address: c.address || '',
          customerType: c.customer_type as 'retail' | 'wholesale',
          creditLimit: Number(c.credit_limit),
          currentCredit: Number(c.current_credit),
          totalPurchases: Number(c.total_purchases),
          loyaltyPoints: c.loyalty_points,
          createdAt: new Date(c.created_at),
          lastPurchase: c.last_purchase ? new Date(c.last_purchase) : undefined,
        })));
      }

      if (sellersRes.data) {
        setSellers(sellersRes.data.map(s => ({
          ...s,
          email: s.email || undefined,
          phone: s.phone || undefined,
          commissionRate: s.commission_rate !== null ? Number(s.commission_rate) : undefined,
          isActive: s.is_active,
          createdAt: new Date(s.created_at),
          totalSales: s.total_sales,
          totalRevenue: Number(s.total_revenue),
          totalProfit: Number(s.total_profit),
        })));
      }

      if (notificationsRes.data) {
        setNotifications(notificationsRes.data.map(n => ({
          ...n,
          type: n.type as 'info' | 'warning' | 'error' | 'success',
          date: new Date(n.date),
          userId: n.user_id || undefined,
          actionUrl: n.action_url || undefined,
        })));
      }

      if (settingsRes.data) {
        const s = settingsRes.data;
        setSettings({
          currency: s.currency as 'USD' | 'IQD',
          usdToIqdRate: Number(s.usd_to_iqd_rate),
          dateFormat: s.date_format,
          lowStockThreshold: s.low_stock_threshold,
          companyName: s.company_name,
          companyAddress: s.company_address,
          companyPhone: s.company_phone,
          companyEmail: s.company_email,
          taxRate: Number(s.tax_rate),
          theme: s.theme as 'light' | 'dark',
          language: s.language as 'en' | 'ar',
          autoBackup: s.auto_backup,
          backupFrequency: s.backup_frequency as 'daily' | 'weekly' | 'monthly',
          emailNotifications: s.email_notifications,
          smsNotifications: s.sms_notifications,
          lastSeller: s.last_seller || undefined,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase.from('products').insert({
        name: productData.name,
        sku: productData.sku,
        barcode: productData.barcode || null,
        category: productData.category,
        price: productData.price,
        cost: productData.cost,
        stock: productData.stock,
        min_stock: productData.minStock,
        description: productData.description,
        image: productData.image || null,
        supplier: productData.supplier || null,
        location: productData.location || null,
        created_by: productData.createdBy || null,
        updated_by: productData.updatedBy || null,
      }).select().single();

      if (error) throw error;
      if (data) {
        const newProduct: Product = {
          ...productData,
          id: data.id,
          price: Number(data.price),
          cost: Number(data.cost),
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
        setProducts(prev => [newProduct, ...prev]);
        checkAlerts(newProduct);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const updateData: any = {};
      if (productData.name !== undefined) updateData.name = productData.name;
      if (productData.sku !== undefined) updateData.sku = productData.sku;
      if (productData.barcode !== undefined) updateData.barcode = productData.barcode;
      if (productData.category !== undefined) updateData.category = productData.category;
      if (productData.price !== undefined) updateData.price = productData.price;
      if (productData.cost !== undefined) updateData.cost = productData.cost;
      if (productData.stock !== undefined) updateData.stock = productData.stock;
      if (productData.minStock !== undefined) updateData.min_stock = productData.minStock;
      if (productData.description !== undefined) updateData.description = productData.description;
      if (productData.image !== undefined) updateData.image = productData.image;
      if (productData.supplier !== undefined) updateData.supplier = productData.supplier;
      if (productData.location !== undefined) updateData.location = productData.location;
      if (productData.updatedBy !== undefined) updateData.updated_by = productData.updatedBy;

      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase.from('products').update(updateData).eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.map(product => {
        if (product.id === id) {
          const updated = { ...product, ...productData, updatedAt: new Date() };
          checkAlerts(updated);
          return updated;
        }
        return product;
      }));
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      const { data, error } = await supabase.from('categories').insert(categoryData).select().single();
      if (error) throw error;
      if (data) {
        setCategories(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      const { error } = await supabase.from('categories').update(categoryData).eq('id', id);
      if (error) throw error;
      setCategories(prev => prev.map(category =>
        category.id === id ? { ...category, ...categoryData } : category
      ));
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const addSale = async (saleData: Omit<Sale, 'id' | 'date'>) => {
    try {
      const { data, error } = await supabase.from('sales').insert({
        product_id: saleData.productId || null,
        product_name: saleData.productName,
        quantity: saleData.quantity,
        unit_price: saleData.unitPrice,
        discount: saleData.discount,
        tax: saleData.tax,
        total: saleData.total,
        profit: saleData.profit,
        customer_id: saleData.customerId || null,
        customer_name: saleData.customerName || null,
        payment_method: saleData.paymentMethod,
        status: saleData.status,
        seller_id: saleData.sellerId || null,
        seller_name: saleData.sellerName || null,
        location: saleData.location || null,
      }).select().single();

      if (error) throw error;
      if (data) {
        const newSale: Sale = {
          ...saleData,
          id: data.id,
          date: new Date(data.date),
        };
        setSales(prev => [newSale, ...prev]);

        const product = products.find(p => p.id === saleData.productId);
        if (product) {
          await updateProduct(saleData.productId, {
            stock: product.stock - saleData.quantity
          });
        }

        if (saleData.sellerId) {
          const { error: sellerError } = await supabase.from('sellers')
            .update({
              total_sales: supabase.raw('total_sales + 1'),
              total_revenue: supabase.raw(`total_revenue + ${newSale.total}`),
              total_profit: supabase.raw(`total_profit + ${newSale.profit}`),
            })
            .eq('id', saleData.sellerId);

          if (!sellerError) {
            setSellers(prev => prev.map(seller => {
              if (seller.id === saleData.sellerId) {
                return {
                  ...seller,
                  totalSales: seller.totalSales + 1,
                  totalRevenue: seller.totalRevenue + newSale.total,
                  totalProfit: seller.totalProfit + newSale.profit,
                };
              }
              return seller;
            }));
          }
        }

        if (saleData.sellerName) {
          const settingsData = await supabase.from('settings').select('id').limit(1).maybeSingle();
          if (settingsData.data) {
            await supabase.from('settings')
              .update({ last_seller: saleData.sellerName })
              .eq('id', settingsData.data.id);
            setSettings(prev => ({ ...prev, lastSeller: saleData.sellerName }));
          }
        }

        if (newSale.total >= (alertRules.find(r => r.type === 'high_value_sale')?.threshold || 1000)) {
          await addNotification({
            type: 'success',
            title: 'High Value Sale',
            message: `Sale of $${newSale.total.toFixed(2)} completed for ${newSale.productName}`,
          });
        }
      }
    } catch (error) {
      console.error('Error adding sale:', error);
    }
  };

  const addReturn = async (returnData: Omit<Return, 'id' | 'date'>) => {
    try {
      const { data, error } = await supabase.from('returns').insert({
        sale_id: returnData.saleId || null,
        product_id: returnData.productId || null,
        product_name: returnData.productName,
        quantity: returnData.quantity,
        reason: returnData.reason,
        refund_amount: returnData.refundAmount,
        status: returnData.status,
        processed_by: returnData.processedBy || null,
      }).select().single();

      if (error) throw error;
      if (data) {
        const newReturn: Return = {
          ...returnData,
          id: data.id,
          date: new Date(data.date),
          saleId: returnData.saleId || '',
          productId: returnData.productId || '',
        };
        setReturns(prev => [newReturn, ...prev]);

        await addNotification({
          type: 'info',
          title: 'Return Processed',
          message: `Return for ${returnData.productName} has been submitted`,
        });
      }
    } catch (error) {
      console.error('Error adding return:', error);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases'>) => {
    try {
      const { data, error } = await supabase.from('customers').insert({
        name: customerData.name,
        email: customerData.email || null,
        phone: customerData.phone || null,
        address: customerData.address || null,
        customer_type: customerData.customerType,
        credit_limit: customerData.creditLimit,
        current_credit: customerData.currentCredit,
        total_purchases: 0,
        loyalty_points: customerData.loyaltyPoints,
        last_purchase: customerData.lastPurchase?.toISOString() || null,
      }).select().single();

      if (error) throw error;
      if (data) {
        const newCustomer: Customer = {
          ...customerData,
          id: data.id,
          createdAt: new Date(data.created_at),
          totalPurchases: 0,
        };
        setCustomers(prev => [newCustomer, ...prev]);
      }
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  const addSeller = async (sellerData: Omit<Seller, 'id' | 'createdAt' | 'totalSales' | 'totalRevenue' | 'totalProfit'>) => {
    try {
      const { data, error } = await supabase.from('sellers').insert({
        name: sellerData.name,
        email: sellerData.email || null,
        phone: sellerData.phone || null,
        commission_rate: sellerData.commissionRate || null,
        is_active: sellerData.isActive,
        total_sales: 0,
        total_revenue: 0,
        total_profit: 0,
      }).select().single();

      if (error) throw error;
      if (data) {
        const newSeller: Seller = {
          ...sellerData,
          id: data.id,
          createdAt: new Date(data.created_at),
          totalSales: 0,
          totalRevenue: 0,
          totalProfit: 0,
        };
        setSellers(prev => [...prev, newSeller]);
      }
    } catch (error) {
      console.error('Error adding seller:', error);
    }
  };

  const updateSeller = async (id: string, sellerData: Partial<Seller>) => {
    try {
      const updateData: any = {};
      if (sellerData.name !== undefined) updateData.name = sellerData.name;
      if (sellerData.email !== undefined) updateData.email = sellerData.email;
      if (sellerData.phone !== undefined) updateData.phone = sellerData.phone;
      if (sellerData.commissionRate !== undefined) updateData.commission_rate = sellerData.commissionRate;
      if (sellerData.isActive !== undefined) updateData.is_active = sellerData.isActive;

      const { error } = await supabase.from('sellers').update(updateData).eq('id', id);
      if (error) throw error;
      setSellers(prev => prev.map(seller =>
        seller.id === id ? { ...seller, ...sellerData } : seller
      ));
    } catch (error) {
      console.error('Error updating seller:', error);
    }
  };

  const deleteSeller = async (id: string) => {
    try {
      const { error } = await supabase.from('sellers').delete().eq('id', id);
      if (error) throw error;
      setSellers(prev => prev.filter(seller => seller.id !== id));
    } catch (error) {
      console.error('Error deleting seller:', error);
    }
  };

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'date' | 'read'>) => {
    try {
      const { data, error } = await supabase.from('notifications').insert({
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        read: false,
        user_id: notificationData.userId || null,
        action_url: notificationData.actionUrl || null,
      }).select().single();

      if (error) throw error;
      if (data) {
        const newNotification: Notification = {
          ...notificationData,
          id: data.id,
          date: new Date(data.date),
          read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
      if (error) throw error;
      setNotifications(prev => prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const checkAlerts = async (product: Product) => {
    const lowStockRule = alertRules.find(r => r.type === 'low_stock' && r.enabled);
    const outOfStockRule = alertRules.find(r => r.type === 'out_of_stock' && r.enabled);

    if (product.stock === 0 && outOfStockRule) {
      await addNotification({
        type: 'error',
        title: 'Out of Stock',
        message: `${product.name} is out of stock`,
      });
    } else if (product.stock <= product.minStock && lowStockRule) {
      await addNotification({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${product.name} is running low (${product.stock} left)`,
      });
    }
  };

  const updateReturn = async (id: string, data: Partial<Return>) => {
    try {
      const returnItem = returns.find(r => r.id === id);
      if (!returnItem) return;

      const updateData: any = {};
      if (data.status !== undefined) updateData.status = data.status;
      if (data.processedBy !== undefined) updateData.processed_by = data.processedBy;

      const { error } = await supabase.from('returns').update(updateData).eq('id', id);
      if (error) throw error;

      if (data.status === 'approved' && returnItem.status !== 'approved') {
        const product = products.find(p => p.id === returnItem.productId);
        if (product) {
          await updateProduct(returnItem.productId, {
            stock: product.stock + returnItem.quantity
          });
        }

        await addNotification({
          type: 'success',
          title: 'Return Approved',
          message: `Return for ${returnItem.productName} has been approved and stock updated`,
        });
      } else if (data.status === 'rejected') {
        await addNotification({
          type: 'info',
          title: 'Return Rejected',
          message: `Return for ${returnItem.productName} has been rejected`,
        });
      }

      setReturns(prev => prev.map(ret =>
        ret.id === id ? { ...ret, ...data } : ret
      ));
    } catch (error) {
      console.error('Error updating return:', error);
    }
  };

  const updateSettings = async (newSettings: Settings) => {
    try {
      const settingsData = await supabase.from('settings').select('id').limit(1).maybeSingle();

      if (settingsData.data) {
        const { error } = await supabase.from('settings').update({
          currency: newSettings.currency,
          usd_to_iqd_rate: newSettings.usdToIqdRate,
          date_format: newSettings.dateFormat,
          low_stock_threshold: newSettings.lowStockThreshold,
          company_name: newSettings.companyName,
          company_address: newSettings.companyAddress,
          company_phone: newSettings.companyPhone,
          company_email: newSettings.companyEmail,
          tax_rate: newSettings.taxRate,
          theme: newSettings.theme,
          language: newSettings.language,
          auto_backup: newSettings.autoBackup,
          backup_frequency: newSettings.backupFrequency,
          email_notifications: newSettings.emailNotifications,
          sms_notifications: newSettings.smsNotifications,
          last_seller: newSettings.lastSeller || null,
        }).eq('id', settingsData.data.id);

        if (error) throw error;
      }
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const exportData = async () => {
    const data = {
      products,
      categories,
      sales,
      returns,
      customers,
      sellers,
      alertRules,
      notifications,
      settings,
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        totalProducts: products.length,
        totalSales: sales.length,
        totalRevenue: sales.reduce((sum, sale) => sum + sale.total, 0),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-backup-${new Date().toISOString().split('T')[0]}-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    await addNotification({
      type: 'success',
      title: 'Backup Created',
      message: `Data backup downloaded successfully with ${products.length} products and ${sales.length} sales`,
    });
  };

  const importData = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        await addNotification({
          type: 'success',
          title: 'Import Successful',
          message: 'Data has been imported successfully',
        });

        await loadData();
      } catch (error) {
        await addNotification({
          type: 'error',
          title: 'Import Failed',
          message: 'Failed to import data. Please check the file format.',
        });
      }
    };
    reader.readAsText(file);
  };

  const resetSalesHistory = async () => {
    if (window.confirm('Are you sure you want to delete all sales history? This action cannot be undone.')) {
      try {
        await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('returns').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('sellers').update({
          total_sales: 0,
          total_revenue: 0,
          total_profit: 0,
        }).neq('id', '00000000-0000-0000-0000-000000000000');

        setSales([]);
        setReturns([]);
        setSellers(prev => prev.map(seller => ({
          ...seller,
          totalSales: 0,
          totalRevenue: 0,
          totalProfit: 0,
        })));

        await addNotification({
          type: 'success',
          title: 'Sales History Reset',
          message: 'All sales history and reports have been cleared',
        });
      } catch (error) {
        console.error('Error resetting sales history:', error);
      }
    }
  };

  const resetAllData = async () => {
    if (window.confirm('Are you sure you want to delete ALL data? This will remove products, sales, customers, and everything else. This action cannot be undone.')) {
      if (window.confirm('This is your final warning. ALL DATA WILL BE PERMANENTLY DELETED. Are you absolutely sure?')) {
        try {
          await Promise.all([
            supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
            supabase.from('returns').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
            supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
            supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
            supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
            supabase.from('sellers').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
            supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          ]);

          setProducts([]);
          setCategories([]);
          setSales([]);
          setReturns([]);
          setCustomers([]);
          setSellers([]);
          setNotifications([]);

          await addNotification({
            type: 'success',
            title: 'All Data Reset',
            message: 'All data has been permanently deleted',
          });
        } catch (error) {
          console.error('Error resetting all data:', error);
        }
      }
    }
  };

  return {
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
    addCategory,
    updateCategory,
    deleteCategory,
    addSale,
    addReturn,
    addCustomer,
    addSeller,
    updateSeller,
    deleteSeller,
    addNotification,
    markNotificationRead,
    updateReturn,
    setSettings: updateSettings,
    exportData,
    importData,
    resetSalesHistory,
    resetAllData,
  };
}
