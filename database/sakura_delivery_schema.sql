DROP DATABASE IF EXISTS sakura_delivery;
CREATE DATABASE sakura_delivery
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE sakura_delivery;

CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    phone VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,
    bonus_points INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    city VARCHAR(80) NOT NULL DEFAULT 'Геленджик',
    street VARCHAR(120) NOT NULL,
    house VARCHAR(30) NOT NULL,
    apartment VARCHAR(30),
    entrance VARCHAR(30),
    floor VARCHAR(30),
    comment VARCHAR(255),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_addresses_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(80) NOT NULL UNIQUE,
    slug VARCHAR(80) NOT NULL UNIQUE,
    sort_order INT NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    product_name VARCHAR(140) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    weight_grams INT,
    image_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id),
    CONSTRAINT chk_products_price
        CHECK (price > 0)
);

CREATE TABLE product_tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE product_tag_map (
    product_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (product_id, tag_id),
    CONSTRAINT fk_product_tag_map_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_product_tag_map_tag
        FOREIGN KEY (tag_id) REFERENCES product_tags(tag_id)
        ON DELETE CASCADE
);

CREATE TABLE order_statuses (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(80) NOT NULL UNIQUE,
    sort_order INT NOT NULL
);

CREATE TABLE payment_methods (
    payment_method_id INT AUTO_INCREMENT PRIMARY KEY,
    method_name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    address_id INT,
    status_id INT NOT NULL,
    payment_method_id INT NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    delivery_address VARCHAR(255) NOT NULL,
    comment VARCHAR(255),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    delivery_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_orders_address
        FOREIGN KEY (address_id) REFERENCES addresses(address_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_orders_status
        FOREIGN KEY (status_id) REFERENCES order_statuses(status_id),
    CONSTRAINT fk_orders_payment
        FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id)
);

CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT,
    product_name VARCHAR(140) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    item_total DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE SET NULL,
    CONSTRAINT chk_order_items_quantity
        CHECK (quantity > 0)
);

CREATE TABLE order_status_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    status_id INT NOT NULL,
    changed_by_user_id INT,
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_status_history_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_order_status_history_status
        FOREIGN KEY (status_id) REFERENCES order_statuses(status_id),
    CONSTRAINT fk_order_status_history_user
        FOREIGN KEY (changed_by_user_id) REFERENCES users(user_id)
        ON DELETE SET NULL
);

CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    rating INT NOT NULL,
    review_text TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_reviews_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_reviews_rating
        CHECK (rating BETWEEN 1 AND 5)
);

INSERT INTO roles (role_name) VALUES
('client'),
('admin'),
('manager'),
('courier');

INSERT INTO users (role_id, full_name, email, phone, password_hash, bonus_points) VALUES
(2, 'Администратор Sakura', 'admin@sakura.ru', '+7 (861) 000-00-00', '$2y$demo_admin_hash', 0),
(1, 'Анна Смирнова', 'anna@mail.ru', '+7 (918) 111-22-33', '$2y$demo_client_hash', 180),
(1, 'Иван Петров', 'ivan@mail.ru', '+7 (918) 444-55-66', '$2y$demo_client_hash', 90);

INSERT INTO addresses (user_id, street, house, apartment, entrance, floor, comment, is_default) VALUES
(2, 'Мира', '23', '18', '2', '4', 'Позвонить за 10 минут', TRUE),
(3, 'Революционная', '12', '5', '1', '2', NULL, TRUE);

INSERT INTO categories (category_name, slug, sort_order) VALUES
('Роллы', 'rolls', 10),
('Суши', 'sushi', 20),
('Сеты', 'sets', 30),
('Горячее', 'hot', 40),
('Напитки', 'drinks', 50);

