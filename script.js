/**
 * Módulo de Dados (Storage)
 * Responsável apenas por salvar e recuperar dados do LocalStorage
 */
const Storage = {
    keys: {
        cards: 'janayneCards'
    },

    init() {
        const initialData = [
            {
                id: 1,
                image: 'assets/foto1.jpg', 
                title: 'Design Exclusivo',
                description: 'Arte e sofisticação.',
                category: 'Nail Art'
            },
            {
                id: 2,
                image: 'assets/foto2.jpg',
                title: 'Nail Art',
                description: 'Acabamento premium.',
                category: 'Nail Art'
            },
            {
                id: 3,
                image: 'assets/foto3.jpg',
                title: 'Alongamento',
                description: 'Naturalidade e resistência.',
                category: 'Alongamento'
            },
            {
                id: 4,
                image: 'assets/foto4.jpg',
                title: 'Esmaltação',
                description: 'Cores vibrantes.',
                category: 'Nail Art'
            },
            {
                id: 5,
                image: 'assets/foto5.jpg',
                title: 'Blindagem',
                description: 'Proteção e brilho.',
                category: 'Blindagem'
            },
            {
                id: 6,
                image: 'assets/foto6.jpg',
                title: 'Spa dos Pés',
                description: 'Cuidado completo.',
                category: 'Pés'
            }
        ];

        // FORÇA a atualização para usar as novas fotos da pasta assets
        // Isso garante que o script pegue as fotos renomeadas pelo script bash
        localStorage.setItem(this.keys.cards, JSON.stringify(initialData));
    },

    get(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    },

    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    add(key, item) {
        const data = this.get(key);
        data.push(item);
        this.set(key, data);
    },

    remove(key, id) {
        let data = this.get(key);
        data = data.filter(item => item.id !== id);
        this.set(key, data);
    }
};

/**
 * Módulo de Interface (UI)
 * Responsável por manipular o DOM
 */
