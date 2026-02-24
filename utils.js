/**
 * utils.js - Lógica compartilhada
 */

const Storage = {
    keys: { cards: 'janayneCards', settings: 'janayneSettings' },
    init() {
        const initialData = [
            { id: 1, image: 'assets/foto1.jpg', title: 'Design Exclusivo', description: 'Arte e sofisticação.', category: 'Nail Art' },
            { id: 2, image: 'assets/foto2.jpg', title: 'Nail Art', description: 'Acabamento premium.', category: 'Nail Art' },
            { id: 3, image: 'assets/foto3.jpg', title: 'Alongamento', description: 'Naturalidade e resistência.', category: 'Alongamento' },
            { id: 4, image: 'assets/foto4.jpg', title: 'Esmaltação', description: 'Cores vibrantes.', category: 'Nail Art' },
            { id: 5, image: 'assets/foto5.jpg', title: 'Blindagem', description: 'Proteção e brilho.', category: 'Blindagem' },
            { id: 6, image: 'assets/foto6.jpg', title: 'Spa dos Pés', description: 'Cuidado completo.', category: 'Pés' }
        ];
        if (!localStorage.getItem(this.keys.cards)) {
            localStorage.setItem(this.keys.cards, JSON.stringify(initialData));
        }
    },
    get(key) { return JSON.parse(localStorage.getItem(key)) || []; },
    set(key, data) { localStorage.setItem(key, JSON.stringify(data)); },
    add(key, item) { const data = this.get(key); data.push(item); this.set(key, data); },
    remove(key, id) { let data = this.get(key); data = data.filter(item => item.id !== id); this.set(key, data); },
    
    getSettings() { return JSON.parse(localStorage.getItem(this.keys.settings)) || {}; },
    saveSettings(settings) { localStorage.setItem(this.keys.settings, JSON.stringify(settings)); }
};

const UI = {
    observer: null,
    initObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('opacity-0', 'translate-y-8');
                    setTimeout(() => entry.target.classList.replace('duration-700', 'duration-300'), 700);
                    this.observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
    },
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
        setTimeout(() => { toast.classList.add('translate-y-10', 'opacity-0'); setTimeout(() => toast.remove(), 300); }, 3000);
    },
    openModal(imageSrc, title) {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-img');
        const modalCta = document.getElementById('modal-cta');
        if (!modal || !modalImg) return;
        modalImg.src = imageSrc;
        const message = encodeURIComponent(`Olá, Janayne! Amei a foto de *${title}* no seu site. Gostaria de agendar!`);
        if(modalCta) modalCta.href = `https://wa.me/5561982412536?text=${message}`;
        modal.classList.remove('hidden');
        setTimeout(() => { modal.classList.remove('opacity-0'); modalImg.classList.remove('scale-95'); modalImg.classList.add('scale-100'); }, 10);
    },
    closeModal() {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-img');
        if (!modal) return;
        modal.classList.add('opacity-0');
        if(modalImg) { modalImg.classList.remove('scale-100'); modalImg.classList.add('scale-95'); }
        setTimeout(() => { modal.classList.add('hidden'); }, 300);
    },
    renderCards(isAdmin = false, filter = 'all') {
        const container = isAdmin ? document.getElementById('admin-cards-list') : document.getElementById('cards-container');
        if (!container) return;
        const cards = Storage.get(Storage.keys.cards);
        container.innerHTML = '';
        const filteredCards = (isAdmin || filter === 'all') ? cards : cards.filter(card => card.category === filter);
        filteredCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = `group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-rose-100 transition-all duration-700 transform hover:-translate-y-1 opacity-0 translate-y-8 ${!isAdmin ? 'cursor-pointer' : ''}`;
            if (!isAdmin) cardElement.onclick = () => this.openModal(card.image, card.title);
            cardElement.innerHTML = `
                <div class="relative overflow-hidden aspect-[4/5] bg-rose-100 animate-pulse img-container">
                    <img src="${card.image}" alt="${card.title}" loading="lazy" class="w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:scale-105" onload="this.classList.remove('opacity-0'); this.parentElement.classList.remove('animate-pulse', 'bg-rose-100');" onerror="this.style.display='none'">
                    <div class="absolute inset-0 bg-gradient-to-t from-rose-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div class="p-6 bg-rose-50 border-t border-rose-100">
                    <h4 class="font-serif text-xl font-medium text-stone-800 mb-2">${card.title}</h4>
                    <p class="text-sm text-stone-500 font-light leading-relaxed">${card.description}</p>
                </div>
                ${isAdmin ? `<div class="px-6 pb-6 pt-0"><button data-id="${card.id}" class="btn-delete w-full py-3 text-xs font-bold uppercase tracking-wider text-rose-500 border border-rose-200 rounded-xl hover:bg-rose-50 active:scale-95 transition-all">Excluir Item</button></div>` : ''}
            `;
            container.appendChild(cardElement);
            if (this.observer) this.observer.observe(cardElement);
        });
    },

    // Aplica o tema (Cores e Imagem de Fundo)
    applyTheme() {
        const settings = Storage.getSettings();
        const root = document.documentElement;

        // Função auxiliar para converter Hex para RGB (para o Tailwind usar opacidade)
        const hexToRgb = (hex) => {
            if (!hex) return null;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `${r} ${g} ${b}`;
        };

        // Cores Padrão
        const defaultPrimary = '#f45d7e'; // Rose 400
        const defaultLight = '#ffeef1';   // Rose 50
        const defaultText = '#292524';    // Stone 800

        const primaryRgb = hexToRgb(settings.primaryColor || defaultPrimary);
        const lightRgb = hexToRgb(settings.lightColor || defaultLight);
        const textRgb = hexToRgb(settings.textColor || defaultText);

        // Define Variáveis CSS
        if (primaryRgb) root.style.setProperty('--color-primary', primaryRgb);
        if (lightRgb) root.style.setProperty('--color-light', lightRgb);
        if (textRgb) root.style.setProperty('--color-text', textRgb);

        // Aplica Imagem de Fundo (Hero e Bio Header)
        if (settings.heroImage) {
            const heroImg = document.getElementById('hero-parallax-img');
            const bioHeaderImg = document.querySelector('header img.absolute'); // Seletor para bio.html
            
            if (heroImg) heroImg.src = settings.heroImage;
            if (bioHeaderImg && window.location.pathname.includes('bio.html')) bioHeaderImg.src = settings.heroImage;
        }
    }
};

// Aplicar tema imediatamente ao carregar qualquer página
document.addEventListener('DOMContentLoaded', () => {
    UI.applyTheme();
});