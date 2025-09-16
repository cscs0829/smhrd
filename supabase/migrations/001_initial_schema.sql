-- 1) ep_data: product master
create table public.ep_data (
  id               text primary key,
  title            text not null,
  price_pc         numeric null,
  benefit_price    numeric null,
  normal_price     numeric null,
  link             text null,
  mobile_link      text null,
  image_link       text null,
  add_image_link   text null,
  video_url        text null,
  category_name1   text null,
  category_name2   text null,
  category_name3   text null,
  category_name4   text null,
  brand            text null,
  maker            text null,
  origin           text null,
  age_group        text null,
  gender           text null,
  city             text null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 2) city_images: image pool per city
create table public.city_images (
  id             bigserial primary key,
  city           text not null,
  image_link     text not null,
  is_main_image  int  not null default 2, -- 1: main / 2: additional
  video_url      text null,
  created_at     timestamptz not null default now()
);
create index city_images_city_idx on public.city_images (lower(city));

-- 3) titles: generated titles for duplication checks
create table public.titles (
  id         text not null,
  title      text not null,
  created_at timestamptz not null default now()
);
create index titles_title_lower_idx on public.titles (lower(title));

-- 4) deleted_items: backup of removed items
create table public.deleted_items (
  id            bigserial primary key,
  original_id   text not null,
  original_data jsonb not null,
  reason        text null,
  created_at    timestamptz not null default now()
);
create index deleted_items_original_id_idx on public.deleted_items (original_id);

-- 5) api_keys: optional API key management
create table public.api_keys (
  id           bigserial primary key,
  provider     text not null check (provider in ('openai','gemini')),
  name         text not null,
  description  text null,
  api_key      text not null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz null,
  usage_count  int not null default 0
);

-- 6) ai_model_settings: optional default AI settings
create table public.ai_model_settings (
  id            bigserial primary key,
  default_model text not null default 'gpt-4o-mini',
  temperature   numeric not null default 0.7,
  max_tokens    int not null default 100,
  updated_at    timestamptz not null default now()
);

-- Recommended indexes
create index ep_data_city_idx on public.ep_data (lower(city));
create index ep_data_updated_at_idx on public.ep_data (updated_at);

-- RLS: public read, write via service role
alter table public.ep_data enable row level security;
alter table public.city_images enable row level security;
alter table public.titles enable row level security;
alter table public.deleted_items enable row level security;
alter table public.api_keys enable row level security;
alter table public.ai_model_settings enable row level security;

create policy ep_data_read on public.ep_data for select using (true);
create policy city_images_read on public.city_images for select using (true);
create policy titles_read on public.titles for select using (true);

create policy ep_data_write on public.ep_data for all to authenticated using (false) with check (false);
create policy city_images_write on public.city_images for all to authenticated using (false) with check (false);
create policy titles_write on public.titles for all to authenticated using (false) with check (false);
create policy deleted_items_write on public.deleted_items for all to authenticated using (false) with check (false);
create policy api_keys_write on public.api_keys for all to authenticated using (false) with check (false);
create policy ai_model_settings_write on public.ai_model_settings for all to authenticated using (false) with check (false);


