import { addToCart, showToast, updateCartBadge } from './cart.js';

const API_URL = 'https://fakestoreapi.com/products';

// Global state
let allProducts = [];
let activeCategory = 'all';
let searchQuery = '';
let currentSort = 'default';

// Slider state
let currentSlideIndex = 0;
let slideInterval = null;
let heroProducts = [];

/**
 * Initialize page components and data fetching
 */
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    initApp();
});

async function initApp() {
    setupEventListeners();
    await fetchCategories();
    await fetchProducts();
}

/**
 * Fetch all products from Fake Store API
 */
async function fetchProducts() {
    // FIX: Using the container ID actually present in index.html
    const grid = document.getElementById('featured-products');
    if (!grid) return;

    renderSkeletons(grid, 8);

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch product catalog');

        allProducts = await response.json();

        // Populate Hero Slider with the first 4 items
        heroProducts = allProducts.slice(0, 4);
        renderHeroSlider(heroProducts);

        // Render main catalog
        applyFiltersAndRender();
    } catch (error) {
        console.error('Error fetching products:', error);
        renderErrorState(grid);
    }
}

/**
 * Fetch category list dynamically from API
 */
async function fetchCategories() {
    const categoryContainer = document.getElementById('category-filters');
    if (!categoryContainer) return;

    try {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');

        const categories = await response.json();
        renderCategoryButtons(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

/**
 * Render category pill buttons dynamically
 */
function renderCategoryButtons(categories) {
    const container = document.getElementById('category-filters');
    if (!container) return;

    const categoryButtonsHTML = `
        <button 
            data-category="all" 
            class="category-btn active border px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer bg-slate-900 text-white border-slate-900 shrink-0"
        >
            All Products
        </button>
        ${categories.map(cat => `
            <button 
                data-category="${cat}" 
                class="category-btn border px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer bg-white text-slate-600 border-gray-200 hover:border-slate-400 shrink-0"
            >
                ${cat}
            </button>
        `).join('')}
    `;

    container.innerHTML = categoryButtonsHTML;
}

/**
 * Apply active search, category, and sorting filters then render grid
 */
function applyFiltersAndRender() {
    const grid = document.getElementById('featured-products');
    if (!grid) return;

    let filtered = [...allProducts];

    // 1. Filter by Category
    if (activeCategory !== 'all') {
        filtered = filtered.filter(item => 
            String(item.category).toLowerCase() === activeCategory.toLowerCase()
        );
    }

    // 2. Filter by Search Input
    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query)
        );
    }

    // 3. Sort by Price or Rating
    if (currentSort === 'price-low') {
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (currentSort === 'price-high') {
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (currentSort === 'rating') {
        filtered.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
    }

    // 4. Render output
    if (filtered.length === 0) {
        renderEmptyState(grid);
    } else {
        renderProductGrid(grid, filtered);
    }
}

/**
 * Render product cards into DOM grid
 */
function renderProductGrid(container, products) {
    container.innerHTML = products.map(product => `
        <article class="bg-white rounded-2xl border border-gray-200/60 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
            <div>
                <!-- Image Wrapper -->
                <a href="pages/product-detail.html?id=${product.id}" class="block aspect-square w-full bg-white rounded-xl mb-4 overflow-hidden p-4 relative flex items-center justify-center border border-gray-100">
                    <img 
                        src="${product.image}" 
                        alt="${product.title}" 
                        class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    >
                </a>

                <!-- Meta Details -->
                <div class="flex items-center justify-between gap-2 mb-1.5">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md truncate max-w-[70%]">
                        ${product.category}
                    </span>
                    ${product.rating ? `
                        <span class="text-[11px] font-semibold text-amber-600 flex items-center gap-1 shrink-0">
                            ★ ${product.rating.rate}
                        </span>
                    ` : ''}
                </div>

                <!-- Product Title -->
                <a href="pages/product-detail.html?id=${product.id}" class="block">
                    <h3 class="font-bold text-slate-900 text-sm line-clamp-2 hover:text-blue-600 transition-colors leading-snug" title="${product.title}">
                        ${product.title}
                    </h3>
                </a>
            </div>

            <!-- Price & Actions -->
            <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <span class="font-extrabold text-slate-900 text-lg">
                    $${Number(product.price).toFixed(2)}
                </span>

                <button 
                    data-action="add-to-cart" 
                    data-id="${product.id}"
                    class="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-full transition-all active:scale-95 cursor-pointer shrink-0"
                >
                    Add to Cart
                </button>
            </div>
        </article>
    `).join('');
}

/**
 * Render and control Hero Slider
 */
function renderHeroSlider(products) {
    const slidesContainer = document.getElementById('slides-container');
    const dotsContainer = document.getElementById('pagination-dots');

    if (!slidesContainer || products.length === 0) return;

    slidesContainer.innerHTML = products.map((product, idx) => `
        <div class="hero-slide absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-between px-8 md:px-20 ${idx === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}">
            <!-- Background Backdrop blur image -->
            <div class="absolute inset-0 z-0 overflow-hidden">
                <img src="${product.image}" class="w-full h-full object-cover blur-3xl opacity-20 scale-125" alt="backdrop">
                <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent"></div>
            </div>

            <!-- Foreground Content -->
            <div class="relative z-10 max-w-xl text-white">
                <span class="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    Featured Collection
                </span>
                <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight mt-4 leading-tight line-clamp-2">
                    ${product.title}
                </h1>
                <p class="text-slate-300 text-sm md:text-base mt-3 line-clamp-2 max-w-md">
                    ${product.description}
                </p>
                <div class="mt-6 flex items-center gap-4">
                    <a href="pages/product-detail.html?id=${product.id}" class="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-full text-sm transition-all shadow-lg shadow-blue-600/30">
                        Shop Now • $${Number(product.price).toFixed(2)}
                    </a>
                </div>
            </div>

            <div class="hidden lg:flex relative z-10 w-80 h-80 items-center justify-center p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl">
                <img src="${product.image}" alt="${product.title}" class="max-h-full max-w-full object-contain drop-shadow-2xl">
            </div>
        </div>
    `).join('');

    if (dotsContainer) {
        dotsContainer.innerHTML = products.map((_, idx) => `
            <button data-slide-dot="${idx}" aria-label="Go to slide ${idx + 1}" class="slide-dot w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${idx === 0 ? 'bg-white w-8' : 'bg-white/40'}"></button>
        `).join('');
    }

    startAutoSlide();
}

function showSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slide-dot');

    if (slides.length === 0) return;

    if (index >= slides.length) currentSlideIndex = 0;
    else if (index < 0) currentSlideIndex = slides.length - 1;
    else currentSlideIndex = index;

    slides.forEach((slide, idx) => {
        if (idx === currentSlideIndex) {
            slide.classList.remove('opacity-0', 'z-0');
            slide.classList.add('opacity-100', 'z-10');
        } else {
            slide.classList.remove('opacity-100', 'z-10');
            slide.classList.add('opacity-0', 'z-0');
        }
    });

    dots.forEach((dot, idx) => {
        if (idx === currentSlideIndex) {
            dot.classList.remove('bg-white/40', 'w-2.5');
            dot.classList.add('bg-white', 'w-8');
        } else {
            dot.classList.remove('bg-white', 'w-8');
            dot.classList.add('bg-white/40', 'w-2.5');
        }
    });
}

function startAutoSlide() {
    stopAutoSlide();
    slideInterval = setInterval(() => {
        showSlide(currentSlideIndex + 1);
    }, 5000);
}

function stopAutoSlide() {
    if (slideInterval) clearInterval(slideInterval);
}

/**
 * Register Event Listeners
 */
function setupEventListeners() {
    // 1. Delegated Add-To-Cart
    const grid = document.getElementById('featured-products');
    if (grid) {
        grid.addEventListener('click', (e) => {
            const addBtn = e.target.closest('[data-action="add-to-cart"]');
            if (!addBtn) return;

            const productId = addBtn.dataset.id;
            const targetProduct = allProducts.find(p => String(p.id) === String(productId));

            if (targetProduct) {
                addToCart(targetProduct, 1);
                showToast(`Added "${targetProduct.title.substring(0, 20)}..." to cart`);
            }
        });
    }

    // 2. Mobile Menu Toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const closeIcon = document.getElementById('close-icon');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden', !isHidden);
            mobileMenu.classList.toggle('flex', isHidden);

            hamburgerIcon?.classList.toggle('hidden', isHidden);
            closeIcon?.classList.toggle('hidden', !isHidden);
        });
    }

    // 3. Category Filter Click Handling
    const categoryContainer = document.getElementById('category-filters');
    if (categoryContainer) {
        categoryContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.category-btn');
            if (!btn) return;

            activeCategory = btn.dataset.category;

            document.querySelectorAll('.category-btn').forEach(b => {
                b.classList.remove('bg-slate-900', 'text-white', 'border-slate-900');
                b.classList.add('bg-white', 'text-slate-600', 'border-gray-200');
            });
            btn.classList.remove('bg-white', 'text-slate-600', 'border-gray-200');
            btn.classList.add('bg-slate-900', 'text-white', 'border-slate-900');

            applyFiltersAndRender();
        });
    }

    // 4. Unified Search Input Event Listeners (Desktop + Mobile)
    const handleSearchInput = (e) => {
        searchQuery = e.target.value;
        applyFiltersAndRender();
    };

    document.getElementById('search-desktop')?.addEventListener('input', handleSearchInput);
    document.getElementById('search-mobile')?.addEventListener('input', handleSearchInput);

    // 5. Slider Controls
    document.getElementById('prev-slide')?.addEventListener('click', () => {
        stopAutoSlide();
        showSlide(currentSlideIndex - 1);
        startAutoSlide();
    });

    document.getElementById('next-slide')?.addEventListener('click', () => {
        stopAutoSlide();
        showSlide(currentSlideIndex + 1);
        startAutoSlide();
    });

    document.getElementById('pagination-dots')?.addEventListener('click', (e) => {
        const dot = e.target.closest('[data-slide-dot]');
        if (!dot) return;

        stopAutoSlide();
        showSlide(Number(dot.dataset.slideDot));
        startAutoSlide();
    });
}

