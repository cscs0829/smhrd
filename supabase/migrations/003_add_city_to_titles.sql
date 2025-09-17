-- titles 테이블에 city 컬럼 추가
alter table public.titles 
  add column if not exists city text;

-- city 컬럼에 인덱스 추가
create index if not exists titles_city_idx on public.titles (lower(city));

-- city와 title 조합으로 중복 체크를 위한 복합 인덱스
create index if not exists titles_city_title_idx on public.titles (lower(city), lower(title));
