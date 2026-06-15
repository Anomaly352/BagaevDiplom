create extension if not exists "pgcrypto";

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique,
    full_name text,
    phone text,
    address text,
    is_admin boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.profiles
drop column if exists bonus_points;

create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    slug text not null unique,
    sort_order integer not null default 100,
    is_active boolean not null default true
);

create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null references public.categories(id),
    name text not null,
    description text not null,
    price numeric(10,2) not null check (price > 0),
    weight text,
    image_url text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.tags (
    id uuid primary key default gen_random_uuid(),
    name text not null unique
);

create table if not exists public.product_tags (
    product_id uuid not null references public.products(id) on delete cascade,
    tag_id uuid not null references public.tags(id) on delete cascade,
    primary key (product_id, tag_id)
);

create table if not exists public.cart_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    quantity integer not null default 1 check (quantity > 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, product_id)
);

create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete set null,
    status text not null default 'new' check (status in ('new', 'cooking', 'courier', 'done', 'cancelled')),
    payment_method text not null default 'Онлайн',
    customer_name text not null,
    customer_phone text not null,
    delivery_address text not null,
    comment text,
    subtotal numeric(10,2) not null default 0,
    delivery_price numeric(10,2) not null default 0,
    total numeric(10,2) not null default 0,
    created_at timestamptz not null default now()
);

create table if not exists public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    product_id uuid references public.products(id) on delete set null,
    product_name text not null,
    quantity integer not null check (quantity > 0),
    unit_price numeric(10,2) not null,
    item_total numeric(10,2) not null
);

create table if not exists public.reviews (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete set null,
    product_id uuid references public.products(id) on delete cascade,
    rating integer not null check (rating between 1 and 5),
    text text,
    created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, email, full_name, phone)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data ->> 'full_name', ''),
        coalesce(new.raw_user_meta_data ->> 'phone', '')
    )
    on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        phone = excluded.phone;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and is_admin = true
    );
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.tags enable row level security;
alter table public.product_tags enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "Profiles can read own profile" on public.profiles;
create policy "Profiles can read own profile"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

drop policy if exists "Profiles can update own profile" on public.profiles;
create policy "Profiles can update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Profiles can insert own profile" on public.profiles;
create policy "Profiles can insert own profile"
on public.profiles for insert
with check (id = auth.uid());

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
on public.categories for select
using (is_active = true);

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select
using (is_active = true or public.is_admin());

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read tags" on public.tags;
create policy "Public can read tags"
on public.tags for select
using (true);

drop policy if exists "Admins manage tags" on public.tags;
create policy "Admins manage tags"
on public.tags for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read product tags" on public.product_tags;
create policy "Public can read product tags"
on public.product_tags for select
using (true);

drop policy if exists "Admins manage product tags" on public.product_tags;
create policy "Admins manage product tags"
on public.product_tags for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users read own cart" on public.cart_items;
create policy "Users read own cart"
on public.cart_items for select
using (user_id = auth.uid());

drop policy if exists "Users insert own cart" on public.cart_items;
create policy "Users insert own cart"
on public.cart_items for insert
with check (user_id = auth.uid());

drop policy if exists "Users update own cart" on public.cart_items;
create policy "Users update own cart"
on public.cart_items for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users delete own cart" on public.cart_items;
create policy "Users delete own cart"
on public.cart_items for delete
using (user_id = auth.uid());

drop policy if exists "Anyone can create order" on public.orders;
create policy "Anyone can create order"
on public.orders for insert
with check (true);

drop policy if exists "Users read own orders and admins read all" on public.orders;
create policy "Users read own orders and admins read all"
on public.orders for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders"
on public.orders for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Anyone can create order items" on public.order_items;
create policy "Anyone can create order items"
on public.order_items for insert
with check (true);

drop policy if exists "Users read own order items and admins read all" on public.order_items;
create policy "Users read own order items and admins read all"
on public.order_items for select
using (
    public.is_admin()
    or exists (
        select 1
        from public.orders
        where orders.id = order_items.order_id
          and orders.user_id = auth.uid()
    )
);

drop policy if exists "Authenticated users create reviews" on public.reviews;
create policy "Authenticated users create reviews"
on public.reviews for insert
with check (user_id = auth.uid());

drop policy if exists "Public can read reviews" on public.reviews;
create policy "Public can read reviews"
on public.reviews for select
using (true);

