import { getCart, removeFromCart, updateQuantity, getCartTotals, updateCartBadge } from './cart.js';

function renderCartPage() {
    const cart = getCart();
    const itemsContainer = document.getElementById('cart-items-container');
    const summaryContainer = document.getElementById('cart-summary-container');

    if (!itemsContainer || !summaryContainer) return;

    if (cart.length === 0) {
        itemsContainer.innerHTML = `
            <div class="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h2 class="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
                <p class="text-slate-500 text-sm mb-6">Looks like you haven't added any products to your cart yet.</p>
                <a href="../index.html" class="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-full transition-colors active:scale-95 text-sm">
                    Start Shopping
                </a>
            </div>
        `;
        itemsContainer.classList.remove('lg:col-span-2');
        itemsContainer.classList.add('col-span-full');
        summaryContainer.classList.add('hidden');
        return;
    }

    itemsContainer.classList.add('lg:col-span-2');
    itemsContainer.classList.remove('col-span-full');
    summaryContainer.classList.remove('hidden');

    itemsContainer.innerHTML = cart.map(item => `
        <div class="bg-white rounded-2xl p-4 md:p-6 border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between" data-id="${item.id}">
            <div class="flex items-center gap-4 w-full sm:w-auto">
                <img 
                    src="${item.image}" 
                    alt="${item.title}" 
                    class="size-20 rounded-xl object-cover bg-slate-100 shrink-0"
                >
                <div>
                    <span class="text-xs font-semibold text-blue-600 uppercase tracking-wide">${item.category}</span>
                    <h3 class="font-semibold text-slate-900 text-base line-clamp-1">${item.title}</h3>
                    <p class="text-slate-900 font-bold mt-1">$${Number(item.price).toFixed(2)}</p>
                </div>
            </div>

            <div class="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                <div class="flex items-center border border-gray-200 rounded-full px-3 py-1 bg-gray-50">
                    <button class="btn-qty-dec text-slate-500 hover:text-slate-900 font-bold px-2 select-none cursor-pointer">-</button>
                    <span class="font-bold text-slate-900 text-sm px-2">${item.quantity}</span>
                    <button class="btn-qty-inc text-slate-500 hover:text-slate-900 font-bold px-2 select-none cursor-pointer">+</button>
                </div>

                <span class="font-extrabold text-slate-900 text-base min-w-[70px] text-right">
                    $${(Number(item.price) * item.quantity).toFixed(2)}
                </span>

                <button aria-label="Remove item" class="btn-remove text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    `).join('');

    updateSummary();
}

function updateSummary() {
    const subtotalEl = document.getElementById('summary-subtotal');
    const taxEl = document.getElementById('summary-tax');
    const totalEl = document.getElementById('summary-total');

    if (!subtotalEl || !taxEl || !totalEl) return;

    const { subtotal } = getCartTotals();
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
}

function attachCartEventListeners() {
    const itemsContainer = document.getElementById('cart-items-container');
    if (!itemsContainer) return;

    itemsContainer.addEventListener('click', (e) => {
        const row = e.target.closest('[data-id]');
        if (!row) return;

        const productId = row.getAttribute('data-id');

        if (e.target.closest('.btn-qty-dec')) {
            const currentItem = getCart().find(item => String(item.id) === String(productId));
            if (currentItem) {
                updateQuantity(productId, currentItem.quantity - 1);
                renderCartPage();
            }
        }

        if (e.target.closest('.btn-qty-inc')) {
            const currentItem = getCart().find(item => String(item.id) === String(productId));
            if (currentItem) {
                updateQuantity(productId, currentItem.quantity + 1);
                renderCartPage();
            }
        }

        if (e.target.closest('.btn-remove')) {
            removeFromCart(productId);
            renderCartPage();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderCartPage();
    attachCartEventListeners();
});