INSERT INTO products (category_id, product_name, description, price, weight_grams, image_url) VALUES
(1, 'Филадельфия премиум', 'Лосось, сливочный сыр, огурец, авокадо и рис нишики.', 690.00, 285, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c'),
(1, 'Калифорния с крабом', 'Краб, авокадо, огурец, японский майонез и икра тобико.', 570.00, 245, 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3'),
(1, 'Дракон унаги', 'Угорь, сливочный сыр, авокадо, кунжут и соус унаги.', 840.00, 300, 'https://images.unsplash.com/photo-1617196034183-421b4917c92d'),
(2, 'Суши с тунцом', 'Классические нигири со свежим тунцом и рисом.', 230.00, 42, 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a'),
(2, 'Суши с лососем', 'Нежный лосось, рис, васаби и соевый соус.', 210.00, 42, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351'),
(3, 'Сет Сакура', 'Филадельфия, Калифорния, Дракон и запеченный ролл с лососем.', 2490.00, 1180, 'https://images.unsplash.com/photo-1611143669185-af224c5e3252'),
(3, 'Сет Токио', 'Большой набор роллов, суши и фирменных соусов для компании.', 3190.00, 1540, 'https://images.unsplash.com/photo-1553621042-f6e147245754'),
(4, 'Рамен с курицей', 'Насыщенный бульон, лапша, курица, яйцо, нори и зеленый лук.', 520.00, 420, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624'),
(4, 'Лапша якисоба', 'Пшеничная лапша с овощами, кунжутом и фирменным соусом.', 490.00, 350, 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841'),
(5, 'Матча айс', 'Холодный напиток на матче с молоком и легкой сладостью.', 260.00, 350, 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7'),
(5, 'Лимонад юдзу', 'Освежающий лимонад с юдзу, лаймом и мятой.', 240.00, 400, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859'),
(1, 'Запеченный лосось', 'Ролл с лососем, сыром, огурцом и запеченной сырной шапкой.', 660.00, 270, 'https://images.unsplash.com/photo-1615361200141-f45040f367be');

INSERT INTO product_tags (tag_name) VALUES
('лосось'), ('сливочный сыр'), ('краб'), ('тобико'), ('угорь'), ('унаги'),
('тунец'), ('32 шт'), ('48 шт'), ('бульон'), ('лапша'), ('матча'), ('цитрус'), ('теплый ролл');

INSERT INTO product_tag_map (product_id, tag_id) VALUES
(1, 1), (1, 2),
(2, 3), (2, 4),
(3, 5), (3, 6),
(4, 7),
(5, 1),
(6, 8),
(7, 9),
(8, 10), (8, 11),
(9, 11),
(10, 12),
(11, 13),
(12, 14);

INSERT INTO order_statuses (status_name, sort_order) VALUES
('Новый', 10),
('Готовится', 20),
('Передан курьеру', 30),
('Выполнен', 40),
('Отменен', 50);

INSERT INTO payment_methods (method_name) VALUES
('Онлайн'),
('Курьеру');

INSERT INTO orders (
    user_id, address_id, status_id, payment_method_id,
    customer_name, customer_phone, delivery_address, comment,
    subtotal, delivery_price, total
) VALUES
(2, 1, 2, 1, 'Анна Смирнова', '+7 (918) 111-22-33', 'г. Геленджик, ул. Мира, 23, кв. 18', 'Без имбиря', 1590.00, 0.00, 1590.00),
(3, 2, 1, 2, 'Иван Петров', '+7 (918) 444-55-66', 'г. Геленджик, ул. Революционная, 12, кв. 5', NULL, 920.00, 190.00, 1110.00);

INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, item_total) VALUES
(1, 1, 'Филадельфия премиум', 1, 690.00, 690.00),
(1, 3, 'Дракон унаги', 1, 840.00, 840.00),
(1, 10, 'Матча айс', 1, 260.00, 260.00),
(2, 2, 'Калифорния с крабом', 1, 570.00, 570.00),
(2, 5, 'Суши с лососем', 1, 210.00, 210.00),
(2, 11, 'Лимонад юдзу', 1, 240.00, 240.00);

INSERT INTO order_status_history (order_id, status_id, changed_by_user_id) VALUES
(1, 1, 1),
(1, 2, 1),
(2, 1, 1);

INSERT INTO reviews (user_id, product_id, rating, review_text) VALUES
(2, 1, 5, 'Очень нежный лосось и аккуратная подача.'),
(3, 2, 5, 'Свежий вкус и быстрая доставка.');
