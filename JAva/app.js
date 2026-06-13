const config = window.SAKURA_SUPABASE || {};
const dadataConfig = window.SAKURA_DADATA || {};
const supabaseReady = Boolean(
    window.supabase &&
    config.url &&
    config.anonKey &&
    !config.url.includes("PASTE_") &&
    !config.anonKey.includes("PASTE_")
);
const db = supabaseReady ? window.supabase.createClient(config.url, config.anonKey) : null;

let productsCache = [];
let cart = [];
let selectedPayment = "Онлайн";

document.addEventListener("DOMContentLoaded", async () => {
    initTheme();
    initNavigation();
    initSubscribe();
    initPhoneMasks();
    initAddressSuggestions();
    await loadProducts();
    await loadCart();
    updateCartCounters();

    const page = document.body.dataset.page;
    if (page === "home") renderFeaturedProducts();
    if (page === "about") updatePublicStats();
    if (page === "menu") initMenuPage();
    if (page === "cart") initCartPage();
    if (page === "auth") initAuthPage();
    if (page === "account") initAccountPage();
    if (page === "admin") initAdminPage();
});

function initTheme() {
    applyTheme("dark");

    document.querySelectorAll(".js-theme-toggle").forEach((button) => {
        button.addEventListener("click", () => {
            const nextTheme = document.body.classList.contains("theme-light") ? "dark" : "light";
            applyTheme(nextTheme);
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

function initPhoneMasks() {
    document.querySelectorAll('input[type="tel"], input[name="phone"]').forEach((input) => {
        input.placeholder = "+7 (999) 999 99-99";
        input.inputMode = "tel";
        input.maxLength = 18;

        input.addEventListener("input", () => {
            input.value = formatRussianPhone(input.value);
        });

        input.addEventListener("focus", () => {
            if (!input.value.trim()) input.value = "+7 ";
        });

        input.addEventListener("blur", () => {
            if (input.value.replace(/\D/g, "").length <= 1) input.value = "";
        });

        if (input.value) input.value = formatRussianPhone(input.value);
    });
}

function formatRussianPhone(value) {
    let digits = value.replace(/\D/g, "");

    if (digits.startsWith("8")) digits = "7" + digits.slice(1);
    if (!digits.startsWith("7")) digits = "7" + digits;

    const body = digits.slice(1, 11);
    let result = "+7";

    if (body.length > 0) result += " (" + body.slice(0, 3);
    if (body.length >= 3) result += ")";
    if (body.length > 3) result += " " + body.slice(3, 6);
    if (body.length > 6) result += " " + body.slice(6, 8);
    if (body.length > 8) result += "-" + body.slice(8, 10);

    return result;
}

function initAddressSuggestions() {
    document.querySelectorAll('input[name="address"]').forEach((input) => {
        input.autocomplete = "off";
        input.placeholder = "Введите адрес доставки";

        const box = document.createElement("div");
        box.className = "address-suggest hidden";
        input.insertAdjacentElement("afterend", box);

        let timer = null;
        input.addEventListener("input", () => {
            clearTimeout(timer);
            const query = input.value.trim();
            if (query.length < 2) {
                box.classList.add("hidden");
                return;
            }
            timer = setTimeout(() => loadAddressSuggestions(query, box, input), 350);
        });

        document.addEventListener("click", (event) => {
            if (!event.target.closest(".address-suggest") && event.target !== input) {
                box.classList.add("hidden");
            }
        });
    });
}

async function loadAddressSuggestions(query, box, input) {
    if (!dadataConfig.token || dadataConfig.token.includes("PASTE_")) {
        box.innerHTML = `<button type="button" disabled>Вставьте API-ключ DaData в JAva/supabase-config.js</button>`;
        box.classList.remove("hidden");
        return;
    }

    try {
        const response = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Token ${dadataConfig.token}`
            },
            body: JSON.stringify({
                query: `Геленджик ${query}`,
                count: hasHouseNumber(query) ? 10 : 6,
                from_bound: { value: "street" },
                to_bound: { value: hasHouseNumber(query) ? "house" : "street" },
                locations: [{ city: "Геленджик" }],
                restrict_value: true
            })
        });
        const data = await response.json();
        const seen = new Set();
        const isHouseSearch = hasHouseNumber(query);
        const suggestions = (data.suggestions || [])
            .filter((suggestion) => isHouseSearch ? suggestion.data?.house : suggestion.data?.street_with_type)
            .map((suggestion) => isHouseSearch ? formatGelendzhikAddress(suggestion) : formatGelendzhikStreet(suggestion))
            .filter((address) => {
                const key = normalizeAddressKey(address);
                if (!address || seen.has(key)) return false;
                seen.add(key);
                return true;
            });

        if (!suggestions.length) {
            box.classList.add("hidden");
            return;
        }

        box.innerHTML = suggestions.map((address) => (
            `<button type="button" data-address="${escapeHtml(address)}">${escapeHtml(address)}</button>`
        )).join("");
        box.classList.remove("hidden");
        box.querySelectorAll("[data-address]").forEach((button) => {
            button.addEventListener("click", () => {
                input.value = button.dataset.address;
                box.classList.add("hidden");
            });
        });
    } catch (error) {
        console.warn(error);
        box.classList.add("hidden");
    }
}

function formatGelendzhikAddress(suggestion) {
    const data = suggestion.data || {};
    const street = data.street_with_type || "";
    const house = data.house ? `${data.house_type || "д."} ${data.house}` : "";
    const block = data.block ? `${data.block_type || "к."} ${data.block}` : "";
    return [street, house, block].filter(Boolean).join(", ");
}

function formatGelendzhikStreet(suggestion) {
    return suggestion.data?.street_with_type || "";
}

function normalizeAddressKey(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function hasHouseNumber(value) {
    return /\d/.test(value);
}

async function loadProducts() {
    if (!db) {
        productsCache = [];
        return productsCache;
    }

    const { data, error } = await db
        .from("products")
        .select("id,name,description,price,weight,image_url,is_active,categories(slug),product_tags(tags(name))")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.warn(error);
        showToast("Не удалось загрузить меню из Supabase.");
        productsCache = [];
        return productsCache;
    }

    productsCache = data.map(productFromDb);
    return productsCache;
}

function productFromDb(row) {
    const tagRows = Array.isArray(row.product_tags) ? row.product_tags : [];
    return {
        id: row.id,
        name: row.name,
        category: row.categories?.slug || "rolls",
        price: Number(row.price),
        weight: row.weight || "",
        tags: tagRows.map((item) => item.tags?.name).filter(Boolean),
        description: row.description || "",
        image: row.image_url || "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80"
    };
}

function getProducts() {
    return productsCache;
}

function formatPrice(value) {
    return `${Number(value || 0).toLocaleString("ru-RU")} ₽`;
}

function productCard(product) {
    const tags = product.tags.map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join("");
    return `
        <article class="product-card">
            <img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy">
            <div class="product-info">
                <div class="product-meta">
                    <span class="badge">${escapeHtml(product.weight)}</span>
                    ${tags}
                </div>
                <h3>${escapeHtml(product.name)}</h3>
                <p>${escapeHtml(product.description)}</p>
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
        button.addEventListener("click", () => addToCart(button.dataset.addProduct));
    });
}

function renderFeaturedProducts() {
    const container = document.querySelector(".js-featured-products");
    if (!container) return;

    container.innerHTML = getProducts().slice(0, 3).map(productCard).join("");
    bindAddButtons(container);
}

function updatePublicStats() {
    setText(".js-products-count", getProducts().length);
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

    tabs?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-category]");
        if (!button) return;
        category = button.dataset.category;
        tabs.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
        button.classList.add("active");
        render();
    });

    search?.addEventListener("input", () => {
        query = search.value.trim();
        render();
    });

    render();
}

async function addToCart(productId) {
    const product = getProducts().find((item) => String(item.id) === String(productId));
    if (!product) return;

    if (!db) {
        showToast("Подключите Supabase, чтобы корзина сохранялась в базе данных.");
        return;
    }

    const profile = await currentProfile();
    if (!profile?.authUser) {
        showToast("Войдите в аккаунт, чтобы добавить блюдо в корзину.");
        return;
    }

    const existing = cart.find((item) => String(item.id) === String(productId));
    const nextQty = existing ? existing.qty + 1 : 1;
    const { error } = await db.from("cart_items").upsert({
        user_id: profile.id,
        product_id: product.id,
        quantity: nextQty
    }, { onConflict: "user_id,product_id" });

    if (error) {
        showToast(error.message);
        return;
    }

    await loadCart();
    saveCart();
    showToast(`${product.name} добавлен в корзину.`);
}

function saveCart() {
    updateCartCounters();
    if (document.body.dataset.page === "cart") renderCartPage();
}

async function loadCart() {
    if (!db) {
        cart = [];
        return cart;
    }

    const profile = await currentProfile();
    if (!profile?.authUser) {
        cart = [];
        return cart;
    }

    const { data, error } = await db
        .from("cart_items")
        .select("product_id,quantity")
        .eq("user_id", profile.id);

    if (error) {
        console.warn(error);
        cart = [];
        return cart;
    }

    cart = (data || []).map((item) => ({
        id: item.product_id,
        qty: item.quantity
    }));
    return cart;
}

function cartDetails() {
    return cart
        .map((item) => {
            const product = getProducts().find((p) => String(p.id) === String(item.id));
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
    document.querySelector(".js-clear-cart")?.addEventListener("click", async () => {
        const profile = await currentProfile();
        if (db && profile?.authUser) {
            await db.from("cart_items").delete().eq("user_id", profile.id);
        }
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

async function prefillOrderForm() {
    const form = document.querySelector(".js-order-form");
    if (!form) return;

    const profile = await currentProfile();
    if (!profile) return;

    form.name.value = profile.full_name || "";
    form.phone.value = profile.phone || "";
    form.address.value = profile.address || "";
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
                <img src="${item.image}" alt="${escapeHtml(item.name)}">
                <div>
                    <h3>${escapeHtml(item.name)}</h3>
                    <p>${escapeHtml(item.weight)} · ${formatPrice(item.price)}</p>
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
            button.addEventListener("click", () => changeQty(button.dataset.changeQty, Number(button.dataset.delta)));
        });
    }

    const subtotal = cartSubtotal();
    const delivery = deliveryPrice(subtotal);
    setText(".js-subtotal", formatPrice(subtotal));
    setText(".js-delivery", delivery ? formatPrice(delivery) : "Бесплатно");
    setText(".js-total", formatPrice(subtotal + delivery));
}

async function changeQty(productId, delta) {
    const item = cart.find((entry) => String(entry.id) === String(productId));
    if (!item) return;

    item.qty += delta;
    const profile = await currentProfile();
    if (!db || !profile?.authUser) {
        cart = [];
        saveCart();
        showToast("Войдите в аккаунт, чтобы управлять корзиной.");
        return;
    }

    if (item.qty <= 0) {
        const { error } = await db
            .from("cart_items")
            .delete()
            .eq("user_id", profile.id)
            .eq("product_id", productId);
        if (error) {
            showToast(error.message);
            return;
        }
    } else {
        const { error } = await db
            .from("cart_items")
            .update({ quantity: item.qty })
            .eq("user_id", profile.id)
            .eq("product_id", productId);
        if (error) {
            showToast(error.message);
            return;
        }
    }

    await loadCart();
    saveCart();
}

async function submitOrder(event) {
    event.preventDefault();
    if (!cart.length) {
        showToast("Сначала добавьте блюда в корзину.");
        return;
    }

    const form = event.currentTarget;
    const details = cartDetails();
    const subtotal = cartSubtotal();
    const delivery = deliveryPrice(subtotal);
    const total = subtotal + delivery;
    if (!db) {
        showToast("Подключите Supabase, чтобы оформить заказ.");
        return;
    }

    const profile = await currentProfile();
    if (!profile?.authUser) {
        showToast("Войдите в аккаунт, чтобы оформить заказ.");
        return;
    }

    const { data: order, error } = await db
        .from("orders")
        .insert({
            user_id: profile.id,
            status: "new",
            payment_method: selectedPayment,
            customer_name: form.name.value.trim(),
            customer_phone: form.phone.value.trim(),
            delivery_address: form.address.value.trim(),
            comment: form.comment.value.trim(),
            subtotal,
            delivery_price: delivery,
            total
        })
        .select("id")
        .single();

    if (error) {
        showToast(error.message);
        return;
    }

    const orderItems = details.map((item) => ({
        order_id: order.id,
        product_id: String(item.id).startsWith("local-") ? null : item.id,
        product_name: item.name,
        quantity: item.qty,
        unit_price: item.price,
        item_total: item.sum
    }));
    const { error: itemsError } = await db.from("order_items").insert(orderItems);

    if (itemsError) {
        showToast(itemsError.message);
        return;
    }

    await finishLocalOrder(form);
}

async function finishLocalOrder(form) {
    const profile = await currentProfile();
    if (db && profile?.authUser) {
        await db.from("cart_items").delete().eq("user_id", profile.id);
    }
    cart = [];
    saveCart();
    form.reset();
    showToast("Заказ оформлен. Он появился в личном кабинете и админ-панели.");
}

function initAuthPage() {
    document.querySelectorAll("[data-auth-tab]").forEach((button) => {
        button.addEventListener("click", () => switchAuthTab(button.dataset.authTab));
    });

    document.querySelector(".js-register-form")?.addEventListener("submit", registerUser);
    document.querySelector(".js-login-form")?.addEventListener("submit", loginUser);
}

async function registerUser(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!db) {
        showToast("Вставьте ключи Supabase в JAva/supabase-config.js.");
        return;
    }

    const fullName = form.name.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;

    if (!form.agreement.checked) {
        showToast("Примите политику конфиденциальности и пользовательское соглашение.");
        return;
    }

    const { data, error } = await db.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, phone } }
    });

    if (error) {
        showToast(error.message);
        return;
    }

    if (data.user) {
        await db.from("profiles").upsert({
            id: data.user.id,
            full_name: fullName,
            phone,
            email
        });
    }

    showToast("Аккаунт создан. Если включено подтверждение email, проверьте почту.");
    setTimeout(() => window.location.href = "account.html", 900);
}

