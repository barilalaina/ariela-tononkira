let allSongs = [];        // Données chargées
let filteredSongs = [];   // Données filtrées (recherche)
let currentPage = 1;      // Page courante
const pageSize = 10;      // ⚙️ Nombre d'éléments par page (modifiable)

// Chargement des données
async function loadAndDisplayData() {
  try {
    const response = await fetch('hira.json');
    allSongs = await response.json();
    // Initialiser le filtre avec toutes les chansons
    filteredSongs = allSongs.slice();
    render();
  } catch (error) {
    console.error('Erreur:', error);
    document.getElementById('content-container').innerHTML =
      '<p style="color:#b00020">Tsy tafiditra ny angona (hira.json). Zahao ny anaran’ny rakitra na ny path.</p>';
  }
}

// Rendu global (liste + pagination)
function render() {
  renderSongsPage();
  renderPagination();
}

// Rendu d'une page de chansons
function renderSongsPage() {
  const container = document.getElementById('content-container');
  container.innerHTML = '';

  if (!filteredSongs.length) {
    container.innerHTML = '<p>Azo antoka fa tsy misy vokatra amin\'ity fikarohana ity.</p>';
    return;
  }

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filteredSongs.slice(start, end);

  let htmlString = '';
  pageItems.forEach(item => {
    htmlString += `
      <div class="hira-list-item">
        <a href="hira.html?id=${encodeURIComponent(item.id)}">${escapeHtml(item.hira)}</a>
      </div>
    `;
  });

  container.insertAdjacentHTML('beforeend', htmlString);
}

// Génère les contrôles de pagination
function renderPagination() {
  const nav = document.getElementById('pagination');
  nav.innerHTML = '';

  const totalPages = Math.max(1, Math.ceil(filteredSongs.length / pageSize));
  // Clamp currentPage si la recherche a réduit le nombre de pages
  if (currentPage > totalPages) currentPage = totalPages;

  // Helper pour bouton
  const btn = (label, page, disabled = false, active = false, ariaLabel) => {
    const el = document.createElement('button');
    el.textContent = label;
    el.className = 'page-btn' + (active ? ' active' : '') + (disabled ? ' disabled' : '');
    el.disabled = disabled;
    if (ariaLabel) el.setAttribute('aria-label', ariaLabel);
    el.addEventListener('click', () => {
      if (!disabled && page !== currentPage) {
        currentPage = page;
        render();
        // Remonter en haut de la liste (optionnel)
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    return el;
  };

  const total = totalPages;

  // Bouton "Précédent"
  nav.appendChild(btn('«', currentPage - 1, currentPage === 1, false, 'Page précédente'));

  // Plage de numéros (avec ellipses)
  const windowSize = 2; // nombre de pages autour de la page courante
  const pages = getPageWindow(currentPage, total, windowSize);

  pages.forEach(p => {
    if (p === '...') {
      const span = document.createElement('span');
      span.className = 'ellipsis';
      span.textContent = '…';
      nav.appendChild(span);
    } else {
      nav.appendChild(btn(String(p), p, false, p === currentPage, `Aller à la page ${p}`));
    }
  });

  // Bouton "Suivant"
  nav.appendChild(btn('»', currentPage + 1, currentPage === total, false, 'Page suivante'));

  // Info de statut (optionnel, accessibilité)
  const status = document.createElement('span');
  status.className = 'page-status';
  status.setAttribute('aria-live', 'polite');
  status.textContent = `Page ${currentPage} / ${total}`;
  nav.appendChild(status);
}

// Calcule une fenêtre de pages avec ellipses
function getPageWindow(current, total, windowSize = 2) {
  // Toujours montrer première et dernière page, avec une fenêtre autour de la page courante
  const pages = new Set([1, total]);
  for (let i = current - windowSize; i <= current + windowSize; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }
  const sorted = Array.from(pages).sort((a, b) => a - b);

  // Insérer des ellipses
  const out = [];
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] !== sorted[i] + 1) {
      out.push('...');
    }
  }
  return out;
}

// Recherche (avec reset de page et petit debounce)
const searchInput = document.getElementById('search-input');
let debounceId;

searchInput.addEventListener('input', (e) => {
  const value = e.target.value.toLowerCase();

  clearTimeout(debounceId);
  debounceId = setTimeout(() => {
    filteredSongs = allSongs.filter(item =>
      (item.hira || '').toLowerCase().includes(value)
    );
    currentPage = 1; // Repartir au début
    render();
  }, 150);
});

// Sécurité : échapper les textes injectés
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Lancer
loadAndDisplayData();