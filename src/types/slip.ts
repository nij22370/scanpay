export interface SlipData {
  transaction_id: string;
  transaction_number: string;
  created_at: string;
  store_name: string;
  store_address: string;
  store_phone: string;
  items: SlipItem[];
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  payment_method: string;
  cashier_name: string;
}

export interface SlipItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}
