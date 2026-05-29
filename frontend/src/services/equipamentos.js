const KEY = 'olympo:equipamentos'

const seed = [
  {
    id: 'eq-1',
    nome: 'Esteira profissional',
    categoria: 'Cardio',
    quantidade: 12,
    status: 'disponivel',
    unidadeId: 'un-centro',
  },
  {
    id: 'eq-2',
    nome: 'Leg press 45°',
    categoria: 'Musculação',
    quantidade: 4,
    status: 'manutencao',
    unidadeId: 'un-centro',
  },
  {
    id: 'eq-3',
    nome: 'Rack de agachamento',
    categoria: 'Musculação',
    quantidade: 6,
    status: 'disponivel',
    unidadeId: 'un-norte',
  },
]

function safeParse(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function loadEquipamentos() {
  const raw = localStorage.getItem(KEY)
  const parsed = raw ? safeParse(raw) : null
  if (Array.isArray(parsed)) return parsed
  localStorage.setItem(KEY, JSON.stringify(seed))
  return [...seed]
}

export function saveEquipamentos(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function upsertEquipamento(item) {
  const list = loadEquipamentos()
  const idx = list.findIndex((e) => e.id === item.id)
  if (idx >= 0) list[idx] = item
  else list.unshift(item)
  saveEquipamentos(list)
  return list
}

export function deleteEquipamento(id) {
  const list = loadEquipamentos().filter((e) => e.id !== id)
  saveEquipamentos(list)
  return list
}
