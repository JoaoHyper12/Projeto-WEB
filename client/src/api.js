export async function fetchProducts() {
  const response = await fetch('/products.json');
  if (!response.ok) {
    throw new Error('Não foi possível carregar os produtos.');
  }

  return response.json();
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
