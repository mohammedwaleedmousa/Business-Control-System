-- Controlled device-status telemetry for the Company iPhones dashboard.
-- Only trusted server-side MDM/provider integrations may write these rows.
-- Do not store account usernames, messages, screenshots, keystrokes, or usage duration.

create table if not exists public.device_status_telemetry (
  device_id uuid primary key references public.devices(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  connection_state text not null default 'unknown'
    check (connection_state in ('online', 'offline', 'unknown')),
  last_seen_at timestamptz,
  current_app_bundle_id text,
  current_app_name text,
  current_app_observed_at timestamptz,
  account_scope text not null default 'unknown'
    check (account_scope in ('personal', 'company', 'unknown')),
  source text not null default 'mdm',
  updated_at timestamptz not null default now(),
  constraint device_status_device_business_match
    foreign key (device_id, business_id)
    references public.devices(id, business_id)
    on delete cascade
);

create index if not exists device_status_business_idx
  on public.device_status_telemetry (business_id, connection_state, last_seen_at desc);

create index if not exists device_status_stale_idx
  on public.device_status_telemetry (last_seen_at);

alter table public.device_status_telemetry enable row level security;

revoke all on public.device_status_telemetry from anon, authenticated;
grant select on public.device_status_telemetry to authenticated;
grant all on public.device_status_telemetry to service_role;

drop policy if exists "active users can read device status" on public.device_status_telemetry;
create policy "active users can read device status"
on public.device_status_telemetry for select to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.status = 'active'
  )
  and (
    public.is_business_member(business_id)
    or public.is_bcs_admin()
  )
);

create or replace function public.bcs_set_device_status_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists device_status_telemetry_set_updated_at on public.device_status_telemetry;
create trigger device_status_telemetry_set_updated_at
before update on public.device_status_telemetry
for each row execute function public.bcs_set_device_status_updated_at();

comment on table public.device_status_telemetry is
  'Trusted provider-reported device status. Current-app data requires an approved MDM capability; account_scope is an administrative classification only. Do not store account identities, messages, screenshots, keystrokes, or usage duration.';
