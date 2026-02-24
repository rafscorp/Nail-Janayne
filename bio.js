/**
 * bio.js - Lógica específica da Bio
 */
document.addEventListener('DOMContentLoaded', () => {
    // Floating WhatsApp (Reutilizado lógica simples)
    const waBtn = document.getElementById('whatsapp-float');
    if (waBtn) {
        const waIcon = waBtn.querySelector('svg');
        let lastScrollTop = 0;
        setTimeout(() => {
            waBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
            waBtn.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto', 'transition-all', 'duration-500', 'ease-out');
            if (waIcon) waIcon.classList.add('animate-gentle-bounce');
        }, 1000);
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            if (currentScroll < lastScrollTop || currentScroll < 100) {
                waBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
                waBtn.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
                if (waIcon) waIcon.classList.add('animate-gentle-bounce');
            } else {
                waBtn.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
                waBtn.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
                if (waIcon) waIcon.classList.remove('animate-gentle-bounce');
            }
            lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
        });
    }
});