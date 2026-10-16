-- DronexMC Applications schema (Phase 1). Run in Supabase SQL editor.
create extension if not exists pgcrypto;

create table admin_accounts (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  must_change_password boolean not null default true,
  session_version int not null default 1,
  created_at timestamptz not null default now()
);
create table site_settings (key text primary key, value jsonb not null, updated_at timestamptz not null default now());

create table forms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  prefix text not null check (prefix ~ '^[A-Z]{2,5}$'),
  name_ar text not null, name_en text not null,
  description_ar text not null default '', description_en text not null default '',
  icon text not null default 'shield', color text not null default '#00d4ff',
  sort_order int not null default 0,
  is_open boolean not null default false,
  is_archived boolean not null default false,
  success_ar text, success_en text, closed_ar text, closed_en text,
  webhook_url text,  -- server-side only, never returned to clients
  current_version int not null default 1,
  draft_questions jsonb,  -- unpublished editor state
  created_at timestamptz not null default now()
);
create table form_versions (
  form_id uuid references forms(id) on delete cascade,
  version int not null,
  questions jsonb not null,
  created_at timestamptz not null default now(),
  primary key (form_id, version)
);
create table prefix_counters (prefix text primary key, last_value bigint not null default 0);

create table applications (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  form_id uuid not null references forms(id),
  form_version int not null,
  discord_id text not null,
  discord_username text not null,
  discord_avatar text,
  lang text not null check (lang in ('ar','en')),
  status text not null default 'under_review' check (status in ('under_review','accepted','rejected')),
  answers jsonb not null,
  created_at timestamptz not null default now(),
  unique (form_id, discord_id)  -- DB-level duplicate prevention
);
create index on applications (status);
create index on applications (discord_id);

create table webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  attempts int not null default 0,
  sent_parts int not null default 0,  -- messages already delivered (prevents duplicates on retry)
  last_error text,
  next_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index on webhook_deliveries (status, next_attempt_at);
create table admin_audit_log (id bigserial primary key, admin_id uuid, action text not null, target text, created_at timestamptz not null default now());

-- Atomic: closed-form check, collision-free code, duplicate guard, webhook job, all in one transaction.
create or replace function submit_application(
  p_form_id uuid, p_discord_id text, p_username text, p_avatar text, p_lang text, p_answers jsonb
) returns text language plpgsql security definer as $$
declare f forms; n bigint; c text;
begin
  select * into f from forms where id = p_form_id for share;
  if not found or not f.is_open or f.is_archived then raise exception 'FORM_CLOSED'; end if;
  insert into prefix_counters(prefix, last_value) values (f.prefix, 1)
    on conflict (prefix) do update set last_value = prefix_counters.last_value + 1
    returning last_value into n;
  c := f.prefix || '-' || lpad(n::text, 4, '0');
  begin
    insert into applications(code, form_id, form_version, discord_id, discord_username, discord_avatar, lang, answers)
    values (c, f.id, f.current_version, p_discord_id, p_username, p_avatar, p_lang, p_answers);
  exception when unique_violation then raise exception 'ALREADY_APPLIED'; end;
  insert into webhook_deliveries(application_id) select id from applications where code = c;
  return c;
end $$;

-- RLS: no policies = deny anon/authenticated. All access goes through the server's service role.
alter table admin_accounts enable row level security;
alter table site_settings enable row level security;
alter table forms enable row level security;
alter table form_versions enable row level security;
alter table prefix_counters enable row level security;
alter table applications enable row level security;
alter table webhook_deliveries enable row level security;
alter table admin_audit_log enable row level security;
revoke execute on function submit_application from anon, authenticated, public;
