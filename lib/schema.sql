-- ============================================================
-- LIMANOVA DATABASE SCHEMA
-- Run this in your Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- Applications table (before citizenship is granted)
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  science_field TEXT NOT NULL,
  vision TEXT NOT NULL,
  document_url TEXT,
  payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Citizens table (approved applicants)
CREATE TABLE citizens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  citizenship_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  science_field TEXT NOT NULL,
  vision TEXT NOT NULL,
  bio TEXT,
  projects TEXT,
  titles TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'approved',
  auth_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shop orders table
CREATE TABLE shop_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  citizen_id UUID REFERENCES citizens(id),
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered')),
  shipping_address TEXT NOT NULL,
  payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Citizenship number sequence
CREATE SEQUENCE citizenship_number_seq START 1000;

-- Function to auto-generate citizenship numbers
CREATE OR REPLACE FUNCTION generate_citizenship_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'LMN-' || LPAD(nextval('citizenship_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-assign citizenship number on insert
CREATE OR REPLACE FUNCTION set_citizenship_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.citizenship_number IS NULL OR NEW.citizenship_number = '' THEN
    NEW.citizenship_number := generate_citizenship_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_citizen_insert
  BEFORE INSERT ON citizens
  FOR EACH ROW EXECUTE FUNCTION set_citizenship_number();

-- Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application
CREATE POLICY "Anyone can apply" ON applications
  FOR INSERT WITH CHECK (true);

-- Citizens can see their own application
CREATE POLICY "Citizens see own application" ON applications
  FOR SELECT USING (email = auth.jwt() ->> 'email');

-- Citizens can see all other citizens (public profiles)
CREATE POLICY "Public citizen profiles" ON citizens
  FOR SELECT USING (true);

-- Citizens can update their own profile
CREATE POLICY "Citizens update own profile" ON citizens
  FOR UPDATE USING (auth_user_id = auth.uid());

-- Citizens can see own orders
CREATE POLICY "Citizens see own orders" ON shop_orders
  FOR SELECT USING (citizen_id IN (
    SELECT id FROM citizens WHERE auth_user_id = auth.uid()
  ));

-- Citizens can create orders
CREATE POLICY "Citizens create orders" ON shop_orders
  FOR INSERT WITH CHECK (citizen_id IN (
    SELECT id FROM citizens WHERE auth_user_id = auth.uid()
  ));

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Anyone can upload documents (application uploads)
CREATE POLICY "Anyone can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents');

-- Avatars are public
CREATE POLICY "Avatars are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Citizens can upload their own avatar
CREATE POLICY "Citizens upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
