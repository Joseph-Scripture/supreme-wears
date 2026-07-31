const API_URL = 'https://api.escuelajs.co/api/v1/products';

function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function processImages(images, productId) {

    const cleanedImages = images.map((img, index) => {
        let url = img;
        if (typeof url === 'string' && url.startsWith('["')) {
            url = url.replace(/^\["|"\]$/g, '');
        }
        return url;
    });

    return cleanedImages;
}

async function fetchProductDetails() {
    const container = document.getElementById('product-detail-container');
    const productId = getProductIdFromURL();

    if (!productId) {
        container.innerHTML = `
            <div class="text-center py-12">
                <h2 class="text-xl font-bold text-slate-900">No Product Specified</h2>
                <p class="text-slate-500 mt-2">Please select a valid item from our home page.</p>
                <a href="index.html" class="inline-block mt-4 bg-slate-900 text-white text-sm font-semibold px-6 py-2.5 rounded-full">Return to Shop</a>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${productId}`);
        if (!response.ok) throw new Error('Failed to retrieve item');

        const product = await response.json();
        renderProductDetail(product);

    } catch (error) {
        console.error('Error fetching detail:', error);
        container.innerHTML = `
            <div class="text-center py-12">
                <h2 class="text-xl font-bold text-slate-900">Unable to Load Product</h2>
                <p class="text-slate-500 mt-2">The product could not be retrieved at this time.</p>
                <a href="index.html" class="inline-block mt-4 bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full">Back to Home</a>
            </div>
        `;
    }
}

function renderProductDetail(product) {
    const container = document.getElementById('product-detail-container');
    const imageList = processImages(product.images, product.id);
    

    const primaryImage = imageList[0];

    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            
            <!-- Gallery Column -->
            <div class="flex flex-col gap-4">
                <!-- Large Main Display Image -->
                <div class="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-gray-200/60 shadow-inner">
                    <img 
                        id="main-product-image" 
                        src="${primaryImage}" 
                        alt="${product.title}" 
                        class="w-full h-full object-cover transition-opacity duration-300"

                    >
                </div>

                <!-- Interactive Thumbnails List -->
                <div id="thumbnail-list" class="flex gap-3 overflow-x-auto pb-2">
                    ${imageList.map((imgUrl, index) => `
                        <button 
                            data-index="${index}"
                            class="thumbnail-btn size-20 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0 ${index === 0 ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200 hover:border-slate-400'}"
                        >
                            <img 
                                src="${imgUrl}" 
                                alt="${product.title} view ${index + 1}" 
                                class="w-full h-full object-cover"
                            >
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- Specifications & Actions Column -->
            <div class="flex flex-col justify-between h-full">
                <div>
                    <!-- Category Tag -->
                    <span class="inline-block bg-blue-50 text-blue-600 font-semibold text-xs tracking-wide uppercase px-3 py-1 rounded-full mb-3">
                        ${product.category ? product.category.name : 'General'}
                    </span>

                    <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                        ${product.title}
                    </h1>

                    <div class="text-3xl font-extrabold text-slate-900 mb-6">
                        $${product.price}
                    </div>

                    <div class="border-t border-b border-gray-100 py-6 mb-6">
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                        <p class="text-slate-600 leading-relaxed text-sm md:text-base">
                            ${product.description}
                        </p>
                    </div>
                </div>

                <!-- Purchase Controls -->
                <div class="flex flex-col sm:flex-row gap-4 pt-4">
                    <div class="flex items-center justify-between border border-gray-200 rounded-full px-4 py-2 w-full sm:w-36 bg-gray-50">
                        <button id="dec-qty" class="text-slate-500 hover:text-slate-900 font-bold px-2 py-1 select-none">-</button>
                        <span id="qty-val" class="font-bold text-slate-900 text-sm">1</span>
                        <button id="inc-qty" class="text-slate-500 hover:text-slate-900 font-bold px-2 py-1 select-none">+</button>
                    </div>

                    <button 
                        data-id="${product.id}"
                        class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-8 rounded-full shadow-sm hover:shadow transition-all active:scale-95 text-center"
                    >
                        Add to Cart
                    </button>
                </div>

            </div>

        </div>
    `;

    setupGalleryInteractions();
    setupQuantitySelector();
}


function setupGalleryInteractions() {
    const mainImg = document.getElementById('main-product-image');
    const thumbBtns = document.querySelectorAll('.thumbnail-btn');

    thumbBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const clickedImg = btn.querySelector('img');
            
            // Swap src values between main image and clicked thumbnail
            const tempSrc = mainImg.src;
            mainImg.src = clickedImg.src;
            clickedImg.src = tempSrc;

            // Update border states
            thumbBtns.forEach(b => {
                b.classList.remove('border-blue-600', 'ring-2', 'ring-blue-100');
                b.classList.add('border-gray-200');
            });

            btn.classList.remove('border-gray-200');
            btn.classList.add('border-blue-600', 'ring-2', 'ring-blue-100');
        });
    });
}

function setupQuantitySelector() {
    const decBtn = document.getElementById('dec-qty');
    const incBtn = document.getElementById('inc-qty');
    const qtyVal = document.getElementById('qty-val');

    if (!decBtn || !incBtn) return;

    let currentQty = 1;

    decBtn.addEventListener('click', () => {
        if (currentQty > 1) {
            currentQty--;
            qtyVal.textContent = currentQty;
        }
    });

    incBtn.addEventListener('click', () => {
        currentQty++;
        qtyVal.textContent = currentQty;
    });
}

document.addEventListener('DOMContentLoaded', fetchProductDetails);