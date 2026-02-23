/**
 * Módulo de Dados (Storage)
 * Responsável apenas por salvar e recuperar dados do LocalStorage
 */
const Storage = {
    keys: {
        cards: 'janayneCards',
        comments: 'janayneComments'
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
        
        if (!localStorage.getItem(this.keys.comments)) {
            localStorage.setItem(this.keys.comments, JSON.stringify([]));
        }
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
    renderCards(isAdmin = false) {
        const container = isAdmin ? document.getElementById('admin-cards-list') : document.getElementById('cards-container');
        if (!container) return;

        const cards = Storage.get(Storage.keys.cards);
        container.innerHTML = '';

        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.innerHTML = `
                <div style="overflow: hidden;"><img src="${card.image}" alt="${card.title}" loading="lazy" onerror="this.style.display='none'"></div>
                <div class="card-content">
                    <h4>${card.title}</h4>
                    <p>${card.description}</p>
                </div>
                ${isAdmin ? `<div class="card-actions"><button data-id="${card.id}" class="btn-delete">Excluir</button></div>` : ''}
            `;
            container.appendChild(cardElement);
        });
    },

    renderComments() {
        const container = document.getElementById('comments-list');
        if (!container) return;
        
        const comments = Storage.get(Storage.keys.comments);
        container.innerHTML = comments.map(c => 
            `<div class="glass" style="padding: 1rem; margin-bottom: 1rem; border-radius: 12px; border-left: 2px solid var(--accent);">
                <strong style="color: var(--accent); display:block; margin-bottom:5px;">${c.name}</strong> 
                <span style="color: var(--text-main);">${c.text}</span>
            </div>`
        ).join('');
    }
};

/**
 * Aplicação Principal
 * Inicializa e gerencia eventos
 */
const App = {
    init() {
        Storage.init();
        
        const isAdminPage = !!document.getElementById('admin-cards-list');
        UI.renderCards(isAdminPage);
        UI.renderComments();

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
                alert('Trabalho adicionado com luxo!');
                adminForm.reset();
                UI.renderCards(true);
            });

            // Event Delegation para deletar (mais performático)
            document.getElementById('admin-cards-list').addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-delete')) {
                    const id = parseInt(e.target.getAttribute('data-id'));
                    if(confirm('Deseja remover este item exclusivo?')) {
                        Storage.remove(Storage.keys.cards, id);
                        UI.renderCards(true);
                    }
                }
            });
        }

        // Form de Comentários
        const commentForm = document.getElementById('comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newComment = {
                    name: document.getElementById('comment-name').value,
                    text: document.getElementById('comment-text').value
                };
                Storage.add(Storage.keys.comments, newComment);
                UI.renderComments();
                commentForm.reset();
            });
        }

        // Mobile Menu Toggle
        const mobileBtn = document.getElementById('mobile-menu-btn');
        const navMenu = document.getElementById('nav-menu');
        if (mobileBtn && navMenu) {
            mobileBtn.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => App.init());