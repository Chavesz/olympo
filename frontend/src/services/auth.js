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

/** Apenas em `npm run dev` com VITE_DEV_BYPASS_AUTH=true — entra sem backend. */
export const DEV_BYPASS_ENABLED =
  import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

const DEV_PROFILES = {
  admin: { role: 'admin', email: 'admin@olympo.dev', userId: 'u-1' },
  instrutor: { role: 'instrutor', email: 'felipe@olympo.dev', userId: 'dev-instrutor' },
  aluno: { role: 'aluno', email: 'jonh@olympo.dev', userId: 'dev-aluno' },
}

export function setDevAuth(role) {
  const profile = DEV_PROFILES[role]
  if (!profile) return
  setAuth({ token: 'dev-bypass', ...profile })
}
