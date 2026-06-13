<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SAKURA — Премиальная доставка японской кухни</title>
    
    <!-- Шрифты -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet">

    <style>
        :root {
            --primary: #E61E43;
            --bg-dark: #0A0A0B;
            --card-bg: #141416;
            --input-bg: #1A1A1C;
            --text-main: #FFFFFF;
            --text-muted: #717171;
            --header-h: 80px;
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Общие стили */
        * { margin: 0; padding: 0; box-sizing: border-box; cursor: default; }
        input, button, a { cursor: pointer; }
        input { cursor: text; }

        body {
            background-color: var(--bg-dark);
            color: var(--text-main);
            font-family: 'Montserrat', sans-serif;
            line-height: 1.6;
            overflow-x: hidden;
            scroll-behavior: smooth;
        }

        /* Фон со звездами */
        .stars-bg {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1.5px, transparent 0);
            background-size: 60px 60px;
            z-index: -1;
        }

        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

        /* Шапка */
        header {
            position: fixed;
            top: 0; left: 0; width: 100%; height: var(--header-h);
            background: rgba(10, 10, 11, 0.8);
            backdrop-filter: blur(10px);
            z-index: 1000;
            display: flex;
            align-items: center;
        }

        .header-content { display: flex; justify-content: space-between; align-items: center; width: 100%; }
        
        .logo { font-weight: 700; font-size: 20px; letter-spacing: 2px; text-decoration: none; color: #fff; }
        .logo span { color: var(--primary); }

        nav { display: flex; gap: 30px; }
        nav a { 
            text-decoration: none; color: #fff; font-size: 11px; 
            font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; 
            transition: var(--transition); opacity: 0.8;
        }
        nav a:hover { opacity: 1; color: var(--primary); }

        .cart-icon-wrapper { position: relative; }
        .cart-count {
            position: absolute; top: -8px; right: -10px;
            background: var(--primary); color: #fff; font-size: 9px;
            width: 16px; height: 16px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; font-weight: 700;
        }

        /* Первый экран */
        .hero {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1920&q=80');
            background-size: cover; background-position: center;
        }

        .hero-pre { color: var(--primary); letter-spacing: 4px; font-size: 12px; text-transform: uppercase; margin-bottom: 20px; font-weight: 500; }
        .hero h1 { font-family: 'Playfair Display', serif; font-size: 80px; line-height: 1.1; margin-bottom: 25px; }
        .hero h1 i { font-weight: 400; font-style: italic; }
        .hero-desc { max-width: 600px; margin: 0 auto 40px; color: rgba(255,255,255,0.6); font-size: 15px; }

        .btn-group { display: flex; gap: 15px; justify-content: center; }
        .btn {
            padding: 16px 35px; border-radius: 30px; font-weight: 700; font-size: 11px;
            text-transform: uppercase; letter-spacing: 1px; text-decoration: none;
            transition: var(--transition); border: 1px solid transparent;
        }
        .btn-primary { background: var(--primary); color: #fff; }
        .btn-primary:hover { background: #ff2a50; transform: translateY(-3px); }
        .btn-outline { border-color: rgba(255,255,255,0.2); color: #fff; }
        .btn-outline:hover { background: #fff; color: #000; }

        /* Секция Меню */
        .section { padding: 120px 0; }
        .section-header { text-align: center; margin-bottom: 60px; }
        .section-header h2 { font-family: 'Playfair Display', serif; font-size: 48px; margin-bottom: 10px; }
        .section-header p { color: var(--text-muted); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; }

        .tabs { display: flex; justify-content: center; gap: 10px; margin-bottom: 60px; }
        .tab-btn {
            background: none; border: 1px solid #222; color: #fff;
            padding: 10px 30px; border-radius: 25px; font-size: 12px; font-weight: 600;
            transition: var(--transition);
        }
        .tab-btn.active { background: var(--primary); border-color: var(--primary); }

        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; }
        
        /* Карточки товаров */
        .card { background: var(--card-bg); border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.03); transition: var(--transition); }
        .card:hover { transform: translateY(-10px); border-color: rgba(255,255,255,0.1); }
        .card-img { height: 240px; background: #1c1c1f; position: relative; }
        .card-img img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; }
        .badge { position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.6); padding: 5px 12px; border-radius: 6px; font-size: 11px; color: var(--primary); }
        
        .card-content { padding: 30px; }
        .card-content h3 { font-family: 'Playfair Display', serif; font-size: 22px; margin-bottom: 10px; }
        .card-content p { color: var(--text-muted); font-size: 13px; margin-bottom: 25px; height: 40px; overflow: hidden; }
        
        .card-footer { display: flex; justify-content: space-between; align-items: center; }
        .price { font-size: 20px; font-weight: 700; }
        .add-btn {
            width: 40px; height: 40px; border-radius: 50%; border: none;
            background: #222; color: #fff; font-size: 20px; transition: var(--transition);
        }
        .add-btn:hover { background: var(--primary); }

        /* О нас */
        .about-row { display: flex; gap: 80px; align-items: center; }
        .about-img { flex: 1; height: 400px; background: #1c1c1f; border-radius: 30px; overflow: hidden; }
        .about-text { flex: 1; }
        .about-text h2 { font-family: 'Playfair Display', serif; font-size: 42px; color: var(--primary); margin-bottom: 25px; }
        .about-text p { color: rgba(255,255,255,0.6); margin-bottom: 40px; font-size: 15px; }
        
        .stats { display: flex; gap: 30px; }
        .stat-item { flex: 1; background: #111; padding: 25px; border-radius: 20px; border: 1px solid #1a1a1c; }
        .stat-val { display: block; font-size: 24px; font-weight: 700; color: var(--primary); margin-bottom: 5px; }
        .stat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }

        /* Футер */
        footer { padding: 100px 0 50px; border-top: 1px solid #1a1a1c; background: #070708; }
        .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.5fr; gap: 60px; margin-bottom: 80px; }
        .footer-col h4 { font-size: 12px; letter-spacing: 2px; margin-bottom: 30px; color: #fff; }
        .footer-col a, .footer-col p { display: block; color: var(--text-muted); text-decoration: none; margin-bottom: 12px; font-size: 14px; transition: var(--transition); }
        .footer-col a:hover { color: #fff; }

        .sub-form { display: flex; background: #151517; padding: 6px; border-radius: 12px; border: 1px solid #222; }
        .sub-form input { background: none; border: none; color: #fff; padding: 10px 15px; flex: 1; outline: none; }
        .sub-btn { background: var(--primary); border: none; width: 40px; height: 40px; border-radius: 10px; color: #fff; display: flex; align-items: center; justify-content: center; }

        .copyright { text-align: center; color: #333; font-size: 12px; }

        /* КОРЗИНА */
        .cart-overlay {
            position: fixed; top: 0; right: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 1100; opacity: 0; visibility: hidden; transition: var(--transition);
        }
        .cart-overlay.active { opacity: 1; visibility: visible; }

        .cart-sidebar {
            position: fixed; top: 0; right: -420px; width: 420px; height: 100%;
            background: #0d0d0f; z-index: 1200; transition: var(--transition);
            padding: 50px 40px; display: flex; flex-direction: column;
        }
        .cart-sidebar.active { right: 0; }

        .cart-sidebar h2 { font-family: 'Playfair Display', serif; font-size: 32px; margin-bottom: 40px; }
        .cart-items { flex: 1; overflow-y: auto; }
        .cart-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #1a1a1c; padding-bottom: 20px; }
        .item-info h4 { font-size: 16px; margin-bottom: 8px; }
        .item-qty { display: flex; gap: 15px; align-items: center; color: var(--text-muted); }
        .qty-btn { background: none; border: none; color: #fff; font-size: 18px; }

        .cart-footer { padding-top: 30px; border-top: 1px solid #222; }
        .total-row { display: flex; justify-content: space-between; font-size: 20px; font-weight: 700; margin-bottom: 30px; }
        .total-row span:last-child { color: var(--primary); }

        /* МОДАЛКА ОФОРМЛЕНИЯ ЗАКАЗКА */
        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 2000; display: none; align-items: center; justify-content: center;
        }
        .modal-overlay.active { display: flex; }

        .checkout-box {
            background: #0D0D0F; width: 100%; max-width: 600px; padding: 60px;
            border-radius: 40px; position: relative; border: 1px solid #1a1a1c;
        }
        .checkout-box h2 { font-family: 'Playfair Display', serif; font-size: 42px; margin-bottom: 15px; }
        .checkout-box p.subtitle { color: var(--text-muted); margin-bottom: 45px; font-size: 14px; }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
        .input-group label { display: block; font-size: 11px; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 12px; text-transform: uppercase; font-weight: 600; }
        .input-group input { 
            width: 100%; background: #141416; border: 1px solid #222; 
            padding: 18px 25px; border-radius: 15px; color: #fff; outline: none; transition: var(--transition);
        }
        .input-group input:focus { border-color: var(--primary); }

        .pay-section { margin-top: 40px; }
        .pay-options { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
        .pay-option {
            background: #141416; border: 1px solid #222; color: var(--text-muted);
            padding: 18px; border-radius: 15px; text-align: center; font-size: 13px; font-weight: 600; transition: var(--transition);
        }
        .pay-option.active { border-color: var(--primary); color: var(--primary); background: rgba(230, 30, 67, 0.05); }

        .modal-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 50px; padding-top: 30px; border-top: 1px solid #1a1a1c; }
        .final-price { font-size: 24px; font-weight: 700; }
        .cancel-btn { color: var(--text-muted); text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 1px; }

        /* Иконка чата на будущее идейя*/
        .chat-btn {
            position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px;
            background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center;
            box-shadow: 0 10px 20px rgba(230, 30, 67, 0.3); z-index: 500;
        }

        /* Адаптив */
        @media (max-width: 992px) {
            .hero h1 { font-size: 50px; }
            .about-row { flex-direction: column; gap: 40px; }
            .footer-grid { grid-template-columns: 1fr 1fr; }
            .cart-sidebar { width: 100%; right: -100%; }
        }
    </style>
</head>
<body>

    <div class="stars-bg"></div>

    <!-- Шапка -->
    <header>
        <div class="container header-content">
            <a href="#" class="logo"><span>S</span> SAKURA</a>
            <nav>
                <a href="#home">Главная</a>
                <a href="#menu">Меню</a>
                <a href="#about">О нас</a>
                <a href="#footer">Доставка</a>
            </nav>
            <div class="cart-icon-wrapper" onclick="toggleCart(true)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <div class="cart-count" id="cart-count">0</div>
            </div>
        </div>
    </header>

    <!-- Герой -->
    <section class="hero" id="home">
        <div class="container">
            <p class="hero-pre">Премиальная доставка в Геленджике</p>
            <h1>Вкус Истинной<br><i>Японии</i></h1>
            <p class="hero-desc">Авторские роллы от лучших шеф-поваров. Мы превращаем обычный ужин в изысканное гастрономическое путешествие.</p>
            <div class="btn-group">
                <a href="#menu" class="btn btn-primary">Перейти в меню</a>
                <a href="#about" class="btn btn-outline">О нас</a>
            </div>
        </div>
    </section>

    <!-- Меню -->
    <section class="section" id="menu">
        <div class="container">
            <div class="section-header">
                <h2>Наше Меню</h2>
                <p>Искусство японской кухни в каждом кусочке</p>
            </div>

            <div class="tabs">
                <button class="tab-btn active" onclick="filterMenu('all', this)">Все</button>
                <button class="tab-btn" onclick="filterMenu('rolls', this)">Роллы</button>
                <button class="tab-btn" onclick="filterMenu('sushi', this)">Суши</button>
                <button class="tab-btn" onclick="filterMenu('sets', this)">Сеты</button>
            </div>

            <div class="grid" id="menu-grid">
                <!-- Карточки генерируются скриптом -->
            </div>
        </div>
    </section>

    <!-- О нас -->
    <section class="section" id="about">
        <div class="container">
            <div class="about-row">
                <div class="about-img">
                    <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" alt="Интерьер" style="width:100%; height:100%; object-fit:cover">
                </div>
                <div class="about-text">
                    <h2>O Sakura Gelendzhik</h2>
                    <p>Мы привозим лучшие морепродукты прямиком в курортный Геленджик. Наши повара обучались у мастеров Токио, чтобы вы могли насладиться аутентичным вкусом премиальной японской кухни, не выходя из дома.</p>
                    <div class="stats">
                        <div class="stat-item">
                            <span class="stat-val">~45 мин</span>
                            <span class="stat-label">Средняя доставка</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-val">100%</span>
                            <span class="stat-label">Свежие продукты</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Футер -->
    <footer id="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col">
                    <a href="#" class="logo" style="margin-bottom:25px; display:block"><span>S</span> SAKURA</a>
                    <p>Премиальная доставка японской кухни в городе-курорте Геленджик. Мы ценим качество и время наших клиентов.</p>
                </div>
                <div class="footer-col">
                    <h4>НАВИГАЦИЯ</h4>
                    <a href="#home">Главная</a>
                    <a href="#menu">Меню</a>
                    <a href="#about">О нас</a>
                    <a href="#footer">Доставка и оплата</a>
                </div>
                <div class="footer-col">
                    <h4>КОНТАКТЫ</h4>
                    <p>г. Геленджик, ул. Мира, 23</p>
                    <p>+7 (861) 000-00-00</p>
                    <p>ежедневно: 10:00 — 23:00</p>
                    <p>info@sakura-gel.ru</p>
                </div>
                <div class="footer-col">
                    <h4>ПОДПИСКА</h4>
                    <p>Получайте секретные промокоды первыми!</p>
                    <form class="sub-form">
                        <input type="email" placeholder="Email">
                        <button class="sub-btn" type="button">→</button>
                    </form>
                </div>
            </div>
            <p class="copyright">© 2026 Sakura Premium Gelendzhik. Все права защищены.</p>
        </div>
    </footer>

    <!-- Корзина -->
    <div class="cart-overlay" id="cart-overlay" onclick="toggleCart(false)"></div>
    <div class="cart-sidebar" id="cart-sidebar">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px">
            <h2>Ваш заказ</h2>
            <button class="qty-btn" onclick="toggleCart(false)" style="font-size:30px">×</button>
        </div>
        <div class="cart-items" id="cart-items">
            <!-- Элементы корзины -->
        </div>
        <div class="cart-footer">
            <div class="total-row">
                <span>ИТОГО:</span>
                <span id="cart-total">0 ₽</span>
            </div>
            <button class="btn btn-primary btn-full" style="width:100%" onclick="openCheckout()">Оформить заказ</button>
        </div>
    </div>

    <!-- Модалка оформления -->
    <div class="modal-overlay" id="checkout-modal">
        <div class="checkout-box">
            <h2>Оформление</h2>
            <p class="subtitle">Пожалуйста, заполните данные для доставки</p>
            
            <form onsubmit="finishCheckout(event)">
                <div class="form-row">
                    <div class="input-group">
                        <label>Имя</label>
                        <input type="text" placeholder="Иван Иванов" required>
                    </div>
                    <div class="input-group">
                        <label>Телефон</label>
                        <input type="tel" placeholder="+7 (___) ___-__-__" required>
                    </div>
                </div>
                <div class="input-group">
                    <label>Адрес в Геленджике</label>
                    <input type="text" placeholder="ул. Революционная, д. 1" required>
                </div>

                <div class="pay-section">
                    <label>Способ оплаты</label>
                    <div class="pay-options">
                        <div class="pay-option active" onclick="selectPay(this)">Картой онлайн</div>
                        <div class="pay-option" onclick="selectPay(this)">Наличными курьеру</div>
                    </div>
                </div>

                <div class="modal-footer">
                    <div>
                        <span style="color:var(--text-muted); font-size:14px">Сумма к оплате: </span>
                        <span class="final-price" id="final-price">0 ₽</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:30px">
                        <a href="javascript:void(0)" class="cancel-btn" onclick="closeCheckout()">ОТМЕНА</a>
                        <button type="submit" class="btn btn-primary">Подтвердить</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <div class="chat-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </div>

    <script>
        const products = [
            { id: 1, name: "Филадельфия Премиум", category: "rolls", price: 850, weight: "280г", desc: "Лосось, сливочный сыр, огурец, икра тобико.", img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500" },
            { id: 2, name: "Калифорния с Крабом", category: "rolls", price: 650, weight: "240г", desc: "Снежный краб, авокадо, огурец, тобико.", img: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=500" },
            { id: 3, name: "Дракон Ролл", category: "rolls", price: 920, weight: "300г", desc: "Угорь, сливочный сыр, авокадо, соус унаги.", img: "https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=500" },
            { id: 4, name: "Суши Тунец", category: "sushi", price: 250, weight: "40г", desc: "Классические суши со свежим тунцом.", img: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=500" },
            { id: 5, name: "Запеченный с Лососем", category: "rolls", price: 780, weight: "260г", desc: "Теплый ролл с нежной шапочкой.", img: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=500" },
            { id: 6, name: "Сет Геленджик", category: "sets", price: 2400, weight: "1200г", desc: "Большой набор из 32 роллов для компании.", img: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500" }
        ];

        let cart = [];

        // Рендер меню
        function renderMenu(items) {
            const grid = document.getElementById('menu-grid');
            grid.innerHTML = items.map(p => `
                <div class="card">
                    <div class="card-img">
                        <img src="${p.img}" alt="${p.name}">
                        <span class="badge">${p.weight}</span>
                    </div>
                    <div class="card-content">
                        <h3>${p.name}</h3>
                        <p>${p.desc}</p>
                        <div class="card-footer">
                            <span class="price">${p.price} ₽</span>
                            <button class="add-btn" onclick="addToCart(${p.id})">+</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function filterMenu(cat, btn) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
            renderMenu(filtered);
        }

        // Корзина
        function addToCart(id) {
            const product = products.find(p => p.id === id);
            const inCart = cart.find(item => item.id === id);
            if (inCart) {
                inCart.qty++;
            } else {
                cart.push({ ...product, qty: 1 });
            }
            updateCart();
            toggleCart(true);
        }

        function updateCart() {
            const itemsCont = document.getElementById('cart-items');
            const totalCont = document.getElementById('cart-total');
            const countCont = document.getElementById('cart-count');
            
            let total = 0;
            itemsCont.innerHTML = cart.map(item => {
                total += item.price * item.qty;
                return `
                    <div class="cart-item">
                        <div class="item-info">
                            <h4>${item.name}</h4>
                            <div class="item-qty">
                                <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
                                <span>${item.qty}</span>
                                <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                            </div>
                        </div>
                        <div class="price">${item.price * item.qty} ₽</div>
                    </div>
                `;
            }).join('');

            totalCont.innerText = `${total} ₽`;
            countCont.innerText = cart.length;
            document.getElementById('final-price').innerText = `${total} ₽`;
        }

        function changeQty(id, delta) {
            const item = cart.find(i => i.id === id);
            item.qty += delta;
            if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
            updateCart();
        }

        function toggleCart(show) {
            document.getElementById('cart-sidebar').classList.toggle('active', show);
            document.getElementById('cart-overlay').classList.toggle('active', show);
        }

        // Оформление
        function openCheckout() {
            if(cart.length === 0) return alert('Корзина пуста!');
            toggleCart(false);
            document.getElementById('checkout-modal').classList.add('active');
        }

        function closeCheckout() {
            document.getElementById('checkout-modal').classList.remove('active');
        }

        function selectPay(el) {
            document.querySelectorAll('.pay-option').forEach(o => o.classList.remove('active'));
            el.classList.add('active');
        }

        function finishCheckout(e) {
            e.preventDefault();
            alert('Заказ успешно оформлен! Наш менеджер свяжется с вами.');
            cart = [];
            updateCart();
            closeCheckout();
        }

        // Инициализация
        renderMenu(products);
    </script>
</body>
</html>