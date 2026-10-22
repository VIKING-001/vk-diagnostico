create table if not exists public.vk_admin_rate_limits (
  scope text not null,
  ip_hash text not null,
  attempts integer not null default 0 check (attempts >= 0),
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz,
  primary key (scope, ip_hash)
);

alter table public.vk_admin_rate_limits enable row level security;
revoke all on table public.vk_admin_rate_limits from public, anon, authenticated;

insert into public.config (key, value)
values ('admin_password_updated_at', clock_timestamp()::text)
on conflict (key) do nothing;

create or replace function public.vk_admin_action(
  p_api_secret text,
  p_action text,
  p_password text default null,
  p_new_password text default null,
  p_code text default null,
  p_expires timestamptz default null,
  p_current_password text default null,
  p_session_version timestamptz default null,
  p_ip text default null,
  p_push_endpoint text default null,
  p_push_p256dh text default null,
  p_push_auth text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
set row_security = off
as $$
declare
  v_expected_hash text;
  v_saved_password text;
  v_password_ok boolean := false;
  v_ip_hash text;
  v_attempts integer;
  v_window_started_at timestamptz;
  v_blocked_until timestamptz;
  v_version timestamptz;
  v_saved_code text;
  v_code_expires timestamptz;
  v_email text;
  v_payload jsonb;
  v_rows integer;
begin
  select value into v_expected_hash
  from public.config
  where key = 'admin_api_secret_hash';

  if v_expected_hash is null
    or encode(extensions.digest(coalesce(p_api_secret, ''), 'sha256'), 'hex') <> v_expected_hash then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  if p_action in ('leads', 'change_password', 'register_push') then
    select nullif(value, '')::timestamptz into v_version
    from public.config
    where key = 'admin_password_updated_at';
    if p_session_version is null or p_session_version is distinct from v_version then
      raise exception 'Session expired' using errcode = '42501';
    end if;
  end if;

  if p_action = 'login' then
    v_ip_hash := encode(extensions.digest(coalesce(nullif(btrim(p_ip), ''), 'unknown'), 'sha256'), 'hex');
    delete from public.vk_admin_rate_limits where window_started_at < now() - interval '7 days';
    insert into public.vk_admin_rate_limits (scope, ip_hash)
    values ('login', v_ip_hash)
    on conflict (scope, ip_hash) do nothing;
    select attempts, window_started_at, blocked_until into v_attempts, v_window_started_at, v_blocked_until
    from public.vk_admin_rate_limits where scope = 'login' and ip_hash = v_ip_hash for update;

    if v_blocked_until > now() then
      return jsonb_build_object('ok', false, 'rate_limited', true);
    end if;
    if v_window_started_at < now() - interval '15 minutes' then
      update public.vk_admin_rate_limits
      set attempts = 0, window_started_at = now(), blocked_until = null
      where scope = 'login' and ip_hash = v_ip_hash
      returning attempts, window_started_at, blocked_until into v_attempts, v_window_started_at, v_blocked_until;
    end if;

    select value into v_saved_password from public.config where key = 'admin_password';
    if v_saved_password is not null and coalesce(p_password, '') <> '' then
      v_password_ok := case when v_saved_password like '$2%'
        then extensions.crypt(p_password, v_saved_password) = v_saved_password
        else p_password = v_saved_password
      end;
    end if;

    if v_password_ok then
      delete from public.vk_admin_rate_limits where scope = 'login' and ip_hash = v_ip_hash;
      select nullif(value, '')::timestamptz into v_version from public.config where key = 'admin_password_updated_at';
      return jsonb_build_object('ok', true, 'version', v_version);
    end if;

    v_attempts := coalesce(v_attempts, 0) + 1;
    update public.vk_admin_rate_limits
    set attempts = v_attempts,
        blocked_until = case when v_attempts >= 8 then now() + interval '15 minutes' else null end
    where scope = 'login' and ip_hash = v_ip_hash;
    return jsonb_build_object('ok', false, 'rate_limited', v_attempts >= 8);
  end if;

  if p_action = 'leads' then
    select coalesce(jsonb_agg(to_jsonb(l) order by l.created_at desc nulls last), '[]'::jsonb)
    into v_payload from public.leads as l;
    return jsonb_build_object('ok', true, 'leads', v_payload);
  end if;

  if p_action = 'change_password' then
    select value into v_saved_password from public.config where key = 'admin_password';
    v_password_ok := case when coalesce(v_saved_password, '') like '$2%'
      then extensions.crypt(coalesce(p_current_password, ''), v_saved_password) = v_saved_password
      else p_current_password = v_saved_password
    end;
    if v_password_ok is distinct from true then return jsonb_build_object('ok', false); end if;
    if length(coalesce(p_new_password, '')) < 6 or length(p_new_password) > 256 then
      return jsonb_build_object('ok', false, 'invalid_password', true);
    end if;
    update public.config set value = extensions.crypt(p_new_password, extensions.gen_salt('bf', 10))
    where key = 'admin_password';
    update public.config set value = clock_timestamp()::text where key = 'admin_password_updated_at';
    return jsonb_build_object('ok', true);
  end if;

  if p_action = 'request_reset' then
    if coalesce(p_code, '') !~ '^[0-9]{6}$' or p_expires is null
      or p_expires <= now() or p_expires > now() + interval '20 minutes' then
      return jsonb_build_object('ok', false);
    end if;
    v_ip_hash := encode(extensions.digest(coalesce(nullif(btrim(p_ip), ''), 'unknown'), 'sha256'), 'hex');
    insert into public.vk_admin_rate_limits (scope, ip_hash)
    values ('reset_request', v_ip_hash)
    on conflict (scope, ip_hash) do nothing;
    select attempts, window_started_at into v_attempts, v_window_started_at
    from public.vk_admin_rate_limits where scope = 'reset_request' and ip_hash = v_ip_hash for update;
    if v_window_started_at < now() - interval '1 hour' then
      v_attempts := 0;
      update public.vk_admin_rate_limits
      set attempts = 0, window_started_at = now(), blocked_until = null
      where scope = 'reset_request' and ip_hash = v_ip_hash;
    end if;
    if coalesce(v_attempts, 0) >= 3 then return jsonb_build_object('ok', false, 'rate_limited', true); end if;
    update public.vk_admin_rate_limits set attempts = coalesce(v_attempts, 0) + 1
    where scope = 'reset_request' and ip_hash = v_ip_hash;
    update public.config set value = p_code where key = 'reset_code';
    update public.config set value = p_expires::text where key = 'reset_code_expires';
    select value into v_email from public.config where key = 'admin_email';
    return jsonb_build_object('ok', true, 'admin_email', v_email);
  end if;

  if p_action = 'reset_password' then
    if length(coalesce(p_new_password, '')) < 6 or length(p_new_password) > 256
      or coalesce(p_code, '') !~ '^[0-9]{6}$' then
      return jsonb_build_object('ok', false, 'invalid_password', true);
    end if;
    v_ip_hash := encode(extensions.digest(coalesce(nullif(btrim(p_ip), ''), 'unknown'), 'sha256'), 'hex');
    insert into public.vk_admin_rate_limits (scope, ip_hash)
    values ('reset_verify', v_ip_hash)
    on conflict (scope, ip_hash) do nothing;
    select attempts, window_started_at, blocked_until into v_attempts, v_window_started_at, v_blocked_until
    from public.vk_admin_rate_limits where scope = 'reset_verify' and ip_hash = v_ip_hash for update;
    if v_blocked_until > now() then return jsonb_build_object('ok', false, 'rate_limited', true); end if;
    if v_window_started_at < now() - interval '15 minutes' then
      update public.vk_admin_rate_limits
      set attempts = 0, window_started_at = now(), blocked_until = null
      where scope = 'reset_verify' and ip_hash = v_ip_hash
      returning attempts, window_started_at, blocked_until into v_attempts, v_window_started_at, v_blocked_until;
    end if;
    select value into v_saved_code from public.config where key = 'reset_code';
    select nullif(value, '')::timestamptz into v_code_expires from public.config where key = 'reset_code_expires';
    if v_saved_code is distinct from p_code or v_code_expires is null or v_code_expires < now() then
      v_attempts := coalesce(v_attempts, 0) + 1;
      update public.vk_admin_rate_limits
      set attempts = v_attempts,
          blocked_until = case when v_attempts >= 5 then now() + interval '15 minutes' else null end
      where scope = 'reset_verify' and ip_hash = v_ip_hash;
      if v_attempts >= 5 then
        update public.config set value = '' where key in ('reset_code', 'reset_code_expires');
      end if;
      return jsonb_build_object('ok', false, 'rate_limited', v_attempts >= 5);
    end if;
    update public.config set value = extensions.crypt(p_new_password, extensions.gen_salt('bf', 10))
    where key = 'admin_password';
    update public.config set value = clock_timestamp()::text where key = 'admin_password_updated_at';
    update public.config set value = '' where key in ('reset_code', 'reset_code_expires');
    delete from public.vk_admin_rate_limits where scope in ('login', 'reset_verify');
    return jsonb_build_object('ok', true);
  end if;

  if p_action = 'register_push' then
    if coalesce(p_push_endpoint, '') = '' or coalesce(p_push_p256dh, '') = '' or coalesce(p_push_auth, '') = '' then
      return jsonb_build_object('ok', false);
    end if;
    insert into public.push_subscriptions (endpoint, p256dh, auth)
    values (p_push_endpoint, p_push_p256dh, p_push_auth)
    on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth;
    return jsonb_build_object('ok', true);
  end if;

  if p_action = 'push_list' then
    select coalesce(jsonb_agg(jsonb_build_object('id', id, 'endpoint', endpoint, 'p256dh', p256dh, 'auth', auth)), '[]'::jsonb)
    into v_payload from public.push_subscriptions;
    return jsonb_build_object('ok', true, 'subscriptions', v_payload);
  end if;

  if p_action = 'push_delete' then
    delete from public.push_subscriptions where endpoint = p_push_endpoint;
    get diagnostics v_rows = row_count;
    return jsonb_build_object('ok', true, 'deleted', v_rows);
  end if;

  if p_action = 'healthcheck' then return jsonb_build_object('ok', true); end if;

  raise exception 'Invalid admin action' using errcode = '22023';
end;
$$;

revoke all on function public.vk_admin_action(text, text, text, text, text, timestamptz, text, timestamptz, text, text, text, text) from public;
grant execute on function public.vk_admin_action(text, text, text, text, text, timestamptz, text, timestamptz, text, text, text, text) to anon;
