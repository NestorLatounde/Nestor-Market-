-- ============================================================
-- Nestor Market — schéma Supabase
-- À exécuter dans Supabase > SQL Editor (une seule fois)
-- ============================================================

-- ---------- Profils ----------
-- Un profil par utilisateur inscrit, créé automatiquement à l'inscription.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Les profils sont visibles par tous"
  on public.profiles for select
  using (true);

create policy "Un utilisateur crée son propre profil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Un utilisateur modifie son propre profil"
  on public.profiles for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- Annonces ----------
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('service', 'produit')),
  category text not null,
  title text not null,
  description text not null,
  price text not null,
  country text not null default 'France',
  commune text not null default 'Non précisée',
  latitude double precision,
  longitude double precision,
  is_featured boolean not null default false,
  featured_until timestamptz,
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;

create policy "Les annonces sont visibles par tous, même sans compte"
  on public.listings for select
  using (true);

create policy "Un utilisateur connecté publie ses propres annonces"
  on public.listings for insert
  with check (auth.uid() = user_id);

create policy "Un utilisateur modifie ses propres annonces"
  on public.listings for update
  using (auth.uid() = user_id);

create policy "Un utilisateur supprime ses propres annonces"
  on public.listings for delete
  using (auth.uid() = user_id);

create or replace function public.distance_km(
  lat1 double precision, lon1 double precision,
  lat2 double precision, lon2 double precision
) returns double precision as $$
  select 6371 * acos(
    least(1, greatest(-1,
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1))
      + sin(radians(lat1)) * sin(radians(lat2))
    ))
  );
$$ language sql immutable strict parallel safe;

create or replace function public.listings_by_distance(
  origin_lat double precision,
  origin_lng double precision,
  p_type text default null,
  p_country text default null
) returns table (
  id uuid, type text, category text, title text, description text, price text,
  country text, commune text, latitude double precision, longitude double precision,
  is_featured boolean, featured_until timestamptz,
  created_at timestamptz, distance_km double precision
) as $$
  select l.id, l.type, l.category, l.title, l.description, l.price,
         l.country, l.commune, l.latitude, l.longitude,
         l.is_featured, l.featured_until, l.created_at,
         public.distance_km(origin_lat, origin_lng, l.latitude, l.longitude) as distance_km
  from public.listings l
  where l.latitude is not null and l.longitude is not null
    and (p_type is null or l.type = p_type)
    and (p_country is null or l.country = p_country)
  order by distance_km asc;
$$ language sql stable;

-- ---------- Photos & vidéos des annonces ----------
create table if not exists public.listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  url text not null,
  kind text not null check (kind in ('image', 'video')),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.listing_media enable row level security;

create policy "Les médias sont visibles par tous"
  on public.listing_media for select
  using (true);

create policy "Le propriétaire ajoute ses médias"
  on public.listing_media for insert
  with check (auth.uid() = user_id);

create policy "Le propriétaire supprime ses médias"
  on public.listing_media for delete
  using (auth.uid() = user_id);

create index if not exists listing_media_listing_id_idx on public.listing_media (listing_id, position);

-- ---------- Mises en avant payantes ----------
create table if not exists public.listing_boosts (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  days integer not null default 7,
  amount_cents integer not null,
  currency text not null default 'eur',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  created_at timestamptz not null default now()
);

alter table public.listing_boosts enable row level security;

create policy "Un utilisateur voit ses propres achats de mise en avant"
  on public.listing_boosts for select
  using (auth.uid() = user_id);

create policy "Un utilisateur crée ses propres achats de mise en avant"
  on public.listing_boosts for insert
  with check (auth.uid() = user_id);

revoke update (is_featured, featured_until) on public.listings from authenticated, anon;

insert into storage.buckets (id, name, public)
values ('listing-media', 'listing-media', true)
on conflict (id) do nothing;

create policy "Fichiers du bucket listing-media visibles par tous"
  on storage.objects for select
  using (bucket_id = 'listing-media');

create policy "Un utilisateur connecté envoie ses fichiers dans son dossier"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Un utilisateur supprime ses propres fichiers"
  on storage.objects for delete
  using (
    bucket_id = 'listing-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------- Messages ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Les messages d'une annonce sont visibles par tous"
  on public.messages for select
  using (true);

create policy "Un utilisateur connecté envoie ses propres messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

alter publication supabase_realtime add table public.messages;

create index if not exists listings_created_at_idx on public.listings (created_at desc);
create index if not exists listings_country_commune_idx on public.listings (country, commune);
create index if not exists messages_listing_id_idx on public.messages (listing_id, created_at asc);