insert into public.categories (name, slug, sort_order) values
('Роллы', 'rolls', 10),
('Суши', 'sushi', 20),
('Сеты', 'sets', 30),
('Горячее', 'hot', 40),
('Напитки', 'drinks', 50)
on conflict (slug) do update set
    name = excluded.name,
    sort_order = excluded.sort_order,
    is_active = true;

insert into public.products (category_id, name, description, price, weight, image_url)
select c.id, v.name, v.description, v.price, v.weight, v.image_url
from (
    values
    ('rolls', 'Филадельфия премиум', 'Лосось, сливочный сыр, огурец, авокадо и рис нишики.', 690.00, '285 г', 'assets/photos/product-philadelphia.jpg'),
    ('rolls', 'Калифорния с крабом', 'Краб, авокадо, огурец, японский майонез и икра тобико.', 570.00, '245 г', 'assets/photos/product-california.jpg'),
    ('rolls', 'Дракон унаги', 'Угорь, сливочный сыр, авокадо, кунжут и соус унаги.', 840.00, '300 г', 'assets/photos/product-dragon.jpg'),
    ('sushi', 'Суши с тунцом', 'Классические нигири со свежим тунцом и рисом.', 230.00, '42 г', 'assets/photos/product-tuna-sushi.jpg'),
    ('sushi', 'Суши с лососем', 'Нежный лосось, рис, васаби и соевый соус.', 210.00, '42 г', 'assets/photos/product-salmon-sushi.jpg'),
    ('sets', 'Сет Сакура', 'Филадельфия, Калифорния, Дракон и запеченный ролл с лососем.', 2490.00, '1180 г', 'assets/photos/product-sakura-set.jpg'),
    ('sets', 'Сет Токио', 'Большой набор роллов, суши и фирменных соусов для компании.', 3190.00, '1540 г', 'assets/photos/product-tokyo-set.jpg'),
    ('hot', 'Рамен с курицей', 'Насыщенный бульон, лапша, курица, яйцо, нори и зеленый лук.', 520.00, '420 г', 'assets/photos/product-ramen.jpg'),
    ('hot', 'Лапша якисоба', 'Пшеничная лапша с овощами, кунжутом и фирменным соусом.', 490.00, '350 г', 'assets/photos/product-yakisoba.jpg'),
    ('drinks', 'Матча айс', 'Холодный напиток на матче с молоком и легкой сладостью.', 260.00, '350 мл', 'assets/photos/product-matcha.jpg'),
    ('drinks', 'Лимонад юдзу', 'Освежающий лимонад с юдзу, лаймом и мятой.', 240.00, '400 мл', 'assets/photos/product-yuzu.jpg'),
    ('rolls', 'Запеченный лосось', 'Ролл с лососем, сыром, огурцом и запеченной сырной шапкой.', 660.00, '270 г', 'assets/photos/product-baked-salmon.jpg')
) as v(slug, name, description, price, weight, image_url)
join public.categories c on c.slug = v.slug
where not exists (
    select 1 from public.products p where p.name = v.name
);

insert into public.tags (name) values
('лосось'), ('сливочный сыр'), ('краб'), ('тобико'), ('угорь'), ('унаги'),
('тунец'), ('32 шт'), ('48 шт'), ('бульон'), ('лапша'), ('матча'), ('цитрус'), ('теплый ролл')
on conflict (name) do nothing;

insert into public.product_tags (product_id, tag_id)
select p.id, t.id
from public.products p
join (
    values
    ('Филадельфия премиум', 'лосось'), ('Филадельфия премиум', 'сливочный сыр'),
    ('Калифорния с крабом', 'краб'), ('Калифорния с крабом', 'тобико'),
    ('Дракон унаги', 'угорь'), ('Дракон унаги', 'унаги'),
    ('Суши с тунцом', 'тунец'),
    ('Суши с лососем', 'лосось'),
    ('Сет Сакура', '32 шт'),
    ('Сет Токио', '48 шт'),
    ('Рамен с курицей', 'бульон'), ('Рамен с курицей', 'лапша'),
    ('Лапша якисоба', 'лапша'),
    ('Матча айс', 'матча'),
    ('Лимонад юдзу', 'цитрус'),
    ('Запеченный лосось', 'теплый ролл')
) as m(product_name, tag_name) on m.product_name = p.name
join public.tags t on t.name = m.tag_name
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images"
on storage.objects for insert
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images"
on storage.objects for update
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images"
on storage.objects for delete
using (bucket_id = 'product-images' and public.is_admin());
