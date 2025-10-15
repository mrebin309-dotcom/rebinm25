# Inventory Management System - Desktop App

A complete inventory management solution built with React, TypeScript, and Electron. This desktop application helps you manage your inventory, track sales, analyze business performance, and much more - all completely offline and free to use!

## 🚀 Features

### 📦 **Inventory Management**
- Add, edit, and delete products
- Track stock levels with low stock alerts
- Organize products by categories
- Barcode support and SKU management
- Product images and detailed descriptions

### 💰 **Sales Management**
- Quick sale interface with product search
- Built-in calculator for quantities
- Customer management
- Multiple payment methods
- Sales history and tracking
- Date-specific sales entry

### 📊 **Analytics & Reports**
- Real-time dashboard with KPIs
- Sales analytics and trends
- Profit margin analysis by product
- Inventory turnover tracking
- Sales forecasting (7, 30, 90 days)
- Best/worst performing products
- Customer segmentation (RFM analysis)
- Business intelligence insights
- Customizable date ranges
- Professional invoice generation
- Receipt printing (thermal & standard)

### 👥 **Multi-User Support**
- User management with role-based permissions
- Activity logging and audit trails
- Seller performance tracking
- Commission calculations

### 🔄 **Advanced Features**
- Supabase database integration (cloud sync)
- User authentication system
- Returns management
- Mobile sync capabilities
- API integrations
- Data export/import (JSON, Excel, PDF)
- Multi-currency support (USD/IQD)
- Offline functionality (localStorage)
- Online functionality (Supabase)

## 🖥️ **Desktop App Benefits**

✅ **Completely Free** - No subscription fees or hidden costs
✅ **Offline First** - Works without internet connection
✅ **Your Data** - All data stored locally on your computer
✅ **Fast Performance** - Native desktop performance
✅ **Cross Platform** - Works on Windows, Mac, and Linux
✅ **No Ads** - Clean, professional interface
✅ **Privacy** - No data sent to external servers

## 🛠️ **Installation & Setup**

### **Development Mode**
```bash
# Install dependencies
npm install

# Run in development mode (web + electron)
npm run electron-dev
```

### **Build Desktop App**
```bash
# Build for production
npm run dist
```

This will create installers in the `release` folder:
- **Windows**: `.exe` installer
- **Mac**: `.dmg` installer  
- **Linux**: `.AppImage` file

### **Available Scripts**
- `npm run dev` - Start web development server
- `npm run electron` - Run Electron app
- `npm run electron-dev` - Development mode with hot reload
- `npm run build` - Build web app for production
- `npm run dist` - Build desktop installers
- `npm run electron-build` - Build Electron app only

## 📱 **How to Use**

### **Getting Started**
1. Launch the desktop app
2. Sign up for a new account or sign in
3. Start by adding your first product
4. Create a quick sale to test the system
5. Generate invoices and receipts
6. Explore the advanced analytics dashboard

### **Quick Actions**
- **Ctrl+N** - New Sale
- **Ctrl+P** - Add Product
- **Ctrl+1-4** - Navigate between views
- **Ctrl+E** - Export Data
- **Ctrl+I** - Import Data

### **Key Workflows**

#### **Adding Products**
1. Click "Add Product" or use Ctrl+P
2. Fill in product details (name, SKU, price, cost, stock)
3. Set minimum stock levels for alerts
4. Add product image (optional)
5. Save and start selling!

#### **Making Sales**
1. Click "Quick Sale" or use Ctrl+N
2. Search for products by name or SKU
3. Set quantity (use built-in calculator if needed)
4. Add customer info (optional)
5. Complete the sale

#### **Viewing Analytics**
1. Go to Analytics tab
2. Select date range
3. View sales trends, profit margins, and top products
4. Export reports as needed

## 💾 **Data Management**

### **Backup & Restore**
- **Export**: File → Export Data (saves JSON backup)
- **Import**: File → Import Data (restore from backup)
- **Auto-backup**: Enable in settings for automatic backups

### **Data Storage**
- **Cloud Mode (Default)**: Data stored in Supabase (PostgreSQL)
  - Multi-device sync
  - Real-time updates
  - Secure authentication
  - Automatic backups
- **Local Mode**: Data stored in browser's localStorage
  - Works offline
  - No account required
  - Manual backups needed
- Data persists between app restarts
- Easy to backup and transfer

## 🔧 **Configuration**

### **Settings**
- **Currency**: Switch between USD and IQD
- **Exchange Rates**: Set USD to IQD conversion
- **Company Info**: Customize company details
- **Alert Rules**: Configure low stock notifications
- **Date Formats**: Choose preferred date display

### **User Management**
- **Admin**: Full access to all features
- **Manager**: Product and sales management
- **Cashier**: Sales and basic inventory view
- **Viewer**: Read-only access

## 🌟 **Advanced Features**

### **Business Intelligence**
- Customer segmentation analysis
- Sales forecasting
- Performance goal tracking
- KPI monitoring
- Trend analysis

### **Mobile Integration**
- Export data for mobile use
- Sync between devices
- Offline mobile support

### **API Integration**
- Connect to external systems
- Shopify, WooCommerce integration
- Custom API endpoints
- Real-time data sync

## 🚀 **Why Choose This Solution?**

### **For Small Businesses**
- **No Monthly Fees** - One-time setup, lifetime use
- **Easy to Use** - Intuitive interface, no training needed
- **Complete Solution** - Everything you need in one app
- **Scalable** - Grows with your business

### **For Developers**
- **Open Source** - Full source code available
- **Customizable** - Modify to fit your needs
- **Modern Stack** - React, TypeScript, Electron
- **Well Documented** - Clear code structure

### **For Privacy-Conscious Users**
- **Local Data** - Nothing stored in the cloud
- **No Tracking** - No analytics or user tracking
- **Secure** - Your data stays on your computer
- **Reliable** - Works without internet

## 📞 **Support & Updates**

This is a complete, production-ready inventory management system that you can use immediately. The desktop app provides:

- **Professional Interface** - Clean, modern design
- **Reliable Performance** - Fast, responsive experience  
- **Complete Features** - Everything needed for inventory management
- **Free Forever** - No licensing fees or subscriptions

Perfect for retail stores, warehouses, small businesses, or anyone needing professional inventory management without the recurring costs of cloud-based solutions!

## 🏗️ **Technical Stack**

- **Frontend**: React 18 + TypeScript
- **Desktop**: Electron
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PDF Generation**: jsPDF
- **Reports**: html2canvas
- **Build**: Vite
- **Package**: Electron Builder

## 📄 **License**

This project is free to use for personal and commercial purposes. Feel free to modify and distribute as needed.

---

**Start managing your inventory professionally today - completely free! 🎉**