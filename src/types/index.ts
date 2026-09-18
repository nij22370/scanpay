export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost_price: number;
  stock: number;
  category: string | null;
  barcode: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  transaction_number: string;
  amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  payment_provider: string | null;
  payment_status: string;
  status: string;
  customer_name: string | null;
  customer_phone: string | null;
  notes: string | null;
  slip_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SplitSession {
  id: string;
  transaction_id: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SplitParticipant {
  id: string;
  split_session_id: string;
  user_id: string;
  assigned_amount: number;
  paid_amount: number;
  is_paid: boolean;
  paid_at: string | null;
  created_at: string;
}
