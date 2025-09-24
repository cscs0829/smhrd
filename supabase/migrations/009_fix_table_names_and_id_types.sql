-- 테이블 이름 수정 및 ID 타입 변경
-- 1. delete 테이블이 존재하는 경우에만 이름 변경
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'delete') THEN
        ALTER TABLE public.delete RENAME TO deleted_items;
    END IF;
END $$;

-- 2. deleted_items 테이블이 존재하는 경우에만 컬럼 수정
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deleted_items') THEN
        -- product_id 컬럼이 존재하는 경우에만 이름 변경
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'deleted_items' AND column_name = 'product_id') THEN
            ALTER TABLE public.deleted_items RENAME COLUMN product_id TO original_id;
        END IF;
        
        -- original_data 컬럼이 존재하지 않는 경우에만 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'deleted_items' AND column_name = 'original_data') THEN
            ALTER TABLE public.deleted_items ADD COLUMN original_data jsonb;
        END IF;
    END IF;
END $$;

-- 3. ep_data 테이블의 ID를 text로 변경 (이미 되어 있을 수 있음)
-- UUID 기본값 제거
ALTER TABLE public.ep_data ALTER COLUMN id DROP DEFAULT;

-- 4. 기존 데이터 정리 (테스트 데이터 삭제)
DO $$
BEGIN
    -- ep_data 테이블이 존재하는 경우에만 데이터 삭제
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ep_data') THEN
        DELETE FROM public.ep_data;
    END IF;
    
    -- deleted_items 테이블이 존재하는 경우에만 데이터 삭제
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deleted_items') THEN
        DELETE FROM public.deleted_items;
    END IF;
    
    -- api_keys 테이블이 존재하는 경우에만 데이터 삭제
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'api_keys') THEN
        DELETE FROM public.api_keys;
    END IF;
END $$;

-- 5. 인덱스 재생성
DROP INDEX IF EXISTS public.delete_product_id_idx;
DROP INDEX IF EXISTS public.delete_created_at_idx;
DROP INDEX IF EXISTS public.deleted_items_original_id_idx;
DROP INDEX IF EXISTS public.deleted_items_created_at_idx;

-- 인덱스가 존재하지 않는 경우에만 생성
DO $$
BEGIN
    -- deleted_items 테이블이 존재하는 경우에만 인덱스 생성
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deleted_items') THEN
        -- original_id 컬럼이 존재하는 경우에만 인덱스 생성
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'deleted_items' AND column_name = 'original_id') THEN
            CREATE INDEX IF NOT EXISTS deleted_items_original_id_idx ON public.deleted_items (original_id);
        END IF;
        
        -- created_at 컬럼이 존재하는 경우에만 인덱스 생성
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'deleted_items' AND column_name = 'created_at') THEN
            CREATE INDEX IF NOT EXISTS deleted_items_created_at_idx ON public.deleted_items (created_at);
        END IF;
    END IF;
END $$;

-- 6. RLS 정책 업데이트
DROP POLICY IF EXISTS delete_read ON public.deleted_items;
DROP POLICY IF EXISTS delete_write ON public.deleted_items;

CREATE POLICY deleted_items_read ON public.deleted_items FOR SELECT USING (true);
CREATE POLICY deleted_items_write ON public.deleted_items FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- 7. 시퀀스 리셋 (시퀀스가 존재하는 경우에만)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'deleted_items_id_seq') THEN
        ALTER SEQUENCE public.deleted_items_id_seq RESTART WITH 1;
    END IF;
END $$;