const UI = {
    observer: null,

    initObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('opacity-0', 'translate-y-8');
                    // Restaura a velocidade para 300ms após a animação de entrada (700ms) para o hover ficar ágil
                    setTimeout(() => entry.target.classList.replace('duration-700', 'duration-300'), 700);
                    this.observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
    },

    // Efeito Parallax na Hero Section
    initParallax() {
        const heroBg = document.getElementById('hero-parallax-img');
        if (!heroBg) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            // Otimização: só anima se estiver visível (primeiros 1000px)
            if (scrolled > 1000) return;
            
            // Move a imagem para baixo a 40% da velocidade do scroll
            heroBg.style.transform = `translateY(${scrolled * 0.4}px)`;
        });
    },

    // Botão Flutuante do WhatsApp
    initFloatingWhatsApp() {
        const waBtn = document.getElementById('whatsapp-float');
        if (!waBtn) return;
        const waIcon = waBtn.querySelector('svg');
        
        let lastScrollTop = 0;

        // Animação de entrada ao carregar (fade-in suave)
        setTimeout(() => {
            waBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
            waBtn.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto', 'transition-all', 'duration-500', 'ease-out');
            if (waIcon) waIcon.classList.add('animate-gentle-bounce');
        }, 1000);

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

            // Se estiver rolando para cima OU estiver no topo da página
            if (currentScroll < lastScrollTop || currentScroll < 100) {
                waBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
                waBtn.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
                if (waIcon) waIcon.classList.add('animate-gentle-bounce');
            } else {
                // Rolando para baixo
                waBtn.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
                waBtn.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
                if (waIcon) waIcon.classList.remove('animate-gentle-bounce');
            }
            
            lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Para Mobile ou rolagem negativa
        });
    },

    // Header com fundo sólido ao rolar
    initStickyHeader() {
        const header = document.querySelector('header');
        if (!header) return;

        window.addEventListener('scroll', () => {
            // No PC, mantemos o header transparente pois a nav é uma pílula flutuante
            // No Mobile, precisamos do fundo para o botão do menu
            const isMobile = window.innerWidth < 768;

            if (window.scrollY > 50 && isMobile) {
                header.classList.remove('bg-transparent', 'border-white/10');
                header.classList.add('bg-white/90', 'shadow-sm', 'border-rose-100');
            } else {
                header.classList.add('bg-transparent', 'border-white/10');
                header.classList.remove('bg-white/90', 'shadow-sm', 'border-rose-100');
            }
        });

        // ScrollSpy para destacar link ativo
        const sections = document.querySelectorAll('section[id]');
        // Seleciona links internos da nav desktop
        const navLinks = document.querySelectorAll('nav.hidden a[href^="#"], nav.hidden a[href="#"]');

        window.addEventListener('scroll', () => {
            let current = '';
            
            // Se estiver no topo, current é vazio (Início)
            if (window.scrollY < 100) current = '#';

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                // Reset estilos
                link.classList.remove('text-rose-500', 'font-semibold');
                link.classList.add('text-stone-600', 'font-medium');
                
                const href = link.getAttribute('href');
                // Verifica se é o link atual
                if ((current === '#' && href === '#') || (current && href.includes(current) && href !== '#')) {
                    link.classList.remove('text-stone-600', 'font-medium');
                    link.classList.add('text-rose-500', 'font-semibold');
                }
            });
        });
    },

    // Notificações Toast Premium
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
        const icon = type === 'success' ? 
            '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' : 
            '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
            
        toast.className = `fixed bottom-4 right-4 z-[60] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white transform translate-y-10 opacity-0 transition-all duration-300 ${bgColor}`;
        toast.innerHTML = `${icon} <span class="font-medium">${message}</span>`;
        
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.remove('translate-y-10', 'opacity-0'));

        setTimeout(() => {
            toast.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Lógica do Modal (Lightbox)
    openModal(imageSrc, title) {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-img');
        const modalCta = document.getElementById('modal-cta');
        
        if (!modal || !modalImg) return;

        modalImg.src = imageSrc;
        
        // Link Dinâmico do WhatsApp (CRO)
        const message = encodeURIComponent(`Olá, Janayne! Amei a foto de *${title}* no seu site. Gostaria de agendar!`);
        modalCta.href = `https://wa.me/5561982412536?text=${message}`;

        modal.classList.remove('hidden');
        // Pequeno delay para permitir a transição CSS
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modalImg.classList.remove('scale-95');
            modalImg.classList.add('scale-100');
        }, 10);
    },

    closeModal() {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-img');
        
        if (!modal) return;

        modal.classList.add('opacity-0');
        if(modalImg) {
            modalImg.classList.remove('scale-100');
            modalImg.classList.add('scale-95');
        }
        
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    },

    renderCards(isAdmin = false, filter = 'all') {
        const container = isAdmin ? document.getElementById('admin-cards-list') : document.getElementById('cards-container');
        if (!container) return;

        const cards = Storage.get(Storage.keys.cards);
        container.innerHTML = '';

        // Filtra os cards se não for admin e o filtro não for 'all'
        const filteredCards = (isAdmin || filter === 'all') 
            ? cards 
            : cards.filter(card => card.category === filter);

        filteredCards.forEach(card => {
            const cardElement = document.createElement('div');
            // Classes Tailwind para o Card: Fundo branco, arredondado, sombra suave, hover com translação
            // Adicionado 'cursor-pointer' se não for admin para indicar clique
            cardElement.className = `group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-rose-100 transition-all duration-700 transform hover:-translate-y-1 opacity-0 translate-y-8 ${!isAdmin ? 'cursor-pointer' : ''}`;
            
            // Evento de clique para abrir o Modal (apenas se não for admin)
            if (!isAdmin) {
                cardElement.onclick = () => this.openModal(card.image, card.title);
            }

            cardElement.innerHTML = `
                <!-- Skeleton Loading: bg-rose-100 e animate-pulse no container da imagem -->
                <div class="relative overflow-hidden aspect-[4/5] bg-rose-100 animate-pulse img-container">
                    <img src="${card.image}" alt="${card.title}" loading="lazy" 
                        class="w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:scale-105" 
                        onload="this.classList.remove('opacity-0'); this.parentElement.classList.remove('animate-pulse', 'bg-rose-100');"
                        onerror="this.style.display='none'">
                    
                    <!-- Overlay Gradiente -->
                    <div class="absolute inset-0 bg-gradient-to-t from-rose-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div class="p-6 bg-rose-50 border-t border-rose-100">
                    <h4 class="font-serif text-xl font-medium text-stone-800 mb-2">${card.title}</h4>
                    <p class="text-sm text-stone-500 font-light leading-relaxed">${card.description}</p>
                </div>
                ${isAdmin ? `
                <div class="px-6 pb-6 pt-0">
                    <button data-id="${card.id}" class="btn-delete w-full py-3 text-xs font-bold uppercase tracking-wider text-rose-500 border border-rose-200 rounded-xl hover:bg-rose-50 active:scale-95 transition-all">Excluir Item</button>
                </div>` : ''}
            `;
            container.appendChild(cardElement);

            if (this.observer) this.observer.observe(cardElement);
        });
    }
};

/**
 * Aplicação Principal
 * Inicializa e gerencia eventos
 */
