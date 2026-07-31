import { getCart, clearCart } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
    initCheckout();
});

function initCheckout() {
    const cart = getCart();

    // If cart is empty, prevent access to checkout
    if (!cart || cart.length === 0) {
        renderEmptyCartRedirect();
        return;
    }

    renderOrderSummary(cart);
    setupFormHandler();
}

function renderOrderSummary(cart) {
    const container = document.getElementById('checkout-items');
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');

    if (!container) return;

    let subtotal = 0;

    container.innerHTML = cart.map(item => {
        const itemTotal = Number(item.price) * item.quantity;
        subtotal += itemTotal;

        return `
            <div class="py-3 flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                    <img src="${item.image}" alt="${item.title}" class="w-12 h-12 object-contain bg-white rounded-lg border border-gray-100 p-1 shrink-0">
                    <div class="min-w-0">
                        <h4 class="text-xs font-bold text-slate-900 truncate">${item.title}</h4>
                        <p class="text-[11px] text-slate-500">Qty: ${item.quantity}</p>
                    </div>
                </div>
                <span class="text-xs font-bold text-slate-900 shrink-0">$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    }).join('');

    const shipping = 5.00;
    const grandTotal = subtotal + shipping;

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${grandTotal.toFixed(2)}`;
}


function setupFormHandler() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Process order completion
        clearCart();

        // Replace content with Order Confirmation View
        const container = document.getElementById('checkout-container');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full bg-white p-10 rounded-2xl border border-gray-200/80 text-center max-w-lg mx-auto my-8">
                    <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 class="text-2xl font-extrabold text-slate-900">Order Confirmed!</h2>
                    <p class="text-slate-500 text-sm mt-2">Thank you for your purchase. We've received your order and are preparing it for shipment.</p>
                    <a href="../index.html" class="inline-block mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-full transition-all">
                        Return to Shop
                    </a>
                </div>
            `;
        }
    });
}

function renderEmptyCartRedirect() {
    const container = document.getElementById('checkout-container');
    if (container) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200/80">
                <h3 class="text-slate-900 font-bold text-lg">Your cart is empty</h3>
                <p class="text-slate-500 text-xs mt-1">Add items to your cart before proceeding to checkout.</p>
                <a href="../index.html" class="inline-block mt-4 bg-slate-900 text-white text-xs font-semibold px-5 py-2.5 rounded-full">
                    Explore Products
                </a>
            </div>
        `;
    }
}