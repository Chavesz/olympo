const USERS_KEY = 'olympo:mock:users'

const seedUsers = [
  { id: 'u-1', nome: 'Admin Olympo', email: 'admin@olympo.dev', role: 'admin', status: 'ativo' },
  { id: 'u-2', nome: 'Felipe Silva', email: 'felipe@olympo.dev', role: 'instrutor', status: 'ativo' },
  { id: 'u-3', nome: 'Jonh Santos', email: 'jonh@olympo.dev', role: 'aluno', status: 'ativo' },
  { id: 'u-4', nome: 'Kauã Chaves', email: 'kaua@olympo.dev', role: 'aluno', status: 'inativo' },
]

function safeParse(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function loadUsers() {
  const raw = localStorage.getItem(USERS_KEY)
  const parsed = raw ? safeParse(raw) : null
  if (Array.isArray(parsed)) return parsed
  localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers))
  return [...seedUsers]
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function upsertUser(user) {
  const users = loadUsers()
  const idx = users.findIndex((u) => u.id === user.id)
  if (idx >= 0) users[idx] = user
  else users.unshift(user)
  saveUsers(users)
  return users
}

export function deleteUser(userId) {
  const users = loadUsers().filter((u) => u.id !== userId)
  saveUsers(users)
  return users
}

