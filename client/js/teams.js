const teamsContainer = document.getElementById('teamsContainer');
const conferenceFilter = document.getElementById('conferenceFilter');
const teamSearch = document.getElementById('teamSearch');

let teams = [];

async function loadTeams() {
  try {
    const response = await fetch('https://www.balldontlie.io/api/v1/teams');
    if (!response.ok) throw new Error('Falha ao obter as equipas.');
    const data = await response.json();
    teams = data.data;
    renderTeams(teams);
  } catch (error) {
    teamsContainer.innerHTML = `<p class="empty">Erro na API de equipas: ${error.message}</p>`;
  }
}

function renderTeams(list) {
  teamsContainer.innerHTML = '';
  const filtered = list.filter((team) => {
    const conferenceMatches = conferenceFilter.value === 'all' || team.conference === conferenceFilter.value;
    const searchMatches = teamSearch.value.trim().toLowerCase() === '' || team.full_name.toLowerCase().includes(teamSearch.value.trim().toLowerCase());
    return conferenceMatches && searchMatches;
  });

  if (filtered.length === 0) {
    teamsContainer.innerHTML = '<p class="empty">Nenhuma equipa encontrada.</p>';
    return;
  }

  filtered.forEach((team) => {
    const card = document.createElement('article');
    card.className = 'team-card';
    card.innerHTML = `
      <h3>${team.full_name}</h3>
      <p>Abreviatura: ${team.abbreviation}</p>
      <p>Conferência: ${team.conference}</p>
      <p>Divisão: ${team.division}</p>
      <button type="button">Ver estatísticas</button>
    `;

    card.querySelector('button').addEventListener('click', () => {
      alert(`Equipa: ${team.full_name}\nCidade: ${team.city}\nConferência: ${team.conference}\nDivisão: ${team.division}`);
    });
    teamsContainer.appendChild(card);
  });
}

conferenceFilter.addEventListener('change', () => renderTeams(teams));
teamSearch.addEventListener('input', () => renderTeams(teams));

loadTeams();
