import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          sku: string;
          barcode: string | null;
          category: string;
          price: number;
          cost: number;
          stock: number;
          min_stock: number;
          description: string;
          image: string | null;
          supplier: string | null;
          location: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      sales: {
        Row: {
          id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          discount: number;
          tax: number;
          total: number;
          profit: number;
          customer_id: string | null;
          customer_name: string | null;
          payment_method: string;
          date: string;
          status: string;
          seller_id: string | null;
          seller_name: string | null;
          location: string | null;
        };
        Insert: Omit<Database['public']['Tables']['sales']['Row'], 'id' | 'date'>;
        Update: Partial<Database['public']['Tables']['sales']['Insert']>;
      };
      returns: {
        Row: {
          id: string;
          sale_id: string | null;
          product_id: string | null;
          product_name: string;
          quantity: number;
          reason: string;
          refund_amount: number;
          date: string;
          status: string;
          processed_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['returns']['Row'], 'id' | 'date'>;
        Update: Partial<Database['public']['Tables']['returns']['Insert']>;
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          customer_type: string;
          credit_limit: number;
          current_credit: number;
          total_purchases: number;
          loyalty_points: number;
          created_at: string;
          last_purchase: string | null;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      sellers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          commission_rate: number | null;
          is_active: boolean;
          created_at: string;
          total_sales: number;
          total_revenue: number;
          total_profit: number;
        };
        Insert: Omit<Database['public']['Tables']['sellers']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sellers']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          type: string;
          title: string;
          message: string;
          date: string;
          read: boolean;
          user_id: string | null;
          action_url: string | null;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'date'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      settings: {
        Row: {
          id: string;
          currency: string;
          usd_to_iqd_rate: number;
          date_format: string;
          low_stock_threshold: number;
          company_name: string;
          company_address: string;
          company_phone: string;
          company_email: string;
          tax_rate: number;
          theme: string;
          language: string;
          auto_backup: boolean;
          backup_frequency: string;
          email_notifications: boolean;
          sms_notifications: boolean;
          last_seller: string | null;
        };
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['settings']['Insert']>;
      };
    };
  };
}
