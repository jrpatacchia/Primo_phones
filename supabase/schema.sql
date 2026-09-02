-- Apresentação comercial — estrutura no Supabase
--
-- COMO RODAR: painel do Supabase → SQL Editor → New query → cole tudo isto →
-- Run. Pode rodar mais de uma vez sem problema; nada é apagado.
--
-- Isto cria duas coisas:
--   1. a tabela que guarda quais mídias vão em cada área da apresentação;
--   2. o bucket de arquivos onde as imagens e vídeos ficam hospedados.
--
-- A regra dos dois é a mesma: qualquer pessoa LÊ (o cliente precisa abrir a
-- apresentação), só quem está logado ESCREVE (só você mexe no estúdio).

-- ---------------------------------------------------------------------------
-- 1. Conteúdo
-- ---------------------------------------------------------------------------

create table if not exists public.presentation_content (
  -- Permite mais de uma apresentação no futuro. Hoje só existe a 'default'.
  id text primary key default 'default',
  media jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

comment on table public.presentation_content is
  'Qual imagem ou vídeo entra em cada área da apresentação. Escrito pelo /studio.';

insert into public.presentation_content (id, media)
values ('default', '{}'::jsonb)
on conflict (id) do nothing;

alter table public.presentation_content enable row level security;

-- O Supabase já concede isto por padrão em tabelas novas do schema public,
-- mas deixar explícito evita um "permission denied" difícil de diagnosticar
-- caso as permissões padrão do projeto tenham sido alteradas.
grant select on public.presentation_content to anon, authenticated;
grant insert, update on public.presentation_content to authenticated;

drop policy if exists "conteudo visivel para todos" on public.presentation_content;
create policy "conteudo visivel para todos"
  on public.presentation_content
  for select
  to anon, authenticated
  using (true);

drop policy if exists "so quem esta logado altera o conteudo" on public.presentation_content;
create policy "so quem esta logado altera o conteudo"
  on public.presentation_content
  for all
  to authenticated
  using (true)
  with check (true);

-- Carimba quem salvou e quando, sem o estúdio precisar mandar isso.
create or replace function public.touch_presentation_content()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists presentation_content_touch on public.presentation_content;
create trigger presentation_content_touch
  before insert or update on public.presentation_content
  for each row execute function public.touch_presentation_content();

-- ---------------------------------------------------------------------------
-- 2. Arquivos
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'presentation',
  'presentation',
  true,
  120 * 1024 * 1024,
  array[
    'image/webp', 'image/png', 'image/jpeg', 'image/avif', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/webm'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "midias visiveis para todos" on storage.objects;
create policy "midias visiveis para todos"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'presentation');

drop policy if exists "so quem esta logado envia midia" on storage.objects;
create policy "so quem esta logado envia midia"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'presentation');

drop policy if exists "so quem esta logado substitui midia" on storage.objects;
create policy "so quem esta logado substitui midia"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'presentation')
  with check (bucket_id = 'presentation');

drop policy if exists "so quem esta logado apaga midia" on storage.objects;
create policy "so quem esta logado apaga midia"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'presentation');
