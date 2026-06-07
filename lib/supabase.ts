import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client (uses service role key — never expose to client)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type Citizen = {
  id: string;
  citizenship_number: string;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  science_field: string;
  vision: string;
  bio: string | null;
  projects: string | null;
  titles: string | null;
  status: 'pending' | 'approved' | 'rejected';
  payment_status: 'unpaid' | 'paid';
  created_at: string;
  avatar_url: string | null;
  access_code: string | null;
};

export type Application = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  science_field: string;
  vision: string;
  document_url: string | null;
  payment_intent_id: string | null;
  payment_status: 'unpaid' | 'paid';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export type ShopOrder = {
  id: string;
  citizen_id: string;
  item_id: string;
  item_name: string;
  price: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  shipping_address: string;
  created_at: string;
};
