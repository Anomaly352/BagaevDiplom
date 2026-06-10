const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: "Филадельфия премиум",
        category: "rolls",
        price: 690,
        weight: "285 г",
        tags: ["лосось", "сливочный сыр"],
        description: "Лосось, сливочный сыр, огурец, авокадо и рис нишики.",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 2,
        name: "Калифорния с крабом",
        category: "rolls",
        price: 570,
        weight: "245 г",
        tags: ["краб", "тобико"],
        description: "Краб, авокадо, огурец, японский майонез и икра тобико.",
        image: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 3,
        name: "Дракон унаги",
        category: "rolls",
        price: 840,
        weight: "300 г",
        tags: ["угорь", "унаги"],
        description: "Угорь, сливочный сыр, авокадо, кунжут и соус унаги.",
        image: "https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 4,
        name: "Суши с тунцом",
        category: "sushi",
        price: 230,
        weight: "42 г",
        tags: ["тунец"],
        description: "Классические нигири со свежим тунцом и рисом.",
        image: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 5,
        name: "Суши с лососем",
        category: "sushi",
        price: 210,
        weight: "42 г",
        tags: ["лосось"],
        description: "Нежный лосось, рис, васаби и соевый соус.",
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 6,
        name: "Сет Сакура",
        category: "sets",
        price: 2490,
        weight: "1180 г",
        tags: ["32 шт", "компания"],
        description: "Филадельфия, Калифорния, Дракон и запеченный ролл с лососем.",
        image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 7,
        name: "Сет Токио",
        category: "sets",
        price: 3190,
        weight: "1540 г",
        tags: ["48 шт", "вечеринка"],
        description: "Большой набор роллов, суши и фирменных соусов для компании.",
        image: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 8,
        name: "Рамен с курицей",
        category: "hot",
        price: 520,
        weight: "420 г",
        tags: ["бульон", "лапша"],
        description: "Насыщенный бульон, лапша, курица, яйцо, нори и зеленый лук.",
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 9,
        name: "Лапша якисоба",
        category: "hot",
        price: 490,
        weight: "350 г",
        tags: ["овощи", "соус"],
        description: "Пшеничная лапша с овощами, кунжутом и фирменным соусом.",
        image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 10,
        name: "Матча айс",
        category: "drinks",
        price: 260,
        weight: "350 мл",
        tags: ["матча"],
        description: "Холодный напиток на матче с молоком и легкой сладостью.",
        image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 11,
        name: "Лимонад юдзу",
        category: "drinks",
        price: 240,
        weight: "400 мл",
        tags: ["цитрус"],
        description: "Освежающий лимонад с юдзу, лаймом и мятой.",
        image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 12,
        name: "Запеченный лосось",
        category: "rolls",
        price: 660,
        weight: "270 г",
        tags: ["теплый ролл"],
        description: "Ролл с лососем, сыром, огурцом и запеченной сырной шапкой.",
        image: "https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&w=900&q=80"
    }
];

const storage = {
    get(key, fallback) {
        try {
            return JSON.parse(localStorage.getItem(key)) ?? fallback;
        } catch (error) {
            return fallback;
        }
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

let cart = storage.get("sakuraCart", []);
let selectedPayment = "Онлайн";

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initNavigation();
    updateCartCounters();
    initSubscribe();

    const page = document.body.dataset.page;
    if (page === "home") renderFeaturedProducts();
    if (page === "about") updatePublicStats();
    if (page === "menu") initMenuPage();
    if (page === "cart") initCartPage();
    if (page === "auth") initAuthPage();
    if (page === "account") initAccountPage();
    if (page === "admin") initAdminPage();
});

function getProducts() {
    return storage.get("sakuraProducts", DEFAULT_PRODUCTS);
}

function saveProducts(products) {
    storage.set("sakuraProducts", products);
}

function updatePublicStats() {
    setText(".js-products-count", getProducts().length);
}

function initTheme() {
    const savedTheme = localStorage.getItem("sakuraTheme") || "dark";
    applyTheme(savedTheme);

    document.querySelectorAll(".js-theme-toggle").forEach((button) => {
        button.addEventListener("click", () => {
            const nextTheme = document.body.classList.contains("theme-light") ? "dark" : "light";
            applyTheme(nextTheme);
            localStorage.setItem("sakuraTheme", nextTheme);
        });
    });
}

