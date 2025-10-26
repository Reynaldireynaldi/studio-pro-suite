-- Add new fields to invoices table for enhanced invoice functionality
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS service_description TEXT,
ADD COLUMN IF NOT EXISTS offer_proposal TEXT,
ADD COLUMN IF NOT EXISTS attachments_json JSONB DEFAULT '[]'::jsonb;

-- Add comment to describe new fields
COMMENT ON COLUMN public.invoices.service_description IS 'Description of services provided';
COMMENT ON COLUMN public.invoices.offer_proposal IS 'Proposal or offer details';
COMMENT ON COLUMN public.invoices.attachments_json IS 'Array of attachment URLs (PDF files)';