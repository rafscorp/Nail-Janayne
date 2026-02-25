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
            heroImageBase64: ''
        },

        init() {
            uiManager.initObserver();
            this.loadCurrentSettings();
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


        }
    };

    // Iniciar Autenticação
    Auth.init();
});