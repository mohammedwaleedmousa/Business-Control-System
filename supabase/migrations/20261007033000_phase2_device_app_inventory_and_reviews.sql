-- Phase 2: approved app catalog, installed-app inventory, and human review workflow.
-- Provider ingestion must use a trusted server-side integration with service_role.
-- No foreground app, account identity, message content, or usage duration is collected.

create table if not exists public.approved_device_apps (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  bundle_id text not null check (length(trim(bundle_id)) between 1 and 255),
  display_name text not null check (length(trim(display_name)) between 1 and 160),
  required boolean not null default false,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, bundle_id)
);

create unique index if not exists devices_id_business_id_uidx on public.devices (id, business_id);

create table if not exists public.device_app_inventory (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  bundle_id text not null check (length(trim(bundle_id)) between 1 and 255),
  app_name text not null check (length(trim(app_name)) between 1 and 160),
  version text,
  inventory_source text not null default 'mdm' check (inventory_source in ('mdm', 'admin_import')),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_synced_at timestamptz not null default now(),
  is_installed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (device_id, bundle_id),
  constraint device_app_inventory_device_business_match
    foreign key (device_id, business_id)
    references public.devices(id, business_id)
    on delete cascade
);

create table if not exists public.device_app_reviews (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid not null unique references public.device_app_inventory(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  status text not null default 'new'
    check (status in ('new', 'under_review', 'discussed', 'closed')),
  assigned_to uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists approved_device_apps_business_idx
  on public.approved_device_apps (business_id, bundle_id);
create index if not exists device_app_inventory_device_idx
  on public.device_app_inventory (device_id, is_installed, last_synced_at desc);
create index if not exists device_app_inventory_business_idx
  on public.device_app_inventory (business_id, bundle_id);
create index if not exists device_app_reviews_business_status_idx
  on public.device_app_reviews (business_id, status, updated_at desc);

create or replace function public.bcs_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists approved_device_apps_set_updated_at on public.approved_device_apps;
create trigger approved_device_apps_set_updated_at
before update on public.approved_device_apps
for each row execute function public.bcs_set_updated_at();

drop trigger if exists device_app_inventory_set_updated_at on public.device_app_inventory;
create trigger device_app_inventory_set_updated_at
before update on public.device_app_inventory
for each row execute function public.bcs_set_updated_at();

drop trigger if exists device_app_reviews_set_updated_at on public.device_app_reviews;
create trigger device_app_reviews_set_updated_at
before update on public.device_app_reviews
for each row execute function public.bcs_set_updated_at();

alter table public.approved_device_apps enable row level security;
alter table public.device_app_inventory enable row level security;
alter table public.device_app_reviews enable row level security;

revoke all on public.approved_device_apps from anon, authenticated;
revoke all on public.device_app_inventory from anon, authenticated;
revoke all on public.device_app_reviews from anon, authenticated;
grant select, insert, update, delete on public.approved_device_apps to authenticated;
grant select on public.device_app_inventory to authenticated;
grant select, insert, update on public.device_app_reviews to authenticated;
grant all on public.approved_device_apps to service_role;
grant all on public.device_app_inventory to service_role;
grant all on public.device_app_reviews to service_role;

drop policy if exists "active users can read approved device apps" on public.approved_device_apps;
create policy "active users can read approved device apps"
on public.approved_device_apps for select to authenticated
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.status = 'active'));

drop policy if exists "admins manage approved device apps" on public.approved_device_apps;
create policy "admins manage approved device apps"
on public.approved_device_apps for all to authenticated
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.status = 'active' and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.status = 'active' and p.role = 'admin'));

drop policy if exists "active users can read app inventory" on public.device_app_inventory;
create policy "active users can read app inventory"
on public.device_app_inventory for select to authenticated
using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.status = 'active')
  and exists (select 1 from public.devices d where d.id = public.device_app_inventory.device_id and d.business_id = public.device_app_inventory.business_id)
);

drop policy if exists "active users can read app reviews" on public.device_app_reviews;
create policy "active users can read app reviews"
on public.device_app_reviews for select to authenticated
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.status = 'active'));

drop policy if exists "admins manage app reviews" on public.device_app_reviews;
create policy "admins manage app reviews"
on public.device_app_reviews for all to authenticated
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.status = 'active' and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.status = 'active' and p.role = 'admin'));

comment on table public.approved_device_apps is
  'Per-business allowlist of approved iOS app bundle identifiers; managed by BCS administrators.';
comment on table public.device_app_inventory is
  'Provider-synced installed-app inventory only. Never store foreground activity, app usage duration, account identities, or message content.';
comment on table public.device_app_reviews is
  'Human review workflow for unapproved or unknown installed apps; no automatic disciplinary action.';
