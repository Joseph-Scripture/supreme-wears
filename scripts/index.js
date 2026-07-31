
const APIURL = 'https://api.escuelajs.co/api/v1/products';
const CATEGORIES_URL = 'https://api.escuelajs.co/api/v1/categories';

// Global Trackers
let selectedCategoryId = null;
let currentIndex = 0;
let slideInterval;

const slideData = [
    {
        image: 'images/first.avif',
        title: 'Summer Collection 2026',
        description: 'Explore the latest trends in lightweight fabrics and vibrant colors. Limited stock available.',
        ctaText: 'Shop New Arrivals'
    },
    {
        image: 'images/second.avif', 
        title: 'Urban Streetwear Essentials',
        description: 'Upgrade your daily look with our durable jackets, hoodies, and cargo pants.',
        ctaText: 'Discover Streetwear'
    },
    {
        image: 'images/third.avif', 
        title: 'Premium Footwear Sale',
        description: 'Find your perfect pair. From athletic sneakers to casual loafers, all up to 40% off.',
        ctaText: 'View Shoes'
    }
];


// Navigation
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const hamburgerIcon = document.getElementById('hamburger-icon');
const closeIcon = document.getElementById('close-icon');

// Slider
const slidesContainer = document.getElementById('slides-container');
const dotsContainer = document.getElementById('pagination-dots');
const prevBtn = document.getElementById('prev-slide');
const nextBtn = document.getElementById('next-slide');


if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        const isMenuOpen = !mobileMenu.classList.contains('hidden');

        if (isMenuOpen) {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('flex');
            hamburgerIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
        } else {
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('flex');
            hamburgerIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
        }
    });
}

/* ==========================================================================
   4. HERO SLIDER MODULE
   ========================================================================== */
function initSlider() {
    if (!slidesContainer || !dotsContainer) return;

    slideData.forEach((slide, index) => {
        const slideEl = document.createElement('div');
        slideEl.className = `absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
            index === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`;
        slideEl.id = `slide-${index}`;

        slideEl.innerHTML = `
            <img src="${slide.image}" alt="${slide.title}" class="absolute inset-0 w-full h-full object-cover">
            <div class="absolute inset-0 bg-slate-900/50"></div>
            <div class="relative z-10 container mx-auto h-full flex items-center px-10 md:px-20">
                <div class="max-w-2xl text-white">
                    <h2 class="text-5xl md:text-6xl font-extrabold tracking-tight mb-5 leading-tight">${slide.title}</h2>
                    <p class="text-xl text-gray-100 mb-10 leading-relaxed">${slide.description}</p>
                    <a href="#" class="inline-block bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-blue-500 transition-colors shadow-lg active:scale-95">
                        ${slide.ctaText}
                    </a>
                </div>
            </div>
        `;
        slidesContainer.appendChild(slideEl);

        const dotEl = document.createElement('button');
        dotEl.className = `size-3 rounded-full border-2 border-white/70 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white ${
            index === 0 ? 'bg-white scale-110' : 'bg-transparent'
        }`;
        dotEl.setAttribute('aria-label', `Go to slide ${index + 1}`);

        dotEl.addEventListener('click', () => {
            goToSlide(index);
            resetAutoPlay();
        });

        dotsContainer.appendChild(dotEl);
    });
}

function updateDOM() {
    const allSlides = slidesContainer.querySelectorAll('[id^="slide-"]');
    allSlides.forEach((slide, index) => {
        if (index === currentIndex) {
            slide.classList.replace('opacity-0', 'opacity-100');
            slide.classList.replace('z-0', 'z-10');
        } else {
            slide.classList.replace('opacity-100', 'opacity-0');
            slide.classList.replace('z-10', 'z-0');
        }
    });

    const allDots = dotsContainer.querySelectorAll('button');
    allDots.forEach((dot, index) => {
        if (index === currentIndex) {
            dot.classList.add('bg-white', 'scale-110');
            dot.classList.remove('bg-transparent');
        } else {
            dot.classList.remove('bg-white', 'scale-110');
            dot.classList.add('bg-transparent');
        }
    });
}

function goToSlide(index) {
    currentIndex = index;
    updateDOM();
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % slideData.length;
    updateDOM();
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + slideData.length) % slideData.length;
    updateDOM();
}

function startAutoPlay() {
    slideInterval = setInterval(nextSlide, 8000);
}

function resetAutoPlay() {
    clearInterval(slideInterval);
    startAutoPlay();
}

if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });
    prevBtn.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });
}

function getSkeletonCardsHTML(count = 8) {
    return Array(count).fill(0).map(() => `
        <div class="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm animate-pulse flex flex-col justify-between">
            <div>
                <div class="aspect-square bg-slate-200 rounded-xl mb-4"></div>
                <div class="h-4 bg-slate-200 rounded-md w-3/4 mb-2"></div>
                <div class="h-3 bg-slate-200 rounded-md w-1/2 mb-4"></div>
            </div>
            <div class="flex items-center justify-between pt-2">
                <div class="h-5 bg-slate-200 rounded-md w-16"></div>
                <div class="h-8 bg-slate-200 rounded-full w-24"></div>
            </div>
        </div>
    `).join('');
}

