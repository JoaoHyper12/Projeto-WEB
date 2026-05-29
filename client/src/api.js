export async function fetchPlayers({ search = '', team = 'all', page = 1, perPage = 50 } = {}) {
  const params = new URLSearchParams({ per_page: perPage, page });

  if (search) {
    params.set('search', search);
  }

  if (team !== 'all') {
    params.append('team_ids[]', team);
  }

  const response = await fetch(`https://www.balldontlie.io/api/v1/players?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Não foi possível carregar os jogadores da API.');
  }

  return response.json();
}

export async function fetchTeams() {
  const response = await fetch('https://www.balldontlie.io/api/v1/teams');
  if (!response.ok) {
    throw new Error('Não foi possível carregar as equipas da API.');
  }

  return response.json();
}
