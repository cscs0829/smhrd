-- Restore Excel IDs by adding original_id column back and mapping via titles
ALTER TABLE public.ep_data ADD COLUMN IF NOT EXISTS original_id text;

-- Add index for original_id
CREATE INDEX IF NOT EXISTS ep_data_original_id_idx ON public.ep_data (original_id);

-- Add comment to document the column purpose
COMMENT ON COLUMN public.ep_data.original_id IS 'Restored Excel file ID mapped via title matching';
