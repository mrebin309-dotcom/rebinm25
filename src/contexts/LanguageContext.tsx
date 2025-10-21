import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.title': 'Inventory Management System',
    'nav.dashboard': 'Dashboard',
    'nav.products': 'Products',
    'nav.sales': 'Sales',
    'nav.returns': 'Returns',
    'nav.reports': 'Reports',
    'nav.advancedReports': 'Advanced Reports',
    'nav.sellers': 'Seller Reports',
    'nav.users': 'Users',
    'nav.mobile': 'Mobile Sync',
    'nav.settings': 'Settings',
    'nav.notifications': 'Notifications',
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.loading': 'Loading...',
    'common.noData': 'No data available',
    'product.name': 'Product Name',
    'product.sku': 'SKU',
    'product.price': 'Price',
    'product.cost': 'Cost',
    'product.stock': 'Stock',
    'product.category': 'Category',
    'product.addProduct': 'Add Product',
    'product.editProduct': 'Edit Product',
    'sale.recordSale': 'Record Sale',
    'sale.customer': 'Customer',
    'sale.total': 'Total',
    'sale.date': 'Date',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.totalSales': 'Total Sales',
    'dashboard.lowStock': 'Low Stock Items',
    'dashboard.outOfStock': 'Out of Stock',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
];
