-- LIFT: one inbox for everything testers tell us: bugs, ideas, and the "what do you want from a
-- workout app" survey. Still insert-only for the app.
alter table public.feedback add column if not exists kind text not null default 'bug';
alter table public.feedback drop constraint if exists feedback_kind_check;
alter table public.feedback add constraint feedback_kind_check check (kind in ('bug', 'idea', 'survey'));
alter table public.feedback add column if not exists answers jsonb;
alter table public.feedback add column if not exists name text check (char_length(name) <= 80);
