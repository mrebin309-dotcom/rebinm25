import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Product,
  Sale,
  Return,
  Customer,
  Category,
  Seller,
  Settings,
} from '../types';

export function useInventorySupabase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [returns, setReturns] = useState<Return[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [settings, setSettings] = useState<Settings>({
    currency: 'USD',
    usdToIqdRate: 1320,
    dateFormat: 'MM/dd/yyyy',
    lowStockThreshold: 10,
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    taxRate: 0,
    theme: 'light',
    language: 'en',
    autoBackup: false,
    backupFrequency: 'daily',
    emailNotifications: true,
    smsNotifications: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
    const unsubscribe = setupRealtimeSubscriptions();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadProducts(),
        loadSales(),
        loadReturns(),
        loadCustomers(),
        loadCategories(),
        loadSellers(),
        loadSettings(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(
        data.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          barcode: p.barcode,
          category: p.category,
          price: parseFloat(p.price),
          cost: parseFloat(p.cost),
          stock: p.stock,
          minStock: p.min_stock,
          description: p.description,
          image: p.image,
          supplier: p.supplier,
          location: p.location,
          createdAt: new Date(p.created_at),
          updatedAt: new Date(p.updated_at),
          createdBy: p.created_by,
          updatedBy: p.updated_by,
        }))
      );
    }
  };

  const loadSales = async () => {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSales(
        data.map((s) => ({
          id: s.id,
          productId: s.product_id,
          productName: s.product_name,
          quantity: s.quantity,
          unitPrice: parseFloat(s.unit_price),
          discount: parseFloat(s.discount),
          tax: parseFloat(s.tax),
          total: parseFloat(s.total),
          profit: parseFloat(s.profit),
          customerId: s.customer_id,
          customerName: s.customer_name,
          paymentMethod: s.payment_method,
          date: new Date(s.created_at),
          status: s.status,
          sellerId: s.seller_id,
          sellerName: s.seller_name,
          location: s.location,
        }))
      );
    }
  };

  const loadReturns = async () => {
    const { data, error } = await supabase
      .from('returns')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReturns(
        data.map((r) => ({
          id: r.id,
          saleId: r.sale_id,
          productId: r.product_id,
          productName: r.product_name,
          quantity: r.quantity,
          reason: r.reason,
          refundAmount: parseFloat(r.refund_amount),
          date: new Date(r.created_at),
          status: r.status,
          processedBy: r.processed_by,
        }))
      );
    }
  };

  const loadCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCustomers(
        data.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          address: c.address,
          customerType: c.customer_type,
          creditLimit: parseFloat(c.credit_limit),
          currentCredit: parseFloat(c.current_credit),
          totalPurchases: parseFloat(c.total_purchases),
          loyaltyPoints: c.loyalty_points,
          createdAt: new Date(c.created_at),
          lastPurchase: c.last_purchase ? new Date(c.last_purchase) : undefined,
        }))
      );
    }
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data) {
      setCategories(
        data.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
        }))
      );
    }
  };

  const loadSellers = async () => {
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSellers(
        data.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          phone: s.phone,
          commissionRate: s.commission_rate ? parseFloat(s.commission_rate) : undefined,
          isActive: s.is_active,
          createdAt: new Date(s.created_at),
          totalSales: s.total_sales,
          totalRevenue: parseFloat(s.total_revenue),
          totalProfit: parseFloat(s.total_profit),
        }))
      );
    }
  };

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .maybeSingle();

    if (!error && data) {
      setSettings({
        currency: data.currency,
        usdToIqdRate: parseFloat(data.usd_to_iqd_rate),
        dateFormat: data.date_format,
        lowStockThreshold: data.low_stock_threshold,
        companyName: data.company_name,
        companyAddress: data.company_address,
        companyPhone: data.company_phone,
        companyEmail: data.company_email,
        taxRate: parseFloat(data.tax_rate),
        theme: data.theme,
        language: data.language,
        autoBackup: data.auto_backup,
        backupFrequency: data.backup_frequency,
        emailNotifications: data.email_notifications,
        smsNotifications: data.sms_notifications,
        lastSeller: data.last_seller,
      });
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!supabase) return;

    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadProducts();
      })
      .subscribe();

    const salesChannel = supabase
      .channel('sales-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
        loadSales();
      })
      .subscribe();

    const returnsChannel = supabase
      .channel('returns-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'returns' }, () => {
        loadReturns();
      })
      .subscribe();

    const customersChannel = supabase
      .channel('customers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
        loadCustomers();
      })
      .subscribe();

    const categoriesChannel = supabase
      .channel('categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        loadCategories();
      })
      .subscribe();

    const sellersChannel = supabase
      .channel('sellers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sellers' }, () => {
        loadSellers();
      })
      .subscribe();

    const settingsChannel = supabase
      .channel('settings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        loadSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(salesChannel);
      supabase.removeChannel(returnsChannel);
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(categoriesChannel);
      supabase.removeChannel(sellersChannel);
      supabase.removeChannel(settingsChannel);
    };
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const existingProduct = await supabase
      .from('products')
      .select('id')
      .eq('sku', productData.sku)
      .maybeSingle();

    if (existingProduct.data) {
      const timestamp = Date.now().toString().slice(-4);
      productData.sku = `${productData.sku}-${timestamp}`;
    }

    if (productData.category) {
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('name', productData.category)
        .maybeSingle();

      if (!existingCategory) {
        await supabase
          .from('categories')
          .insert({
            name: productData.category,
            description: '',
          });
      }
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        sku: productData.sku,
        barcode: productData.barcode,
        category: productData.category,
        price: productData.price,
        cost: productData.cost,
        stock: productData.stock,
        min_stock: productData.minStock,
        description: productData.description,
        image: productData.image,
        supplier: productData.supplier,
        location: productData.location,
      })
      .select()
      .single();

    if (!error && data) {
      await loadProducts();
      await loadCategories();
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const { error } = await supabase
      .from('products')
      .update({
        name: productData.name,
        sku: productData.sku,
        barcode: productData.barcode,
        category: productData.category,
        price: productData.price,
        cost: productData.cost,
        stock: productData.stock,
        min_stock: productData.minStock,
        description: productData.description,
        image: productData.image,
        supplier: productData.supplier,
        location: productData.location,
      })
      .eq('id', id);

    if (!error) {
      await loadProducts();
    }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (!error) {
      await loadProducts();
    }
  };

  const addSale = async (saleData: Omit<Sale, 'id' | 'date'>) => {
    const { error } = await supabase.from('sales').insert({
      product_id: saleData.productId,
      product_name: saleData.productName,
      quantity: saleData.quantity,
      unit_price: saleData.unitPrice,
      discount: saleData.discount,
      tax: saleData.tax,
      total: saleData.total,
      profit: saleData.profit,
      customer_id: saleData.customerId,
      customer_name: saleData.customerName,
      payment_method: saleData.paymentMethod,
      status: saleData.status,
      seller_id: saleData.sellerId,
      seller_name: saleData.sellerName,
      location: saleData.location,
    });

    if (!error) {
      await Promise.all([loadSales(), loadProducts()]);
    }
  };

  const updateSettings = async (newSettings: Settings) => {
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .maybeSingle();

    const settingsData = {
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
      last_seller: newSettings.lastSeller,
    };

    const { error } = existing
      ? await supabase.from('settings').update(settingsData).eq('id', existing.id)
      : await supabase.from('settings').insert(settingsData);

    if (!error) {
      setSettings(newSettings);
    }
  };

  const addReturn = async (returnData: Omit<Return, 'id' | 'date'>) => {
    const { error } = await supabase.from('returns').insert({
      sale_id: returnData.saleId,
      product_id: returnData.productId,
      product_name: returnData.productName,
      quantity: returnData.quantity,
      reason: returnData.reason,
      refund_amount: returnData.refundAmount,
      status: returnData.status,
      processed_by: returnData.processedBy,
    });

    if (!error) {
      await loadReturns();
    }
  };

  const updateReturn = async (id: string, returnData: Partial<Return>) => {
    const { error } = await supabase
      .from('returns')
      .update({
        status: returnData.status,
        processed_by: returnData.processedBy,
      })
      .eq('id', id);

    if (!error) {
      await loadReturns();
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases'>) => {
    const { error } = await supabase.from('customers').insert({
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      customer_type: customerData.customerType,
      credit_limit: customerData.creditLimit,
      current_credit: customerData.currentCredit,
      loyalty_points: customerData.loyaltyPoints || 0,
      total_purchases: 0,
    });

    if (!error) {
      await loadCustomers();
    }
  };

  const addSeller = async (sellerData: Omit<Seller, 'id' | 'createdAt' | 'totalSales' | 'totalRevenue' | 'totalProfit'>) => {
    const { error } = await supabase.from('sellers').insert({
      name: sellerData.name,
      email: sellerData.email,
      phone: sellerData.phone,
      commission_rate: sellerData.commissionRate,
      is_active: sellerData.isActive,
      total_sales: 0,
      total_revenue: 0,
      total_profit: 0,
    });

    if (!error) {
      await loadSellers();
    }
  };

  const exportData = () => {
    return {
      products,
      sales,
      returns,
      customers,
      sellers,
      settings,
      exportDate: new Date().toISOString(),
    };
  };

  const importData = async (data: any) => {
    try {
      if (data.products && Array.isArray(data.products)) {
        for (const product of data.products) {
          const productData = {
            id: product.id,
            name: product.name,
            sku: product.sku,
            barcode: product.barcode || null,
            category: product.category,
            price: parseFloat(product.price),
            cost: parseFloat(product.cost),
            stock: parseInt(product.stock),
            min_stock: parseInt(product.minStock || product.min_stock || 0),
            description: product.description || null,
            image: product.image || null,
            supplier: product.supplier || null,
            location: product.location || null,
          };

          const { error } = await supabase
            .from('products')
            .upsert(productData, { onConflict: 'id' });

          if (error) {
            console.error('Error importing product:', error);
          }
        }
      }

      if (data.sales && Array.isArray(data.sales)) {
        for (const sale of data.sales) {
          const saleData = {
            id: sale.id,
            product_id: sale.productId || sale.product_id,
            quantity: parseInt(sale.quantity),
            unit_price: parseFloat(sale.unitPrice || sale.unit_price),
            total_amount: parseFloat(sale.totalAmount || sale.total_amount),
            payment_method: sale.paymentMethod || sale.payment_method,
            customer_id: sale.customerId || sale.customer_id || null,
            seller_id: sale.sellerId || sale.seller_id || null,
            notes: sale.notes || null,
            created_at: sale.createdAt || sale.created_at || new Date().toISOString(),
          };

          const { error } = await supabase
            .from('sales')
            .upsert(saleData, { onConflict: 'id' });

          if (error) {
            console.error('Error importing sale:', error);
          }
        }
      }

      if (data.returns && Array.isArray(data.returns)) {
        for (const returnItem of data.returns) {
          const returnData = {
            id: returnItem.id,
            sale_id: returnItem.saleId || returnItem.sale_id,
            product_id: returnItem.productId || returnItem.product_id,
            quantity: parseInt(returnItem.quantity),
            reason: returnItem.reason,
            status: returnItem.status,
            refund_amount: parseFloat(returnItem.refundAmount || returnItem.refund_amount),
            created_at: returnItem.createdAt || returnItem.created_at || new Date().toISOString(),
          };

          const { error } = await supabase
            .from('returns')
            .upsert(returnData, { onConflict: 'id' });

          if (error) {
            console.error('Error importing return:', error);
          }
        }
      }

      if (data.customers && Array.isArray(data.customers)) {
        for (const customer of data.customers) {
          const customerData = {
            id: customer.id,
            name: customer.name,
            email: customer.email || null,
            phone: customer.phone || null,
            address: customer.address || null,
            loyalty_points: parseInt(customer.loyaltyPoints || customer.loyalty_points || 0),
            total_purchases: parseFloat(customer.totalPurchases || customer.total_purchases || 0),
          };

          const { error } = await supabase
            .from('customers')
            .upsert(customerData, { onConflict: 'id' });

          if (error) {
            console.error('Error importing customer:', error);
          }
        }
      }

      if (data.sellers && Array.isArray(data.sellers)) {
        for (const seller of data.sellers) {
          const sellerData = {
            id: seller.id,
            name: seller.name,
            email: seller.email || null,
            phone: seller.phone || null,
            commission_rate: parseFloat(seller.commissionRate || seller.commission_rate || 0),
            is_active: seller.isActive !== undefined ? seller.isActive : seller.is_active !== undefined ? seller.is_active : true,
            total_sales: parseInt(seller.totalSales || seller.total_sales || 0),
            total_revenue: parseFloat(seller.totalRevenue || seller.total_revenue || 0),
            total_profit: parseFloat(seller.totalProfit || seller.total_profit || 0),
          };

          const { error } = await supabase
            .from('sellers')
            .upsert(sellerData, { onConflict: 'id' });

          if (error) {
            console.error('Error importing seller:', error);
          }
        }
      }

      if (data.categories && Array.isArray(data.categories)) {
        for (const category of data.categories) {
          const categoryData = {
            id: category.id,
            name: category.name,
            description: category.description || null,
          };

          const { error } = await supabase
            .from('categories')
            .upsert(categoryData, { onConflict: 'id' });

          if (error) {
            console.error('Error importing category:', error);
          }
        }
      }

      if (data.settings) {
        await updateSettings(data.settings);
      }

      await loadAllData();
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  };

  const resetSalesHistory = async () => {
    const { error } = await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (!error) {
      await loadSales();
    }
  };

  const resetAllData = async () => {
    await Promise.all([
      supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('returns').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('sellers').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    ]);
    await loadAllData();
  };

  const refreshData = async () => {
    await loadAllData();
  };

  return {
    products,
    sales,
    returns,
    customers,
    categories,
    sellers,
    settings,
    loading,
    notifications: [],
    alertRules: [],
    addProduct,
    updateProduct,
    deleteProduct,
    addSale,
    addReturn,
    updateReturn,
    addCustomer,
    addSeller,
    setSettings: updateSettings,
    markNotificationRead: () => {},
    exportData,
    importData,
    resetSalesHistory,
    resetAllData,
    loadProducts,
    loadSales,
    refreshData,
  };
}
