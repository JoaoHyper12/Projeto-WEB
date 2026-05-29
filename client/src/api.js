export async function fetchProducts() {
  // Usar a API balldontlie como fonte de dados e mapear jogadores para "produtos"
  const response = await fetch('https://www.balldontlie.io/api/v1/players?per_page=50');
  if (!response.ok) {
    throw new Error('Não foi possível carregar os produtos (API externa).');
  }

  const data = await response.json();

  // Mapear jogadores para um formato de produto compatível com a app
  const products = data.data.map((player) => ({
    id: `player-${player.id}`,
    name: `${player.first_name} ${player.last_name}`,
    price: 9.99,
    category: player.team && player.team.abbreviation ? player.team.abbreviation : 'N/D',
    image: '/images/placeholder-player.webp',
  }))

  return products;
}

export async function fetchPlayerPreview() {
  const response = await fetch('https://www.balldontlie.io/api/v1/players?per_page=6');
  if (!response.ok) {
    throw new Error('Não foi possível carregar os jogadores de destaque.');
  }

  return response.json();
}

export async function fetchPlayers({ search = '', page = 1, perPage = 12 }) {
  const params = new URLSearchParams({
    per_page: perPage,
    page,
    search,
  });
  const response = await fetch(`https://www.balldontlie.io/api/v1/players?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Não foi possível carregar os jogadores.');
  }

  return response.json();
}

export async function fetchTeams() {
  const response = await fetch('https://www.balldontlie.io/api/v1/teams');
  if (!response.ok) {
    throw new Error('Não foi possível carregar as equipas.');
  }

  return response.json();
}
