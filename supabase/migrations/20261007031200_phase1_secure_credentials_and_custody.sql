alter table public.devices
  add column if not exists custody_status text not null default 'not_assigned'
    check (custody_status in ('not_assigned','in_employee_custody','returned')),
  add column if not exists handover_date date,
  add column if not exists return_date date,
  add column if not exists handover_return_notes text,
  add column if not exists phone_number text,
  add column if not exists whatsapp_number text;

create table if not exists public.device_credentials (
  device_id uuid primary key references public.devices(id) on delete cascade,
  vault_secret_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.account_credentials (
  account_id uuid primary key references public.accounts(id) on delete cascade,
  vault_secret_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.device_credentials enable row level security;
alter table public.account_credentials enable row level security;
revoke all on table public.device_credentials from anon, authenticated;
revoke all on table public.account_credentials from anon, authenticated;
grant all on table public.device_credentials to service_role;
grant all on table public.account_credentials to service_role;

create or replace function public.bcs_create_vault_secret(secret_value text, secret_name text, secret_description text)
returns uuid language sql security definer set search_path=''
as $$ select vault.create_secret(secret_value, secret_name, secret_description, null::uuid); $$;

create or replace function public.bcs_update_vault_secret(secret_id uuid, secret_value text, secret_name text, secret_description text)
returns void language sql security definer set search_path=''
as $$ select vault.update_secret(secret_id, secret_value, secret_name, secret_description, null::uuid); $$;

create or replace function public.bcs_read_vault_secret(secret_id uuid)
returns text language sql security definer set search_path='' stable
as $$ select decrypted_secret from vault.decrypted_secrets where id=secret_id; $$;

revoke execute on function public.bcs_create_vault_secret(text,text,text) from public, anon, authenticated;
revoke execute on function public.bcs_update_vault_secret(uuid,text,text,text) from public, anon, authenticated;
revoke execute on function public.bcs_read_vault_secret(uuid) from public, anon, authenticated;
grant execute on function public.bcs_create_vault_secret(text,text,text) to service_role;
grant execute on function public.bcs_update_vault_secret(uuid,text,text,text) to service_role;
grant execute on function public.bcs_read_vault_secret(uuid) to service_role;

create index if not exists devices_custody_status_idx on public.devices(custody_status);
create index if not exists devices_assigned_user_id_idx on public.devices(assigned_user_id);
create index if not exists accounts_owner_user_id_idx on public.accounts(owner_user_id);
