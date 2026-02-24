/**
 * utils.js - Módulos de Lógica e UI
 * Refatorado para uma arquitetura moderna, baseada em classes.
 */

/**
 * Gerencia todo o acesso ao localStorage de forma segura.
 */
class StorageManager {
    constructor() {
        this.keys = {
            cards: 'janayneCards',
            settings: 'janayneSettings'
        };
    }

    /**
     * Popula o localStorage com dados iniciais se estiver vazio.
     * As imagens agora são apenas para referência e serão substituídas por Base64.
     */
    init() {
        if (!localStorage.getItem(this.keys.cards)) {
            const initialData = [
                { id: 1, image: 'assets/foto1.jpg', title: 'Design Exclusivo', description: 'Arte e sofisticação.', category: 'Nail Art' },
                { id: 2, image: 'assets/foto2.jpg', title: 'Nail Art', description: 'Acabamento premium.', category: 'Nail Art' },
                { id: 3, image: 'assets/foto3.jpg', title: 'Alongamento', description: 'Naturalidade e resistência.', category: 'Alongamento' },
                { id: 4, image: 'assets/foto4.jpg', title: 'Esmaltação', description: 'Cores vibrantes.', category: 'Nail Art' },
                { id: 5, image: 'assets/foto5.jpg', title: 'Blindagem', description: 'Proteção e brilho.', category: 'Blindagem' },
                { id: 6, image: 'assets/foto6.jpg', title: 'Spa dos Pés', description: 'Cuidado completo.', category: 'Pés' }
            ];
            this.set(this.keys.cards, initialData);
        }
    }

