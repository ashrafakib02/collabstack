create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text unique,
  avatar_url text,
  created_at timestamptz default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz default now(),
  unique (workspace_id, user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  due_date timestamptz,
  created_at timestamptz default now()
);


create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();