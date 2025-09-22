-- Add original_id column to ep_data table to preserve Excel ID for data tracking
ALTER TABLE public.ep_data ADD COLUMN IF NOT EXISTS original_id text;

-- Add index for original_id for faster lookups
CREATE INDEX IF NOT EXISTS ep_data_original_id_idx ON public.ep_data (original_id);

-- Update existing records to have original_id as the current UUID (temporary)
-- This is a placeholder - in production you'd want to map back to actual Excel IDs
UPDATE public.ep_data SET original_id = id::text WHERE original_id IS NULL;

-- Add comment to document the column purpose
COMMENT ON COLUMN public.ep_data.original_id IS 'Original Excel file ID for data tracking and matching';
