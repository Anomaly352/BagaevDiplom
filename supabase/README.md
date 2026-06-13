# Supabase и DaData для SAKURA

Проект работает как статический сайт на Vercel: HTML, CSS и JS лежат в репозитории, а данные хранятся в Supabase. PHP и MySQL больше не используются.

## 1. Обновить базу Supabase

1. Откройте проект в Supabase.
2. Перейдите в `SQL Editor`.
3. Откройте файл `supabase/schema.sql`.
4. Скопируйте весь SQL-код.
5. Вставьте его в Supabase и нажмите `Run`.

После запуска появятся таблицы:

- `profiles` - профили пользователей.
- `categories` - категории меню.
- `products` - блюда.
- `tags` и `product_tags` - теги блюд.
- `cart_items` - корзина пользователя.
- `orders` и `order_items` - заказы и состав заказа.
- `reviews` - отзывы.

Важно: корзина теперь хранится в `cart_items`, поэтому пользователь должен войти в аккаунт перед добавлением блюд.

## 2. Ключи Supabase

Ключи лежат в `JAva/supabase-config.js`:

```js
window.SAKURA_SUPABASE = {
    url: "https://project.supabase.co",
    anonKey: "ваш anon public key"
};
```

`anon public key` можно использовать на фронтенде. Безопасность обеспечивают RLS-политики из `schema.sql`.

## 3. Подсказки адреса DaData

В этом же файле подключен DaData:

```js
window.SAKURA_DADATA = {
    token: "ваш API-ключ DaData"
};
```

На страницах `cart.html` и `account.html` поле адреса отправляет запрос в DaData и показывает только короткий адрес по Геленджику: улица, дом, корпус.

Профессиональный вариант: хранить DaData-токен на сервере или в Vercel Serverless Function, чтобы ключ не был виден в браузере. Для дипломного статического сайта допустим учебный вариант с ключом в JS-файле.

## 4. Регистрация и вход

Для удобной демонстрации можно отключить подтверждение email:

1. Supabase -> `Authentication`.
2. `Providers`.
3. `Email`.
4. Отключить `Confirm email`.

Если подтверждение оставить включенным, после регистрации пользователь должен перейти по ссылке из письма.

## 5. Администратор

1. Зарегистрируйтесь на сайте с email `admin@sakura.ru`.
2. В Supabase откройте `SQL Editor`.
3. Выполните:

```sql
update public.profiles
set is_admin = true
where email = 'admin@sakura.ru';
```

После этого пользователь сможет входить в `admin.html`.

## 6. Проверка сайта

1. Зарегистрируйте пользователя.
2. Войдите в аккаунт.
3. Откройте меню и добавьте блюдо в корзину.
4. Проверьте таблицу `cart_items` в Supabase.
5. Оформите заказ.
6. Проверьте таблицы `orders` и `order_items`.
7. Откройте админ-панель и проверьте, что заказ появился там.

## 7. Vercel

Для Vercel:

1. Framework Preset: `Other`.
2. Build Command: пусто.
3. Output Directory: пусто.
4. Root Directory: корень репозитория.

Vercel просто отдает `index.html`, CSS и JS.
