-- Remove original_id column from ep_data table since original Excel IDs cannot be restored
DROP INDEX IF EXISTS ep_data_original_id_idx;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS original_id;
