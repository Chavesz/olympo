const STORAGE_KEY = 'olympo:auth'

export function getAuth() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function isAuthenticated() {
  const auth = getAuth()
  return Boolean(auth?.token)
}

export function getRole() {
  const auth = getAuth()
  return auth?.role ?? null
}

export function getUserId() {
  const auth = getAuth()
  return auth?.userId ?? null
}

export function getEmail() {
  const auth = getAuth()
  return auth?.email ?? null
}

export function setAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY)
}
