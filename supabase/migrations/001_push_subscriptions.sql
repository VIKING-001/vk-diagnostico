-- Aplicada via Supabase MCP em 2026-07-17 no projeto cquhmmidsprqbyqjrkhc.
-- Mantida aqui como registro/documentação.

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "open access" on push_subscriptions
  for all using (true) with check (true);
