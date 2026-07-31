import { addToCart, showToast, updateCartBadge } from './cart.js';

const API_URL = 'https://fakestoreapi.com/products';

let currentProductDetail = null;
let currentQty = 1;

function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function fetchProductDetails() {
    const container = document.getElementById('product-detail-container');
    const productId = getProductIdFromURL();

    if (!productId) {
        container.innerHTML = `
            <div class="text-center py-12">
                <h2 class="text-xl font-bold text-slate-900">No Product Specified</h2>
                <p class="text-slate-500 mt-2">Please select a valid item from our home page.</p>
                <a href="../index.html" class="inline-block mt-4 bg-slate-900 text-white text-sm font-semibold px-6 py-2.5 rounded-full">Return to Shop</a>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${productId}`);
        if (!response.ok) throw new Error('Failed to retrieve item');

        const product = await response.json();
        currentProductDetail = product;

        renderProductDetail(product);
        setupAddToCartDetailPage();

    } catch (error) {
        console.error('Error fetching detail:', error);
        container.innerHTML = `
            <div class="text-center py-12">
                <h2 class="text-xl font-bold text-slate-900">Unable to Load Product</h2>
                <p class="text-slate-500 mt-2">The product could not be retrieved at this time.</p>
                <a href="../index.html" class="inline-block mt-4 bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full">Back to Home</a>
            </div>
        `;
    }
}

function renderProductDetail(product) {
    const container = document.getElementById('product-detail-container');
    const categoryName = typeof product.category === 'string' ? product.category : 'General';

    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            
            <!-- Product Image -->
            <div class="aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200/60 p-8 flex items-center justify-center shadow-inner">
                <img 
                    id="main-product-image" 
                    src="${product.image}" 
                    alt="${product.title}" 
                    class="max-h-full max-w-full object-contain"
                >
            </div>

            <!-- Specifications & Actions -->
            <div class="flex flex-col justify-between h-full">
                <div>
                    <span class="inline-block bg-blue-50 text-blue-600 font-semibold text-xs tracking-wide uppercase px-3 py-1 rounded-full mb-3">
                        ${categoryName}
                    </span>

                    <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                        ${product.title}
                    </h1>

                    <div class="flex items-center gap-4 mb-6">
                        <span class="text-3xl font-extrabold text-slate-900">$${Number(product.price).toFixed(2)}</span>
                        ${product.rating ? `
                            <span class="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200/60">
                                ★ ${product.rating.rate} (${product.rating.count} reviews)
                            </span>
                        ` : ''}
                    </div>

                    <div class="border-t border-b border-gray-100 py-6 mb-6">
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                        <p class="text-slate-600 leading-relaxed text-sm md:text-base">
                            ${product.description}
                        </p>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-4 pt-4">
                    <div class="flex items-center justify-between border border-gray-200 rounded-full px-4 py-2 w-full sm:w-36 bg-gray-50">
                        <button id="dec-qty" class="text-slate-500 hover:text-slate-900 font-bold px-2 py-1 select-none cursor-pointer">-</button>
                        <span id="qty-val" class="font-bold text-slate-900 text-sm">1</span>
                        <button id="inc-qty" class="text-slate-500 hover:text-slate-900 font-bold px-2 py-1 select-none cursor-pointer">+</button>
                    </div>

                    <button 
                        id="add-to-cart-btn"
                        data-id="${product.id}"
                        class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-8 rounded-full shadow-sm hover:shadow transition-all active:scale-95 text-center cursor-pointer"
                    >
                        Add to Cart
                    </button>
                </div>

            </div>

        </div>
    `;

    setupQuantitySelector();
}

function setupQuantitySelector() {
    const decBtn = document.getElementById('dec-qty');
    const incBtn = document.getElementById('inc-qty');
    const qtyVal = document.getElementById('qty-val');

    if (!decBtn || !incBtn) return;

    currentQty = 1;
    if (qtyVal) qtyVal.textContent = currentQty;

    decBtn.addEventListener('click', () => {
        if (currentQty > 1) {
            currentQty--;
            if (qtyVal) qtyVal.textContent = currentQty;
        }
    });

    incBtn.addEventListener('click', () => {
        if (currentQty < 99) {
            currentQty++;
            if (qtyVal) qtyVal.textContent = currentQty;
        }
    });
}

function setupAddToCartDetailPage() {
    const addBtn = document.getElementById('add-to-cart-btn');
    if (!addBtn) return;

    addBtn.addEventListener('click', () => {
        if (currentProductDetail) {
            addToCart(currentProductDetail, currentQty);
            showToast(`Added ${currentQty} item(s) to cart`);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    fetchProductDetails();
});