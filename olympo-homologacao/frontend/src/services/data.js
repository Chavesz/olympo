import { api } from './api'
import {
  mapAluno,
  mapFicha,
  mapInstrutor,
  mapUser,
  mapAvaliacao,
} from './mappers'
import { getExerciciosFromFicha } from './fichaExercises'

export async function fetchUsers() {
  const rows = await api.get('/usuarios')
  return rows.map(mapUser)
}

export async function createUser(payload) {
  const row = await api.post('/usuarios', {
    nome: payload.nome,
    email: payload.email,
    senha: payload.senha,
    role: payload.role,
    status: payload.status,
    telefone: payload.telefone,
    cref: payload.cref,
    especialidade: payload.especialidade,
    plano_id: payload.planoId,
  })
  return mapUser(row)
}

export async function updateUser(id, payload) {
  const row = await api.patch(`/usuarios/${id}`, {
    nome: payload.nome,
    email: payload.email,
    role: payload.role,
    status: payload.status,
    senha: payload.senha,
    telefone: payload.telefone,
    cref: payload.cref,
    especialidade: payload.especialidade,
    plano_id: payload.planoId,
  })
  return mapUser(row)
}

export async function deleteUser(userId) {
  await api.delete(`/usuarios/${userId}`)
}

export async function fetchAlunos() {
  const rows = await api.get('/alunos')
  return rows.map(mapAluno)
}

export async function fetchAlunoMe() {
  const row = await api.get('/alunos/me')
  return mapAluno(row)
}

export async function fetchAluno(id) {
  const row = await api.get(`/alunos/${id}`)
  return mapAluno(row)
}

export async function createAluno(payload, planoId) {
  const row = await api.post('/alunos', {
    nome: payload.nome,
    email: payload.email,
    telefone: payload.telefone,
    data_nascimento: payload.dataNascimento || null,
    data_matricula: payload.dataMatricula || null,
    plano_id: planoId || null,
    status: payload.status,
  })
  return mapAluno(row)
}

export async function updateAluno(id, payload, planoId) {
  const row = await api.patch(`/alunos/${id}`, {
    nome: payload.nome,
    email: payload.email,
    telefone: payload.telefone,
    data_nascimento: payload.dataNascimento || null,
    data_matricula: payload.dataMatricula || null,
    plano_id: planoId,
    status: payload.status,
  })
  return mapAluno(row)
}

export async function deleteAluno(alunoId) {
  await api.delete(`/alunos/${alunoId}`)
}

export async function fetchInstrutores() {
  const rows = await api.get('/instrutores')
  return rows.map(mapInstrutor)
}

export async function createInstrutor(payload) {
  const row = await api.post('/instrutores', {
    nome: payload.nome,
    email: payload.email,
    cref: payload.cref,
    especialidade: payload.especialidade,
    status: payload.status,
    senha: '123456',
  })
  return mapInstrutor(row)
}

export async function updateInstrutor(id, payload) {
  const row = await api.patch(`/instrutores/${id}`, {
    cref: payload.cref,
    especialidade: payload.especialidade,
    status: payload.status,
  })
  return mapInstrutor(row)
}

export async function fetchFichas() {
  const rows = await api.get('/fichas')
  return rows.map(mapFicha)
}

export async function fetchFicha(id) {
  const row = await api.get(`/fichas/${id}`)
  return mapFicha(row)
}

export async function createFicha(payload) {
  const exercicios = getExerciciosFromFicha(payload).map((ex, idx) => ({
    nome: ex.nome,
    series: ex.series,
    repeticoes: ex.repeticoes,
    ordem: idx,
  }))
  const row = await api.post('/fichas', {
    titulo: payload.titulo,
    aluno_id: payload.alunoId,
    instrutor_id: payload.instrutorId,
    objetivo: payload.objetivo,
    status: payload.status,
    exercicios,
  })
  return mapFicha({ ...row, exercicios })
}

export async function updateFicha(id, payload) {
  const exercicios = getExerciciosFromFicha(payload).map((ex, idx) => ({
    nome: ex.nome,
    series: ex.series,
    repeticoes: ex.repeticoes,
    ordem: idx,
  }))
  await api.patch(`/fichas/${id}`, {
    titulo: payload.titulo,
    objetivo: payload.objetivo,
    status: payload.status,
    exercicios,
  })
  return fetchFicha(id)
}

export async function deleteFicha(fichaId) {
  await api.delete(`/fichas/${fichaId}`)
}

export async function fetchAvaliacoes(alunoId) {
  const rows = await api.get(`/alunos/${alunoId}/avaliacoes`)
  return rows.map(mapAvaliacao)
}

export async function fetchMinhasAvaliacoes() {
  const rows = await api.get('/alunos/me/avaliacoes')
  return rows.map(mapAvaliacao)
}

export async function createAvaliacao(alunoId, payload) {
  const row = await api.post(`/alunos/${alunoId}/avaliacoes`, {
    peso: payload.peso,
    altura: payload.altura,
    gordura_pct: payload.gordura,
    observacao: payload.observacao,
    data_avaliacao: payload.data,
    instrutor_id: payload.instrutorId,
  })
  return mapAvaliacao(row)
}

export async function fetchAuthProfile() {
  return api.get('/auth/me')
}

export async function resolveAlunoNomeByUserId(userId) {
  try {
    const users = await fetchUsers()
    const user = users.find((u) => u.id === userId)
    if (user) {
      const alunos = await fetchAlunos()
      const aluno = alunos.find((a) => String(a.email).toLowerCase() === String(user.email).toLowerCase())
      return aluno?.nome ?? user.nome
    }
    const alunos = await fetchAlunos()
    const byAluno = alunos.find((a) => a.id === userId)
    if (byAluno) return byAluno.nome
    return 'Aluno'
  } catch {
    return 'Aluno'
  }
}
