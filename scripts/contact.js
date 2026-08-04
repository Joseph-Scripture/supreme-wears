document.getElementById('contact-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formContainer = e.target.parentElement;
            formContainer.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                        ✓
                    </div>
                    <h3 class="text-xl font-extrabold text-slate-900">Message Delivered</h3>
                    <p class="text-slate-500 text-xs mt-2 max-w-sm mx-auto">
                        Thank you for reaching out! We've received your inquiry and will reply to your email shortly.
                    </p>
                    <a href="../index.html" class="inline-block mt-6 bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-full hover:bg-slate-800 transition-all">
                        Back to Shop
                    </a>
                </div>
            `;
        });