update public.config
set value = extensions.crypt(value, extensions.gen_salt('bf', 10))
where key = 'admin_password' and value not like '$2%';

alter table public.config enable row level security;
alter table public.leads enable row level security;
alter table public.push_subscriptions enable row level security;

drop policy if exists "allow insert" on public.config;
drop policy if exists "allow select" on public.config;
drop policy if exists "allow update" on public.config;
drop policy if exists "select leads" on public.leads;
drop policy if exists "open access" on public.push_subscriptions;

revoke all on table public.config from public, anon, authenticated;
revoke all on table public.leads from public, anon, authenticated;
grant insert on table public.leads to anon;
revoke all on table public.push_subscriptions from public, anon, authenticated;
