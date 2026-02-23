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
                description: 'Arte e sofisticação.'
            },
            {
                id: 2,
                image: 'assets/foto2.jpg',
                title: 'Nail Art',
                description: 'Acabamento premium.'
            },
            {
                id: 3,
                image: 'assets/foto3.jpg',
                title: 'Alongamento',
                description: 'Naturalidade e resistência.'
            },
            {
                id: 4,
                image: 'assets/foto4.jpg',
                title: 'Esmaltação',
                description: 'Cores vibrantes.'
            },
            {
                id: 5,
                image: 'assets/foto5.jpg',
                title: 'Blindagem',
                description: 'Proteção e brilho.'
            },
            {
                id: 6,
                image: 'assets/foto6.jpg',
                title: 'Spa dos Pés',
                description: 'Cuidado completo.'
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

    renderCards(isAdmin = false) {
        const container = isAdmin ? document.getElementById('admin-cards-list') : document.getElementById('cards-container');
        if (!container) return;

        const cards = Storage.get(Storage.keys.cards);
        container.innerHTML = '';

        cards.forEach(card => {
            const cardElement = document.createElement('div');
            // Classes Tailwind para o Card: Fundo branco, arredondado, sombra suave, hover com translação
            cardElement.className = 'group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-700 transform hover:-translate-y-2 border border-gray-100 opacity-0 translate-y-8';
            
            cardElement.innerHTML = `
                <div class="relative overflow-hidden aspect-[4/5]">
                    <img src="${card.image}" alt="${card.title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onerror="this.style.display='none'">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div class="p-6">
                    <h4 class="font-serif text-xl font-semibold text-brand-dark mb-2">${card.title}</h4>
                    <p class="text-sm text-brand-gray font-light leading-relaxed">${card.description}</p>
                </div>
                ${isAdmin ? `
                <div class="px-6 pb-6 pt-0">
                    <button data-id="${card.id}" class="btn-delete w-full py-2 text-xs font-bold uppercase tracking-wider text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Excluir Item</button>
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
        
        const isAdminPage = !!document.getElementById('admin-cards-list');
        UI.renderCards(isAdminPage);

        this.bindEvents(isAdminPage);
    },

    bindEvents(isAdmin) {
        // Form de Admin
        const adminForm = document.getElementById('admin-form');
        if (adminForm) {
            adminForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newCard = {
                    id: Date.now(),
                    image: document.getElementById('img-url').value,
                    title: document.getElementById('card-title').value,
                    description: document.getElementById('card-desc').value
                };
                Storage.add(Storage.keys.cards, newCard);
                alert('Trabalho adicionado com sucesso!');
                adminForm.reset();
                UI.renderCards(true);
            });

            // Event Delegation para deletar (mais performático)
            document.getElementById('admin-cards-list').addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-delete')) {
                    const id = parseInt(e.target.getAttribute('data-id'));
                    if(confirm('Tem certeza que deseja remover este item?')) {
                        Storage.remove(Storage.keys.cards, id);
                        UI.renderCards(true);
                    }
                }
            });
        }

        // Mobile Menu Toggle
        const mobileBtn = document.getElementById('mobile-menu-btn');
        const closeMenuBtn = document.getElementById('close-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

        function toggleMenu() {
            mobileMenu.classList.toggle('translate-x-full');
        }

        if (mobileBtn && mobileMenu) {
            mobileBtn.addEventListener('click', toggleMenu);
            if(closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
            
            // Fechar menu ao clicar em um link
            menuLinks.forEach(link => {
                link.addEventListener('click', toggleMenu);
            });
        }
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => App.init());