async function loginUser(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!db) {
        showToast("Вставьте ключи Supabase в JAva/supabase-config.js.");
        return;
    }

    const { error } = await db.auth.signInWithPassword({
        email: form.email.value.trim(),
        password: form.password.value
    });

    if (error) {
        showToast(error.message);
        return;
    }

    showToast("Вход выполнен.");
    setTimeout(() => window.location.href = "account.html", 700);
}

function switchAuthTab(tab) {
    document.querySelectorAll("[data-auth-tab]").forEach((button) => {
        button.classList.toggle("active", button.dataset.authTab === tab);
    });
    document.querySelectorAll("[data-auth-form]").forEach((form) => {
        form.classList.toggle("hidden", form.dataset.authForm !== tab);
    });
}

async function currentProfile() {
    if (!db) return null;

    const { data: authData } = await db.auth.getUser();
    const user = authData?.user;
    if (!user) return null;

    const { data, error } = await db
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        console.warn(error);
        return null;
    }

    return data ? { ...data, authUser: user } : { id: user.id, email: user.email, authUser: user };
}

async function initAccountPage() {
    const profile = await currentProfile();
    const isLoggedIn = Boolean(profile?.authUser);
    const orders = await loadUserOrders(profile?.id);
    const spent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const role = !isLoggedIn ? "Гость" : profile.is_admin ? "Админ" : "Клиент";

    setText(".js-profile-name", isLoggedIn ? profile.full_name || "Клиент" : "Гость");
    setText(".js-profile-email", isLoggedIn ? profile.email : "Войдите или зарегистрируйтесь");
    setText(".js-avatar", isLoggedIn ? (profile.full_name || profile.email || "S").slice(0, 1).toUpperCase() : "S");
    setText(".js-spent", formatPrice(spent));
    setText(".js-orders-count", orders.length);
    setText(".js-status", role);

    const authLink = document.querySelector(".js-auth-link");
    const logout = document.querySelector(".js-logout");
    if (authLink) authLink.style.display = isLoggedIn ? "none" : "inline-flex";
    if (logout) logout.style.display = isLoggedIn ? "inline-flex" : "none";

    const form = document.querySelector(".js-profile-form");
    if (form && isLoggedIn) {
        form.name.value = profile.full_name || "";
        form.phone.value = profile.phone || "";
        form.address.value = profile.address || "";
    }

    document.querySelector(".js-save-profile")?.addEventListener("click", async () => {
        if (!db || !isLoggedIn) {
            showToast("Сначала войдите в аккаунт.");
            return;
        }

        const { error } = await db.from("profiles").update({
            full_name: form.name.value.trim(),
            phone: form.phone.value.trim(),
            address: form.address.value.trim()
        }).eq("id", profile.id);

        showToast(error ? error.message : "Профиль сохранен.");
    }, { once: true });

    logout?.addEventListener("click", async () => {
        if (db) await db.auth.signOut();
        showToast("Вы вышли из аккаунта.");
        setTimeout(() => window.location.reload(), 500);
    }, { once: true });

    renderOrders(orders);
}

