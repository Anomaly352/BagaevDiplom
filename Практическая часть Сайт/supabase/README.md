# Supabase для SAKURA

Эта папка нужна для подключения сайта к Supabase. Supabase заменяет PHP + MySQL: он дает базу Postgres, регистрацию пользователей, API и хранилище файлов.

## 1. Создать проект

1. Откройте https://supabase.com
2. Создайте новый проект.
3. Придумайте пароль от базы и сохраните его.
4. Дождитесь, пока проект создастся.

## 2. Создать таблицы

1. В Supabase откройте `SQL Editor`.
2. Нажмите `New query`.
3. Откройте файл `supabase/schema.sql`.
4. Скопируйте весь SQL в редактор Supabase.
5. Нажмите `Run`.

После этого появятся таблицы:

- `profiles` - профили пользователей.
- `categories` - категории меню.
- `products` - товары.
- `tags` - теги товаров.
- `product_tags` - связь товаров и тегов.
- `orders` - заказы.
- `order_items` - состав заказа.
- `reviews` - отзывы.

Также создастся Storage bucket `product-images` для фотографий блюд.

## 3. Вставить ключи в сайт

1. В Supabase откройте `Project Settings`.
2. Перейдите в `API`.
3. Скопируйте `Project URL`.
4. Скопируйте `anon public` key.
5. Откройте файл `JAva/supabase-config.js`.
6. Замените значения:

```js
window.SAKURA_SUPABASE = {
    url: "ВАШ_PROJECT_URL",
    anonKey: "ВАШ_ANON_PUBLIC_KEY"
};
```

`anon public` key можно использовать на фронте. Это не пароль администратора. Доступ к данным ограничивают RLS-политики из `schema.sql`.

## 4. Настроить регистрацию

Для дипломного проекта удобнее временно отключить обязательное подтверждение email:

1. Откройте `Authentication`.
2. Перейдите в `Providers`.
3. Откройте `Email`.
4. Если включено подтверждение почты, можно отключить `Confirm email`.

Если подтверждение оставить включенным, после регистрации пользователь должен будет перейти по ссылке из письма.

## 5. Создать администратора

1. Откройте сайт.
2. Зарегистрируйтесь через страницу `auth.html` с email `admin@sakura.ru`.
3. В Supabase откройте `SQL Editor`.
4. Выполните:

```sql
update public.profiles
set is_admin = true
where email = 'admin@sakura.ru';
```

После этого этот пользователь сможет входить в `admin.html`.

## 6. Как сайт теперь работает

Схема такая:

```text
Vercel hosting
HTML/CSS/JS
    |
    | Supabase JS SDK
    v
Supabase Auth + Postgres + Storage
```

Примеры:

- `menu.html` читает блюда из таблицы `products`.
- `auth.html` регистрирует пользователя через Supabase Auth.
- `cart.html` создает записи в `orders` и `order_items`.
- `account.html` показывает профиль и историю заказов.
- `admin.html` показывает заказы, товары и позволяет добавлять блюда.

## 7. Что загрузить на GitHub и Vercel

На GitHub загружается весь проект, кроме служебных папок из `.gitignore`.

Для Vercel:

1. Подключите GitHub-репозиторий.
2. Framework Preset: `Other`.
3. Build Command: оставить пустым.
4. Output Directory: оставить пустым или указать корень проекта.
5. После деплоя откройте `index.html`.

Так как проект статический, Vercel просто отдаст HTML, CSS и JS.
