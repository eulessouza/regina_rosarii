document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const prayerList = document.getElementById('prayer-list');
    
    // Coletar todos os títulos e IDs das orações
    const prayers = Array.from(document.querySelectorAll('.card[id]')).map(card => {
        const title = card.querySelector('.card-title');
        return {
            id: card.id,
            title: title ? title.textContent : '',
            element: card
        };
    });

    function normalizeText(text) {
        return text.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    function showResults(filteredPrayers) {
        prayerList.innerHTML = '';
        
        if (filteredPrayers.length > 0) {
            filteredPrayers.forEach(prayer => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                const a = document.createElement('a');
                a.href = `#${prayer.id}`;
                a.textContent = prayer.title;
                a.addEventListener('click', () => {
                    searchResults.classList.add('d-none');
                    searchInput.value = '';
                });
                li.appendChild(a);
                prayerList.appendChild(li);
            });
            searchResults.classList.remove('d-none');
        } else {
            searchResults.classList.add('d-none');
        }
    }

    function handleSearch() {
        const searchTerm = searchInput.value;
        if (searchTerm.length < 1) {
            searchResults.classList.add('d-none');
            return;
        }

        const normalizedSearch = normalizeText(searchTerm);
        const filteredPrayers = prayers.filter(prayer => 
            normalizeText(prayer.title).includes(normalizedSearch)
        );

        showResults(filteredPrayers);
    }

    // Eventos
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(handleSearch, 300);
    });

    // Fechar resultados ao clicar fora
    document.addEventListener('click', (e) => {
        if (!searchResults.contains(e.target) && e.target !== searchInput) {
            searchResults.classList.add('d-none');
        }
    });
});