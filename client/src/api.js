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
