document.addEventListener('DOMContentLoaded', () => {
    // Elementos DOM
    const elements = {
        input: document.getElementById('navSearchInput'),
        form: document.getElementById('navSearchInput').closest('.search-form'),
        container: document.getElementById('navSearchInput').closest('.search-container'),
        overlay: document.getElementById('searchOverlay'),
        suggestions: document.getElementById('searchSuggestions')
    };

    // Estado da busca
    const state = {
        isActive: false,
        debounceTimer: null,
        preventDeactivation: false // Novo estado para prevenir desativação indesejada
    };

    // Funções principais
    const search = {
        activate: () => {
            state.isActive = true;
            elements.container.classList.add('search-active');
            elements.overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
        },

        deactivate: () => {
            if (state.preventDeactivation) {
                state.preventDeactivation = false;
                return;
            }
            state.isActive = false;
            elements.container.classList.remove('search-active');
            elements.overlay.style.display = 'none';
            document.body.style.overflow = '';
            elements.suggestions.classList.add('d-none');
        },

        showSuggestions: (searchTerm) => {
            const normalizedSearch = searchTerm.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .trim();

            if (normalizedSearch.length < 2) {
                elements.suggestions.classList.add('d-none');
                return;
            }

            // Busca nos cards do feed
            const feedCards = document.querySelectorAll('#feed .card');
            const results = Array.from(feedCards)
                .map(card => ({
                    title: card.querySelector('.card-title')?.textContent || '',
                    description: card.querySelector('.card-text')?.textContent || '',
                    image: card.querySelector('img')?.src || '',
                    url: card.closest('a')?.href || '#'
                }))
                .filter(item => 
                    item.title.toLowerCase().includes(normalizedSearch) ||
                    item.description.toLowerCase().includes(normalizedSearch)
                )
                .slice(0, 5);

            const content = elements.suggestions.querySelector('.suggestions-content');
            content.innerHTML = '';

            if (results.length > 0) {
                results.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.innerHTML = `
                        <img src="${item.image}" alt="" onerror="this.src='img/default.png'">
                        <div class="suggestion-text">
                            <div class="suggestion-title">${item.title}</div>
                            <div class="suggestion-description">
                                ${item.description.substring(0, 60)}...
                            </div>
                        </div>
                    `;
                    div.addEventListener('click', () => window.location.href = item.url);
                    content.appendChild(div);
                });
                elements.suggestions.classList.remove('d-none');
            } else {
                elements.suggestions.classList.add('d-none');
            }
        }
    };

    // Event Listeners
    const events = {
        onInputFocus: (e) => {
            e.stopPropagation();
            state.preventDeactivation = false;
            if (!state.isActive) {
                search.activate();
            }
        },

        onInputClick: (e) => {
            e.stopPropagation();
            state.preventDeactivation = true;
            if (!state.isActive) {
                search.activate();
            }
        },

        onContainerClick: (e) => {
            e.stopPropagation();
            state.preventDeactivation = true;
        },

        onOverlayClick: () => {
            state.preventDeactivation = false;
            search.deactivate();
            elements.input.blur();
        },

        onDocumentClick: (e) => {
            if (state.isActive && 
                !elements.container.contains(e.target) && 
                !elements.overlay.contains(e.target)) {
                state.preventDeactivation = false;
                search.deactivate();
            }
        },

        onEscape: (e) => {
            if (e.key === 'Escape' && state.isActive) {
                state.preventDeactivation = false;
                search.deactivate();
                elements.input.blur();
            }
        },

        onInput: (e) => {
            clearTimeout(state.debounceTimer);
            state.debounceTimer = setTimeout(() => {
                if (state.isActive && e.target.value.length >= 2) {
                    search.showSuggestions(e.target.value);
                }
            }, 300);
        }
    };

    // Adicionar Event Listeners
    elements.input.addEventListener('focus', events.onInputFocus);
    elements.input.addEventListener('click', events.onInputClick);
    elements.input.addEventListener('input', events.onInput);

    elements.form.addEventListener('click', events.onContainerClick);
    elements.form.addEventListener('submit', events.onContainerClick);

    elements.container.addEventListener('click', events.onContainerClick);
    elements.suggestions.addEventListener('click', events.onContainerClick);

    elements.overlay.addEventListener('click', events.onOverlayClick);

    document.addEventListener('keydown', events.onEscape);
    document.addEventListener('click', events.onDocumentClick);
});