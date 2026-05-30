const API_BASE = 'https://api.balldontlie.io/nba/v1'
const API_KEY = '57f7171d-c8c9-4f08-9908-625274de378e'

function buildHeaders() {
  return {
    Authorization: API_KEY,
  }
}

async function parseResponse(response, type) {
  if (response.ok) {
    return response.json()
  }

  const body = await response.text().catch(() => '')
  const errorMessage = response.status === 401
    ? 'A API balldontlie exige uma chave de autorização. Verifique a chave configurada.'
    : `Não foi possível carregar ${type} da API. (${response.status} ${body || response.statusText})`

  throw new Error(errorMessage)
}

export async function fetchPlayers({ search = '', team = 'all', page = 1, perPage = 50 } = {}) {
  const params = new URLSearchParams({ per_page: perPage, page })

  if (search) {
    params.set('search', search)
  }

  if (team !== 'all') {
    params.append('team_ids[]', team)
  }

  const response = await fetch(`${API_BASE}/players?${params.toString()}`, {
    headers: buildHeaders(),
  })
  return parseResponse(response, 'os jogadores')
}

export async function fetchTeams() {
  const response = await fetch(`${API_BASE}/teams`, {
    headers: buildHeaders(),
  })
  return parseResponse(response, 'as equipas')
}

export async function fetchGames({ season, page = 1, perPage = 10 } = {}) {
  const params = new URLSearchParams({ page, per_page: perPage })
  if (season) {
    params.append('seasons[]', season)
  }

  const response = await fetch(`${API_BASE}/games?${params.toString()}`, {
    headers: buildHeaders(),
  })
  return parseResponse(response, 'os jogos')
}

export async function fetchPlayerStats({ playerId, season }) {
  const params = new URLSearchParams()
  params.append('player_ids[]', playerId)
  params.append('season', season)
  params.append('season_type', 'regular')

  const response = await fetch(`${API_BASE}/season_averages/general?${params.toString()}`, {
    headers: buildHeaders(),
  })
  return parseResponse(response, 'as estatísticas do jogador')
}

export async function fetchPlayerById(id) {
  const response = await fetch(`${API_BASE}/players/${id}`, {
    headers: buildHeaders(),
  })
  return parseResponse(response, 'o jogador')
}