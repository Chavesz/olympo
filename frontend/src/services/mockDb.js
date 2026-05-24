const USERS_KEY = 'olympo:mock:users'
const ALUNOS_KEY = 'olympo:mock:alunos'
const INSTRUTORES_KEY = 'olympo:mock:instrutores'
const FICHAS_KEY = 'olympo:mock:fichas'

const seedUsers = [
  { id: 'u-1', nome: 'Admin Olympo', email: 'admin@olympo.dev', role: 'admin', status: 'ativo' },
  { id: 'u-2', nome: 'Felipe Silva', email: 'felipe@olympo.dev', role: 'instrutor', status: 'ativo' },
  { id: 'u-3', nome: 'Jonh Santos', email: 'jonh@olympo.dev', role: 'aluno', status: 'ativo' },
  { id: 'u-4', nome: 'Kauã Chaves', email: 'kaua@olympo.dev', role: 'aluno', status: 'inativo' },
]

const seedAlunos = [
  {
    id: 'a-1',
    nome: 'Jonh Santos',
    email: 'jonh@olympo.dev',
    telefone: '(11) 90000-0001',
    dataNascimento: '2001-04-12',
    dataMatricula: '2025-02-03',
    planoAtivo: 'Mensal',
    status: 'ativo',
  },
  {
    id: 'a-2',
    nome: 'Kauã Chaves',
    email: 'kaua@olympo.dev',
    telefone: '(11) 90000-0002',
    dataNascimento: '2002-09-20',
    dataMatricula: '2024-10-15',
    planoAtivo: 'Anual',
    status: 'inativo',
  },
  {
    id: 'a-3',
    nome: 'Maria Oliveira',
    email: 'maria@olympo.dev',
    telefone: '(11) 90000-0003',
    dataNascimento: '1999-12-05',
    dataMatricula: '2025-06-01',
    planoAtivo: 'Mensal',
    status: 'ativo',
  },
]

const seedInstrutores = [
  {
    id: 'i-1',
    nome: 'Felipe Silva',
    email: 'felipe@olympo.dev',
    cref: 'CREF 123456-G/SP',
    especialidade: 'Hipertrofia',
    status: 'ativo',
  },
  {
    id: 'i-2',
    nome: 'Ana Souza',
    email: 'ana@olympo.dev',
    cref: 'CREF 654321-G/SP',
    especialidade: 'Emagrecimento',
    status: 'ativo',
  },
]

const seedFichas = [
  {
    id: 'f-1',
    titulo: 'Treino A - Superior',
    alunoId: 'a-1',
    instrutorId: 'i-1',
    objetivo: 'Hipertrofia',
    status: 'ativa',
    exerciciosText:
      'Supino reto — 4x 8-10\nPuxada na barra — 4x 10-12\nDesenvolvimento — 3x 8-10\nRosca direta — 3x 10-12\nTríceps corda — 3x 12-15',
    updatedAt: Date.now(),
  },
  {
    id: 'f-2',
    titulo: 'Treino B - Inferior',
    alunoId: 'a-3',
    instrutorId: 'i-2',
    objetivo: 'Condicionamento',
    status: 'ativa',
    exerciciosText: 'Agachamento — 4x 8-10\nLeg press — 4x 10-12\nCadeira extensora — 3x 12-15',
    updatedAt: Date.now(),
  },
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

export function loadAlunos() {
  const raw = localStorage.getItem(ALUNOS_KEY)
  const parsed = raw ? safeParse(raw) : null
  if (Array.isArray(parsed)) return parsed
  localStorage.setItem(ALUNOS_KEY, JSON.stringify(seedAlunos))
  return [...seedAlunos]
}

export function saveAlunos(alunos) {
  localStorage.setItem(ALUNOS_KEY, JSON.stringify(alunos))
}

export function upsertAluno(aluno) {
  const alunos = loadAlunos()
  const idx = alunos.findIndex((a) => a.id === aluno.id)
  if (idx >= 0) alunos[idx] = aluno
  else alunos.unshift(aluno)
  saveAlunos(alunos)
  return alunos
}

export function deleteAluno(alunoId) {
  const alunos = loadAlunos().filter((a) => a.id !== alunoId)
  saveAlunos(alunos)
  return alunos
}

export function loadInstrutores() {
  const raw = localStorage.getItem(INSTRUTORES_KEY)
  const parsed = raw ? safeParse(raw) : null
  if (Array.isArray(parsed)) return parsed
  localStorage.setItem(INSTRUTORES_KEY, JSON.stringify(seedInstrutores))
  return [...seedInstrutores]
}

export function saveInstrutores(instrutores) {
  localStorage.setItem(INSTRUTORES_KEY, JSON.stringify(instrutores))
}

export function upsertInstrutor(instrutor) {
  const instrutores = loadInstrutores()
  const idx = instrutores.findIndex((i) => i.id === instrutor.id)
  if (idx >= 0) instrutores[idx] = instrutor
  else instrutores.unshift(instrutor)
  saveInstrutores(instrutores)
  return instrutores
}

export function deleteInstrutor(instrutorId) {
  const instrutores = loadInstrutores().filter((i) => i.id !== instrutorId)
  saveInstrutores(instrutores)
  return instrutores
}

export function loadFichas() {
  const raw = localStorage.getItem(FICHAS_KEY)
  const parsed = raw ? safeParse(raw) : null
  if (Array.isArray(parsed)) return parsed
  localStorage.setItem(FICHAS_KEY, JSON.stringify(seedFichas))
  return [...seedFichas]
}

export function saveFichas(fichas) {
  localStorage.setItem(FICHAS_KEY, JSON.stringify(fichas))
}

export function upsertFicha(ficha) {
  const fichas = loadFichas()
  const idx = fichas.findIndex((f) => f.id === ficha.id)
  if (idx >= 0) fichas[idx] = ficha
  else fichas.unshift(ficha)
  saveFichas(fichas)
  return fichas
}

export function deleteFicha(fichaId) {
  const fichas = loadFichas().filter((f) => f.id !== fichaId)
  saveFichas(fichas)
  return fichas
}
