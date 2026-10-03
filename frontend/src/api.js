const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function apiRequest(path, { method = 'GET', token, body } = {}) {
  const headers = { Accept: 'application/json' }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const detail = data?.detail || data?.message || 'Request failed'
    throw new Error(detail)
  }

  return data
}

export function loginUser(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function getCurrentUser(token) {
  return apiRequest('/auth/me', { token })
}

export function getSummary(token) {
  return apiRequest('/summary', { token })
}

export function getObservations(token) {
  return apiRequest('/observations', { token })
}

export function createObservation(token, observation) {
  return apiRequest('/observations', {
    method: 'POST',
    token,
    body: observation,
  })
}

export function getExerciseEntries(token) {
  return apiRequest('/exercise-entries', { token })
}

export function createExerciseEntry(token, entry) {
  return apiRequest('/exercise-entries', {
    method: 'POST',
    token,
    body: entry,
  })
}

export function getMedicationEntries(token) {
  return apiRequest('/medication-entries', { token })
}

export function createMedicationEntry(token, entry) {
  return apiRequest('/medication-entries', {
    method: 'POST',
    token,
    body: entry,
  })
}

export function getBloodPressureEntries(token) {
  return apiRequest('/blood-pressure-entries', { token })
}

export function createBloodPressureEntry(token, entry) {
  return apiRequest('/blood-pressure-entries', {
    method: 'POST',
    token,
    body: entry,
  })
}

export function getNotesEntries(token) {
  return apiRequest('/notes-entries', { token })
}

export function createNoteEntry(token, entry) {
  return apiRequest('/notes-entries', {
    method: 'POST',
    token,
    body: entry,
  })
}
