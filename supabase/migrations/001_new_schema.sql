-- 새로운 스키마: EP 데이터와 삭제된 아이템 관리
-- 기존 테이블들 삭제
DROP TABLE IF EXISTS public.city_images CASCADE;
DROP TABLE IF EXISTS public.titles CASCADE;
DROP TABLE IF EXISTS public.deleted_items CASCADE;

-- 기존 ep_data 테이블 구조 변경 (id, title만 유지)
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS price_pc;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS benefit_price;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS normal_price;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS link;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS mobile_link;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS image_link;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS add_image_link;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS video_url;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS category_name1;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS category_name2;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS category_name3;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS category_name4;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS brand;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS maker;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS origin;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS age_group;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS gender;
ALTER TABLE public.ep_data DROP COLUMN IF EXISTS city;

-- ep_data 테이블의 id를 text로 변경 (엑셀의 id와 매칭)
ALTER TABLE public.ep_data ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.ep_data ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.ep_data ADD CONSTRAINT ep_data_id_unique UNIQUE (id);

-- delete 테이블 생성 (삭제된 아이템 저장)
CREATE TABLE public.delete (
  id            bigserial primary key,
  product_id    text not null,  -- EP 데이터의 ID
  title         text not null,  -- 제목
  reason        text null,      -- 삭제 이유 (클릭수 0 등)
  created_at    timestamptz not null default now()
);

-- 인덱스 생성
CREATE INDEX delete_product_id_idx ON public.delete (product_id);
CREATE INDEX delete_created_at_idx ON public.delete (created_at);

-- RLS 설정
ALTER TABLE public.delete ENABLE ROW LEVEL SECURITY;

-- 정책 설정
CREATE POLICY delete_read ON public.delete FOR SELECT USING (true);
CREATE POLICY delete_write ON public.delete FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- 기존 인덱스 삭제 및 새로 생성
DROP INDEX IF EXISTS public.ep_data_city_idx;
DROP INDEX IF EXISTS public.ep_data_updated_at_idx;

CREATE INDEX ep_data_id_idx ON public.ep_data (id);
CREATE INDEX ep_data_title_idx ON public.ep_data (lower(title));
CREATE INDEX ep_data_updated_at_idx ON public.ep_data (updated_at);