async function loadUserOrders(userId) {
    if (!db || !userId) return [];

    const { data, error } = await db
        .from("orders")
        .select("*,order_items(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        console.warn(error);
        return [];
    }
    return data || [];
}

function renderOrders(orders) {
    const list = document.querySelector(".js-orders-list");
    if (!list) return;

    if (!orders.length) {
        list.innerHTML = `<div class="empty-state"><h3>Заказов пока нет</h3><p>После оформления заказа здесь появится история.</p></div>`;
        return;
    }

    list.innerHTML = orders.map((order) => {
        const items = order.order_items
            ? order.order_items.map((item) => `${item.product_name} x${item.quantity}`).join(", ")
            : (order.items || []).map((item) => `${item.name} x${item.qty}`).join(", ");
        const date = order.created_at ? new Date(order.created_at).toLocaleString("ru-RU") : order.date;
        return `
            <article class="order-item">
                <strong>Заказ #${String(order.id).slice(0, 8)} · ${formatPrice(order.total)}</strong>
                <span>${date} · ${order.payment_method || order.payment}</span>
                <p>${escapeHtml(items)}</p>
            </article>
        `;
    }).join("");
}

async function initAdminPage() {
    const profile = await currentProfile();
    const isAdmin = Boolean(profile?.is_admin);
    const loginView = document.querySelector(".js-admin-login");
    const panelView = document.querySelector(".js-admin-panel");

    loginView?.classList.toggle("hidden", isAdmin);
    panelView?.classList.toggle("hidden", !isAdmin);

    document.querySelector(".js-admin-login-form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (!db) {
            showToast("Вставьте ключи Supabase в JAva/supabase-config.js.");
            return;
        }

        const { error } = await db.auth.signInWithPassword({
            email: form.email.value.trim(),
            password: form.password.value
        });

        if (error) {
            showToast(error.message);
            return;
        }

        const adminProfile = await currentProfile();
        if (!adminProfile?.is_admin) {
            await db.auth.signOut();
            showToast("У пользователя нет прав администратора.");
            return;
        }

        showToast("Вход в админ-панель выполнен.");
        setTimeout(() => window.location.reload(), 600);
    });

    document.querySelector(".js-admin-logout")?.addEventListener("click", async () => {
        if (db) await db.auth.signOut();
        showToast("Вы вышли из админ-панели.");
        setTimeout(() => window.location.reload(), 500);
    });

    if (!isAdmin) return;

    document.querySelector(".js-product-form")?.addEventListener("submit", saveAdminProduct);
    initAdminFilters();
    document.querySelector(".js-reset-products")?.addEventListener("click", () => {
        showToast("В Supabase меню сбрасывается через SQL seed-скрипт.");
    });

    await renderAdminStats();
    await renderAdminOrders();
    renderAdminProducts();
    await renderAdminClients();
}

