let allSongs = []; // Stockage global pour le filtrage

async function loadAndDisplayData() {
    try {
        const response = await fetch('hira.json');
        allSongs = await response.json();
        renderSongs(allSongs); // Affichage initial
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Fonction qui génère le HTML
function renderSongs(songs) {
    const container = document.getElementById('content-container');
    container.innerHTML = ''; // Vide le conteneur

    let htmlString = '';
    songs.forEach(item => {
        htmlString += `
        <div>
            <a href="hira.html?id=${item.id}">${item.hira}</a>
        </div>
        `;
    });
    container.insertAdjacentHTML('beforeend', htmlString);
}

// Écouteur d'événement pour la recherche
document.getElementById('search-input').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    const filteredSongs = allSongs.filter(item => 
        item.hira.toLowerCase().includes(searchTerm)
    );
    
    renderSongs(filteredSongs);
});

loadAndDisplayData();