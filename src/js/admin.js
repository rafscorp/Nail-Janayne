/**
 * admin.js - Lógica de admin totalmente refatorada e modernizada.
 */
document.addEventListener('DOMContentLoaded', () => {
    const adminLogin = document.getElementById('admin-login');
    const adminContent = document.getElementById('admin-content');

    // Estado global de alterações não salvas
    window.DirtyState = {
        main: false,
        activeModal: null // 'portfolio' ou 'color'
    };

    // Função geradora de modal de intercepção aninhados (Nested Overlays)
    const createPromptOverlay = (prefix, onDiscard, onSave) => {
        const overlay = document.getElementById(`${prefix}-unsaved-overlay`);
        const box = document.getElementById(`${prefix}-unsaved-box`);
        const discardBtn = document.getElementById(`${prefix}-unsaved-discard-btn`);
        const saveBtn = document.getElementById(`${prefix}-unsaved-save-btn`);

        if (!overlay || !box || !discardBtn || !saveBtn) return;

        // Remover Listeners antigos (clonando)
        const newDiscard = discardBtn.cloneNode(true);
        discardBtn.parentNode.replaceChild(newDiscard, discardBtn);
        const newSave = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSave, saveBtn);

        const hideOverlay = () => {
            overlay.classList.add('opacity-0');
            box.classList.add('scale-95');
            setTimeout(() => overlay.classList.add('hidden'), 300);
        };

        overlay.classList.remove('hidden');
        void overlay.offsetWidth;
        overlay.classList.remove('opacity-0');
        box.classList.remove('scale-95');

        newDiscard.addEventListener('click', () => {
            hideOverlay();
            window.DirtyState.activeModal = null;
            if (onDiscard) onDiscard();
        });

        newSave.addEventListener('click', () => {
            hideOverlay();
            if (onSave) onSave();
        });
    };

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

    const colorHistory = {
        get() {
            try {
                return JSON.parse(localStorage.getItem('janayneColorHistory')) || [
                    '#f45d7e', '#fda4af', '#fb7185', '#e11d48', '#fbcfe8',
                    '#38bdf8', '#34d399', '#fbbf24', '#a78bfa', '#a8a29e',
                    '#292524', '#ffffff', '#000000'
                ];
            } catch (e) { return []; }
        },
        add(colorHex) {
            let history = this.get();
            if (!history.includes(colorHex)) {
                history.unshift(colorHex);
                if (history.length > 16) history.pop(); // Keep last 16 colors
                localStorage.setItem('janayneColorHistory', JSON.stringify(history));
                return true;
            }
            return false;
        }
    };

    const ColorPickerManager = {
        _activeId: null,
        _hsv: { h: 0, s: 100, v: 50, a: 1 }, // Internal state
        _isDraggingWheel: false,
        _isDraggingLightness: false,
        _isDraggingOpacity: false,

        init() {
            this.modal = document.getElementById('custom-color-picker-modal');
            this.box = document.getElementById('custom-color-picker-box');
            this.applyBtn = document.getElementById('apply-color-btn');
            this.closeBtn = document.getElementById('close-color-picker-btn');
            this.historyGrid = document.getElementById('color-history-grid');

            this.wheelContainer = document.getElementById('color-wheel-container');
            this.wheelCursor = document.getElementById('color-cursor');

            this.lightnessSlider = document.getElementById('lightness-slider');
            this.lightnessBg = document.getElementById('lightness-bg');
            this.lightnessThumb = document.getElementById('lightness-thumb');
            this.lightnessVal = document.getElementById('lightness-val');

            this.opacitySlider = document.getElementById('opacity-slider');
            this.opacityBg = document.getElementById('opacity-bg');
            this.opacityThumb = document.getElementById('opacity-thumb');
            this.opacityVal = document.getElementById('opacity-val');

            this.colorPreview = document.getElementById('selected-color-preview');
            this.hexInput = document.getElementById('hex-color-input'); // Hidden but kept for logic

            this.bindEvents();
        },

        bindEvents() {
            // Modal actions
            this.closeBtn.addEventListener('click', () => this.close());
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.close();
            });

            this.applyBtn.addEventListener('click', () => {
                const hex = this.getHex();
                if (this._activeId) {
                    AdminApp.setPaletteActive(this._activeId, hex);
                    colorHistory.add(hex);
                }
                window.DirtyState.activeModal = null;
                this.close();
            });

            // Hex input listener
            this.hexInput.addEventListener('change', (e) => {
                let val = e.target.value.replace(/^#/, '');
                if (val.length === 3 || val.length === 4) {
                    val = val.split('').map(c => c + c).join('');
                }
                e.target.value = val;
                if (val.length === 6 || val.length === 8) {
                    this.hexToHsv('#' + val);
                    this.updateUI();
                }
            });

            // Wheel Interactions
            this.wheelContainer.addEventListener('mousedown', (e) => {
                this._isDraggingWheel = true;
                window.DirtyState.activeModal = 'color';
                this.handleWheelMove(e);
            });
            window.addEventListener('mousemove', (e) => {
                if (this._isDraggingWheel) this.handleWheelMove(e);
                if (this._isDraggingLightness) this.handleLightnessMove(e);
                if (this._isDraggingOpacity) this.handleOpacityMove(e);
            });
            window.addEventListener('mouseup', () => {
                this._isDraggingWheel = false;
                this._isDraggingLightness = false;
                this._isDraggingOpacity = false;
            });

            // Lightness
            this.lightnessSlider.addEventListener('mousedown', (e) => {
                this._isDraggingLightness = true;
                window.DirtyState.activeModal = 'color';
                this.handleLightnessMove(e);
            });
            this.lightnessSlider.addEventListener('input', (e) => this.handleLightnessMove(e, true));

            // Opacity
            this.opacitySlider.addEventListener('mousedown', (e) => {
                this._isDraggingOpacity = true;
                window.DirtyState.activeModal = 'color';
                this.handleOpacityMove(e);
            });
            this.opacitySlider.addEventListener('input', (e) => this.handleOpacityMove(e, true));
        },

        handleWheelMove(e) {
            const rect = this.wheelContainer.getBoundingClientRect();
            // Calculate center
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Distance from center
            let dx = e.clientX - centerX;
            let dy = e.clientY - centerY;

            // Angle in degrees (Hue) -> 0 is top (red in our conic gradient)
            let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
            if (angle < 0) angle += 360;

            // Radius (Saturation)
            let radius = Math.sqrt(dx * dx + dy * dy);
            const maxRadius = (rect.width / 2) - 10; // Keep cursor strictly inside the wheel

            if (radius > maxRadius) {
                // Clamp to edge
                const ratio = maxRadius / radius;
                dx *= ratio;
                dy *= ratio;
                radius = maxRadius;
            }

            this._hsv.h = angle;
            this._hsv.s = (radius / maxRadius) * 100;

            this.updateUI();
        },

        handleLightnessMove(e, isInputEvent = false) {
            let val;
            if (isInputEvent) {
                val = parseFloat(this.lightnessSlider.value);
            } else {
                const rect = this.lightnessSlider.getBoundingClientRect();
                let x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                val = (x / rect.width) * 100;
                this.lightnessSlider.value = val;
            }
            this._hsv.v = val;
            this.updateUI();
        },

        handleOpacityMove(e, isInputEvent = false) {
            let val;
            if (isInputEvent) {
                val = parseFloat(this.opacitySlider.value);
            } else {
                const rect = this.opacitySlider.getBoundingClientRect();
                let x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                val = (x / rect.width) * 100;
                this.opacitySlider.value = val;
            }
            this._hsv.a = val / 100;
            this.updateUI();
        },

        // --- Color Math Helpers ---
        // Convert HSV Wheel + Lightness Factor to final RGB
        getStateRgb() {
            // 1. Get Base Wheel Color (H from h, S from s, V is flat 100)
            let h = this._hsv.h;
            let s = this._hsv.s / 100;
            let v = 1; // max bright
            let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);

            let wheelR = f(5), wheelG = f(3), wheelB = f(1);

            // 2. Apply Lightness Slider (_hsv.v acting as 0-100 L multiplier)
            let l = this._hsv.v / 100;
            let r, g, b;

            if (l <= 0.5) {
                // Darken: 0% is Black, 50% is Wheel Color
                let ratio = l / 0.5;
                r = wheelR * ratio;
                g = wheelG * ratio;
                b = wheelB * ratio;
            } else {
                // Lighten: 50% is Wheel Color, 100% is White
                let ratio = (l - 0.5) / 0.5;
                r = wheelR + (1 - wheelR) * ratio;
                g = wheelG + (1 - wheelG) * ratio;
                b = wheelB + (1 - wheelB) * ratio;
            }

            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255)
            };
        },

        // Parse hex to internal state mapping (always centers sliders at 50% for base color equivalent)
        hexToHsv(hex) {
            hex = hex.replace('#', '');
            let r = 0, g = 0, b = 0, a = 1;

            if (hex.length === 3) {
                r = parseInt(hex[0] + hex[0], 16);
                g = parseInt(hex[1] + hex[1], 16);
                b = parseInt(hex[2] + hex[2], 16);
            } else if (hex.length >= 6) {
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
                if (hex.length === 8) {
                    a = parseInt(hex.substring(6, 8), 16) / 255;
                }
            }

            r /= 255; g /= 255; b /= 255;
            let max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s;
            let d = max - min;
            s = max === 0 ? 0 : d / max;

            if (max === min) {
                h = 0; // achromatic
            } else {
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            // Map incoming HEX specifically to Wheel coordinates + sliders strictly at 50%
            this._hsv = {
                h: h * 360,
                s: s * 100,
                v: 50, // User ALWAYS wants the lightness slider exactly at 50% upon load
                a: 1 // User ALWAYS wants the opacity slider exactly at 100% upon load
            };
        },

        getHex() {
            const rgb = this.getStateRgb();
            let hex = '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1).toUpperCase();
            if (this._hsv.a < 1) {
                let alpha = Math.round(this._hsv.a * 255).toString(16).toUpperCase();
                if (alpha.length === 1) alpha = '0' + alpha;
                hex += alpha;
            }
            return hex;
        },

        // Syncs all DOM elements with the current state (Wheel=H/S, Lightness=V, Opacity=A)
        updateUI() {
            // 1. Update text inputs
            const hex = this.getHex();
            if (this.hexInput) this.hexInput.value = hex.substring(1);

            // 2. Base wheel color (unaffected by Lightness slider)
            let wH = this._hsv.h, wS = this._hsv.s / 100, wV = 1;
            let f = (n, k = (n + wH / 60) % 6) => wV - wV * wS * Math.max(Math.min(k, 4 - k, 1), 0);
            const wheelRGB = { r: Math.round(f(5) * 255), g: Math.round(f(3) * 255), b: Math.round(f(1) * 255) };
            const wheelHex = '#' + ((1 << 24) + (wheelRGB.r << 16) + (wheelRGB.g << 8) + wheelRGB.b).toString(16).slice(1);

            // Current final RGB without opacity
            const currentRgb = this.getStateRgb();
            const currentColorHex = '#' + ((1 << 24) + (currentRgb.r << 16) + (currentRgb.g << 8) + currentRgb.b).toString(16).slice(1);

            // 3. Update Wheel Cursor Position (Angle and Radius)
            const angleRad = (this._hsv.h - 90) * (Math.PI / 180);
            const radiusPercent = wS;

            // Map 0-1 radius to 0-50% positional offset from center
            const xOffset = Math.cos(angleRad) * radiusPercent * 50;
            const yOffset = Math.sin(angleRad) * radiusPercent * 50;

            this.wheelCursor.style.left = `calc(50% + ${xOffset}%)`;
            this.wheelCursor.style.top = `calc(50% + ${yOffset}%)`;
            this.wheelCursor.style.backgroundColor = wheelHex; // Cursor shows pure wheel color

            // 4. Update Lightness Slider
            this.lightnessBg.style.background = `linear-gradient(to right, black, ${wheelHex}, white)`;
            this.lightnessThumb.style.left = `${this._hsv.v}%`;
            this.lightnessSlider.value = this._hsv.v;
            this.lightnessVal.textContent = Math.round(this._hsv.v) + '%';
            this.lightnessThumb.style.backgroundColor = currentColorHex;

            // 5. Update Opacity Slider
            this.opacityBg.style.background = `linear-gradient(to right, transparent, ${currentColorHex})`;
            this.opacityThumb.style.left = `${this._hsv.a * 100}%`;
            this.opacitySlider.value = this._hsv.a * 100;
            this.opacityVal.textContent = Math.round(this._hsv.a * 100) + '%';
            this.opacityThumb.style.backgroundColor = hex;

            // 6. Preview Square
            if (this.colorPreview) this.colorPreview.style.backgroundColor = hex;
        },

        renderHistory() {
            const colors = colorHistory.get();
            this.historyGrid.innerHTML = colors.map(hex => `
                <button type="button" 
                    class="w-10 h-10 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)] hover:scale-110 transition-transform bg-white bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc_100%),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc_100%)] bg-[length:6px_6px] bg-[position:0_0,3px_3px] overflow-hidden" 
                    onclick="ColorPickerManager.selectHistoryColor('${hex}')"
                >
                    <div class="w-full h-full" style="background-color: ${hex}"></div>
                </button>
            `).join('');
        },

        selectHistoryColor(hex) {
            this.hexToHsv(hex);
            this.updateUI();
        },

        open(id, currentColor) {
            this._activeId = id;
            this.hexToHsv(currentColor || '#000000');

            this.renderHistory();
            this.updateUI();

            this.modal.classList.remove('hidden');
            void this.modal.offsetWidth;
            this.modal.classList.remove('opacity-0');
            this.box.classList.remove('scale-95');
        },

        close() {
            if (window.DirtyState.activeModal === 'color') {
                createPromptOverlay('color',
                    () => {
                        this.modal.classList.add('opacity-0');
                        this.box.classList.add('scale-95');
                        setTimeout(() => {
                            this.modal.classList.add('hidden');
                            this._activeId = null;
                        }, 300);
                    },
                    () => { this.applyBtn.click(); }
                );
                return;
            }
            this.modal.classList.add('opacity-0');
            this.box.classList.add('scale-95');
            setTimeout(() => {
                this.modal.classList.add('hidden');
                this._activeId = null;
            }, 300);
        }
    };

    // Attach to global scope for onclick handlers
    window.ColorPickerManager = ColorPickerManager;

    /**
     * Lógica do Painel de Administração
     */
    const AdminApp = {
        _localState: {
            heroImageBase64: ''
        },

        init() {
            uiManager.initObserver();
            ColorPickerManager.init();
            this.initColorPalettes();
            this.loadCurrentSettings();
            this.bindEvents();
        },

        initColorPalettes() {
            document.querySelectorAll('.color-picker-btn').forEach(btn => {
                const id = btn.dataset.id;

                btn.addEventListener('click', () => {
                    const input = document.getElementById(id);
                    const currentColor = input ? input.value : (btn.dataset.default || '#000000');
                    ColorPickerManager.open(id, currentColor);
                });
            });
        },

        setPaletteActive(id, hexVal) {
            const input = document.getElementById(id);
            if (input && hexVal) {
                input.value = hexVal;
                window.DirtyState.main = true;

                // Sync UI overlay
                const btn = document.querySelector(`.color-picker-btn[data-id="${id}"]`);
                if (btn) {
                    const bgOverlay = btn.querySelector('.color-bg-overlay');
                    if (bgOverlay) bgOverlay.style.backgroundColor = hexVal;
                }
            }
        },

        resetColor(id) {
            const btn = document.querySelector(`.color-picker-btn[data-id="${id}"]`);
            if (btn) {
                const defaultColor = btn.dataset.default;
                this.setPaletteActive(id, defaultColor);
                uiManager.showToast('Cor restaurada para o padrão.', 'success');
            }
        },

        loadCurrentSettings() {
            const settings = storageManager.getSettings();
            document.getElementById('hero-preview').src = settings.heroImage || 'assets/foto1.jpg';

            if (settings.primaryColor) this.setPaletteActive('color-primary', settings.primaryColor);
            if (settings.globalBtnColor) this.setPaletteActive('color-global-btn', settings.globalBtnColor);
            if (settings.waIconColor) this.setPaletteActive('color-wa-icon', settings.waIconColor);

            if (settings.navGlassColor) this.setPaletteActive('color-nav-glass', settings.navGlassColor);
            if (settings.cardBgColor) this.setPaletteActive('color-card-bg', settings.cardBgColor);
            if (settings.cardBtnColor) this.setPaletteActive('color-card-btn', settings.cardBtnColor);
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
            // Settings Form Tracking Rigoroso (Anti-Data Loss)
            const settingsForm = document.getElementById('settings-form');
            const inputs = settingsForm?.querySelectorAll('input, textarea, select');

            // Ativa o estado de sujeira global instantaneamente ao digitar ou mudar qualquer estado
            const markDirty = () => window.DirtyState.main = true;
            inputs?.forEach(inp => {
                inp.addEventListener('input', markDirty);
                inp.addEventListener('change', markDirty);
            });

            document.getElementById('hero-file')?.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    this.handleImageUpload(e.target.files[0], 'hero');
                    markDirty();
                }
            });

            document.getElementById('return-btn')?.addEventListener('click', (e) => {
                if (window.DirtyState.main) {
                    e.preventDefault();
                    createPromptOverlay('global',
                        () => {
                            // On Discard: Force exit to index
                            window.location.href = 'index.html';
                        },
                        () => {
                            // On Save/Stay: Scroll to the section and animate the button
                            const saveSection = document.getElementById('finalizar-edicoes-section');
                            const saveBtn = document.getElementById('save-settings-btn');
                            if (saveSection && saveBtn) {
                                saveSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

                                saveBtn.classList.remove('transition-all', 'duration-300');
                                const ringClasses = ['animate-bounce', 'ring-4', 'ring-rose-400', 'shadow-[0_0_20px_rgba(244,63,94,0.6)]'];
                                saveBtn.classList.add(...ringClasses);

                                setTimeout(() => {
                                    saveBtn.classList.remove(...ringClasses);
                                    saveBtn.classList.add('transition-all', 'duration-300');
                                }, 2500);
                            }
                        }
                    );
                }
            });

            settingsForm?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const currentSettings = storageManager.getSettings();
                const settings = {
                    heroImage: this._localState.heroImageBase64 || currentSettings.heroImage,
                    primaryColor: document.getElementById('color-primary').value,
                    globalBtnColor: document.getElementById('color-global-btn').value,
                    waIconColor: document.getElementById('color-wa-icon').value,
                    navGlassColor: document.getElementById('color-nav-glass').value,
                    cardBgColor: document.getElementById('color-card-bg').value,
                    cardBtnColor: document.getElementById('color-card-btn').value,
                    salonName: document.getElementById('salon-name').value,
                    whatsappLink: document.getElementById('whatsapp-link').value
                };
                storageManager.saveSettings(settings);
                window.DirtyState.main = false;
                uiManager.applyTheme();
                uiManager.showToast('Aparência atualizada com sucesso!');
                this._localState.heroImageBase64 = '';
            });

            // IntersectionObserver: Anima o botão Salvar se estiver 'Sujo' ao entrar na tela
            const saveSection = document.getElementById('finalizar-edicoes-section');
            const saveBtn = document.getElementById('save-settings-btn');

            if (saveSection && saveBtn) {
                let bounceTimeout;
                const ringClasses = ['animate-bounce', 'ring-4', 'ring-rose-400', 'shadow-[0_0_20px_rgba(244,63,94,0.6)]'];

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            if (window.DirtyState.main) {
                                // Remove transitions para evitar conflito com os keyframes do animate-bounce
                                saveBtn.classList.remove('transition-all', 'duration-300');
                                saveBtn.classList.add(...ringClasses);

                                clearTimeout(bounceTimeout);
                                bounceTimeout = setTimeout(() => {
                                    saveBtn.classList.remove(...ringClasses);
                                    saveBtn.classList.add('transition-all', 'duration-300');
                                }, 2500);
                            }
                        } else {
                            // Sair do viewport: Aborta e limpa a animação na mesma hora para resetar o gatilho
                            clearTimeout(bounceTimeout);
                            saveBtn.classList.remove(...ringClasses);
                            saveBtn.classList.add('transition-all', 'duration-300');
                        }
                    });
                }, { threshold: 0.1 }); // Dispara quando 10% da seção estiver visível

                observer.observe(saveSection);
            }

            // Portfolio Manager Initialization
            PortfolioManager.init();
        }
    };

    // --- Módulo de Gerenciamento de Portfólio ---
    const PortfolioManager = {
        _localState: {
            currentImageBase64: '',
            editingId: null
        },

        init() {
            this.updateFilterOptions();
            this.renderTable();
            this.bindEvents();
        },

        updateCategoryDropdown(selectedValue = '') {
            const hiddenInput = document.getElementById('card-category');
            const dropContainer = document.getElementById('custom-category-dropdown');
            const textEl = document.getElementById('custom-category-text');
            if (!hiddenInput || !dropContainer) return;

            const data = storageManager.getPortfolio();
            const categories = [...new Set(data.map(i => i.category))];

            dropContainer.innerHTML = '';

            const createOption = (val, label, isSpecial = false) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                if (isSpecial) {
                    btn.className = 'w-full text-left px-5 py-4 text-sm font-sans font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100/80 transition-colors border-t border-rose-100';
                } else {
                    btn.className = 'w-full text-left px-5 py-3 text-sm font-sans font-semibold text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors';
                }
                btn.textContent = label;
                btn.dataset.value = val;

                btn.onclick = (e) => {
                    e.stopPropagation();
                    hiddenInput.value = val;
                    textEl.textContent = label;
                    this.handleCategoryChange(val);
                    this.closeCategoryDropdown();
                    window.DirtyState.activeModal = 'portfolio';
                };
                return btn;
            };

            categories.forEach(c => dropContainer.appendChild(createOption(c, c)));
            dropContainer.appendChild(createOption('___new___', '+ Nova Categoria...', true));

            if (selectedValue && categories.includes(selectedValue)) {
                hiddenInput.value = selectedValue;
                textEl.textContent = selectedValue;
            } else if (selectedValue) {
                hiddenInput.value = '___new___';
                textEl.textContent = '+ Nova Categoria...';
            } else {
                hiddenInput.value = '';
                textEl.textContent = 'Selecione uma categoria...';
            }
            this.handleCategoryChange(hiddenInput.value, selectedValue);
        },

        handleCategoryChange(internalValue, rawValue = '') {
            const newInp = document.getElementById('card-category-new');
            const wrapper = document.getElementById('new-category-wrapper');

            if (internalValue === '___new___') {
                if (rawValue && rawValue !== '___new___') {
                    newInp.value = rawValue;
                }
                if (wrapper) {
                    wrapper.classList.remove('max-h-0', 'opacity-0', '-translate-y-2');
                    wrapper.classList.add('max-h-40', 'opacity-100', 'translate-y-0');
                }
                newInp.required = true;
                if (!rawValue || rawValue === '___new___') newInp.focus();
            } else {
                if (wrapper) {
                    wrapper.classList.remove('max-h-40', 'opacity-100', 'translate-y-0');
                    wrapper.classList.add('max-h-0', 'opacity-0', '-translate-y-2');
                }
                newInp.required = false;
                if (!internalValue) newInp.value = '';
            }
        },

        toggleCategoryDropdown() {
            const drop = document.getElementById('custom-category-dropdown');
            const arrow = document.getElementById('custom-category-arrow');
            if (drop.classList.contains('opacity-0')) {
                drop.classList.remove('invisible', 'opacity-0', '-translate-y-2');
                arrow.classList.add('rotate-180');
            } else {
                this.closeCategoryDropdown();
            }
        },

        closeCategoryDropdown() {
            const drop = document.getElementById('custom-category-dropdown');
            const arrow = document.getElementById('custom-category-arrow');
            if (drop) drop.classList.add('invisible', 'opacity-0', '-translate-y-2');
            if (arrow) arrow.classList.remove('rotate-180');
        },

        updateFilterOptions() {
            const input = document.getElementById('portfolio-search');
            const dropContainer = document.getElementById('custom-filter-dropdown');
            const textEl = document.getElementById('custom-filter-text');
            if (!input || !dropContainer) return;

            const data = storageManager.getPortfolio();
            const categories = [...new Set(data.map(i => i.category))];
            const current = input.value;

            // Limpa opções antigas (mantendo o template se houver)
            dropContainer.innerHTML = '';

            const createOption = (val, label) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-rose-50 hover:text-rose-600 transition-colors';
                btn.textContent = label;
                btn.dataset.value = val;

                btn.onclick = (e) => {
                    e.stopPropagation();
                    input.value = val;
                    textEl.textContent = label;
                    this.renderTable(val);
                    this.closeFilterDropdown();
                };
                return btn;
            };

            dropContainer.appendChild(createOption('', 'Todas as categorias'));
            categories.forEach(c => dropContainer.appendChild(createOption(c, c)));

            if (categories.includes(current)) {
                input.value = current;
                textEl.textContent = current;
            } else {
                input.value = '';
                textEl.textContent = 'Todas as categorias';
            }
        },

        toggleFilterDropdown() {
            const drop = document.getElementById('custom-filter-dropdown');
            const arrow = document.getElementById('custom-filter-arrow');
            if (drop.classList.contains('opacity-0')) {
                drop.classList.remove('invisible', 'opacity-0', '-translate-y-2');
                if (arrow) arrow.classList.add('rotate-180');
            } else {
                this.closeFilterDropdown();
            }
        },

        closeFilterDropdown() {
            const drop = document.getElementById('custom-filter-dropdown');
            const arrow = document.getElementById('custom-filter-arrow');
            if (drop) {
                drop.classList.add('opacity-0', '-translate-y-2');
                setTimeout(() => drop.classList.add('invisible'), 200);
            }
            if (arrow) arrow.classList.remove('rotate-180');
        },

        renderTable(searchCategory = '') {
            const tbody = document.getElementById('portfolio-table-body');
            let data = storageManager.getPortfolio();

            if (searchCategory) {
                data = data.filter(i => i.category === searchCategory);
            }

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-stone-400">Nenhum cartão no portfólio.</td></tr>`;
                return;
            }

            tbody.innerHTML = data.map(item => `
                <tr class="border-b border-rose-50 hover:bg-rose-50/50 transition-colors">
                    <td class="py-3 pr-4">
                        <img src="${item.image || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" class="w-20 h-20 xl:w-40 xl:h-40 aspect-square rounded-full overflow-hidden object-cover border-2 border-rose-200 shadow-sm transition-all duration-300" alt="Thumb">
                    </td>
                    <td class="py-3 px-4 font-medium xl:text-lg transition-all duration-300">${item.title}</td>
                    <td class="py-3 px-4 xl:text-lg transition-all duration-300">${item.category}</td>
                    <td class="py-3 pl-4">
                        <div class="flex flex-col md:flex-row justify-end items-end md:items-center gap-2 md:gap-3 w-full">
                            <button onclick="window.PortfolioManager.editCard(${item.id})" class="px-5 py-2.5 text-sm xl:text-base font-bold uppercase tracking-wide text-stone-600 bg-stone-100/80 hover:bg-stone-200 border border-stone-200 rounded-xl transition-all shadow hover:shadow-md hover:-translate-y-0.5 active:scale-95 w-full md:w-auto">Editar</button>
                            <button onclick="window.PortfolioManager.deleteCard(${item.id})" class="px-5 py-2.5 text-sm xl:text-base font-bold uppercase tracking-wide text-white bg-rose-400 hover:bg-rose-500 rounded-xl shadow hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer active:scale-95 w-full md:w-auto">Excluir</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        },

        openModal(item = null) {
            const modal = document.getElementById('portfolio-modal');
            const titleEl = document.getElementById('portfolio-modal-title');
            const previewEl = document.getElementById('card-image-preview');

            this._localState.currentImageBase64 = '';

            if (item) {
                titleEl.textContent = 'Editar Cartão';
                this._localState.editingId = item.id;
                document.getElementById('card-title').value = item.title;
                document.getElementById('card-desc').value = item.description;
                this.updateCategoryDropdown(item.category);
                document.getElementById('card-image').value = item.image || '';
                previewEl.src = item.image || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
            } else {
                titleEl.textContent = 'Novo Cartão';
                this._localState.editingId = null;
                document.getElementById('portfolio-form').reset();
                this.updateCategoryDropdown('');
                previewEl.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
            }

            modal.classList.remove('hidden');
        },

        closeModal() {
            if (window.DirtyState.activeModal === 'portfolio') {
                createPromptOverlay('portfolio',
                    () => {
                        document.getElementById('portfolio-modal').classList.add('hidden');
                    },
                    () => {
                        document.querySelector('#portfolio-form button[type="submit"]').click();
                    }
                );
                return;
            }
            document.getElementById('portfolio-modal').classList.add('hidden');
        },

        editCard(id) {
            const items = storageManager.getPortfolio();
            const item = items.find(i => i.id === id);
            if (item) this.openModal(item);
        },

        deleteCard(id) {
            const modal = document.getElementById('custom-confirm-modal');
            const box = document.getElementById('custom-confirm-box');

            const btnConfirm = document.getElementById('custom-confirm-ok');
            const btnCancel = document.getElementById('custom-confirm-cancel');

            // Clone to remove old listeners
            const newBtnConfirm = btnConfirm.cloneNode(true);
            btnConfirm.parentNode.replaceChild(newBtnConfirm, btnConfirm);
            const newBtnCancel = btnCancel.cloneNode(true);
            btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);

            const hideModal = () => {
                modal.classList.add('opacity-0');
                box.classList.add('scale-95');
                setTimeout(() => modal.classList.add('hidden'), 300);
            };

            modal.classList.remove('hidden');
            // Force reflow
            void modal.offsetWidth;
            modal.classList.remove('opacity-0');
            box.classList.remove('scale-95');

            newBtnCancel.addEventListener('click', hideModal);

            newBtnConfirm.addEventListener('click', () => {
                hideModal();
                let items = storageManager.getPortfolio();
                items = items.filter(i => i.id !== id);
                storageManager.set(storageManager.keys.portfolio, items);
                this.updateFilterOptions();
                this.renderTable(document.getElementById('portfolio-search')?.value || '');
                uiManager.showToast('Cartão excluído.', 'success');
            });
        },

        async saveCard(e) {
            e.preventDefault();
            const submitBtn = document.querySelector('#portfolio-form button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Salvando...';

            const items = storageManager.getPortfolio();
            const title = document.getElementById('card-title').value;
            const desc = document.getElementById('card-desc').value;
            let category = document.getElementById('card-category').value;
            if (category === '___new___') {
                category = document.getElementById('card-category-new').value.trim();
            }

            // Determina a imagem final (base64 via upload ou URL manual)
            let finalImage = this._localState.currentImageBase64 || document.getElementById('card-image').value;
            if (!finalImage && this._localState.editingId) {
                // Mantém a antiga se não editou
                finalImage = items.find(i => i.id === this._localState.editingId).image;
            } else if (!finalImage) {
                finalImage = './assets/foto1.jpg'; // fallback fallback
            }

            const newItem = {
                id: this._localState.editingId || Date.now(),
                title,
                description: desc,
                category,
                image: finalImage
            };

            if (this._localState.editingId) {
                const index = items.findIndex(i => i.id === this._localState.editingId);
                if (index > -1) items[index] = newItem;
            } else {
                items.unshift(newItem); // Coloca no topo
            }

            storageManager.set(storageManager.keys.portfolio, items);
            this.updateFilterOptions();
            this.renderTable(document.getElementById('portfolio-search')?.value || '');
            window.DirtyState.activeModal = null;
            this.closeModal();
            uiManager.showToast('Cartão salvo com sucesso!');

            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Salvar Cartão';
        },

        bindEvents() {
            document.getElementById('custom-filter-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeCategoryDropdown(); // always close the other
                this.toggleFilterDropdown();
            });

            document.getElementById('custom-category-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeFilterDropdown(); // always close the other
                this.toggleCategoryDropdown();
            });

            document.addEventListener('click', (e) => {
                const filterDrop = document.getElementById('custom-filter-dropdown');
                const filterBtn = document.getElementById('custom-filter-btn');
                if (filterDrop && !filterDrop.classList.contains('opacity-0') && e.target !== filterBtn && !filterBtn.contains(e.target)) {
                    this.closeFilterDropdown();
                }

                const catDrop = document.getElementById('custom-category-dropdown');
                const catBtn = document.getElementById('custom-category-btn');
                if (catDrop && !catDrop.classList.contains('opacity-0') && e.target !== catBtn && !catBtn.contains(e.target)) {
                    this.closeCategoryDropdown();
                }
            });

            document.getElementById('add-portfolio-btn')?.addEventListener('click', () => {
                window.DirtyState.activeModal = null;
                this.openModal();
            });
            document.getElementById('close-portfolio-modal')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal();
            });
            document.getElementById('portfolio-modal')?.addEventListener('click', (e) => {
                if (e.target === document.getElementById('portfolio-modal')) {
                    this.closeModal();
                }
            });

            const pInputs = document.querySelectorAll('#portfolio-form input, #portfolio-form textarea');
            pInputs.forEach(i => i.addEventListener('input', () => window.DirtyState.activeModal = 'portfolio'));
            pInputs.forEach(i => i.addEventListener('change', () => window.DirtyState.activeModal = 'portfolio'));

            document.getElementById('portfolio-form')?.addEventListener('submit', (e) => this.saveCard(e));

            // Variável para guardar a instância ativa do Cropper
            let cropperInstance = null;
            const cropModal = document.getElementById('image-crop-modal');
            const cropperImage = document.getElementById('cropper-image');
            const fileInput = document.getElementById('card-image-file');

            const closeCropModal = () => {
                if (cropperInstance) {
                    cropperInstance.destroy();
                    cropperInstance = null;
                }
                fileInput.value = ''; // Limpa o input para permitir selecionar a mesma imagem novamente
                cropModal.classList.remove('opacity-100');
                document.querySelector('#image-crop-modal > div').classList.remove('scale-100');
                setTimeout(() => cropModal.classList.add('hidden'), 300);
            };

            document.getElementById('close-crop-modal')?.addEventListener('click', closeCropModal);
            document.getElementById('cancel-crop-btn')?.addEventListener('click', closeCropModal);

            document.getElementById('apply-crop-btn')?.addEventListener('click', async () => {
                if (!cropperInstance) return;
                try {
                    // Pega o canvas cortado e converte para Blob/DataURL com qualidade aceitável
                    const canvas = cropperInstance.getCroppedCanvas({
                        maxWidth: 1200,
                        maxHeight: 1200
                    });
                    const base64 = canvas.toDataURL('image/jpeg', 0.85);

                    // Atualiza o estado da imagem no modal do portfólio
                    this._localState.currentImageBase64 = base64;
                    document.getElementById('card-image').value = '[Imagem Recortada Localmente]';
                    document.getElementById('card-image-preview').src = base64;

                    window.DirtyState.activeModal = 'portfolio';
                    closeCropModal();
                } catch (err) {
                    uiManager.showToast('Falha ao cortar imagem.', 'error');
                }
            });

            // Interceptar upload de thumb para abrir o modal de recorte primeiro
            fileInput?.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        cropperImage.src = event.target.result;

                        // Show Modal
                        cropModal.classList.remove('hidden');
                        // Force reflow
                        void cropModal.offsetWidth;
                        cropModal.classList.add('opacity-100');
                        document.querySelector('#image-crop-modal > div').classList.add('scale-100');

                        // Destroy any existing instance just in case
                        if (cropperInstance) cropperInstance.destroy();

                        // Initialize Cropper JS
                        cropperInstance = new Cropper(cropperImage, {
                            viewMode: 2,
                            dragMode: 'move',
                            autoCropArea: 1,
                            restore: false,
                            guides: true,
                            center: true,
                            highlight: false,
                            cropBoxMovable: true,
                            cropBoxResizable: true,
                            toggleDragModeOnDblclick: false,
                        });
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Expor globalmente para os botões inline na tabela
            window.PortfolioManager = this;
        }
    };

    // Expor globalmente para os botões reset
    window.AdminApp = AdminApp;

    // Iniciar Autenticação
    Auth.init();
});