function applyTheme(theme) {
    const isLight = theme === "light";
    document.body.classList.toggle("theme-light", isLight);
    document.querySelectorAll(".js-theme-toggle").forEach((button) => {
        button.textContent = isLight ? "Темная" : "Светлая";
        button.setAttribute("aria-label", isLight ? "Включить темную тему" : "Включить светлую тему");
    });
}

function initNavigation() {
    const page = document.body.dataset.page;
    document.querySelectorAll("[data-nav]").forEach((link) => {
        if (link.dataset.nav === page) link.classList.add("active");
    });

    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");
    if (toggle && nav) {
        toggle.addEventListener("click", () => nav.classList.toggle("open"));
    }
}

function initSubscribe() {
    document.querySelectorAll(".js-subscribe-form").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            form.reset();
            showToast("Спасибо! Промокоды будут приходить на вашу почту.");
        });
    });
}

function formatPrice(value) {
    return `${value.toLocaleString("ru-RU")} ₽`;
}

function productCard(product) {
    const tags = product.tags.map((tag) => `<span class="badge">${tag}</span>`).join("");
    return `
        <article class="product-card">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="product-info">
                <div class="product-meta">
                    <span class="badge">${product.weight}</span>
                    ${tags}
                </div>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-footer">
                    <span class="price">${formatPrice(product.price)}</span>
                    <button class="btn btn-primary" type="button" data-add-product="${product.id}">В корзину</button>
                </div>
            </div>
        </article>
    `;
}

function bindAddButtons(root = document) {
    root.querySelectorAll("[data-add-product]").forEach((button) => {
        button.addEventListener("click", () => addToCart(Number(button.dataset.addProduct)));
    });
}

function renderFeaturedProducts() {
    const container = document.querySelector(".js-featured-products");
    if (!container) return;

    const featured = getProducts().filter((product) => [1, 3, 6].includes(product.id));
    container.innerHTML = featured.map(productCard).join("");
    bindAddButtons(container);
}

function initMenuPage() {
    const grid = document.querySelector(".js-menu-products");
    const tabs = document.querySelector(".js-menu-tabs");
    const search = document.querySelector(".js-menu-search");
    let category = "all";
    let query = "";

    const render = () => {
        const filtered = getProducts().filter((product) => {
            const matchesCategory = category === "all" || product.category === category;
            const searchable = `${product.name} ${product.description} ${product.tags.join(" ")}`.toLowerCase();
            return matchesCategory && searchable.includes(query.toLowerCase());
        });

        grid.innerHTML = filtered.length
            ? filtered.map(productCard).join("")
            : `<div class="empty-state"><h3>Ничего не найдено</h3><p>Попробуйте изменить запрос или категорию.</p></div>`;
        bindAddButtons(grid);
    };

    tabs.addEventListener("click", (event) => {
        const button = event.target.closest("[data-category]");
        if (!button) return;
        category = button.dataset.category;
        tabs.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
        button.classList.add("active");
        render();
    });

    search.addEventListener("input", () => {
        query = search.value.trim();
        render();
    });

    render();
}

function addToCart(productId) {
    const product = getProducts().find((item) => item.id === productId);
    if (!product) return;

    const existing = cart.find((item) => item.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: product.id, qty: 1 });
    }

    saveCart();
    showToast(`${product.name} добавлен в корзину.`);
}

function saveCart() {
    storage.set("sakuraCart", cart);
    updateCartCounters();
    if (document.body.dataset.page === "cart") renderCartPage();
}

function cartDetails() {
    return cart
        .map((item) => {
            const product = getProducts().find((p) => p.id === item.id);
            if (!product) return null;
            return { ...product, qty: item.qty, sum: product.price * item.qty };
        })
        .filter(Boolean);
}

function cartSubtotal() {
    return cartDetails().reduce((sum, item) => sum + item.sum, 0);
}

function deliveryPrice(subtotal) {
    if (subtotal === 0 || subtotal >= 1500) return 0;
    return 190;
}

function updateCartCounters() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll(".js-cart-count").forEach((item) => {
        item.textContent = count;
    });
}

