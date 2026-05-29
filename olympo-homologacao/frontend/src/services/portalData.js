import { api } from './api'
import {
  mapAulas,
  mapComunicado,
  mapEvento,
  mapInscricao,
  mapPlano,
  mapHistorico,
} from './mappers'

export async function fetchPlanos() {
  const rows = await api.get('/planos')
  return rows.map(mapPlano)
}

export async function createPlano(payload) {
  const row = await api.post('/planos', {
    nome: payload.nome,
    tipo: payload.tipo,
    valor: payload.valor,
    descricao: payload.descricao,
    status: payload.status,
  })
  return mapPlano(row)
}

export async function updatePlano(id, payload) {
  const row = await api.patch(`/planos/${id}`, {
    nome: payload.nome,
    tipo: payload.tipo,
    valor: payload.valor,
    descricao: payload.descricao,
    status: payload.status,
  })
  return mapPlano(row)
}

export async function deletePlano(id) {
  await api.delete(`/planos/${id}`)
}

export async function fetchEventos() {
  const rows = await api.get('/eventos')
  return rows.map(mapEvento)
}

export async function createEvento(payload) {
  const row = await api.post('/eventos', {
    nome: payload.nome,
    data: payload.data,
    horario: payload.horario,
    local: payload.local,
    descricao: payload.descricao,
    vagas: payload.vagas,
  })
  return mapEvento(row)
}

export async function updateEvento(id, payload) {
  const row = await api.patch(`/eventos/${id}`, {
    nome: payload.nome,
    data: payload.data,
    horario: payload.horario,
    local: payload.local,
    descricao: payload.descricao,
    vagas: payload.vagas,
  })
  return mapEvento(row)
}

export async function deleteEvento(id) {
  await api.delete(`/eventos/${id}`)
}

export async function fetchAulas() {
  const rows = await api.get('/aulas')
  return mapAulas(rows)
}

export async function createAulaSlot(payload) {
  return api.post('/aulas/slots', {
    modalidade_id: payload.modalidadeId,
    dia_semana: payload.dia,
    horario: payload.horario,
    vagas: payload.vagas,
  })
}

export async function deleteAulaSlot(slotId) {
  await api.delete(`/aulas/slots/${slotId}`)
}

export async function fetchComunicados() {
  const rows = await api.get('/comunicados')
  return rows.map(mapComunicado)
}

export async function createComunicado(payload) {
  const row = await api.post('/comunicados', {
    titulo: payload.titulo,
    texto: payload.texto,
    data: payload.data,
  })
  return mapComunicado(row)
}

export async function updateComunicado(id, payload) {
  const row = await api.patch(`/comunicados/${id}`, {
    titulo: payload.titulo,
    texto: payload.texto,
    data: payload.data,
  })
  return mapComunicado(row)
}

export async function deleteComunicado(id) {
  await api.delete(`/comunicados/${id}`)
}

export async function fetchMinhasInscricoes() {
  const rows = await api.get('/inscricoes/minhas')
  return rows.map(mapInscricao)
}

export async function fetchTodasInscricoes() {
  const rows = await api.get('/inscricoes')
  // Normaliza datas e campos opcionais para que o componente receba
  // os mesmos nomes independentemente do driver PostgreSQL
  return rows.map((r) => ({
    ...r,
    evento_data: r.evento_data
      ? String(r.evento_data).slice(0, 10)
      : null,
    evento_horario: r.evento_horario
      ? String(r.evento_horario).slice(0, 5)
      : null,
    slot_horario: r.slot_horario
      ? String(r.slot_horario).slice(0, 5)
      : null,
  }))
}

export async function inscreverEvento(eventoId) {
  return api.post('/inscricoes', { tipo: 'evento', evento_id: eventoId })
}

export async function inscreverAula(slotId) {
  return api.post('/inscricoes', { tipo: 'aula', slot_id: slotId })
}

export async function cancelarInscricao(inscricaoId) {
  await api.delete(`/inscricoes/${inscricaoId}`)
}

export async function fetchHistorico() {
  const rows = await api.get('/historico')
  return rows.map(mapHistorico)
}

export async function registrarTreino(payload) {
  const row = await api.post('/historico', {
    ficha_id: payload.fichaId,
    data_treino: payload.dataTreino,
    observacao: payload.observacao,
  })
  return mapHistorico(row)
}

export async function fetchProgresso(fichaId) {
  return api.get(`/progresso/${fichaId}`)
}

export async function salvarProgresso(exercicioId, concluido) {
  return api.post('/progresso', { exercicio_id: exercicioId, concluido })
}
