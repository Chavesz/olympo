import imgCentro from '../assets/photo-1517838277536-f5f99be501cd.jpg'
import imgNorte from '../assets/photo-1534438327276-14e5300c3a48.jpg'
import { api } from './api'

const IMAGENS = {
  centro: imgCentro,
  norte: imgNorte,
}

function mapUnidade(row) {
  return {
    id: row.id,
    nome: row.nome,
    endereco: row.endereco ?? '',
    telefone: row.telefone ?? '',
    horario: row.horario ?? '',
    imagem: IMAGENS[row.imagem_key] ?? imgCentro,
    imagemKey: row.imagem_key ?? 'centro',
    planoMensal: row.plano_mensal ?? '',
    planoAnual: row.plano_anual ?? '',
  }
}

export async function loadUnidades() {
  const rows = await api.publicGet('/unidades')
  return rows.map(mapUnidade)
}

export async function upsertUnidade(unidade) {
  const body = {
    nome: unidade.nome,
    endereco: unidade.endereco,
    telefone: unidade.telefone,
    horario: unidade.horario,
    imagem_key: unidade.imagemKey ?? 'centro',
    plano_mensal: unidade.planoMensal,
    plano_anual: unidade.planoAnual,
  }
  const isUuid = unidade.id && String(unidade.id).length > 20
  if (isUuid) {
    await api.patch(`/unidades/${unidade.id}`, body)
  } else {
    await api.post('/unidades', body)
  }
  return loadUnidades()
}

export async function deleteUnidade(id) {
  await api.delete(`/unidades/${id}`)
  return loadUnidades()
}
