const playersContainer = document.getElementById('playersContainer');
const teamFilter = document.getElementById('teamFilter');
const positionFilter = document.getElementById('positionFilter');
const playerSearch = document.getElementById('playerSearch');
const loadMoreButton = document.getElementById('loadMorePlayers');

let currentPage = 1;
let currentQuery = '';
let selectedTeam = 'all';
let selectedPosition = 'all';

async function loadTeams() {
  try {
    const response = await fetch('https://www.balldontlie.io/api/v1/teams');
    if (!response.ok) throw new Error('Falha no carregamento das equipas.');
    const data = await response.json();

    data.data.forEach((team) => {
      const option = document.createElement('option');
      option.value = team.id;
      option.textContent = `${team.full_name} (${team.abbreviation})`;
      teamFilter.appendChild(option);
    });
  } catch (error) {
    playersContainer.innerHTML = `<p class="empty">Erro ao carregar equipas: ${error.message}</p>`;
  }
}

async function loadPlayers(reset = false) {
  if (reset) {
    currentPage = 1;
    playersContainer.innerHTML = '';
  }

  const filters = new URLSearchParams({
    per_page: 12,
    page: currentPage,
    search: currentQuery,
  });

  try {
    const response = await fetch(`https://www.balldontlie.io/api/v1/players?${filters.toString()}`);
    if (!response.ok) throw new Error('Erro na API de jogadores.');
    const data = await response.json();

    const list = data.data.filter((player) => {
      const teamMatches = selectedTeam === 'all' || String(player.team.id) === selectedTeam;
      const positionMatches = selectedPosition === 'all' || player.position === selectedPosition;
      return teamMatches && positionMatches;
    });

    if (list.length === 0 && currentPage === 1) {
      playersContainer.innerHTML = '<p class="empty">Nenhum jogador encontrado.</p>';
      return;
    }

    list.forEach((player) => {
      const card = document.createElement('article');
      card.className = 'player-card';
      card.innerHTML = `
        <h3>${player.first_name} ${player.last_name}</h3>
        <p>Equipa: ${player.team.full_name}</p>
        <p>Posição: ${player.position || 'N/D'}</p>
        <button type="button">Ver detalhes</button>
      `;

      card.querySelector('button').addEventListener('click', () => showPlayerDetails(player));
      playersContainer.appendChild(card);
    });

    if (!data.meta.next_page) {
      loadMoreButton.disabled = true;
      loadMoreButton.textContent = 'Sem mais jogadores';
    } else {
      loadMoreButton.disabled = false;
      loadMoreButton.textContent = 'Carregar mais';
    }
  } catch (error) {
    playersContainer.innerHTML = `<p class="empty">Erro ao carregar jogadores: ${error.message}</p>`;
  }
}

function showPlayerDetails(player) {
  const detailText = `Jogador: ${player.first_name} ${player.last_name}\nEquipa: ${player.team.full_name}\nPosição: ${player.position || 'N/D'}\nCidade: ${player.team.city}`;
  alert(detailText);
}

function refreshPlayers() {
  selectedTeam = teamFilter.value;
  selectedPosition = positionFilter.value;
  currentQuery = playerSearch.value.trim();
  loadPlayers(true);
}

playerSearch.addEventListener('input', () => refreshPlayers());
teamFilter.addEventListener('change', () => refreshPlayers());
positionFilter.addEventListener('change', () => refreshPlayers());
loadMoreButton.addEventListener('click', () => {
  currentPage += 1;
  loadPlayers();
});

loadTeams();
loadPlayers(true);