function initAdminFilters() {
    const tabs = document.querySelector(".admin-tabs");
    if (!tabs) return;

    tabs.addEventListener("click", (event) => {
        const button = event.target.closest("[data-admin-view]");
        if (!button) return;

        const view = button.dataset.adminView;
        tabs.querySelectorAll("[data-admin-view]").forEach((tab) => {
            tab.classList.toggle("active", tab === button);
        });
        document.querySelectorAll("[data-admin-section]").forEach((section) => {
            section.classList.toggle("hidden", section.dataset.adminSection !== view);
        });
    });

    document.querySelectorAll("[data-admin-section]").forEach((section) => {
        section.classList.toggle("hidden", section.dataset.adminSection !== "orders");
    });
}

async function renderAdminStats() {
    const orders = await loadAdminOrders();
    const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    let clients = 0;
    if (db) {
        const { count } = await db.from("profiles").select("id", { count: "exact", head: true });
        clients = count || 0;
    }

    setText(".js-admin-revenue", formatPrice(revenue));
    setText(".js-admin-orders", orders.length);
    setText(".js-admin-products", getProducts().length);
    setText(".js-admin-clients", clients);
}

async function loadAdminOrders() {
    if (!db) return [];
    const { data, error } = await db
        .from("orders")
        .select("*,order_items(*)")
        .order("created_at", { ascending: false });
    if (error) {
        console.warn(error);
        return [];
    }
    return data || [];
}

