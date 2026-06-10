# База данных SAKURA

Файл `sakura_delivery_schema.sql` предназначен для MySQL Workbench.

## Как открыть в MySQL Workbench

1. Запустите MySQL Workbench.
2. Подключитесь к локальному серверу MySQL.
3. Откройте меню `File -> Open SQL Script`.
4. Выберите файл `database/sakura_delivery_schema.sql`.
5. Нажмите кнопку запуска SQL-скрипта.
6. После выполнения обновите список схем. Должна появиться база `sakura_delivery`.

## Основные таблицы

- `users` - клиенты и сотрудники.
- `roles` - роли пользователей: client, admin, manager, courier.
- `addresses` - адреса доставки клиентов.
- `categories` - категории меню.
- `products` - блюда.
- `product_tags` и `product_tag_map` - теги блюд.
- `orders` - заказы.
- `order_items` - состав заказа.
- `order_statuses` - статусы заказа.
- `payment_methods` - способы оплаты.
- `order_status_history` - история изменения статуса.
- `reviews` - отзывы.

## Как сайт будет связан с базой

HTML-страница сама по себе не подключается к MySQL безопасно. Между сайтом и базой нужен backend, например PHP.

Схема будет такой:

```text
Браузер -> HTML/CSS/JS -> PHP API -> MySQL -> PHP API -> JS -> обновление страницы
```

Например:

- `menu.html` просит у PHP список блюд.
- PHP делает запрос `SELECT * FROM products WHERE is_active = 1`.
- MySQL возвращает данные.
- PHP отдает JSON.
- JavaScript рисует карточки блюд на странице.

## Про фотографии

В профессиональном сайте администратор обычно загружает файл через форму. Backend сохраняет изображение в папку сервера или облачное хранилище, а в таблицу `products.image_url` записывает путь к файлу.

В базу обычно не кладут само изображение. В базе хранят путь, например:

```text
uploads/products/filadelfiya.jpg
```

или внешний URL:

```text
https://cdn.example.com/products/filadelfiya.jpg
```