const App = {
    init() {
        Storage.init();
        UI.initObserver();
        UI.initParallax();
        UI.initFloatingWhatsApp();
        UI.initStickyHeader();
        
        const isAdminPage = !!document.getElementById('admin-cards-list');
        UI.renderCards(isAdminPage);

        this.bindEvents(isAdminPage);
    },

    bindEvents(isAdmin) {
        // Form de Admin
        let currentBase64Image = '';
        const adminForm = document.getElementById('admin-form');
        
        if (adminForm) {
            // Upload de Imagem com Preview
            const fileInput = document.getElementById('img-file');
            const previewContainer = document.getElementById('img-preview-container');
            const previewImg = document.getElementById('img-preview');

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        currentBase64Image = event.target.result;
                        previewImg.src = currentBase64Image;
                        previewContainer.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            });

            adminForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!currentBase64Image) {
                    UI.showToast('Por favor, selecione uma imagem.', 'error');
                    return;
                }

                const newCard = {
                    id: Date.now(),
                    image: currentBase64Image, // Salva Base64
                    title: document.getElementById('card-title').value,
                    description: document.getElementById('card-desc').value,
                    category: document.getElementById('card-category').value
                };
                Storage.add(Storage.keys.cards, newCard);
                UI.showToast('Trabalho adicionado com sucesso!');
                adminForm.reset();
                previewContainer.classList.add('hidden');
                currentBase64Image = '';
                UI.renderCards(true);
            });

            // Modal de Exclusão
            let deleteTargetId = null;
            const deleteModal = document.getElementById('delete-modal');
            
            document.getElementById('admin-cards-list').addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-delete')) {
                    deleteTargetId = parseInt(e.target.getAttribute('data-id'));
                    deleteModal.classList.remove('hidden');
                }
            });

            document.getElementById('cancel-delete-btn').addEventListener('click', () => deleteModal.classList.add('hidden'));
            document.getElementById('confirm-delete-btn').addEventListener('click', () => {
                if (deleteTargetId) {
                    Storage.remove(Storage.keys.cards, deleteTargetId);
                    UI.renderCards(true);
                    deleteModal.classList.add('hidden');
                    UI.showToast('Item removido com sucesso!');
                }
            });
        }

        // Filtros de Categoria (Index)
        const filterContainer = document.getElementById('portfolio-filters');
        if (filterContainer) {
            filterContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    // Remove classe ativa de todos
                    document.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.remove('bg-rose-300', 'text-stone-900', 'shadow-md', 'border-rose-200');
                        btn.classList.add('bg-rose-50', 'text-stone-800', 'hover:bg-rose-100', 'border-rose-100');
                    });

                    // Adiciona classe ativa no clicado
                    e.target.classList.remove('bg-rose-50', 'text-stone-800', 'hover:bg-rose-100', 'border-rose-100');
                    e.target.classList.add('bg-rose-300', 'text-stone-900', 'shadow-md', 'border-rose-200');

                    // Filtra
                    const category = e.target.getAttribute('data-category');
                    
                    // Pequeno efeito de fade-out/in no container para suavizar a troca
                    const container = document.getElementById('cards-container');
                    container.style.opacity = '0';
                    setTimeout(() => {
                        UI.renderCards(false, category);
                        container.style.opacity = '1';
                    }, 200);
                }
            });
        }

        // Mobile Menu Toggle
        const mobileBtn = document.getElementById('mobile-menu-btn');
        const closeMenuBtn = document.getElementById('close-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
        const menuIcon = mobileBtn ? mobileBtn.querySelector('svg') : null;

        function toggleMenu() {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                // Pequeno delay para permitir a transição de opacidade
                setTimeout(() => {
                    mobileMenu.classList.remove('translate-x-full');
                    // Animação escalonada dos itens do menu
                    menuLinks.forEach((link, index) => {
                        setTimeout(() => {
                            link.classList.remove('opacity-0', 'translate-y-4');
                        }, 100 + (index * 100));
                    });
                }, 10);
                if (menuIcon) menuIcon.classList.add('rotate-90', 'transition-transform', 'duration-300');
            } else {
                mobileMenu.classList.add('translate-x-full');
                // Reset dos itens para a próxima abertura
                menuLinks.forEach(link => link.classList.add('opacity-0', 'translate-y-4'));
                
                setTimeout(() => mobileMenu.classList.add('hidden'), 300);
                if (menuIcon) menuIcon.classList.remove('rotate-90');
            }
        }

        if (mobileBtn && mobileMenu) {
            mobileBtn.addEventListener('click', toggleMenu);
            if(closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
            
            // Fechar menu ao clicar em um link
            menuLinks.forEach(link => {
                link.addEventListener('click', toggleMenu);
            });
        }

        // Modal Events
        const modalCloseBtn = document.getElementById('modal-close');
        const modalBackdrop = document.getElementById('modal-backdrop');
        
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => UI.closeModal());
        if (modalBackdrop) modalBackdrop.addEventListener('click', () => UI.closeModal());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') UI.closeModal();
        });
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => App.init());