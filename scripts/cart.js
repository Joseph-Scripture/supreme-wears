const CART_STORAGE_KEY = 'supreme_wears_cart';

export function getCart() {
    try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        return storedCart ? JSON.parse(storedCart) : [];
    } catch {
        console.warn('Cart data corrupted. Clearing storage.');
        localStorage.removeItem(CART_STORAGE_KEY);
        return [];
    }
}


export function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
}


function cleanImageUrl(imgSource) {
    if (!imgSource) return '';
    return typeof imgSource === 'string' ? imgSource : '';
}
export function addToCart(product, quantityToAdd = 1) {
    if (!product || quantityToAdd < 1) return;

    let cart = getCart();
    const existingIndex = cart.findIndex(item => String(item.id) === String(product.id));

    const image = cleanImageUrl(product.image);
    const categoryName = typeof product.category === 'string' 
        ? product.category 
        : (product.category?.name || 'General');

    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantityToAdd;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: Number(product.price),
            image: image,
            category: categoryName,
            quantity: quantityToAdd
        });
    }

    saveCart(cart);
}


export function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => String(item.id) !== String(productId));
    saveCart(cart);
}

export function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    let cart = getCart();
    const item = cart.find(item => String(item.id) === String(productId));
    if (item) {
        item.quantity = newQuantity;
        saveCart(cart);
    }
}

export function getCartTotals() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, itemCount };
}

export function updateCartBadge() {
    const { itemCount } = getCartTotals();
    const badgeElements = document.querySelectorAll('.cart-count-badge');
    badgeElements.forEach(badge => {
        badge.textContent = itemCount;
    });
}
export function clearCart(){

}

let toastTimer = null;

export function showToast(message = 'Item added to cart!') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    if (!toast || !toastMessage) return;

    if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
    }

    toastMessage.textContent = message;

    toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
    toast.classList.add('translate-y-0', 'opacity-100');

    toastTimer = setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
        toastTimer = null;
    }, 2500);
}

document.addEventListener('DOMContentLoaded', updateCartBadge);