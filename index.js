/**
 * index.js - Lógica específica da Home
 */
document.addEventListener('DOMContentLoaded', () => {
    Storage.init();
    UI.initObserver();
    UI.renderCards(false);

    // Parallax
    const heroBg = document.getElementById('hero-parallax-img');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            if (window.scrollY <= 1000) heroBg.style.transform = `translateY(${window.scrollY * 0.4}px)`;
        });
    }

    // Floating WhatsApp
    const waBtn = document.getElementById('whatsapp-float');
    if (waBtn) {
        const waIcon = waBtn.querySelector('svg');
        let lastScrollTop = 0;
        setTimeout(() => {
            waBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
            waBtn.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto', 'transition-all', 'duration-500', 'ease-out');
            if (waIcon) waIcon.classList.add('animate-gentle-bounce');
        }, 1000);
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            if (currentScroll < lastScrollTop || currentScroll < 100) {
                waBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
                waBtn.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
                if (waIcon) waIcon.classList.add('animate-gentle-bounce');
            } else {
                waBtn.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
                waBtn.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
                if (waIcon) waIcon.classList.remove('animate-gentle-bounce');
            }
            lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
        });
    }

    // Sticky Header & ScrollSpy
    const header = document.querySelector('header');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav.hidden a[href^="#"], nav.hidden a[href="#"]');
    if (header) {
        window.addEventListener('scroll', () => {
            const isMobile = window.innerWidth < 768;
            if (window.scrollY > 50 && isMobile) {
                header.classList.remove('bg-transparent', 'border-white/10');
                header.classList.add('bg-white/90', 'shadow-sm', 'border-rose-100');
            } else {
                header.classList.add('bg-transparent', 'border-white/10');
                header.classList.remove('bg-white/90', 'shadow-sm', 'border-rose-100');
            }
            
            let current = '';
            if (window.scrollY < 100) current = '#';
            sections.forEach(section => {
                if (pageYOffset >= (section.offsetTop - section.clientHeight / 3)) current = section.getAttribute('id');
            });
            navLinks.forEach(link => {
                link.classList.remove('text-rose-500', 'font-semibold');
                link.classList.add('text-stone-600', 'font-medium');
                const href = link.getAttribute('href');
                if ((current === '#' && href === '#') || (current && href.includes(current) && href !== '#')) {
                    link.classList.remove('text-stone-600', 'font-medium');
                    link.classList.add('text-rose-500', 'font-semibold');
                }
            });
        });
    }

    // Filtros
    const filterContainer = document.getElementById('portfolio-filters');
    if (filterContainer) {
        filterContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('bg-rose-300', 'text-stone-900', 'shadow-md', 'border-rose-200');
                    btn.classList.add('bg-rose-50', 'text-stone-800', 'hover:bg-rose-100', 'border-rose-100');
                });
                e.target.classList.remove('bg-rose-50', 'text-stone-800', 'hover:bg-rose-100', 'border-rose-100');
                e.target.classList.add('bg-rose-300', 'text-stone-900', 'shadow-md', 'border-rose-200');
                const category = e.target.getAttribute('data-category');
                const container = document.getElementById('cards-container');
                container.style.opacity = '0';
                setTimeout(() => { UI.renderCards(false, category); container.style.opacity = '1'; }, 200);
            }
        });
    }

    // Mobile Menu
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
    const menuIcon = mobileBtn ? mobileBtn.querySelector('svg') : null;
    function toggleMenu() {
        const isHidden = mobileMenu.classList.contains('hidden');
        if (isHidden) {
            mobileMenu.classList.remove('hidden');
            setTimeout(() => {
                mobileMenu.classList.remove('translate-x-full');
                menuLinks.forEach((link, index) => setTimeout(() => link.classList.remove('opacity-0', 'translate-y-4'), 100 + (index * 100)));
            }, 10);
            if (menuIcon) menuIcon.classList.add('rotate-90', 'transition-transform', 'duration-300');
        } else {
            mobileMenu.classList.add('translate-x-full');
            menuLinks.forEach(link => link.classList.add('opacity-0', 'translate-y-4'));
            setTimeout(() => mobileMenu.classList.add('hidden'), 300);
            if (menuIcon) menuIcon.classList.remove('rotate-90');
        }
    }
    if (mobileBtn) {
        mobileBtn.addEventListener('click', toggleMenu);
        if(closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
        menuLinks.forEach(link => link.addEventListener('click', toggleMenu));
    }

    // Modal
    const modalCloseBtn = document.getElementById('modal-close');
    const modalBackdrop = document.getElementById('modal-backdrop');
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => UI.closeModal());
    if (modalBackdrop) modalBackdrop.addEventListener('click', () => UI.closeModal());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') UI.closeModal(); });
});