async function renderAdminOrders() {
    const list = document.querySelector(".js-admin-orders-list");
    if (!list) return;

    const orders = await loadAdminOrders();
    if (!orders.length) {
        list.innerHTML = `<div class="empty-state"><h3>Заказов пока нет</h3><p>Когда клиент оформит заказ, он появится в этой таблице.</p></div>`;
        return;
    }

    list.innerHTML = orders.map((order) => {
        const items = (order.order_items || []).map((item) => `${item.product_name} x${item.quantity}`).join(", ");
        return `
            <article class="admin-row">
                <div>
                    <strong>#${String(order.id).slice(0, 8)} · ${escapeHtml(order.customer_name)}</strong>
                    <span>${escapeHtml(order.customer_phone)} · ${escapeHtml(order.delivery_address)}</span>
                    <p>${escapeHtml(items)}</p>
                </div>
                <strong>${formatPrice(order.total)}</strong>
                <select data-order-status="${order.id}">
                    ${["new", "cooking", "courier", "done", "cancelled"].map((status) => `<option value="${status}" ${status === order.status ? "selected" : ""}>${statusLabel(status)}</option>`).join("")}
                </select>
            </article>
        `;
    }).join("");

    list.querySelectorAll("[data-order-status]").forEach((select) => {
        select.addEventListener("change", async () => {
            const { error } = await db.from("orders").update({ status: select.value }).eq("id", select.dataset.orderStatus);
            showToast(error ? error.message : "Статус заказа обновлен.");
        });
    });
}

