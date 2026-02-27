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
            settings: 'janayneSettings',
            portfolio: 'janaynePortfolio_v2'
        };
    }

    /**
     * Popula o localStorage com dados iniciais se estiver vazio.
     * As imagens agora são apenas para referência e serão substituídas por Base64.
     */
    init() {
        const defaultPortfolio = [
            { id: 1, image: 'assets/foto1.jpg', category: 'Nail Art', title: 'Nail Art Minimalista', description: 'Design sofisticado com traços finos e geometria delicada.', btnColor: '#fda4af' },
            { id: 2, image: 'assets/foto2.jpg', category: 'Alongamento', title: 'Alongamento em Fibra', description: 'Resistência e naturalidade com acabamento premium.', btnColor: '#fda4af' },
            { id: 3, image: 'assets/foto3.jpg', category: 'Blindagem', title: 'Blindagem Diamante', description: 'Proteção extra para o crescimento saudável das unhas.', btnColor: '#fda4af' },
            { id: 4, image: 'assets/foto4.jpg', category: 'Nail Art', title: 'Francesinha Moderna', description: 'A clássica elegância reinventada com toques contemporâneos.', btnColor: '#fda4af' },
            { id: 5, image: 'assets/foto5.jpg', category: 'Pés', title: 'Spa dos Pés', description: 'Renovação completa, hidratação profunda e relaxamento.', btnColor: '#fda4af' },
            { id: 6, image: 'assets/foto6.jpg', category: 'Esmaltação', title: 'Esmaltação em Gel', description: 'Brilho intenso e durabilidade.', btnColor: '#fda4af' }
        ];

        // Restore default testing data as requested by user
        const currentData = this.get(this.keys.portfolio);
        if (currentData.length === 0 || !currentData[0].image || currentData[0].image === '') {
            this.set(this.keys.portfolio, defaultPortfolio);
        } else if (localStorage.getItem('janayne_force_restore') !== 'done') {
            this.set(this.keys.portfolio, defaultPortfolio);
            localStorage.setItem('janayne_force_restore', 'done');
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

    getSettings() { return this.get(this.keys.settings); }

    getPortfolio() { return this.get(this.keys.portfolio); }

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

    applyTheme() {
        const settings = storageManager.getSettings();
        const root = document.documentElement;

        const hexToRgb = (hex) => {
            if (!hex) return null;
            if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
                const match = hex.match(/\d+/g);
                if (match && match.length >= 3) return `${match[0]} ${match[1]} ${match[2]}`;
            }
            if (hex.length < 4) return null;
            let r = 0, g = 0, b = 0;
            if (hex.length === 4 || hex.length === 5) {
                r = parseInt(hex[1] + hex[1], 16);
                g = parseInt(hex[2] + hex[2], 16);
                b = parseInt(hex[3] + hex[3], 16);
            } else if (hex.length >= 7) {
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
            '--color-btn-global': hexToRgb(settings.globalBtnColor || '#fda4af'),
            '--color-wa-icon': hexToRgb(settings.waIconColor || '#fb7185'),
            '--color-nav-glass': hexToRgb(settings.navGlassColor || '#ffffff'),
            '--color-card-bg': hexToRgb(settings.cardBgColor || '#ffffff'),
            '--color-card-btn': hexToRgb(settings.cardBtnColor || '#fda4af')
        };

        for (const [key, value] of Object.entries(theme)) {
            if (value) root.style.setProperty(key, value);
        }

        // Nome do Salão e WhatsApp
        if (settings.salonName) {
            document.querySelectorAll('.salon-name').forEach(el => el.textContent = settings.salonName);
        }
        if (settings.whatsappLink) {
            // Se o usuário digitou apenas números, formata como link wa.me
            let finalLink = settings.whatsappLink;
            if (!finalLink.startsWith('http')) {
                finalLink = `https://wa.me/${finalLink.replace(/[^0-9]/g, '')}?text=Olá,%20como%20faço%20para%20agendar%20um%20horário%20com%20vocês?`;
            }
            document.querySelectorAll('.whatsapp-link').forEach(el => el.href = finalLink);
        }

        // Imagem de Fundo Hero
        if (settings.heroImage) {
            const heroImg = document.getElementById('hero-parallax-img');
            if (heroImg) heroImg.src = settings.heroImage;
        }
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