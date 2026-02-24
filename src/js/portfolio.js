/**
 * portfolio.js - Gerencia a renderização dinâmica dos cards de serviço
 */
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    // 1. Carrega todos os dados
    const allItems = storageManager.getPortfolio();
    
    // Função para renderizar itens na tela
    const renderItems = (items) => {
        if (items.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-12 text-stone-500 italic">Nenhum trabalho encontrado nesta categoria.</div>';
            return;
        }

        grid.innerHTML = items.map(item => `
            <div class="portfolio-card group relative h-96 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 opacity-0 translate-y-12 scale-95">
                <img src="${item.image}" alt="${item.category}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
                <div class="absolute bottom-0 left-0 p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <span class="text-rose-300 text-xs font-bold tracking-widest uppercase mb-2 block">${item.category}</span>
                    <h4 class="text-white font-serif text-2xl mb-2">${item.title}</h4>
                    <p class="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 transform translate-y-4 group-hover:translate-y-0">${item.description}</p>
                </div>
            </div>
        `).join('');

        // Re-ativa a animação de entrada
        if (window.uiManager) {
            if (!uiManager.observer) uiManager.initObserver();
            const cards = grid.querySelectorAll('.portfolio-card');
            cards.forEach(card => uiManager.observer.observe(card));
        } else {
            // Fallback de segurança: torna visível imediatamente se o uiManager falhar
            grid.querySelectorAll('.portfolio-card').forEach(card => {
                card.classList.remove('opacity-0', 'translate-y-12', 'scale-95');
            });
        }
    };

    // Renderiza inicial (Todos)
    renderItems(allItems);

    // 2. Lógica dos Botões de Filtro
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove classe ativa de todos e adiciona no clicado
            filterBtns.forEach(b => {
                b.classList.remove('bg-rose-400', 'text-white', 'shadow-md');
                b.classList.add('bg-white', 'text-stone-600', 'border', 'border-rose-100');
            });
            btn.classList.remove('bg-white', 'text-stone-600', 'border', 'border-rose-100');
            btn.classList.add('bg-rose-400', 'text-white', 'shadow-md');

            // Filtra e renderiza
            const category = btn.dataset.category;
            const filtered = category === 'all' ? allItems : allItems.filter(item => item.category === category);
            renderItems(filtered);
        });
    });
});