function renderAdminProducts() {
    const list = document.querySelector(".js-admin-products-list");
    if (!list) return;

    list.innerHTML = getProducts().map((product) => `
        <article class="admin-row">
            <div>
                <strong>${escapeHtml(product.name)}</strong>
                <span>${escapeHtml(product.category)} · ${escapeHtml(product.weight)}</span>
                <p>${escapeHtml(product.description)}</p>
            </div>
            <strong>${formatPrice(product.price)}</strong>
            <button class="ghost-button" type="button" data-delete-product="${product.id}">Удалить</button>
        </article>
    `).join("");

    list.querySelectorAll("[data-delete-product]").forEach((button) => {
        button.addEventListener("click", async () => {
            const id = button.dataset.deleteProduct;
            if (!db || String(id).startsWith("local-")) {
                showToast("Подключите Supabase, чтобы управлять меню.");
                return;
            }

            const { error } = await db.from("products").update({ is_active: false }).eq("id", id);
            if (error) {
                showToast(error.message);
                return;
            }
            await loadProducts();
            renderAdminProducts();
            await renderAdminStats();
            showToast("Позиция удалена из меню.");
        });
    });
}

async function renderAdminClients() {
    const list = document.querySelector(".js-admin-clients-list");
    if (!list) return;

    if (!db) {
        list.innerHTML = `<div class="empty-state"><h3>Клиенты недоступны</h3><p>Подключите Supabase, чтобы видеть пользователей.</p></div>`;
        return;
    }

    const { data, error } = await db
        .from("profiles")
        .select("id,email,full_name,phone,address,is_admin,created_at")
        .order("created_at", { ascending: false });

    if (error) {
        list.innerHTML = `<div class="empty-state"><h3>Не удалось загрузить клиентов</h3><p>${escapeHtml(error.message)}</p></div>`;
        return;
    }

    if (!data.length) {
        list.innerHTML = `<div class="empty-state"><h3>Клиентов пока нет</h3><p>После регистрации пользователи появятся здесь.</p></div>`;
        return;
    }

    list.innerHTML = data.map((client) => `
        <article class="admin-row">
            <div>
                <strong>${escapeHtml(client.full_name || client.email || "Клиент")}</strong>
                <span>${escapeHtml(client.is_admin ? "Админ" : "Клиент")} · ${escapeHtml(client.email || "email не указан")}</span>
                <p>${escapeHtml([client.phone, client.address].filter(Boolean).join(" · ") || "Контактные данные не заполнены")}</p>
            </div>
        </article>
    `).join("");
}

