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

    const waBtn = document.getElementById('whatsapp-float');
    let waTimeout;

    const updateScroll = () => {
        // Parallax Logic
        if (heroBg && lastScrollY <= 1000) {
            heroBg.style.transform = `translateY(${lastScrollY * 0.4}px)`;
        }

        // WhatsApp Floating Button Logic (Aparece ao deslizar e some após 3s parado)
        if (waBtn) {
            if (lastScrollY > 100) {
                // Aparece
                waBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');

                // Limpa o timer anterior
                clearTimeout(waTimeout);

                // Define novo timer para sumir
                waTimeout = setTimeout(() => {
                    waBtn.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
                }, 700);
            } else {
                // Se estiver no topo absoluto, esconde na hora
                waBtn.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
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

    // O evento de scroll cuidará da visibilidade do WhatsApp

    // Mobile Menu
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuLinks = mobileMenu?.querySelectorAll('a');
    const animElements = mobileMenu?.querySelectorAll('.mobile-nav-link');

    const mobileDrawer = document.getElementById('mobile-drawer');

    const toggleMenu = () => {
        const isHidden = mobileMenu.classList.contains('hidden');
        const btnSpans = mobileBtn?.querySelectorAll('span');

        if (isHidden) {
            // OPEN
            mobileMenu.classList.remove('hidden');
            document.body.style.overflow = 'hidden';

            mobileBtn?.classList.add('is-active');
            mobileBtn?.setAttribute('aria-expanded', 'true');
            if (btnSpans && btnSpans.length === 3) {
                btnSpans[0].classList.add('translate-y-[6px]', 'rotate-45');
                btnSpans[1].classList.add('opacity-0');
                btnSpans[2].classList.add('-translate-y-[6px]', '-rotate-45');
            }

            // Allow display block to apply before animating opacity/transform
            setTimeout(() => {
                mobileMenu.classList.remove('opacity-0');
                if (mobileDrawer) mobileDrawer.classList.remove('translate-x-full');
            }, 10);
        } else {
            // CLOSE
            mobileMenu.classList.add('opacity-0');
            if (mobileDrawer) mobileDrawer.classList.add('translate-x-full');
            document.body.style.overflow = '';

            mobileBtn?.classList.remove('is-active');
            mobileBtn?.setAttribute('aria-expanded', 'false');
            if (btnSpans && btnSpans.length === 3) {
                btnSpans[0].classList.remove('translate-y-[6px]', 'rotate-45');
                btnSpans[1].classList.remove('opacity-0');
                btnSpans[2].classList.remove('-translate-y-[6px]', '-rotate-45');
            }

            // Wait for drawer transition to complete before display: none
            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
        }
    };

    // Close on backdrop tap
    mobileMenu?.addEventListener('click', (e) => {
        // Only toggle if the click was directly on the backdrop (not inside the drawer)
        if (e.target === mobileMenu) {
            toggleMenu();
        }
    });

    const handleMenuToggle = (e) => {
        e.preventDefault(); // Mute ghost clicks on touch devices
        toggleMenu();
    };

    mobileBtn?.addEventListener('click', handleMenuToggle);
    mobileBtn?.addEventListener('touchstart', handleMenuToggle, { passive: false });
    closeMenuBtn?.addEventListener('click', toggleMenu);
    menuLinks?.forEach(link => link.addEventListener('click', () => {
        // Apenas fecha se for um link de âncora
        if (link.getAttribute('href').startsWith('#')) {
            toggleMenu();
        }
    }));

    // --- PORTFOLIO LOGIC (Strict Small UI) ---
    const portfolioGrid = document.getElementById('portfolio-grid');
    const filtersContainer = document.getElementById('filter-dropdown-container');

    if (portfolioGrid && filtersContainer) {
        const portfolioData = storageManager.getPortfolio();

        const categories = ['Todos', ...new Set(portfolioData.map(item => item.category))];
        let currentFilter = 'Todos';

        const renderFilters = () => {
            filtersContainer.innerHTML = `
                <!-- Master Toggle Button -->
                <button id="filter-master-btn" class="group relative z-20 w-auto min-w-[260px] sm:min-w-[320px] max-w-[95vw] mx-auto flex flex-col items-center justify-center min-h-[4.5rem] sm:min-h-[5.5rem] py-3 sm:py-4 px-12 sm:px-16 bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] rounded-[2.5rem] transition-all duration-300 hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.15)] hover:-translate-y-1 outline-none">
                    
                    <!-- Interactive Tooltip Balloon -->
                    <div id="filter-tooltip" class="absolute -top-12 sm:-top-14 right-0 sm:right-2 flex flex-col items-center opacity-0 transition-opacity duration-700 pointer-events-none z-30">
                        <!-- Removed ID from here to avoid overwriting the shine -->
                        <div class="relative overflow-hidden bg-rose-500 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-xl shadow-rose-500/30 flex tracking-widest uppercase">
                            <!-- Letras inseridas aqui via JS -->
                            <div id="filter-tooltip-text" class="flex whitespace-nowrap relative z-10 drop-shadow-sm"></div>
                            
                            <!-- Efeito Neon Fluido (Shine) -->
                            <div class="absolute inset-0 z-20 pointer-events-none w-[40%] bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-[150%] -skew-x-[20deg] animate-shine"></div>
                        </div>
                        <div class="w-3 h-3 bg-rose-500 rotate-45 -mt-1.5 shadow-sm rounded-sm"></div>
                    </div>

                    <!-- Flex Centered Text Layer -->
                    <div class="flex flex-col items-center w-full leading-none gap-2 sm:gap-2.5">
                        <span class="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-stone-400 font-bold text-center -translate-y-0.5">Filtro Atual</span>
                        <span id="master-filter-text" class="text-sm sm:text-lg md:text-xl font-extrabold text-stone-800 tracking-wide text-center translate-y-0.5">${currentFilter}</span>
                    </div>
                    <!-- Right Anchored Chevron (Animated CTA) -->
                    <div id="filter-chevron-container" class="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300 pointer-events-none">
                        <svg id="filter-chevron" class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </button>

                <!-- Absolute Dropdown Menu -->
                <div id="filter-dropdown-menu" class="absolute top-[calc(100%+0.5rem)] sm:top-[calc(100%+1rem)] left-1/2 -translate-x-1/2 w-full min-w-[220px] sm:min-w-[260px] bg-white/95 backdrop-blur-xl border border-stone-200 shadow-2xl rounded-3xl p-2 sm:p-3 opacity-0 scale-95 pointer-events-none transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] z-10 flex flex-col gap-1 origin-top">
                    ${categories.map(cat => `
                        <button class="filter-dropdown-item relative overflow-hidden group w-full text-center px-5 py-4 rounded-2xl text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all duration-300 active:scale-95 ${cat === currentFilter ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'text-stone-500 hover:text-stone-900'}" data-category="${cat}" onclick="window.filterPortfolio('${cat}')">
                            ${cat === currentFilter ? '' : '<div class="absolute inset-0 bg-stone-50 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300 rounded-2xl pointer-events-none"></div>'}
                            <span class="relative z-10 block transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">${cat}</span>
                        </button>
                    `).join('')}
                </div>
            `;

            const masterBtn = document.getElementById('filter-master-btn');
            const dropdown = document.getElementById('filter-dropdown-menu');
            const chevron = document.getElementById('filter-chevron');

            let isOpen = false;

            const closeMenu = () => {
                isOpen = false;
                dropdown.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
                dropdown.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
                chevron.classList.remove('rotate-180');
            };

            masterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                isOpen = !isOpen;
                if (isOpen) {
                    dropdown.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
                    dropdown.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
                    chevron.classList.add('rotate-180');
                } else {
                    closeMenu();
                }
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (isOpen && !filtersContainer.contains(e.target)) closeMenu();
            });

            // Store closeMenu globally so filterPortfolio can trigger it
            window.closeFilterMenu = closeMenu;
        };

        let isAnimatingGrid = false;

        const renderGrid = () => {
            if (isAnimatingGrid) return; // Prevent spam clicking

            const items = currentFilter === 'Todos' ? portfolioData : portfolioData.filter(i => i.category === currentFilter);
            const currentCards = portfolioGrid.querySelectorAll('.portfolio-card');

            const buildHTML = (item) => `
                <article class="portfolio-card opacity-0 translate-y-8 bg-card-bg rounded-[2rem] xl:rounded-[3rem] shadow-sm border border-stone-100 overflow-hidden hover:shadow-lg hover:-translate-y-2 hover:scale-[1.02] [&.is-active]:shadow-lg [&.is-active]:-translate-y-2 [&.is-active]:scale-[1.02] transition-all duration-700 cursor-pointer group relative w-full flex flex-col" onclick="window.openModal('${item.image}', '${item.title}', '${item.description}')">
                    <div class="w-full relative bg-stone-50 overflow-hidden">
                        <img src="${item.image}" alt="${item.title}" class="w-full h-80 sm:h-96 lg:h-[28rem] object-cover group-hover:scale-110 group-[.is-active]:scale-110 transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)]" />
                        <div class="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-[.is-active]:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div class="p-6 md:p-8 flex-1 flex flex-col justify-center bg-card-bg z-10 relative">
                        <div class="w-8 h-[1px] bg-rose-300 mb-3 group-hover:w-16 group-[.is-active]:w-16 transition-all duration-500"></div>
                        <h3 class="text-xl font-bold text-stone-800 truncate leading-tight group-hover:text-rose-500 group-[.is-active]:text-rose-500 transition-colors duration-300 mb-2">${item.title}</h3>
                        <p class="text-sm text-stone-500 line-clamp-2 leading-relaxed mb-5 flex-1">${item.description}</p>
                        <button onclick="event.stopPropagation(); window.open('https://wa.me/5561982412536?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20um%20trabalho%20com%20voc%C3%AAs!', '_blank')" class="w-full text-white bg-card-btn px-4 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base hover:opacity-90 hover:shadow-lg transition-all duration-300 active:scale-[0.98]">Agendar trabalho</button>
                    </div>
                </article>
            `;

            isAnimatingGrid = true;

            // 1. Fade out current cards if any exist
            if (currentCards.length > 0) {
                currentCards.forEach(card => {
                    card.classList.remove('opacity-100', 'translate-y-0');
                    card.classList.add('opacity-0', 'scale-95');
                });
            }

            // 2. Wait for fade out, then swap DOM and fade in sequentially
            setTimeout(() => {
                portfolioGrid.innerHTML = items.map(item => buildHTML(item)).join('');
                setupScrollAnimations();

                // 3. Trigger reflow and stagger entrance animations
                const newCards = portfolioGrid.querySelectorAll('.portfolio-card');
                requestAnimationFrame(() => {
                    newCards.forEach((card, i) => {
                        setTimeout(() => {
                            card.classList.remove('opacity-0', 'translate-y-8', 'scale-95');
                            card.classList.add('opacity-100', 'translate-y-0');
                        }, i * 100); // 100ms stagger between each card sliding up
                    });
                    setTimeout(() => isAnimatingGrid = false, (newCards.length * 100) + 500);
                });
            }, currentCards.length > 0 ? 300 : 0);
        };

        const setupScrollAnimations = () => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    // Se pelo menos 50% do cartão estiver visível na tela
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-active');
                    } else {
                        entry.target.classList.remove('is-active');
                    }
                });
            }, {
                root: null,
                rootMargin: "-15% 0px -15% 0px", // Forces the trigger to be closer to the center of the vertical viewport
                threshold: 0.7 // Requires 70% of the element to be visible before playing the animation
            });

            document.querySelectorAll('.portfolio-card').forEach(card => observer.observe(card));
        };

        const setupChevronAnimation = () => {
            const tooltip = document.getElementById('filter-tooltip');
            const tooltipText = document.getElementById('filter-tooltip-text');
            const chevronSvg = document.getElementById('filter-chevron');

            if (!tooltip || !tooltipText || !chevronSvg || sessionStorage.getItem('balloonShown')) return;

            // Injeta o texto a ser apagado letra a letra
            const text = "Clique aqui";
            tooltipText.innerHTML = text.split('').map(char => {
                if (char === ' ') return '<span class="inline-block w-1"></span>';
                return `<span class="inline-block transition-opacity duration-300 opacity-100">${char}</span>`;
            }).join('');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        sessionStorage.setItem('balloonShown', 'true');
                        observer.disconnect();

                        // 1. Revela o balão
                        tooltip.classList.remove('opacity-0');
                        tooltip.classList.add('opacity-100');

                        // 2. Aciona o pulo físico que para suavemente na seta
                        chevronSvg.classList.add('animate-chevron-bounce');

                        // 3. Após o pulo (3.1s), inicia sumiço do balão
                        setTimeout(() => {
                            const spans = tooltipText.querySelectorAll('span');
                            spans.forEach((span, index) => {
                                setTimeout(() => {
                                    span.classList.remove('opacity-100');
                                    span.classList.add('opacity-0');
                                }, index * 50); // Efeito fade por letra
                            });

                            // 4. Some com a caixinha inteira
                            setTimeout(() => {
                                tooltip.classList.remove('opacity-100');
                                tooltip.classList.add('opacity-0');
                            }, spans.length * 50 + 500);

                        }, 3100);
                    }
                });
            }, { threshold: 0.9 });

            observer.observe(document.getElementById('filter-master-btn'));
        };



        const setupNavigationGlider = () => {
            const navBox = document.getElementById('nav-desktop-box');
            const glider = document.getElementById('nav-glider');
            if (!navBox || !glider) return;

            const navLinks = Array.from(navBox.querySelectorAll('.nav-link'));
            let activeLink = navLinks[0];

            const updateGlider = (target) => {
                if (!target) return;
                const boxRect = navBox.getBoundingClientRect();
                const linkRect = target.getBoundingClientRect();

                // Set the exact width and offset inside the relative navbox
                glider.style.width = `${linkRect.width}px`;
                glider.style.left = `${linkRect.left - boxRect.left}px`;
                glider.classList.remove('opacity-0');
                glider.classList.add('opacity-100');

                // Sync text color with glider position dynamically
                navLinks.forEach(l => {
                    l.classList.remove('text-white', 'drop-shadow-md');
                    l.classList.add('text-stone-600');
                });
                target.classList.remove('text-stone-600');
                target.classList.add('text-white', 'drop-shadow-md');
            };

            const setActiveState = (targetLink) => {
                activeLink = targetLink;
                updateGlider(targetLink);
            };

            // Initialize position after DOM paints
            setTimeout(() => setActiveState(activeLink), 150);

            navLinks.forEach(link => {
                link.addEventListener('mouseenter', () => updateGlider(link));
                link.addEventListener('click', (e) => {
                    // Lock active state for internal links
                    if (link.getAttribute('target') !== '_blank') {
                        setActiveState(link);
                    }
                });
            });

            // Revert to active link when mouse leaves the navbar entirely
            navBox.addEventListener('mouseleave', () => updateGlider(activeLink));
        };



        window.filterPortfolio = (category) => {
            if (isAnimatingGrid || currentFilter === category) return;
            currentFilter = category;

            // Re-render the filters structure so the active state is updated
            renderFilters();

            // Guarantee the newly rendered menu is closed
            if (window.closeFilterMenu) window.closeFilterMenu();

            renderGrid();

            // Re-bind the observer just in case it was wiped by the innerHTML DOM swap,
            // though the sessionStorage guard prevents re-animation.
            setupChevronAnimation();
        };

        renderFilters();
        renderGrid();
        setupChevronAnimation();
        setupNavigationGlider();
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