    get(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch (e) {
            console.error(`Erro ao ler a chave ${key} do localStorage:`, e);
            return [];
        }
    }

    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Erro ao salvar a chave ${key} no localStorage:`, e);
            uiManager.showToast('Erro ao salvar dados. O armazenamento pode estar cheio.', 'error');
        }
    }

    getCards() { return this.get(this.keys.cards); }
    getSettings() { return this.get(this.keys.settings); }

    addCard(card) {
        const cards = this.getCards();
        cards.push(card);
        this.set(this.keys.cards, cards);
    }

    removeCard(id) {
        let cards = this.getCards();
        // Usa != para permitir comparação entre string (do HTML) e number (do JSON)
        cards = cards.filter(card => card.id != id);
        this.set(this.keys.cards, cards);
    }

    saveSettings(settings) {
        this.set(this.keys.settings, settings);
    }
}

/**
 * Otimiza e converte imagens antes de salvar.
 */
class ImageOptimizer {
    constructor(maxWidth = 800, maxHeight = 800, quality = 0.6, format = 'image/webp') {
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.quality = quality;
        this.format = format;
        this.fallbackFormat = 'image/jpeg';
    }

    /**
     * Processa um arquivo de imagem, redimensionando e comprimindo-o.
     * @param {File} file - O arquivo de imagem do input.
     * @returns {Promise<string>} Uma promessa que resolve com a string Base64 da imagem otimizada.
     */
    process(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let { width, height } = img;

                    if (width > height) {
                        if (width > this.maxWidth) {
                            height = Math.round((height * this.maxWidth) / width);
                            width = this.maxWidth;
                        }
                    } else {
                        if (height > this.maxHeight) {
                            width = Math.round((width * this.maxHeight) / height);
                            height = this.maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Tenta usar WebP, com fallback para JPEG
                    let dataUrl = canvas.toDataURL(this.format, this.quality);
                    if (!dataUrl.startsWith(`data:${this.format}`)) {
                        console.warn('WebP não suportado, usando JPEG como fallback.');
                        dataUrl = canvas.toDataURL(this.fallbackFormat, this.quality);
                    }
                    
                    resolve(dataUrl);
                };
                img.onerror = reject;
                img.src = event.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

/**
 * Controla todas as manipulações do DOM e interações da UI.
 */
class UIManager {
    constructor() {
        this.observer = null;
        // Estado do Modal
        this.currentGallery = [];
        this.currentIndex = 0;
        this.touchStartX = 0;
        this.touchEndX = 0;
    }

    initObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Adiciona delay escalonado (stagger) para um efeito cascata elegante
                    setTimeout(() => {
                        entry.target.classList.remove('opacity-0', 'translate-y-12', 'scale-95');
                        entry.target.classList.add('opacity-100', 'translate-y-0', 'scale-100');
                    }, index * 100); // 100ms de intervalo entre cada card
                    this.observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';
        const icon = type === 'success' ? 
            `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>` : 
            `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
        toast.className = `fixed bottom-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white transform translate-y-20 opacity-0 transition-all duration-300 ease-out ${bgColor}`;
        toast.innerHTML = `${icon} <span class="font-medium text-sm">${message}</span>`;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.remove('translate-y-20', 'opacity-0'));
        setTimeout(() => { 
            toast.classList.add('translate-y-20', 'opacity-0'); 
            setTimeout(() => toast.remove(), 300); 
        }, 3500);
    }
    
    /**
     * Renderiza os cards de serviço com um design de luxo e efeitos.
     * @param {HTMLElement} container - O elemento onde os cards serão inseridos.
     * @param {Array} cards - Os dados dos cards a serem renderizados.
     * @param {boolean} isAdmin - Flag para renderizar a versão de admin.
     */
    renderCards(container, cards, isAdmin = false) {
        if (!container) return;
        container.innerHTML = '';
        
        if (cards.length === 0 && !isAdmin) {
            container.innerHTML = `<p class="text-stone-500 col-span-full text-center">Nenhum trabalho encontrado.</p>`;
            return;
        }

        cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            // Classes de animação e design de luxo
            cardElement.className = `card-item group rounded-3xl overflow-hidden bg-stone-900/10 backdrop-blur-3xl border border-white/10 shadow-lg transition-all duration-700 ease-out will-change-transform opacity-0 translate-y-12 scale-95 ${!isAdmin ? 'cursor-pointer' : ''} flex flex-col`;
            
            cardElement.innerHTML = `
                <div class="relative overflow-hidden aspect-[3/2]">
                    <!-- Skeleton Shimmer (Carregamento) -->
                    <div class="absolute inset-0 bg-stone-200 z-10 overflow-hidden">
                        <div class="absolute top-0 h-full w-full bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12 animate-shine" style="left: -100%"></div>
                    </div>
                    <img src="${card.image}" alt="${card.title}" loading="lazy" 
                         class="w-full h-full object-cover transition-all duration-700 ease-in-out transform group-hover:scale-110 group-hover:saturate-150 opacity-0"
                         onload="this.classList.remove('opacity-0'); this.previousElementSibling.remove();">
                    <!-- Hover Shimmer (Brilho ao passar o mouse) -->
                    <div class="absolute top-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 hover-shine pointer-events-none z-20" style="left: -100%"></div>
                    <!-- Overlay de Gradiente para Legibilidade -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none"></div>
                    <div class="absolute top-4 right-4 bg-rose-400/80 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-2 group-hover:translate-y-0">
                        ${card.category}
                    </div>
                </div>
                <div class="p-4 flex-1 flex flex-col">
                    <h4 class="font-serif text-lg font-semibold text-stone-800 mb-1">${card.title}</h4>
                    <p class="text-xs text-stone-600 font-light leading-relaxed line-clamp-2">${card.description}</p>
                </div>
                ${isAdmin ? `
                <div class="px-6 pb-6 pt-0">
                    <button data-id="${card.id}" class="btn-delete w-full py-3 text-xs font-bold uppercase tracking-wider text-red-500 border border-red-200 rounded-xl bg-red-50 hover:bg-red-100 active:scale-95 transition-all">
                        Excluir Item
                    </button>
                </div>` : ''}
            `;

            if (!isAdmin) {
                const imgElement = cardElement.querySelector('img');
                cardElement.onclick = () => this.openModal(index, cards, imgElement);
            }

            container.appendChild(cardElement);
            if (this.observer) this.observer.observe(cardElement);
        });
    }

    applyTheme() {
        const settings = storageManager.getSettings();
        const root = document.documentElement;

        const hexToRgb = (hex) => {
            if (!hex || hex.length < 4) return null;
            let r = 0, g = 0, b = 0;
            if (hex.length === 4) {
                r = parseInt(hex[1] + hex[1], 16);
                g = parseInt(hex[2] + hex[2], 16);
                b = parseInt(hex[3] + hex[3], 16);
            } else if (hex.length === 7) {
                r = parseInt(hex.slice(1, 3), 16);
                g = parseInt(hex.slice(3, 5), 16);
                b = parseInt(hex.slice(5, 7), 16);
            }
            return `${r} ${g} ${b}`;
        };

        const theme = {
            '--color-primary': hexToRgb(settings.primaryColor || '#f45d7e'),
            '--color-light': hexToRgb(settings.lightColor || '#ffeef1'),
            '--color-text': hexToRgb(settings.textColor || '#292524'),
        };

        for (const [key, value] of Object.entries(theme)) {
            if (value) root.style.setProperty(key, value);
        }
        
        // Nome do Salão e WhatsApp
        if (settings.salonName) {
            document.querySelectorAll('.salon-name').forEach(el => el.textContent = settings.salonName);
        }
        if (settings.whatsappLink) {
             document.querySelectorAll('.whatsapp-link').forEach(el => el.href = settings.whatsappLink);
        }

        // Imagem de Fundo
        if (settings.heroImage) {
            const heroImg = document.getElementById('hero-parallax-img');
            if (heroImg) heroImg.src = settings.heroImage;
        }
    }
    
    // Outros métodos de UI como openModal, closeModal, etc. podem ser adicionados aqui.
    openModal(index, allCards, sourceElement = null) {
        this.currentIndex = index;
        this.currentGallery = allCards;
        const card = allCards[index];

        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-img');
        const modalCta = document.getElementById('modal-cta');
        const prevBtn = document.getElementById('modal-prev');
        const nextBtn = document.getElementById('modal-next');

        if (!modal || !modalImg) return;

        // Setup Navigation Events (apenas na primeira abertura para evitar duplicidade)
        if (!modal.hasAttribute('data-events-bound')) {
            prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); this.navigateModal(-1); });
            nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); this.navigateModal(1); });
            
            // Swipe Events
            modal.addEventListener('touchstart', (e) => this.touchStartX = e.changedTouches[0].screenX, {passive: true});
            modal.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
            }, {passive: true});
            
            modal.setAttribute('data-events-bound', 'true');
        }

        this.updateModalContent(card);
        
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Impede o scroll do fundo
        
        // Configuração Inicial da Animação (Zoom Centralizado "Pop")
        // Começa invisível e menor (60% do tamanho) no centro da tela
        modal.classList.add('opacity-0');
        modalImg.style.transition = 'none';
        modalImg.style.transform = 'scale(0.6)'; 
        modalImg.style.opacity = '0';

        // Executa a animação no próximo frame
        requestAnimationFrame(() => {
            // Curva Bezier "bouncy" suave para dar sensação de vida
            modalImg.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            
            modal.classList.remove('opacity-0');
            modalImg.style.transform = 'scale(1)';
            modalImg.style.opacity = '1';
        });
    }

    navigateModal(direction) {
        const newIndex = this.currentIndex + direction;
        
        // Loop infinito (se chegar no fim, volta pro começo e vice-versa)
        if (newIndex < 0) this.currentIndex = this.currentGallery.length - 1;
        else if (newIndex >= this.currentGallery.length) this.currentIndex = 0;
        else this.currentIndex = newIndex;

        const card = this.currentGallery[this.currentIndex];
        const modalImg = document.getElementById('modal-img');

        // Animação rápida de troca
        modalImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        modalImg.style.opacity = '0';
        modalImg.style.transform = direction > 0 ? 'translateX(-20px)' : 'translateX(20px)';

        setTimeout(() => {
            this.updateModalContent(card);
            modalImg.style.transform = direction > 0 ? 'translateX(20px)' : 'translateX(-20px)';
            
            requestAnimationFrame(() => {
                modalImg.style.opacity = '1';
                modalImg.style.transform = 'translateX(0)';
            });
        }, 200);
    }

    updateModalContent(card) {
        const modalImg = document.getElementById('modal-img');
        const modalCta = document.getElementById('modal-cta');
        const counter = document.getElementById('modal-counter');
        const dotsContainer = document.getElementById('modal-dots');

        modalImg.src = card.image;
        
        // Update WhatsApp Link
        const settings = storageManager.getSettings();
        let whatsappNumber = '5561982412536'; // Default
        
        if (settings?.whatsappLink) {
            // Tenta extrair apenas os números do link salvo para evitar erros de formatação
            const match = settings.whatsappLink.match(/wa\.me\/(\d+)/) || settings.whatsappLink.match(/phone=(\d+)/);
            if (match) whatsappNumber = match[1];
        }

        const message = encodeURIComponent(`Olá! Amei o trabalho *${card.title}* que vi no seu site. Gostaria de agendar um horário.`);
        if(modalCta) modalCta.href = `https://wa.me/${whatsappNumber}?text=${message}`;

        // Update Counter
        if (counter) counter.textContent = `${this.currentIndex + 1} / ${this.currentGallery.length}`;

        // Update Dots (Mots)
        if (dotsContainer) {
            dotsContainer.innerHTML = this.currentGallery.map((_, idx) => `
                <div class="w-2 h-2 rounded-full transition-all duration-300 ${idx === this.currentIndex ? 'bg-white scale-125' : 'bg-white/30'}"></div>
            `).join('');
        }
    }

    handleSwipe() {
        const threshold = 50; // Mínimo de pixels para considerar swipe
        if (this.touchStartX - this.touchEndX > threshold) {
            this.navigateModal(1); // Swipe Left -> Next
        }
        if (this.touchEndX - this.touchStartX > threshold) {
            this.navigateModal(-1); // Swipe Right -> Prev
        }
    }

    closeModal() {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-img');
        if (!modal) return;

        modal.classList.add('opacity-0');
        
        // Animação de saída: encolhe de volta para o centro
        if(modalImg) { 
            modalImg.style.transform = 'scale(0.8)'; 
            modalImg.style.opacity = '0'; 
        }
        
        // Limpa estilos inline após a transição para não afetar a próxima abertura
        setTimeout(() => { modalImg.style.transform = ''; modalImg.style.transition = ''; }, 300);

        document.body.style.overflow = ''; // Restaura o scroll
        
        setTimeout(() => { modal.classList.add('hidden'); }, 300);
    }
}

// --- Instanciação dos Módulos ---
const storageManager = new StorageManager();
const imageOptimizer = new ImageOptimizer();
const uiManager = new UIManager();

// Aplicar tema imediatamente ao carregar
document.addEventListener('DOMContentLoaded', () => {
    storageManager.init(); // Garante que os dados iniciais existam
    uiManager.applyTheme();
});