import imgCentro from '../assets/photo-1517838277536-f5f99be501cd.jpg'
import imgNorte from '../assets/photo-1534438327276-14e5300c3a48.jpg'

const KEY = 'olympo:unidades'

const seed = [
  {
    id: 'un-centro',
    nome: 'Olympo Centro',
    endereco: 'Av. Central, 1500',
    telefone: '(83) 99999-9999',
    horario: '05h às 23h',
    imagem: imgCentro,
    planoMensal: 'R$ 119,90',
    planoAnual: 'R$ 999,90',
  },
  {
    id: 'un-norte',
    nome: 'Olympo Norte',
    endereco: 'Rua Arena Brasil, 220',
    telefone: '(83) 98888-8888',
    horario: '24 horas',
    imagem: imgNorte,
    planoMensal: 'R$ 139,90',
    planoAnual: 'R$ 1199,90',
  },
]

function safeParse(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function loadUnidades() {
  const raw = localStorage.getItem(KEY)
  const parsed = raw ? safeParse(raw) : null
  if (Array.isArray(parsed) && parsed.length) return parsed
  localStorage.setItem(KEY, JSON.stringify(seed))
  return [...seed]
}

export function saveUnidades(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function upsertUnidade(unidade) {
  const list = loadUnidades()
  const idx = list.findIndex((u) => u.id === unidade.id)
  if (idx >= 0) list[idx] = unidade
  else list.unshift(unidade)
  saveUnidades(list)
  return list
}

export function deleteUnidade(id) {
  const list = loadUnidades().filter((u) => u.id !== id)
  saveUnidades(list)
  return list
}
