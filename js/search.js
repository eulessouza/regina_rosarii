document.addEventListener('DOMContentLoaded', () => {
    const mainSearchInput = document.getElementById('mainSearchInput');
    const resultsContainer = document.getElementById('resultsContainer');
    
    // Função para carregar o conteúdo do index.html
    async function loadIndexContent() {
        try {
            const response = await fetch('index.html');
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Busca todos os cards do feed
            return Array.from(doc.querySelectorAll('.card')).map(card => {
                const title = card.querySelector('.card-title');
                const description = card.querySelector('.card-text');
                const img = card.querySelector('img');
                const link = card.closest('a');
                
                return {
                    title: title ? title.textContent.trim() : '',
                    description: description ? description.textContent.trim() : '',
                    image: img ? img.src : '',
                    url: link ? link.href : '#'
                };
            });
        } catch (error) {
            console.error('Erro ao carregar conteúdo:', error);
            return [];
        }
    }

    function normalizeText(text) {
        return text.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    function highlightText(text, searchTerm) {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    async function showResults(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) {
            resultsContainer.innerHTML = `
                <div class="alert alert-info text-center">
                    Digite pelo menos 2 caracteres para buscar
                </div>
            `;
            return;
        }

        const normalizedSearch = normalizeText(searchTerm);
        const indexContent = await loadIndexContent();

        const results = indexContent.filter(item => 
            normalizeText(item.title).includes(normalizedSearch) ||
            normalizeText(item.description).includes(normalizedSearch)
        );

        if (results.length > 0) {
            resultsContainer.innerHTML = results.map(item => `
                <div class="card mb-4 shadow-sm">
                    <div class="row g-0">
                        <div class="col-md-4">
                            <img src="${item.image}" class="img-fluid rounded-start" 
                                 alt="${item.title}" style="height: 200px; object-fit: cover;">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title">${highlightText(item.title, searchTerm)}</h5>
                                <p class="card-text">${highlightText(item.description, searchTerm)}</p>
                                <a href="${item.url}" class="btn btn-primary">Ver mais</a>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            resultsContainer.innerHTML = `
                <div class="alert alert-warning text-center">
                    <h4>Nenhum resultado encontrado</h4>
                    <p>Tente buscar por outros termos</p>
                </div>
            `;
        }
    }

    // Verifica se há termo de busca na URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    
    if (searchQuery) {
        mainSearchInput.value = searchQuery;
        showResults(searchQuery);
    }

    // Evento de busca em tempo real com debounce
    let debounceTimer;
    mainSearchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            showResults(e.target.value);
        }, 300);
    });
});