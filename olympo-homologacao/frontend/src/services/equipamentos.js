import { api } from './api'

function mapEquipamento(row) {
  return {
    id: row.id,
    nome: row.nome,
    categoria: row.categoria ?? '',
    quantidade: Number(row.quantidade ?? 1),
    status: row.status,
    unidadeId: row.unidade_id,
    unidadeNome: row.unidade_nome ?? '',
  }
}

export async function loadEquipamentos() {
  const rows = await api.get('/equipamentos')
  return rows.map(mapEquipamento)
}

export async function upsertEquipamento(item) {
  const body = {
    nome: item.nome,
    categoria: item.categoria,
    quantidade: item.quantidade,
    status: item.status,
    unidade_id: item.unidadeId || null,
  }
  const isUuid = item.id && String(item.id).length > 20
  if (isUuid) {
    await api.patch(`/equipamentos/${item.id}`, body)
  } else {
    await api.post('/equipamentos', body)
  }
  return loadEquipamentos()
}

export async function deleteEquipamento(id) {
  await api.delete(`/equipamentos/${id}`)
  return loadEquipamentos()
}