function initCartPage() {
    document.querySelector(".js-clear-cart")?.addEventListener("click", () => {
        cart = [];
        saveCart();
        showToast("Корзина очищена.");
    });

    document.querySelectorAll(".payment").forEach((button) => {
        button.addEventListener("click", () => {
            selectedPayment = button.dataset.payment;
            document.querySelectorAll(".payment").forEach((item) => item.classList.remove("active"));
            button.classList.add("active");
        });
    });

    document.querySelector(".js-order-form")?.addEventListener("submit", submitOrder);
    prefillOrderForm();
    renderCartPage();
}

function prefillOrderForm() {
    const user = storage.get("sakuraUser", null);
    const form = document.querySelector(".js-order-form");
    if (!user || !form) return;

    form.name.value = user.name || "";
    form.phone.value = user.phone || "";
    form.address.value = user.address || "";
}

function renderCartPage() {
    const list = document.querySelector(".js-cart-items");
    if (!list) return;

    const items = cartDetails();
    if (!items.length) {
        list.innerHTML = `
            <div class="empty-state">
                <h3>Корзина пока пустая</h3>
                <p>Добавьте блюда из меню, чтобы оформить заказ.</p>
                <a class="btn btn-primary" href="menu.html">Перейти в меню</a>
            </div>
        `;
    } else {
        list.innerHTML = items.map((item) => `
            <article class="cart-row">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h3>${item.name}</h3>
                    <p>${item.weight} · ${formatPrice(item.price)}</p>
                    <div class="qty-control">
                        <button type="button" data-change-qty="${item.id}" data-delta="-1">-</button>
                        <strong>${item.qty}</strong>
                        <button type="button" data-change-qty="${item.id}" data-delta="1">+</button>
                    </div>
                </div>
                <strong class="price">${formatPrice(item.sum)}</strong>
            </article>
        `).join("");

        list.querySelectorAll("[data-change-qty]").forEach((button) => {
            button.addEventListener("click", () => changeQty(Number(button.dataset.changeQty), Number(button.dataset.delta)));
        });
    }

    const subtotal = cartSubtotal();
    const delivery = deliveryPrice(subtotal);
    document.querySelector(".js-subtotal").textContent = formatPrice(subtotal);
    document.querySelector(".js-delivery").textContent = delivery ? formatPrice(delivery) : "Бесплатно";
    document.querySelector(".js-total").textContent = formatPrice(subtotal + delivery);
}

function changeQty(productId, delta) {
    const item = cart.find((entry) => entry.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter((entry) => entry.id !== productId);
    }
    saveCart();
}

function submitOrder(event) {
    event.preventDefault();
    if (!cart.length) {
        showToast("Сначала добавьте блюда в корзину.");
        return;
    }

    const form = event.currentTarget;
    const subtotal = cartSubtotal();
    const delivery = deliveryPrice(subtotal);
    const order = {
        id: Date.now(),
        date: new Date().toLocaleString("ru-RU"),
        items: cartDetails().map((item) => ({ name: item.name, qty: item.qty, sum: item.sum })),
        subtotal,
        delivery,
        total: subtotal + delivery,
        payment: selectedPayment,
        customer: {
            name: form.name.value.trim(),
            phone: form.phone.value.trim(),
            address: form.address.value.trim(),
            comment: form.comment.value.trim()
        }
    };

    const orders = storage.get("sakuraOrders", []);
    orders.unshift(order);
    storage.set("sakuraOrders", orders);

    const user = storage.get("sakuraUser", null);
    if (user) {
        user.name = order.customer.name || user.name;
        user.phone = order.customer.phone || user.phone;
        user.address = order.customer.address || user.address;
        user.bonus = (user.bonus || 0) + Math.floor(order.total * 0.03);
        storage.set("sakuraUser", user);
    }

    cart = [];
    saveCart();
    form.reset();
    showToast("Заказ оформлен. Он появился в личном кабинете.");
}

function initAuthPage() {
    document.querySelectorAll("[data-auth-tab]").forEach((button) => {
        button.addEventListener("click", () => switchAuthTab(button.dataset.authTab));
    });

    document.querySelector(".js-register-form")?.addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const user = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            password: form.password.value,
            address: "",
            bonus: 150,
            loggedIn: true
        };
        storage.set("sakuraUser", user);
        showToast("Аккаунт создан. Перенаправляем в кабинет.");
        setTimeout(() => window.location.href = "account.html", 700);
    });

    document.querySelector(".js-login-form")?.addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const user = storage.get("sakuraUser", null);
        if (!user || user.email !== form.email.value.trim() || user.password !== form.password.value) {
            showToast("Пользователь не найден. Зарегистрируйтесь или проверьте данные.");
            return;
        }
        user.loggedIn = true;
        storage.set("sakuraUser", user);
        showToast("Вход выполнен.");
        setTimeout(() => window.location.href = "account.html", 700);
    });
}

