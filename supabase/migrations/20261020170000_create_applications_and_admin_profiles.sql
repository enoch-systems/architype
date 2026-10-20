create extension if not exists pgcrypto with schema extensions;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(btrim(full_name)) between 2 and 160),
  email text not null check (email = btrim(email) and position('@' in email) > 1),
  whatsapp_number text not null check (char_length(btrim(whatsapp_number)) between 7 and 32),
  sex text not null check (sex in ('Male', 'Female')),
  country text not null check (country in ('Nigeria', 'South Africa', 'Egypt', 'Kenya', 'Morocco', 'Ethiopia', 'Algeria')),
  course text not null check (course in (
    'Cybersecurity', 'UI/UX Design', 'Cloud Computing', 'Web Development',
    'Data Analysis', 'AI Video Creation', 'AI Automation', 'AI Agent Development',
    'Backend Development', 'Frontend Development', 'Ethical Hacking'
  )),
  employment_status text not null check (employment_status in ('Employed', 'Unemployed', 'Student', 'Freelancer')),
  has_laptop text not null check (has_laptop in ('Yes', 'No')),
  motivation text not null check (char_length(btrim(motivation)) between 10 and 5000),
  status text not null default 'new' check (status in ('new', 'contacted', 'enrolled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_created_at_desc_idx on public.applications (created_at desc);
create index if not exists applications_course_idx on public.applications (course);
create index if not exists applications_status_idx on public.applications (status);
create index if not exists applications_email_idx on public.applications (lower(email));

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  phone_number text not null default '',
  role text not null check (role in ('owner', 'admin', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.current_admin_role()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

drop trigger if exists admin_profiles_set_updated_at on public.admin_profiles;
create trigger admin_profiles_set_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

alter table public.applications enable row level security;
alter table public.admin_profiles enable row level security;

drop policy if exists "public can submit applications" on public.applications;
create policy "public can submit applications"
on public.applications for insert
to anon, authenticated
with check (true);

drop policy if exists "admins can read applications" on public.applications;
create policy "admins can read applications"
on public.applications for select
to authenticated
using (public.current_admin_role() in ('owner', 'admin', 'viewer'));

drop policy if exists "admins can update applications" on public.applications;
create policy "admins can update applications"
on public.applications for update
to authenticated
using (public.current_admin_role() in ('owner', 'admin'))
with check (public.current_admin_role() in ('owner', 'admin'));

drop policy if exists "owner can delete applications" on public.applications;
create policy "owner can delete applications"
on public.applications for delete
to authenticated
using (public.current_admin_role() = 'owner');

drop policy if exists "admins can read admin profiles" on public.admin_profiles;
create policy "admins can read admin profiles"
on public.admin_profiles for select
to authenticated
using (public.current_admin_role() in ('owner', 'admin', 'viewer'));

drop policy if exists "admins can update own profile" on public.admin_profiles;
create policy "admins can update own profile"
on public.admin_profiles for update
to authenticated
using (user_id = (select auth.uid()) and role = public.current_admin_role())
with check (user_id = (select auth.uid()) and role = public.current_admin_role());

revoke all on public.applications from anon, authenticated;
revoke all on public.admin_profiles from anon, authenticated;
grant insert (full_name, email, whatsapp_number, sex, country, course, employment_status, has_laptop, motivation)
  on public.applications to anon, authenticated;
grant select on public.applications to authenticated;
grant update (status, updated_at) on public.applications to authenticated;
grant delete on public.applications to authenticated;
grant select on public.admin_profiles to authenticated;
grant update (full_name, phone_number, updated_at) on public.admin_profiles to authenticated;
grant execute on function public.current_admin_role() to authenticated;