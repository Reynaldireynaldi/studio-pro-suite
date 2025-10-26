-- Create storage buckets first
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('headshots', 'headshots', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('cv-documents', 'cv-documents', false, 10485760, ARRAY['application/pdf']::text[]),
  ('company-logos', 'company-logos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']::text[])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for headshots
CREATE POLICY "Users can upload headshots" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'headshots' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their headshots" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'headshots' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their headshots" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'headshots' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for CV documents
CREATE POLICY "Users can upload cv docs" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'cv-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their cv docs" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'cv-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their cv docs" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'cv-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for company logos (public)
CREATE POLICY "Anyone can view company logos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'company-logos');

CREATE POLICY "Users can upload their company logo" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'company-logos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their company logo" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'company-logos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their company logo" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'company-logos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create company_profiles table
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  tax_id TEXT,
  bank_name TEXT,
  bank_account_name TEXT,
  bank_account_number TEXT,
  payment_terms_default TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(owner_id)
);

-- Create headshots table
CREATE TABLE IF NOT EXISTS public.headshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_file_url TEXT NOT NULL,
  variants_json JSONB,
  chosen_url TEXT,
  style TEXT,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cv_profiles table
CREATE TABLE IF NOT EXISTS public.cv_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT,
  summary TEXT,
  skills_json JSONB,
  education_json JSONB,
  selected_headshot_url TEXT,
  template_type TEXT DEFAULT 'minimal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cv_experiences table
CREATE TABLE IF NOT EXISTS public.cv_experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_profile_id UUID REFERENCES public.cv_profiles(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  description_bullets_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cv_projects table
CREATE TABLE IF NOT EXISTS public.cv_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_profile_id UUID REFERENCES public.cv_profiles(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  technologies_json JSONB,
  outcome TEXT,
  description_bullets_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  email TEXT,
  items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'draft',
  due_date DATE,
  notes TEXT,
  bill_to_name TEXT,
  bill_to_address TEXT,
  bill_to_email TEXT,
  bill_to_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.headshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_profiles
CREATE POLICY "Users can view their company profile" 
ON public.company_profiles FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their company profile" 
ON public.company_profiles FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their company profile" 
ON public.company_profiles FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their company profile" 
ON public.company_profiles FOR DELETE 
USING (auth.uid() = owner_id);

-- RLS policies for headshots
CREATE POLICY "Users can view their headshots" 
ON public.headshots FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their headshots" 
ON public.headshots FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their headshots" 
ON public.headshots FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their headshots" 
ON public.headshots FOR DELETE 
USING (auth.uid() = owner_id);

-- RLS policies for cv_profiles
CREATE POLICY "Users can view their cv profiles" 
ON public.cv_profiles FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their cv profiles" 
ON public.cv_profiles FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their cv profiles" 
ON public.cv_profiles FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their cv profiles" 
ON public.cv_profiles FOR DELETE 
USING (auth.uid() = owner_id);

-- RLS policies for cv_experiences
CREATE POLICY "Users can view their experiences" 
ON public.cv_experiences FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their experiences" 
ON public.cv_experiences FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their experiences" 
ON public.cv_experiences FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their experiences" 
ON public.cv_experiences FOR DELETE 
USING (auth.uid() = owner_id);

-- RLS policies for cv_projects
CREATE POLICY "Users can view their projects" 
ON public.cv_projects FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their projects" 
ON public.cv_projects FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their projects" 
ON public.cv_projects FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their projects" 
ON public.cv_projects FOR DELETE 
USING (auth.uid() = owner_id);

-- RLS policies for invoices
CREATE POLICY "Users can view their invoices" 
ON public.invoices FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their invoices" 
ON public.invoices FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their invoices" 
ON public.invoices FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their invoices" 
ON public.invoices FOR DELETE 
USING (auth.uid() = owner_id);

-- Create update timestamp function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_company_profiles_updated_at
BEFORE UPDATE ON public.company_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_headshots_updated_at
BEFORE UPDATE ON public.headshots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cv_profiles_updated_at
BEFORE UPDATE ON public.cv_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();