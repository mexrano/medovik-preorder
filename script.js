function renderProducts(items = products) {
    const grid = document.getElementById('products-grid');
    const htmlArray = items.map((product) => {
        return `
            <article class="card">
                <img src="${product.image}" alt="${product.name}" class="card-image">
                <div class="card-content">
                    <h3 class="card-title">${product.name}</h3>
                    <div class="card-bottom">
                        <span class="card-price">₺${product.price}</span>
                        <button class="btn-add" data-id="${product.id}">+</button>
                    </div>
                </div>
            </article>
        `;
    });
    grid.innerHTML = htmlArray.join('');
}

renderProducts();

let cart = [];

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const itemInCart = cart.find(item => item.id === productId);

    if (itemInCart) {
        itemInCart.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    renderCart();
}

const gridElement = document.getElementById('products-grid');

gridElement.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-add')) {
        const productId = Number(event.target.dataset.id);
        addToCart(productId);
    }
});

function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalContainer = document.getElementById('cart-total');

    if (cart.length === 0) {
        cartContainer.innerHTML = '<div class="empty-cart-message">Ваша корзина пуста.<br>Добавьте десерты из меню выше.</div>';
        totalContainer.textContent = '₺0';
        updateCartBadge();
        return;
    }

    const htmlArray = cart.map(item => {
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">₺${item.price}</span>
                </div>
                <div class="quantity-controls">
                    <button class="btn-qty btn-minus" data-id="${item.id}">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="btn-qty btn-plus" data-id="${item.id}">+</button>
                </div>
            </div>
        `;
    });

    cartContainer.innerHTML = htmlArray.join('');

    const totalPrice = cart.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    totalContainer.textContent = `₺${totalPrice}`;
    updateCartBadge();
}

const cartItemsContainer = document.getElementById('cart-items');

cartItemsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-qty')) {
        const productId = Number(event.target.dataset.id);
        const itemInCart = cart.find(item => item.id === productId);

        if (!itemInCart) return;

        if (event.target.classList.contains('btn-plus')) {
            itemInCart.quantity++;
        } else if (event.target.classList.contains('btn-minus')) {
            itemInCart.quantity--;
            if (itemInCart.quantity === 0) {
                cart = cart.filter(item => item.id !== productId);
            }
        }

        renderCart();
    }
});

const phoneInput = document.getElementById('customer-phone');

phoneInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^\d+\s-]/g, '');
});

const dateInput = document.getElementById('order-date');

const today = new Date();
const maxDate = new Date();
maxDate.setDate(today.getDate() + 14);

const formatDate = (date) => date.toLocaleDateString('en-CA');

dateInput.min = formatDate(today);
dateInput.value = formatDate(today);
dateInput.max = formatDate(maxDate);

const orderForm = document.getElementById('tg-form');

orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (cart.length === 0) {
        alert('Пожалуйста, добавьте хотя бы один десерт в корзину.');
        return;
    }

    const digitsOnly = phoneInput.value.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
        alert('Введите корректный номер телефона (минимум 10 цифр).');
        return;
    }

    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const date = document.getElementById('order-date').value;
    const time = document.getElementById('order-time').value;

    let orderText = '';
    let totalPrice = 0;

    cart.forEach((item, index) => {
        orderText += `${index + 1}. ${item.name} x${item.quantity} (₺${item.price * item.quantity})\n`;
        totalPrice += (item.price * item.quantity);
    });

    const message = `
📦 НОВЫЙ ЗАКАЗ НАВЫНОС 📦

👤 Имя: ${name}
📞 Телефон: ${phone}
📅 Дата: ${date}
⏰ Время: ${time}

🛒 ЗАКАЗ:
${orderText}
💰 ИТОГО: ₺${totalPrice}
`;

    const BOT_TOKEN = '9264813321:AAE93oeaud0jqif2bfL33cXo0V8LFy0Gq0c';
    const CHAT_ID = '7421473493';
    const URL_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    fetch(URL_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message
        })
    })
        .then(response => {
            if (response.ok) {
                alert('Заказ успешно отправлен! Мы скоро с вами свяжемся.');
                cart = [];
                renderCart();
                orderForm.reset();
            } else {
                alert('Что-то пошло не так. Попробуйте еще раз.');
            }
        })
        .catch(error => {
            console.error('Ошибка сети:', error);
            alert('Ошибка соединения. Проверьте интернет.');
        });
});

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;

    if (totalItems === 0) {
        badge.style.display = 'none';
    } else {
        badge.style.display = 'flex';
    }
}

const filtersContainer = document.getElementById('filters');
const filterBtns = document.querySelectorAll('.filter-btn');

filtersContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('filter-btn')) {
        filterBtns.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        const category = event.target.dataset.category;

        if (category === 'all') {
            renderProducts(products);
        } else {
            const filteredProducts = products.filter(p => p.category === category);
            renderProducts(filteredProducts);
        }
    }
});

renderCart();