function switchAuthTab(tab) {
    document.querySelectorAll("[data-auth-tab]").forEach((button) => {
        button.classList.toggle("active", button.dataset.authTab === tab);
    });
    document.querySelectorAll("[data-auth-form]").forEach((form) => {
        form.classList.toggle("hidden", form.dataset.authForm !== tab);
    });
}

function initAccountPage() {
    const user = storage.get("sakuraUser", null);
    const orders = storage.get("sakuraOrders", []);
    const isLoggedIn = Boolean(user?.loggedIn);

    document.querySelector(".js-profile-name").textContent = isLoggedIn ? user.name : "Гость";
    document.querySelector(".js-profile-email").textContent = isLoggedIn ? user.email : "Войдите или зарегистрируйтесь";
    document.querySelector(".js-avatar").textContent = isLoggedIn ? user.name.slice(0, 1).toUpperCase() : "S";
    document.querySelector(".js-bonus").textContent = isLoggedIn ? user.bonus || 0 : 0;
    document.querySelector(".js-orders-count").textContent = orders.length;
    document.querySelector(".js-status").textContent = isLoggedIn ? "Клиент" : "Гость";
    document.querySelector(".js-auth-link").style.display = isLoggedIn ? "none" : "inline-flex";
    document.querySelector(".js-logout").style.display = isLoggedIn ? "inline-flex" : "none";

    const form = document.querySelector(".js-profile-form");
    if (form && isLoggedIn) {
        form.name.value = user.name || "";
        form.phone.value = user.phone || "";
        form.address.value = user.address || "";
    }

    document.querySelector(".js-save-profile")?.addEventListener("click", () => {
        const current = storage.get("sakuraUser", null);
        if (!current?.loggedIn) {
            showToast("Сначала войдите в аккаунт.");
            return;
        }
        current.name = form.name.value.trim();
        current.phone = form.phone.value.trim();
        current.address = form.address.value.trim();
        storage.set("sakuraUser", current);
        showToast("Профиль сохранен.");
        initAccountPage();
    }, { once: true });

    document.querySelector(".js-logout")?.addEventListener("click", () => {
        const current = storage.get("sakuraUser", null);
        if (current) {
            current.loggedIn = false;
            storage.set("sakuraUser", current);
        }
        showToast("Вы вышли из аккаунта.");
        setTimeout(() => window.location.reload(), 500);
    }, { once: true });

    renderOrders(orders);
}

function renderOrders(orders) {
    const list = document.querySelector(".js-orders-list");
    if (!list) return;

    if (!orders.length) {
        list.innerHTML = `<div class="empty-state"><h3>Заказов пока нет</h3><p>После оформления заказа здесь появится история.</p></div>`;
        return;
    }

    list.innerHTML = orders.map((order) => {
        const items = order.items.map((item) => `${item.name} x${item.qty}`).join(", ");
        return `
            <article class="order-item">
                <strong>Заказ #${String(order.id).slice(-6)} · ${formatPrice(order.total)}</strong>
                <span>${order.date} · ${order.payment}</span>
                <p>${items}</p>
            </article>
        `;
    }).join("");
}

function initAdminPage() {
    const session = storage.get("sakuraAdminSession", null);
    const loginView = document.querySelector(".js-admin-login");
    const panelView = document.querySelector(".js-admin-panel");

    const showPanel = Boolean(session?.loggedIn);
    loginView?.classList.toggle("hidden", showPanel);
    panelView?.classList.toggle("hidden", !showPanel);

    document.querySelector(".js-admin-login-form")?.addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.email.value.trim() !== "admin@sakura.ru" || form.password.value !== "admin123") {
            showToast("Неверный логин или пароль администратора.");
            return;
        }
        storage.set("sakuraAdminSession", { loggedIn: true, email: form.email.value.trim() });
        showToast("Вход в админ-панель выполнен.");
        setTimeout(() => window.location.reload(), 500);
    });

    document.querySelector(".js-admin-logout")?.addEventListener("click", () => {
        storage.set("sakuraAdminSession", { loggedIn: false });
        showToast("Вы вышли из админ-панели.");
        setTimeout(() => window.location.reload(), 500);
    });

    if (!showPanel) return;

    document.querySelector(".js-product-form")?.addEventListener("submit", saveAdminProduct);
    document.querySelector(".js-reset-products")?.addEventListener("click", () => {
        saveProducts(DEFAULT_PRODUCTS);
        renderAdminProducts();
        renderAdminStats();
        showToast("Меню восстановлено по умолчанию.");
    });

    renderAdminStats();
    renderAdminOrders();
    renderAdminProducts();
}