async function saveAdminProduct(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!db) {
        showToast("Вставьте ключи Supabase в JAva/supabase-config.js.");
        return;
    }

    const categorySlug = form.category.value;
    const { data: category, error: categoryError } = await db
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();

    if (categoryError) {
        showToast(categoryError.message);
        return;
    }

    let imageUrl = form.image.value.trim();
    const imageFile = form.imageFile?.files?.[0];
    if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const filePath = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
        const upload = await db.storage.from("product-images").upload(filePath, imageFile);
        if (upload.error) {
            showToast(upload.error.message);
            return;
        }
        imageUrl = db.storage.from("product-images").getPublicUrl(filePath).data.publicUrl;
    }

    const { data: product, error } = await db
        .from("products")
        .insert({
            category_id: category.id,
            name: form.name.value.trim(),
            price: Number(form.price.value),
            weight: form.weight.value.trim(),
            description: form.description.value.trim(),
            image_url: imageUrl
        })
        .select("id")
        .single();

    if (error) {
        showToast(error.message);
        return;
    }

    const tags = form.tags.value.split(",").map((tag) => tag.trim()).filter(Boolean);
    for (const tagName of tags) {
        const { data: tag } = await db.from("tags").upsert({ name: tagName }, { onConflict: "name" }).select("id").single();
        if (tag) await db.from("product_tags").insert({ product_id: product.id, tag_id: tag.id });
    }

    form.reset();
    await loadProducts();
    renderAdminProducts();
    await renderAdminStats();
    showToast("Новая позиция добавлена в меню.");
}

function statusLabel(status) {
    return {
        new: "Новый",
        cooking: "Готовится",
        courier: "Передан курьеру",
        done: "Выполнен",
        cancelled: "Отменен"
    }[status] || status;
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
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
