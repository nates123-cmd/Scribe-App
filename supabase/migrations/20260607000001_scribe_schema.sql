-- Scribe schema — single-user, per-user RLS on the shared suite project.
-- Three tables: areas + projects (the structural tree) and notes (documents)
-- and inbox (untriaged captures). Flexible note sub-structures (body, actions,
-- related, people, tags, etc.) are JSONB/array columns matching the prototype's
-- data shapes (design_ref/README.md "Data shapes"). All tables carry user_id
-- defaulting to auth.uid() with RLS limiting every row to its owner.

-- ── areas ──────────────────────────────────────────────────────────
create table if not exists public.scribe_areas (
  id          text not null,
  user_id     uuid not null default auth.uid(),
  name        text not null,
  open_default boolean not null default true,
  sort        int not null default 0,
  created_at  timestamptz not null default now(),
  primary key (user_id, id)
);

-- ── projects (belong to an area) ───────────────────────────────────
create table if not exists public.scribe_projects (
  id          text not null,
  user_id     uuid not null default auth.uid(),
  area_id     text not null,
  name        text not null,
  status      text not null default 'Active',
  due         text,
  sort        int not null default 0,
  created_at  timestamptz not null default now(),
  primary key (user_id, id)
);

-- ── notes (the documents) ──────────────────────────────────────────
create table if not exists public.scribe_notes (
  id          text not null,
  user_id     uuid not null default auth.uid(),
  kind        text not null default 'note',  -- note|meeting|knowledge|brainstorm|artifact
  title       text not null default '',
  project     text,                          -- home project id, or null
  area        text,                          -- home area id, or null
  projects    text[] not null default '{}',  -- multi-project meetings span these
  people      text[] not null default '{}',
  tags        text[] not null default '{}',
  date        text,                          -- display date string (prototype style)
  updated     text,                          -- relative display string ("2h","1d")
  updated_at  timestamptz not null default now(),
  indexed     boolean not null default true,
  status      int not null default 2,        -- 0 Raw / 1 Ready / 2 Indexed
  raw_words   text,
  summary     text,
  terms       text[] not null default '{}',
  actions     jsonb not null default '[]'::jsonb,   -- [{text,src,owner,project?}]
  body        jsonb not null default '[]'::jsonb,   -- [{p}|{ul:[]}|{links:[]}]
  related     jsonb not null default '[]'::jsonb,   -- [{kind,title,reason}]
  created_at  timestamptz not null default now(),
  primary key (user_id, id)
);

-- ── inbox (untriaged captures) ─────────────────────────────────────
create table if not exists public.scribe_inbox (
  id            text not null,
  user_id       uuid not null default auth.uid(),
  title         text not null default '',
  src           text,
  src_icon      text,
  snippet       text,
  suggest       jsonb,        -- {project,confidence} | null
  suggest_multi jsonb,        -- {home,homeLabel,confidence,routes:[{project,count}]} | null
  tags          text[] not null default '{}',
  created_at    timestamptz not null default now(),
  primary key (user_id, id)
);

-- ── RLS: each row visible/writable only by its owner ───────────────
alter table public.scribe_areas    enable row level security;
alter table public.scribe_projects enable row level security;
alter table public.scribe_notes    enable row level security;
alter table public.scribe_inbox    enable row level security;

do $$
declare tbl text;
begin
  foreach tbl in array array['scribe_areas','scribe_projects','scribe_notes','scribe_inbox'] loop
    execute format('drop policy if exists %1$s_owner on public.%1$s', tbl);
    execute format($f$
      create policy %1$s_owner on public.%1$s
        for all
        using (user_id = auth.uid())
        with check (user_id = auth.uid())
    $f$, tbl);
  end loop;
end $$;
