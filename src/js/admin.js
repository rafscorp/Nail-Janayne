/**
 * admin.js - Lógica de admin totalmente refatorada e modernizada.
 */
document.addEventListener('DOMContentLoaded', () => {
    const adminLogin = document.getElementById('admin-login');
    const adminContent = document.getElementById('admin-content');

    // Módulo de Autenticação
    const Auth = {
        targetHash: "fc5669b52ce4e283ad1d5d182de88ff9faec6672bace84ac2ce4c083f54fe2bc",
        
        async sha256(message) {
            if (window.crypto && window.crypto.subtle) {
                const msgBuffer = new TextEncoder().encode(message);
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }
            return message === 'kali' ? this.targetHash : 'senha_invalida';
        },

        checkSession() {
            if (sessionStorage.getItem('adminLogged') === 'true') {
                adminLogin?.classList.add('hidden');
                adminContent?.classList.remove('hidden');
                return true;
            }
            return false;
        },

        async login(password) {
            const inputHash = await this.sha256(password);
            if (inputHash === this.targetHash) {
                sessionStorage.setItem('adminLogged', 'true');
                this.checkSession();
                uiManager.showToast('Bem-vinda de volta!', 'success');
            } else {
                uiManager.showToast('Senha incorreta.', 'error');
                const passwordInput = document.getElementById('admin-password');
                passwordInput?.classList.add('ring-2', 'ring-red-500');
                setTimeout(() => passwordInput?.classList.remove('ring-2', 'ring-red-500'), 500);
            }
        },

        logout() {
            sessionStorage.removeItem('adminLogged');
            window.location.reload();
        },

        init() {
            if (this.checkSession()) {
                AdminApp.init();
            }

            document.getElementById('login-form')?.addEventListener('submit', (e) => {
                e.preventDefault();
                const password = document.getElementById('admin-password').value.trim().toLowerCase();
                this.login(password);
            });

            document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
        }
    };

    // Módulo Principal da Aplicação Admin
    const AdminApp = {
        _localState: {
            heroImageBase64: '',
            itemToDeleteId: null
        },

        init() {
            uiManager.initObserver();
            this.loadCurrentSettings();
            this.renderPortfolioList();
            this.bindEvents();
        },
        
        loadCurrentSettings() {
            const settings = storageManager.getSettings();
            if (settings.heroImage) document.getElementById('hero-preview').src = settings.heroImage;
            if (settings.primaryColor) document.getElementById('color-primary').value = settings.primaryColor;
            if (settings.lightColor) document.getElementById('color-light').value = settings.lightColor;
            if (settings.textColor) document.getElementById('color-text').value = settings.textColor;
            if (settings.salonName) document.getElementById('salon-name').value = settings.salonName;
            if (settings.whatsappLink) document.getElementById('whatsapp-link').value = settings.whatsappLink;
        },

        renderPortfolioList() {
            const listContainer = document.getElementById('admin-cards-list');
            if (!listContainer) return;

            const items = storageManager.getPortfolio();
            
            if (items.length === 0) {
                listContainer.innerHTML = '<p class="text-stone-500 col-span-full text-center py-8">Nenhum trabalho cadastrado.</p>';
                return;
            }

            listContainer.innerHTML = items.map(item => `
                <div class="bg-white rounded-xl shadow-sm border border-rose-100 overflow-hidden group">
                    <div class="h-48 overflow-hidden relative">
                        <img src="${item.image}" class="w-full h-full object-cover transition-transform group-hover:scale-105">
                        <div class="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-rose-500 uppercase tracking-wider shadow-sm">
                            ${item.category}
                        </div>
                    </div>
                    <div class="p-5">
                        <h4 class="font-serif text-lg text-stone-800 mb-1">${item.title}</h4>
                        <p class="text-stone-500 text-xs mb-4 line-clamp-2">${item.description}</p>
                        <button data-delete-id="${item.id}" class="delete-btn w-full py-2 border border-red-200 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                            Excluir
                        </button>
                    </div>
                </div>
            `).join('');
        },

        async handleImageUpload(file, type) {
            const button = document.querySelector('#settings-form button[type="submit"]');
            
            const originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<span class="animate-pulse">Processando...</span>';

            try {
                const base64 = await imageOptimizer.process(file);
                this._localState.heroImageBase64 = base64;
                document.getElementById('hero-preview').src = base64;
                uiManager.showToast('Imagem pronta para salvar.');
            } catch (error) {
                console.error("Erro ao otimizar imagem:", error);
                uiManager.showToast('Falha ao processar imagem.', 'error');
            } finally {
                button.disabled = false;
                button.innerHTML = originalText;
            }
        },

        bindEvents() {
            // Settings Form
            const settingsForm = document.getElementById('settings-form');
            
            document.getElementById('hero-file')?.addEventListener('change', (e) => {
                if (e.target.files[0]) this.handleImageUpload(e.target.files[0], 'hero');
            });

            // Portfolio Form - Preview Imagem
            const imgInput = document.getElementById('img-file');
            imgInput?.addEventListener('change', async (e) => {
                if (e.target.files[0]) {
                    const base64 = await imageOptimizer.process(e.target.files[0]);
                    const preview = document.getElementById('img-preview');
                    preview.src = base64;
                    document.getElementById('img-preview-container').classList.remove('hidden');
                }
            });

            // --- Submit Handlers ---

            settingsForm?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const currentSettings = storageManager.getSettings();
                const settings = {
                    heroImage: this._localState.heroImageBase64 || currentSettings.heroImage,
                    primaryColor: document.getElementById('color-primary').value,
                    lightColor: document.getElementById('color-light').value,
                    textColor: document.getElementById('color-text').value,
                    salonName: document.getElementById('salon-name').value,
                    whatsappLink: document.getElementById('whatsapp-link').value
                };
                storageManager.saveSettings(settings);
                uiManager.applyTheme();
                uiManager.showToast('Aparência atualizada com sucesso!');
                this._localState.heroImageBase64 = '';
            });

            const portfolioForm = document.getElementById('admin-form');
            portfolioForm?.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const file = imgInput.files[0];
                if (!file) {
                    uiManager.showToast('Selecione uma imagem.', 'error');
                    return;
                }

                try {
                    const imageBase64 = await imageOptimizer.process(file);
                    const newItem = {
                        id: Date.now(),
                        image: imageBase64,
                        title: document.getElementById('card-title').value,
                        category: document.getElementById('card-category').value,
                        description: document.getElementById('card-desc').value
                    };

                    const currentPortfolio = storageManager.getPortfolio();
                    currentPortfolio.unshift(newItem);
                    storageManager.set(storageManager.keys.portfolio, currentPortfolio);

                    uiManager.showToast('Trabalho adicionado!');
                    portfolioForm.reset();
                    document.getElementById('img-preview-container').classList.add('hidden');
                    this.renderPortfolioList();
                } catch (err) {
                    console.error(err);
                    uiManager.showToast('Erro ao salvar card.', 'error');
                }
            });

            // --- Delete Logic (Event Delegation) ---
            const listContainer = document.getElementById('admin-cards-list');
            const deleteModal = document.getElementById('delete-modal');

            listContainer?.addEventListener('click', (e) => {
                if (e.target.closest('.delete-btn')) {
                    const btn = e.target.closest('.delete-btn');
                    this._localState.itemToDeleteId = parseInt(btn.dataset.deleteId);
                    deleteModal.classList.remove('hidden');
                }
            });

            document.getElementById('cancel-delete-btn')?.addEventListener('click', () => {
                deleteModal.classList.add('hidden');
                this._localState.itemToDeleteId = null;
            });

            document.getElementById('confirm-delete-btn')?.addEventListener('click', () => {
                if (this._localState.itemToDeleteId) {
                    const currentItems = storageManager.getPortfolio();
                    const newItems = currentItems.filter(item => item.id !== this._localState.itemToDeleteId);
                    storageManager.set(storageManager.keys.portfolio, newItems);
                    
                    this.renderPortfolioList();
                    uiManager.showToast('Item removido.');
                    deleteModal.classList.add('hidden');
                    this._localState.itemToDeleteId = null;
                }
            });
        }
    };
    
    // Iniciar Autenticação
    Auth.init();
});