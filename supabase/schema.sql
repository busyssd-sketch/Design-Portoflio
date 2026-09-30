-- ============================================================================
-- Portfolio CMS schema (JSON-snapshot model)
--
-- Run this once in the Supabase SQL editor for a new project.
-- The CMS stores the entire site as a single JSONB blob per "kind":
--     kind = 'draft'      → editable in /cms
--     kind = 'published'  → visible on the public site
-- ============================================================================

create table if not exists public.site_content (
  kind        text        primary key check (kind in ('draft', 'published')),
  data        jsonb       not null,
  updated_at  timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- Public site can read the "published" row anonymously.
drop policy if exists "public read published" on public.site_content;
create policy "public read published"
  on public.site_content
  for select
  using (kind = 'published');

-- Authenticated CMS users can read either row.
drop policy if exists "auth read all" on public.site_content;
create policy "auth read all"
  on public.site_content
  for select
  to authenticated
  using (true);

-- Authenticated CMS users can insert/update either row.
drop policy if exists "auth write all" on public.site_content;
create policy "auth write all"
  on public.site_content
  for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================================
-- Storage bucket for images + videos ("media")
--
-- After running this SQL, also flip the bucket to "public" in Supabase
-- dashboard → Storage → media → Settings, or run:
--     update storage.buckets set public = true where id = 'media';
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- Public read on the media bucket.
drop policy if exists "media public read" on storage.objects;
create policy "media public read"
  on storage.objects
  for select
  using (bucket_id = 'media');

-- Authenticated users can upload / replace / delete files in the media bucket.
drop policy if exists "media auth write" on storage.objects;
create policy "media auth write"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');