/**
 * Skeleton Loader State
 */
function renderSkeletons(container, count = 8) {
    container.innerHTML = Array(count).fill(0).map(() => `
        <div class="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse flex flex-col justify-between h-80">
            <div>
                <div class="w-full aspect-square bg-slate-100 rounded-xl mb-4"></div>
                <div class="h-3 bg-slate-100 rounded w-1/3 mb-2"></div>
                <div class="h-4 bg-slate-100 rounded w-5/6"></div>
            </div>
            <div class="flex justify-between items-center pt-3 border-t border-gray-50">
                <div class="h-6 bg-slate-100 rounded w-1/4"></div>
                <div class="h-8 bg-slate-100 rounded-full w-1/3"></div>
            </div>
        </div>
    `).join('');
}

/**
 * Empty Filter State
 */
function renderEmptyState(container) {
    container.innerHTML = `
        <div class="col-span-full text-center py-16">
            <p class="text-slate-400 font-medium text-base">No items match your criteria.</p>
            <button 
                id="reset-filters-btn"
                class="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer"
            >
                Clear search and filters
            </button>
        </div>
    `;

    document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
        searchQuery = '';
        activeCategory = 'all';

        const searchDesktop = document.getElementById('search-desktop');
        const searchMobile = document.getElementById('search-mobile');
        if (searchDesktop) searchDesktop.value = '';
        if (searchMobile) searchMobile.value = '';

        document.querySelectorAll('.category-btn').forEach(btn => {
            const isAll = btn.dataset.category === 'all';
            btn.classList.toggle('bg-slate-900', isAll);
            btn.classList.toggle('text-white', isAll);
            btn.classList.toggle('border-slate-900', isAll);
            btn.classList.toggle('bg-white', !isAll);
            btn.classList.toggle('text-slate-600', !isAll);
            btn.classList.toggle('border-gray-200', !isAll);
        });

        applyFiltersAndRender();
    });
}

/**
 * Error State
 */
function renderErrorState(container) {
    container.innerHTML = `
        <div class="col-span-full text-center py-16 bg-red-50/50 rounded-2xl border border-red-100">
            <h3 class="text-slate-900 font-bold text-base">Unable to connect to product catalog</h3>
            <p class="text-slate-500 text-xs mt-1">Please check your network connection and try again.</p>
            <button 
                onclick="window.location.reload()" 
                class="mt-4 bg-slate-900 text-white text-xs font-semibold px-5 py-2 rounded-full cursor-pointer"
            >
                Retry Loading
            </button>
        </div>
    `;
}