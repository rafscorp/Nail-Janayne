/**
 * index.js - Lógica da página inicial, agora usando os novos managers.
 */
document.addEventListener('JanayneDataLoaded', () => {
    // Os inits de storage e theme já são chamados em utils.js
    uiManager.initObserver();

    // ===== Render Professionals =====
    const renderProfessionals = () => {
        const grid = document.getElementById('professionals-grid');
        if (!grid) return;
        const data = storageManager.getProfessionals();

        if (data.length === 0) {
            grid.innerHTML = '<p class="text-stone-400 text-center col-span-full py-10">Nenhum profissional cadastrado.</p>';
            return;
        }

        grid.innerHTML = data.map((item, index) => {
            const delayClass = index === 0 ? '' : (index === 1 ? 'delay-100' : 'delay-200'); // simplistic animation delays
            return `
                <div class="bio-card group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-stone-100 overflow-hidden hover:-translate-y-2 transition-all duration-500 opacity-0 translate-y-6 flex flex-col h-full ${delayClass} reveal" style="border-radius:1.5rem;overflow:hidden;;will-change:transform;">
                    <div class="w-full relative bg-stone-50 overflow-hidden" style="border-radius:1.5rem 1.5rem 0 0; overflow:hidden;">
                        <img loading="lazy" src="${item.image || 'assets/foto3.jpg'}" alt="${item.name}" class="w-full h-80 sm:h-96 lg:h-[28rem] object-cover object-top group-hover:scale-110 transition-transform duration-700" style="border-radius:1.5rem 1.5rem 0 0;">
                        <span class="absolute top-4 left-4 z-10 inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-rose-500 text-[10px] font-bold tracking-widest uppercase rounded-full shadow-sm">${item.role}</span>
                    </div>

                    <div class="p-8 flex flex-col flex-1 bg-white relative z-20">
                        <div class="mb-4">
                            <h4 class="text-2xl font-bold text-stone-800" style="font-family: 'Outfit', sans-serif;">${item.name}</h4>
                        </div>
                        <p class="text-stone-500 text-sm leading-relaxed mb-8 flex-1">${item.description}</p>
                        ${item.instagram ? `
                        <a href="${item.instagram}" target="_blank" class="shrink-0 mt-auto w-full inline-flex justify-center items-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white shadow-md shadow-pink-500/20 hover:shadow-lg hover:shadow-pink-500/30 hover:-translate-y-0.5 transition-all duration-300 text-sm font-semibold tracking-wide">
                            <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                            <span>Instagram</span>
                        </a>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    };

    renderProfessionals();

    // ===== Render Hero & Global Links =====
    const renderHeroAndLinks = () => {
        const settings = storageManager.getSettings();
        if (!settings) return;

        // Visuals
        const heroBg = document.getElementById('hero-parallax-img');
        if (heroBg && settings.heroImage) heroBg.src = settings.heroImage;
        const heroLogo = document.getElementById('hero-logo-img');
        if (heroLogo && settings.logoImage) heroLogo.src = settings.logoImage;

        // Texts
        const sub = document.getElementById('hero-subtitle-el');
        if (sub && settings.heroSubtitle) sub.innerText = settings.heroSubtitle;
        const t1 = document.getElementById('hero-title1-el');
        if (t1 && settings.heroTitle1) t1.innerHTML = settings.heroTitle1;
        const t2 = document.getElementById('hero-title2-el');
        if (t2 && settings.heroTitle2) t2.innerText = settings.heroTitle2;
        const desc = document.getElementById('hero-desc-el');
        if (desc && settings.heroDescription) desc.innerText = settings.heroDescription;

        // Links
        if (settings.whatsappLink) {
            document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
                // Ensure the link is properly formatted if they typed just numbers
                const isOnlyNum = /^\\d+$/.test(settings.whatsappLink);
                let finalLink = settings.whatsappLink;
                if (isOnlyNum) {
                    finalLink = `https://wa.me/55${settings.whatsappLink}?text=${encodeURIComponent('Olá, estou vindo do site, queria agendar um horário!')}`;
                }
                link.href = finalLink;
            });
        }
        if (settings.contactInstagram) {
            document.querySelectorAll('a[href*="instagram.com"]').forEach(link => {
                link.href = settings.contactInstagram;
            });
        }
    };
    renderHeroAndLinks();

    // ===== Render Units =====
    const renderUnits = () => {
        const grid = document.getElementById('units-grid');
        if (!grid) return;
        const data = storageManager.getUnits() || [];

        if (data.length === 0) {
            grid.innerHTML = '<p class="text-stone-400 text-sm py-4 col-span-full">Nenhuma unidade cadastrada ainda.</p>';
            return;
        }

        grid.innerHTML = data.map((item, idx) => {
            const num = String(idx + 1).padStart(2, '0');
            return `
                <div class="group bg-white rounded-3xl border border-stone-100 p-8 sm:p-10 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 reveal">
                    <div class="flex items-center gap-4 mb-5">
                        <div class="icon-container w-12 h-12 shrink-0 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:bg-rose-500 transition-colors duration-300">
                            <svg class="w-5 h-5 text-rose-400 group-hover:text-white transition-colors duration-300 bounce-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                        </div>
                        <div>
                            <span class="inline-block text-[10px] font-bold tracking-widest uppercase text-rose-400 mb-0.5">Unidade ${num}</span>
                            <h4 class="text-lg font-bold text-stone-800 leading-tight" style="font-family:'Outfit',sans-serif">${item.name}</h4>
                        </div>
                    </div>
                    <p class="text-stone-500 text-sm leading-relaxed mb-6 whitespace-pre-line">${item.address}</p>
                    <a href="https://maps.google.com/?q=${encodeURIComponent(item.address)}" target="_blank"
                        class="inline-flex items-center gap-2 text-rose-500 text-sm font-semibold hover:text-rose-600 transition-colors">
                        <span>Como chegar</span>
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </a>
                </div>
            `;
        }).join('');
    };
    renderUnits();


    // ===== Scroll Reveal (IntersectionObserver) =====
    (function () {
        const revealEls = document.querySelectorAll('.reveal');
        if (!revealEls.length) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('revealed');
                    observer.unobserve(e.target); // animate only once
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(el => observer.observe(el));
    })();

    // ===== Reviews Carousel (scroll-snap) =====
    (function () {
        const track = document.getElementById('rev-track');
        const dotsEl = document.getElementById('rev-dots');
        const btnPrev = document.getElementById('rev-prev');
        const btnNext = document.getElementById('rev-next');
        if (!track) return;

        // Inject scrollbar-hide CSS
        const st = document.createElement('style');
        st.textContent = '#rev-track::-webkit-scrollbar{display:none}';
        document.head.appendChild(st);

        const CARDS_PER_PAGE = 5;
        let page = 0;

        // All review data fetched dynamically
        const reviews = storageManager.getReviews();

        const makeCard = (r, isReview) => {
            const d = document.createElement('div');
            d.className = 'rev-card snap-center shrink-0 flex flex-col justify-between p-8 rounded-2xl border transition-all duration-300';
            d.style.cssText = 'background:#fff;border-color:#fecdd3;box-shadow:none;transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1),background 0.3s,border-color 0.3s,box-shadow 0.3s;';
            if (isReview) {
                const numStars = Math.floor(r.rating || 5);
                const starStr = '★'.repeat(numStars) + '☆'.repeat(5 - numStars);
                d.innerHTML = `<div><div style="color:#fda4af;font-size:1.1rem;margin-bottom:1rem;">${starStr}</div><p style="color:#57534e;font-size:.9rem;line-height:1.7;font-style:italic;margin-bottom:1.25rem;">${r.text}</p></div><div style="font-weight:700;color:#292524;font-family:'Outfit',sans-serif;">${r.name}</div>`;
            }
            return d;
        };

        const makeActionCard = (label, icon, onClick) => {
            const d = document.createElement('div');
            d.className = 'rev-action snap-center shrink-0 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300';
            d.style.cssText = 'background:#fff;border-color:#fda4af;';
            d.innerHTML = `${icon}<span style="color:#f43f5e;font-weight:600;font-size:.85rem;">${label}</span>`;
            d.onmouseenter = () => { d.style.background = '#fff1f2'; };
            d.onmouseleave = () => { d.style.background = '#fff'; };
            d.onclick = onClick;
            return d;
        };

        const SVG_NEXT = '<svg style="width:2.5rem;height:2.5rem;color:#fda4af;margin-bottom:.75rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
        const SVG_BACK = '<svg style="width:2.5rem;height:2.5rem;color:#fda4af;margin-bottom:.75rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';

        // Card sizing: computed from container
        const getCardWidth = () => {
            const w = track.parentElement.offsetWidth;
            if (window.innerWidth >= 1024) return (w - 40) / 3;      // 3 cards, gap-5*2=40
            if (window.innerWidth >= 640) return (w - 20) / 2;      // 2 cards, gap-5=20
            return w * 0.82;                                           // 1 card, 82% width
        };

        const setCardWidths = () => {
            const cw = getCardWidth();
            const minH = 220;
            track.querySelectorAll('.rev-card, .rev-action').forEach(c => {
                c.style.width = cw + 'px';
                c.style.minWidth = cw + 'px';
                c.style.minHeight = minH + 'px';
            });
            // Center first/last cards: padding = half container - half card
            const containerW = track.parentElement.offsetWidth;
            const sidePad = Math.max(0, (containerW - cw) / 2);
            track.style.paddingLeft = sidePad + 'px';
            track.style.paddingRight = sidePad + 'px';
        };

        // Equalize card heights for current page
        const equalizeHeights = () => {
            const cards = Array.from(track.querySelectorAll('.rev-card'));
            let max = 0;
            cards.forEach(c => { c.style.height = 'auto'; });
            cards.forEach(c => { max = Math.max(max, c.offsetHeight); });
            cards.forEach(c => { c.style.height = max + 'px'; });
        };

        const renderPage = () => {
            track.innerHTML = '';
            if (dotsEl) dotsEl.innerHTML = '';

            const start = page * CARDS_PER_PAGE;
            const end = Math.min(start + CARDS_PER_PAGE, reviews.length);
            const pageReviews = reviews.slice(start, end);

            // Voltar card
            if (page > 0) {
                track.appendChild(makeActionCard('Comentários anteriores', SVG_BACK, () => { page--; renderPage(); track.scrollLeft = 0; }));
            }

            // Review cards
            pageReviews.forEach(r => {
                track.appendChild(makeCard(r, true));
            });

            // Ver mais card
            if (end < reviews.length) {
                track.appendChild(makeActionCard('Ver mais', SVG_NEXT, () => { page++; renderPage(); track.scrollLeft = 0; }));
            }

            setCardWidths();
            setTimeout(equalizeHeights, 50);

            // Build dots (one per review card only)
            if (dotsEl) {
                const revCards = Array.from(track.querySelectorAll('.rev-card'));
                revCards.forEach((_, i) => {
                    const dot = document.createElement('button');
                    dot.className = 'h-2.5 rounded-full transition-all duration-300';
                    dot.style.cssText = 'width:.625rem;background:#fecdd3;';
                    dot.onclick = () => revCards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
                    dotsEl.appendChild(dot);
                });
            }

            rafUpdate();
        };

        // Get index of card closest to left edge
        const getActiveIdx = () => {
            const allEl = Array.from(track.children);
            if (!allEl.length) return 0;
            const cw = allEl[0].offsetWidth + 20;
            return Math.min(Math.round(track.scrollLeft / cw), allEl.length - 1);
        };

        // Active index among only rev-cards (excluding actions)
        const getRevActiveIdx = () => {
            const allEl = Array.from(track.children);
            const activeEl = allEl[getActiveIdx()];
            const revCards = allEl.filter(c => c.classList.contains('rev-card'));
            return revCards.indexOf(activeEl);
        };

        const rafUpdate = () => {
            const allEl = Array.from(track.children);
            const activeIdx = getActiveIdx();
            const revActiveIdx = getRevActiveIdx();
            const maxScroll = track.scrollWidth - track.clientWidth;

            // Arrows visibility
            if (btnPrev) {
                btnPrev.style.opacity = track.scrollLeft <= 4 ? '0' : '1';
                btnPrev.style.pointerEvents = track.scrollLeft <= 4 ? 'none' : 'auto';
            }
            if (btnNext) {
                btnNext.style.opacity = track.scrollLeft >= maxScroll - 4 ? '0' : '1';
                btnNext.style.pointerEvents = track.scrollLeft >= maxScroll - 4 ? 'none' : 'auto';
            }

            // Card highlight: lift up for selected card, no shadow
            allEl.forEach((card, i) => {
                if (i === activeIdx) {
                    card.style.background = '#ffe4e6';         // rose-100
                    card.style.borderColor = '#fb7185';         // rose-400
                    card.style.boxShadow = 'none';
                    card.style.transform = 'translateY(-20px) scale(1.04)';
                    card.style.zIndex = '10';
                } else {
                    card.style.background = '#fff';
                    card.style.borderColor = '#fecdd3';         // rose-200
                    card.style.boxShadow = 'none';
                    card.style.transform = 'translateY(0) scale(1)';
                    card.style.zIndex = '1';
                }
            });

            // Dots
            if (dotsEl) {
                Array.from(dotsEl.children).forEach((dot, i) => {
                    if (i === revActiveIdx) {
                        dot.style.width = '1.5rem';
                        dot.style.background = '#f43f5e';       // rose-500
                    } else {
                        dot.style.width = '.625rem';
                        dot.style.background = '#fecdd3';       // rose-200
                    }
                });
            }
        };

        track.addEventListener('scroll', rafUpdate, { passive: true });

        if (btnPrev) btnPrev.onclick = () => {
            const cw = (track.children[0] || {}).offsetWidth + 20 || 300;
            track.scrollBy({ left: -cw, behavior: 'smooth' });
        };
        if (btnNext) btnNext.onclick = () => {
            const cw = (track.children[0] || {}).offsetWidth + 20 || 300;
            track.scrollBy({ left: cw, behavior: 'smooth' });
        };

        window.addEventListener('resize', () => { setCardWidths(); equalizeHeights(); });

        renderPage();
    })();

    // Otimização de Scroll (Debounce/Throttling via rAF)
    const heroBg = document.getElementById('hero-parallax-img');
    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;
    let ticking = false;

    const waBtn = document.getElementById('whatsapp-float');
    let waTimeout;

    const updateScroll = () => {
        // Multi-layer Parallax Logic
        if (lastScrollY <= 1000) {
            // Background moves fastest (depth)
            if (heroBg) heroBg.style.transform = `translateY(${lastScrollY * 0.4}px)`;

            // Hero content layers move at different speeds for depth illusion
            const heroLogo = document.querySelector('.hero-logo');
            const heroH1 = document.querySelector('#hero h1');
            const heroP = document.querySelector('#hero p');
            const heroCTA = document.querySelector('#hero .flex.flex-col');

            if (heroLogo) heroLogo.style.transform = `translateY(${lastScrollY * 0.15}px)`;
            if (heroH1) heroH1.style.transform = `translateY(${lastScrollY * 0.1}px)`;
            if (heroP) heroP.style.transform = `translateY(${lastScrollY * 0.05}px)`;
            if (heroCTA) heroCTA.style.transform = `translateY(${lastScrollY * 0.03}px)`;
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

    // Removed handleMenuToggle to prevent double-firing. Just use click.
    mobileBtn?.addEventListener('click', (e) => {
        // Prevent default only if necessary, but standard click is fine here
        toggleMenu();
    });
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
                <div id="filter-dropdown-menu" class="absolute top-[calc(100%+0.5rem)] sm:top-[calc(100%+1rem)] left-1/2 -translate-x-1/2 w-[85vw] max-w-[280px] sm:w-full sm:max-w-none sm:min-w-[260px] bg-white/95 backdrop-blur-xl border border-stone-200 shadow-2xl rounded-3xl p-2 sm:p-3 opacity-0 scale-95 pointer-events-none transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] z-10 flex flex-col gap-1 origin-top">
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
                <article class="portfolio-card opacity-0 translate-y-8 bg-card-bg rounded-[2rem] xl:rounded-[3rem] shadow-sm border border-stone-100 overflow-hidden isolate hover:shadow-lg hover:-translate-y-2 hover:scale-[1.02] [&.is-active]:shadow-lg [&.is-active]:-translate-y-2 [&.is-active]:scale-[1.02] transition-all duration-700 cursor-pointer group relative w-full flex flex-col" style="border-radius:2rem;overflow:hidden;will-change:transform;" onclick="window.openModal('${item.image}', '${item.title}', '${item.description}')">
                    <div class="w-full relative bg-stone-50 overflow-hidden" style="border-radius:2rem 2rem 0 0;overflow:hidden;">
                        <img loading="lazy" src="${item.image}" alt="${item.title}" class="w-full h-80 sm:h-96 lg:h-[28rem] object-cover group-hover:scale-110 group-[.is-active]:scale-110 transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)]" style="border-radius:2rem 2rem 0 0;" />
                        <div class="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-[.is-active]:opacity-100 transition-opacity duration-500"></div>
                        <span class="absolute top-4 left-4 z-10 inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-rose-500 text-[10px] font-bold tracking-widest uppercase rounded-full shadow-sm">${item.category}</span>
                    </div>
                    <div class="p-6 md:p-8 flex-1 flex flex-col justify-center bg-card-bg z-10 relative">
                        <div class="w-8 h-[1px] bg-rose-300 mb-3 group-hover:w-16 group-[.is-active]:w-16 transition-all duration-500"></div>
                        <h3 class="text-xl font-bold text-stone-800 truncate leading-tight group-hover:text-rose-500 group-[.is-active]:text-rose-500 transition-colors duration-300 mb-2">${item.title}</h3>
                        <p class="text-sm text-stone-500 line-clamp-2 leading-relaxed mb-5 flex-1">${item.description}</p>
                        <button onclick="event.stopPropagation(); window.open('https://wa.me/5561982412536?text=' + encodeURIComponent('Olá, vim do site, queria agendar um serviço de ${item.title}!'), '_blank')" class="w-full text-white bg-card-btn px-4 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base hover:opacity-90 hover:shadow-lg transition-all duration-300 active:scale-[0.98]">Agendar serviço</button>
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
                setupBioCardAnimations();

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

        // Bio Cards — Staggered viewport reveal + scroll active state
        const setupBioCardAnimations = () => {
            const bioCards = document.querySelectorAll('.bio-card');
            if (!bioCards.length) return;

            // 1. Staggered entrance animation when section enters viewport
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Find all bio-cards within the observed container
                        const cards = entry.target.querySelectorAll('.bio-card');
                        cards.forEach((card, i) => {
                            setTimeout(() => {
                                card.classList.remove('opacity-0', 'translate-y-6', 'scale-95');
                                card.classList.add('opacity-100', 'translate-y-0', 'scale-100');
                            }, i * 120); // 120ms stagger between each card
                        });
                        revealObserver.disconnect();
                    }
                });
            }, { threshold: 0.15 });

            // Observe the grid container (parent of bio cards)
            const grid = bioCards[0]?.parentElement;
            if (grid) revealObserver.observe(grid);

            // 2. Scroll-based center activation: active when in viewport center, weak at edges
            const updateActiveStates = () => {
                const vh = window.innerHeight;
                const activeTop = vh * 0.35;    // Top 35% mark
                const activeBottom = vh * 0.65; // Bottom 65% mark

                bioCards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const cardCenter = rect.top + rect.height / 2;

                    // Card center is in the active zone (center 60% of screen) → activate
                    if (cardCenter > activeTop && cardCenter < activeBottom && rect.top < vh && rect.bottom > 0) {
                        card.classList.add('is-active');
                    } else {
                        card.classList.remove('is-active');
                    }
                });
            };

            window.addEventListener('scroll', updateActiveStates, { passive: true });
            updateActiveStates(); // Run once on load
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
        setupBioCardAnimations();
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