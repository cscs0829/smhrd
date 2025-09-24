-- Update ep_data table to use UUID primary key
-- First, add a new UUID column
ALTER TABLE public.ep_data ADD COLUMN new_id uuid DEFAULT gen_random_uuid();

-- Update the new_id column to have unique values
UPDATE public.ep_data SET new_id = gen_random_uuid() WHERE new_id IS NULL;

-- Drop the old primary key constraint
ALTER TABLE public.ep_data DROP CONSTRAINT ep_data_pkey;

-- Drop the old id column
ALTER TABLE public.ep_data DROP COLUMN id;

-- Rename new_id to id
ALTER TABLE public.ep_data RENAME COLUMN new_id TO id;

-- Add primary key constraint
ALTER TABLE public.ep_data ADD PRIMARY KEY (id);

-- Update titles table to use UUID primary key
-- First, add a new UUID column
ALTER TABLE public.titles ADD COLUMN new_id uuid DEFAULT gen_random_uuid();

-- Update the new_id column to have unique values
UPDATE public.titles SET new_id = gen_random_uuid() WHERE new_id IS NULL;

-- Drop the old primary key constraint
ALTER TABLE public.titles DROP CONSTRAINT titles_pkey;

-- Drop the old id column
ALTER TABLE public.titles DROP COLUMN id;

-- Rename new_id to id
ALTER TABLE public.titles RENAME COLUMN new_id TO id;

-- Add primary key constraint
ALTER TABLE public.titles ADD PRIMARY KEY (id);

-- Add city column to titles if it doesn't exist
ALTER TABLE public.titles ADD COLUMN IF NOT EXISTS city text;

-- Update deleted_items table to use UUID for original_id
-- First, add a new UUID column
ALTER TABLE public.deleted_items ADD COLUMN new_original_id uuid;

-- Update the new_original_id column (this will need manual data migration)
-- For now, we'll set it to a random UUID, but in production you'd want to map the old text IDs
UPDATE public.deleted_items SET new_original_id = gen_random_uuid() WHERE new_original_id IS NULL;

-- Drop the old original_id column
ALTER TABLE public.deleted_items DROP COLUMN original_id;

-- Rename new_original_id to original_id
ALTER TABLE public.deleted_items RENAME COLUMN new_original_id TO original_id;

-- Make original_id NOT NULL
ALTER TABLE public.deleted_items ALTER COLUMN original_id SET NOT NULL;

-- Recreate the index
DROP INDEX IF EXISTS deleted_items_original_id_idx;
CREATE INDEX deleted_items_original_id_idx ON public.deleted_items (original_id);
