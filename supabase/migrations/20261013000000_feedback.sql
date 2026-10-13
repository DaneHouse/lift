-- LIFT: in-app bug reports and feedback. Anyone with the app can send one; nobody can read them
-- through the public API (only the project owner, with the service role, in the dashboard / CLI).
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  message text not null check (char_length(message) between 1 and 4000),
  screen text check (char_length(screen) <= 200),
  app_version text check (char_length(app_version) <= 40),
  device text check (char_length(device) <= 200),
  screenshot text check (char_length(screenshot) <= 300)
);
alter table public.feedback enable row level security;
drop policy if exists "anyone can send feedback" on public.feedback;
create policy "anyone can send feedback" on public.feedback for insert to anon, authenticated with check (true);

-- Screenshots attached to a report: upload only, never listed or read publicly.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('feedback', 'feedback', false, 8388608, array['image/png', 'image/jpeg', 'image/heic', 'image/webp'])
on conflict (id) do nothing;
drop policy if exists "anyone can upload a feedback screenshot" on storage.objects;
create policy "anyone can upload a feedback screenshot" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'feedback');