function renderAdminStats() {
    const products = getProducts();
    const orders = storage.get("sakuraOrders", []);
    const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const clients = storage.get("sakuraUser", null) ? 1 : 0;

    setText(".js-admin-revenue", formatPrice(revenue));
    setText(".js-admin-orders", orders.length);
    setText(".js-admin-products", products.length);
    setText(".js-admin-clients", clients);
}

function renderAdminOrders() {
    const list = document.querySelector(".js-admin-orders-list");
    if (!list) return;

    const orders = storage.get("sakuraOrders", []);
    if (!orders.length) {
        list.innerHTML = `<div class="empty-state"><h3>Заказов пока нет</h3><p>Когда клиент оформит заказ, он появится в этой таблице.</p></div>`;
        return;
    }

    list.innerHTML = orders.map((order) => {
        const status = order.status || "Новый";
        const items = order.items.map((item) => `${item.name} x${item.qty}`).join(", ");
        return `
            <article class="admin-row">
                <div>
                    <strong>#${String(order.id).slice(-6)} · ${order.customer.name}</strong>
                    <span>${order.customer.phone} · ${order.customer.address}</span>
                    <p>${items}</p>
                </div>
                <strong>${formatPrice(order.total)}</strong>
                <select data-order-status="${order.id}">
                    ${["Новый", "Готовится", "Передан курьеру", "Выполнен", "Отменен"].map((item) => `<option value="${item}" ${item === status ? "selected" : ""}>${item}</option>`).join("")}
                </select>
            </article>
        `;
    }).join("");

    list.querySelectorAll("[data-order-status]").forEach((select) => {
        select.addEventListener("change", () => {
            const updated = storage.get("sakuraOrders", []).map((order) => {
                if (String(order.id) === String(select.dataset.orderStatus)) {
                    return { ...order, status: select.value };
                }
                return order;
            });
            storage.set("sakuraOrders", updated);
            showToast("Статус заказа обновлен.");
        });
    });
}

function renderAdminProducts() {
    const list = document.querySelector(".js-admin-products-list");
    if (!list) return;

    const products = getProducts();
    list.innerHTML = products.map((product) => `
        <article class="admin-row">
            <div>
                <strong>${product.name}</strong>
                <span>${product.category} · ${product.weight}</span>
                <p>${product.description}</p>
            </div>
            <strong>${formatPrice(product.price)}</strong>
            <button class="ghost-button" type="button" data-delete-product="${product.id}">Удалить</button>
        </article>
    `).join("");

    list.querySelectorAll("[data-delete-product]").forEach((button) => {
        button.addEventListener("click", () => {
            const products = getProducts().filter((product) => product.id !== Number(button.dataset.deleteProduct));
            saveProducts(products);
            renderAdminProducts();
            renderAdminStats();
            showToast("Позиция удалена из меню.");
        });
    });
}

async function saveAdminProduct(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const products = getProducts();
    const imageFile = form.imageFile?.files?.[0];
    const uploadedImage = imageFile ? await fileToDataUrl(imageFile) : "";
    const product = {
        id: Date.now(),
        name: form.name.value.trim(),
        category: form.category.value,
        price: Number(form.price.value),
        weight: form.weight.value.trim(),
        tags: form.tags.value.split(",").map((tag) => tag.trim()).filter(Boolean),
        description: form.description.value.trim(),
        image: uploadedImage || form.image.value.trim() || "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80"
    };

    products.unshift(product);
    saveProducts(products);
    form.reset();
    renderAdminProducts();
    renderAdminStats();
    showToast("Новая позиция добавлена в меню.");
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
}

function showToast(message) {
    const toast = document.querySelector(".js-toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}