function getErrorHTML(message = 'Failed loading products.') {
    return `
        <div class="col-span-full py-12 px-4 text-center bg-red-50/50 border border-red-100 rounded-2xl">
            <svg class="size-10 text-red-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p class="text-slate-800 font-semibold mb-1">${message}</p>
            <p class="text-slate-500 text-sm mb-4">Please check your connection or try again later.</p>
            <button 
                onclick="getData(selectedCategoryId, 0, 8)" 
                class="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all active:scale-95 shadow-sm"
            >
                Retry
            </button>
        </div>
    `;
}

function renderProducts(products, container) {
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-12 text-center text-slate-500">
                No products found in this category.
            </div>
        `;
        return;
    }

    const productCardsHTML = products.map(product => {
        let imageUrl = product.images && product.images.length > 0 ? product.images[1] : '';
        
        if (typeof imageUrl === 'string' && imageUrl.startsWith('["')) {
            imageUrl = imageUrl.replace(/^\["|"\]$/g, '');
        }

        return `
            <div class="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                    <div class="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden">
                        <img 
                            src="${imageUrl}" 
                            alt="${product.title}" 
                            class="w-full h-full object-cover product_image"
                            loading="lazy"
                        >
                    </div>
                    <h3 class="font-semibold text-slate-900 product_title line-clamp-1" title="${product.title}">
                        ${product.title}
                    </h3>
                    <p class="text-slate-500 text-sm mb-3 product_description">
                        ${product.category ? product.category.name : 'General'}
                    </p>
                </div>

                <div class="flex items-center justify-between mt-2">
                    <span class="text-lg font-bold text-slate-900 product_price">
                        $${product.price}
                    </span>
                    <button 
                        data-id="${product.id}"
                        class="add-to-cart-btn bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-3 py-1.5 rounded-full transition-colors active:scale-95"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = productCardsHTML;
}

async function getData(categoryId = null, offset = 0, limit = 8) {
    const productsContainer = document.getElementById('featured-products');
    if (!productsContainer) return;

    productsContainer.innerHTML = getSkeletonCardsHTML(limit);

    try {
        let endpoint = `${APIURL}?offset=${offset}&limit=${limit}`;
        if (categoryId !== null) {
            endpoint = `${APIURL}/?categoryId=${categoryId}&offset=${offset}&limit=${limit}`;
        }

        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Server status ${response.status}`);

        const products = await response.json();
        renderProducts(products, productsContainer);

    } catch (error) {
        console.error('Error fetching products:', error);
        productsContainer.innerHTML = getErrorHTML('Unable to load product catalog');
    }
}

async function initCategories() {
    const categoryContainer = document.getElementById('category-filters');
    if (!categoryContainer) return;

    try {
        const response = await fetch(`${CATEGORIES_URL}?limit=5`);
        if (!response.ok) throw new Error('Failed loading categories');

        const categories = await response.json();
        const allCategories = [{ id: null, name: 'All' }, ...categories];

        renderCategoryButtons(allCategories, categoryContainer);
    } catch (error) {
        console.error('Category load error:', error);
        renderCategoryButtons([{ id: null, name: 'All' }], categoryContainer);
    }
}

function renderCategoryButtons(categories, container) {
    container.innerHTML = categories.map(cat => {
        const isAll = cat.id === null;
        const isActive = selectedCategoryId === cat.id;

        const baseClasses = "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ease-in-out cursor-pointer select-none border";
        const activeClasses = isActive 
            ? "bg-slate-900 text-white border-slate-900 shadow-sm scale-105" 
            : "bg-white text-slate-600 border-gray-200 hover:bg-slate-100 hover:text-slate-900";

        return `
            <button 
                data-category-id="${isAll ? 'all' : cat.id}"
                class="category-btn ${baseClasses} ${activeClasses}"
            >
                ${cat.name}
            </button>
        `;
    }).join('');

    container.addEventListener('click', handleCategoryClick);
}

function handleCategoryClick(event) {
    const target = event.target.closest('.category-btn');
    if (!target) return;

    const catAttr = target.getAttribute('data-category-id');
    const newCategoryId = catAttr === 'all' ? null : Number(catAttr);

    if (newCategoryId === selectedCategoryId) return;

    selectedCategoryId = newCategoryId;

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('bg-slate-900', 'text-white', 'border-slate-900', 'shadow-sm', 'scale-105');
        btn.classList.add('bg-white', 'text-slate-600', 'border-gray-200', 'hover:bg-slate-100', 'hover:text-slate-900');
    });

    target.classList.remove('bg-white', 'text-slate-600', 'border-gray-200', 'hover:bg-slate-100', 'hover:text-slate-900');
    target.classList.add('bg-slate-900', 'text-white', 'border-slate-900', 'shadow-sm', 'scale-105');

    getData(selectedCategoryId, 0, 8);
}


document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    startAutoPlay();
    initCategories();
    getData(null, 0, 8); 
});