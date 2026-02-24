/**
 * admin.js - Lógica específica do Admin
 */
document.addEventListener('DOMContentLoaded', () => {
    Storage.init();
    UI.initObserver();
    UI.renderCards(true);

    // Auth
    const loginForm = document.getElementById('login-form');
    const adminContent = document.getElementById('admin-content');
    const adminLogin = document.getElementById('admin-login');
    const logoutBtn = document.getElementById('logout-btn');
    const targetHash = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";

    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    if (sessionStorage.getItem('adminLogged') === 'true') {
        adminLogin.classList.add('hidden');
        adminContent.classList.remove('hidden');
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('admin-password').value;
            const inputHash = await sha256(password);
            if (inputHash === targetHash) {
                sessionStorage.setItem('adminLogged', 'true');
                adminLogin.classList.add('hidden');
                adminContent.classList.remove('hidden');
                UI.showToast('Bem-vinda de volta!', 'success');
            } else {
                UI.showToast('Senha incorreta.', 'error');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('adminLogged');
            window.location.reload();
        });
    }

    // Settings Logic
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        const heroFile = document.getElementById('hero-file');
        const heroPreview = document.getElementById('hero-preview');
        const colorPrimary = document.getElementById('color-primary');
        const colorLight = document.getElementById('color-light');
        const colorText = document.getElementById('color-text');

        // Carregar configurações atuais
        const currentSettings = Storage.getSettings();
        if (currentSettings.heroImage) heroPreview.src = currentSettings.heroImage;
        if (currentSettings.primaryColor) colorPrimary.value = currentSettings.primaryColor;
        if (currentSettings.lightColor) colorLight.value = currentSettings.lightColor;
        if (currentSettings.textColor) colorText.value = currentSettings.textColor;

        let newHeroBase64 = '';

        heroFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    newHeroBase64 = event.target.result;
                    heroPreview.src = newHeroBase64;
                };
                reader.readAsDataURL(file);
            }
        });

        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const settings = {
                heroImage: newHeroBase64 || currentSettings.heroImage,
                primaryColor: colorPrimary.value,
                lightColor: colorLight.value,
                textColor: colorText.value
            };
            Storage.saveSettings(settings);
            UI.applyTheme(); // Aplica imediatamente para preview
            UI.showToast('Aparência atualizada com sucesso!');
        });
    }

    // Form Logic
    let currentBase64Image = '';
    const adminForm = document.getElementById('admin-form');
    if (adminForm) {
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
                image: currentBase64Image,
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

        // Delete Modal
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
});