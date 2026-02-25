/**
 * index.js - Lógica da página inicial, agora usando os novos managers.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Os inits de storage e theme já são chamados em utils.js
    uiManager.initObserver();

    // Otimização de Scroll (Debounce/Throttling via rAF)
    const heroBg = document.getElementById('hero-parallax-img');
    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScroll = () => {
        // Parallax Logic
        if (heroBg && lastScrollY <= 1000) {
            heroBg.style.transform = `translateY(${lastScrollY * 0.4}px)`;
        }
        // Sticky Header Logic
        if (header) {
            if (lastScrollY > 50) {
                header.classList.add('bg-white/80', 'backdrop-blur-md', 'shadow-sm');
                header.classList.remove('bg-transparent', 'border-white/10');
            } else {
                header.classList.remove('bg-white/80', 'backdrop-blur-md', 'shadow-sm');
                header.classList.add('bg-transparent', 'border-white/10');
            }
        }
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(updateScroll);
            ticking = true;
        }
    }, { passive: true });

    // Floating WhatsApp
    const waBtn = document.getElementById('whatsapp-float');
    if (waBtn) {
        setTimeout(() => {
            waBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
        }, 1000);
    }

    // Mobile Menu
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuLinks = mobileMenu?.querySelectorAll('a');

    const toggleMenu = () => {
        const isHidden = mobileMenu.classList.contains('hidden');
        if (isHidden) {
            mobileMenu.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                mobileMenu.classList.remove('translate-x-full');
            }, 10);
        } else {
            mobileMenu.classList.add('translate-x-full');
            document.body.style.overflow = '';
            setTimeout(() => mobileMenu.classList.add('hidden'), 300);
        }
    };

    mobileBtn?.addEventListener('click', toggleMenu);
    closeMenuBtn?.addEventListener('click', toggleMenu);
    menuLinks?.forEach(link => link.addEventListener('click', () => {
        // Apenas fecha se for um link de âncora
        if (link.getAttribute('href').startsWith('#')) {
            toggleMenu();
        }
    }));

    // --- PORTFOLIO LOGIC (Premium UI v2) ---
    const portfolioGrid = document.getElementById('portfolio-grid');
    const filtersContainer = document.getElementById('portfolio-filters');

    if (portfolioGrid && filtersContainer) {
        const portfolioData = [
            { id: 1, image: './assets/foto1.jpg', category: 'Nail Art', title: 'Nail Art Minimalista', description: 'Design sofisticado com traços finos e geometria delicada.' },
            { id: 2, image: './assets/foto2.jpg', category: 'Alongamento', title: 'Alongamento em Fibra', description: 'Resistência e naturalidade com acabamento premium.' },
            { id: 3, image: './assets/foto3.jpg', category: 'Blindagem', title: 'Blindagem Diamante', description: 'Proteção extra para o crescimento saudável das unhas.' },
            { id: 4, image: './assets/foto4.jpg', category: 'Nail Art', title: 'Francesinha Moderna', description: 'A clássica elegância reinventada com toques contemporâneos.' },
            { id: 5, image: './assets/foto5.jpg', category: 'Pés', title: 'Spa dos Pés', description: 'Renovação completa, hidratação profunda e relaxamento.' },
            { id: 6, image: './assets/foto6.jpg', category: 'Esmaltação', title: 'Esmaltação em Gel', description: 'Brilho intenso e durabilidade.' }
        ];

        const categories = ['Todos', ...new Set(portfolioData.map(item => item.category))];
        let currentFilter = 'Todos';

        const renderFilters = () => {
            filtersContainer.innerHTML = categories.map(cat => {
                const isActive = cat === currentFilter;
                const activeClasses = "bg-stone-900 text-rose-50 shadow-lg shadow-stone-300/50 rounded-full px-8 py-3 text-sm font-medium tracking-widest uppercase transition-all duration-500 scale-105";
                const inactiveClasses = "bg-white text-stone-500 border border-stone-200 rounded-full px-8 py-3 text-sm font-medium tracking-widest uppercase hover:bg-stone-50 hover:text-stone-900 hover:border-stone-300 hover:shadow-sm transition-all duration-300";

                return `<button class="${isActive ? activeClasses : inactiveClasses}" onclick="window.filterPortfolio('${cat}')">${cat}</button>`;
            }).join('');
        };

        const renderGrid = () => {
            const items = currentFilter === 'Todos' ? portfolioData : portfolioData.filter(i => i.category === currentFilter);

            // Suave Fade Out
            portfolioGrid.style.opacity = '0';
            portfolioGrid.style.transform = 'translateY(10px)';
            portfolioGrid.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

            setTimeout(() => {
                portfolioGrid.innerHTML = items.map((item, index) => `
                    <article class="group relative bg-white rounded-[1.5rem] overflow-hidden border border-stone-100/50 shadow-sm hover:-translate-y-2 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-700 ease-out cursor-pointer flex flex-col" onclick="window.openModal('${item.image}', '${item.title}', '${item.description}')" style="animation: fadeUp 0.6s ease-out forwards; animation-delay: ${index * 0.08}s; opacity: 0;">
                        
                        <!-- Floating Category Badge -->
                        <div class="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md text-stone-900 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm border border-white/20 transition-all duration-300">
                            ${item.category}
                        </div>

                        <div class="w-full aspect-[4/5] overflow-hidden relative transition-all duration-500 bg-stone-100">
                            <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)]">
                            <!-- Premium Gradient Overlay -->
                            <div class="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                        
                        <div class="p-6 flex flex-col justify-center bg-white z-10 relative transition-all duration-500">
                            <!-- Subtle line decoration -->
                            <div class="w-6 h-[1px] bg-rose-300 mb-2 group-hover:w-12 transition-all duration-500"></div>
                            <h3 class="text-lg font-serif text-stone-800 leading-tight group-hover:text-rose-500 transition-colors duration-300">${item.title}</h3>
                            <p class="text-xs text-stone-500 font-light leading-snug mt-2 line-clamp-2">${item.description}</p>
                        </div>
                    </article>
                `).join('');

                // Adiciona os keyframes para a animação do grid dinamicamente via style tag se não existir
                if (!document.getElementById('portfolio-animations')) {
                    const style = document.createElement('style');
                    style.id = 'portfolio-animations';
                    style.textContent = `
                        @keyframes fadeUp {
                            from { opacity: 0; transform: translateY(15px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `;
                    document.head.appendChild(style);
                }

                // Suave Fade In
                portfolioGrid.style.opacity = '1';
                portfolioGrid.style.transform = 'translateY(0)';
            }, 300);
        };

        window.filterPortfolio = (category) => {
            currentFilter = category;
            renderFilters();
            renderGrid();
        };

        renderFilters();
        renderGrid();
    }
});

// Funções Globais do Modal (Acessíveis via onclick no HTML)
window.openModal = (image, title, description) => {
    const modal = document.getElementById('image-modal');
    if (modal) {
        document.getElementById('modal-image').src = image;
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-desc').textContent = description;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
};

window.closeModal = () => {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
};