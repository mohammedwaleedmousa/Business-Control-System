alter table public.devices
  add column if not exists phone_number text,
  add column if not exists whatsapp_number text;

create policy "deny direct credential table access" on public.device_credentials
  for all to anon, authenticated using (false) with check (false);

create policy "deny direct credential table access" on public.account_credentials
  for all to anon, authenticated using (false) with check (false);
