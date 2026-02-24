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
            cardImageBase64: '',
            heroImageBase64: ''
        },

        init() {
            uiManager.initObserver();
            this.loadExistingCards();
            this.loadCurrentSettings();
            this.bindEvents();
        },
        
        loadExistingCards() {
            const container = document.getElementById('admin-cards-list');
            const cards = storageManager.getCards();
            uiManager.renderCards(container, cards, true);
        },

        loadCurrentSettings() {
            const settings = storageManager.getSettings();
            if (settings.heroImage) document.getElementById('hero-preview').src = settings.heroImage;
            if (settings.primaryColor) document.getElementById('color-primary').value = settings.primaryColor;
            if (settings.lightColor) document.getElementById('color-light').value = settings.lightColor;
            if (settings.textColor) document.getElementById('color-text').value = settings.textColor;
        },

        async handleImageUpload(file, type) {
            const button = type === 'card' 
                ? document.querySelector('#admin-form button[type="submit"]')
                : document.querySelector('#settings-form button[type="submit"]');
            
            const originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<span class="animate-pulse">Processando...</span>';

            try {
                const base64 = await imageOptimizer.process(file);
                if (type === 'card') {
                    this._localState.cardImageBase64 = base64;
                    document.getElementById('img-preview').src = base64;
                    document.getElementById('img-preview-container').classList.remove('hidden');
                } else {
                    this._localState.heroImageBase64 = base64;
                    document.getElementById('hero-preview').src = base64;
                }
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
            // Card Form
            const adminForm = document.getElementById('admin-form');
            document.getElementById('img-file')?.addEventListener('change', (e) => {
                if (e.target.files[0]) this.handleImageUpload(e.target.files[0], 'card');
            });
            
            adminForm?.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!this._localState.cardImageBase64) {
                    uiManager.showToast('Por favor, selecione e aguarde o processamento da imagem.', 'error');
                    return;
                }
                const newCard = {
                    id: Date.now(),
                    image: this._localState.cardImageBase64,
                    title: document.getElementById('card-title').value,
                    description: document.getElementById('card-desc').value,
                    category: document.getElementById('card-category').value
                };
                storageManager.addCard(newCard);
                uiManager.showToast('Trabalho adicionado com sucesso!');
                adminForm.reset();
                document.getElementById('img-preview-container').classList.add('hidden');
                this._localState.cardImageBase64 = '';
                this.loadExistingCards();
            });

            // Settings Form
            const settingsForm = document.getElementById('settings-form');
            document.getElementById('hero-file')?.addEventListener('change', (e) => {
                if (e.target.files[0]) this.handleImageUpload(e.target.files[0], 'hero');
            });

            settingsForm?.addEventListener('submit', (e) => {
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

            // Delete Logic
            let deleteTargetId = null;
            const deleteModal = document.getElementById('delete-modal');
            document.getElementById('admin-cards-list')?.addEventListener('click', (e) => {
                const button = e.target.closest('.btn-delete');
                if (button) {
                    deleteTargetId = parseInt(button.getAttribute('data-id'));
                    deleteModal?.classList.remove('hidden');
                }
            });
            document.getElementById('cancel-delete-btn')?.addEventListener('click', () => deleteModal?.classList.add('hidden'));
            document.getElementById('confirm-delete-btn')?.addEventListener('click', () => {
                if (deleteTargetId) {
                    storageManager.removeCard(deleteTargetId);
                    this.loadExistingCards();
                    deleteModal?.classList.add('hidden');
                    uiManager.showToast('Item removido com sucesso!');
                }
            });
        }
    };
    
    // Iniciar Autenticação
    Auth.init();
});