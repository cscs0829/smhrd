-- 테이블 이름 수정 및 ID 타입 변경
-- 1. delete 테이블을 deleted_items로 이름 변경
ALTER TABLE public.delete RENAME TO deleted_items;

-- 2. deleted_items 테이블의 컬럼명 수정
ALTER TABLE public.deleted_items RENAME COLUMN product_id TO original_id;
ALTER TABLE public.deleted_items ADD COLUMN original_data jsonb;

-- 3. ep_data 테이블의 ID를 text로 변경 (이미 되어 있을 수 있음)
-- UUID 기본값 제거
ALTER TABLE public.ep_data ALTER COLUMN id DROP DEFAULT;

-- 4. 기존 데이터 정리 (테스트 데이터 삭제)
DELETE FROM public.ep_data;
DELETE FROM public.deleted_items;
DELETE FROM public.api_keys;

-- 5. 인덱스 재생성
DROP INDEX IF EXISTS public.delete_product_id_idx;
DROP INDEX IF EXISTS public.delete_created_at_idx;

CREATE INDEX deleted_items_original_id_idx ON public.deleted_items (original_id);
CREATE INDEX deleted_items_created_at_idx ON public.deleted_items (created_at);

-- 6. RLS 정책 업데이트
DROP POLICY IF EXISTS delete_read ON public.deleted_items;
DROP POLICY IF EXISTS delete_write ON public.deleted_items;

CREATE POLICY deleted_items_read ON public.deleted_items FOR SELECT USING (true);
CREATE POLICY deleted_items_write ON public.deleted_items FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- 7. 시퀀스 리셋
ALTER SEQUENCE public.deleted_items_id_seq RESTART WITH 1;
