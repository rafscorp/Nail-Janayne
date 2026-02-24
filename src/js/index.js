/**
 * index.js - Lógica da página inicial, agora usando os novos managers.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Os inits de storage e theme já são chamados em utils.js
    uiManager.initObserver();

    const cardsContainer = document.getElementById('cards-container');
    let allCards = [];

    // Carrega os cards iniciais
    if (cardsContainer) {
        allCards = storageManager.getCards();
        uiManager.renderCards(cardsContainer, allCards, false);
    }
    
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

    // Filtros de Categoria
    const filterContainer = document.getElementById('portfolio-filters');
    filterContainer?.addEventListener('click', (e) => {
        const button = e.target.closest('.filter-btn');
        if (button) {
            document.querySelectorAll('.filter-btn.active-filter').forEach(btn => btn.classList.remove('active-filter'));
            button.classList.add('active-filter');
            
            const category = button.getAttribute('data-category');
            const filteredCards = (category === 'all') ? allCards : allCards.filter(card => card.category === category);
            
            uiManager.renderCards(cardsContainer, filteredCards, false);
        }
    });

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

    // Modal
    document.getElementById('modal-close')?.addEventListener('click', () => uiManager.closeModal());
    document.getElementById('modal-backdrop')?.addEventListener('click', () => uiManager.closeModal());
    document.addEventListener('keydown', (e) => { 
        if (e.key === 'Escape' && !document.getElementById('image-modal').classList.contains('hidden')) {
            uiManager.closeModal();
        }
    });
});