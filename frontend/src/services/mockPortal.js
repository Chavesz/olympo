const EVENTOS_KEY = 'olympo:mock:eventos'
const AULAS_KEY = 'olympo:mock:aulas'
const COMUNICADOS_KEY = 'olympo:mock:comunicados'
const SUBS_PREFIX = 'olympo:subs:'

function safeParse(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const seedEventos = [
  {
    id: 'ev-1',
    nome: 'Desafio 30 dias',
    data: '2026-06-10',
    horario: '19:00',
    local: 'Unidade Centro',
    descricao: 'Treinos guiados e metas semanais para acelerar resultados.',
    vagas: 30,
    inscritos: 12,
    image: null,
  },
  {
    id: 'ev-2',
    nome: 'Aulão aberto',
    data: '2026-06-22',
    horario: '10:00',
    local: 'Unidade Norte',
    descricao: 'Funcional e HIIT para todos os níveis.',
    vagas: 40,
    inscritos: 40,
    image: null,
  },
  {
    id: 'ev-3',
    nome: 'Semana da saúde',
    data: '2026-07-01',
    horario: '18:00',
    local: 'Unidade Centro',
    descricao: 'Palestras, avaliações e dicas de nutrição.',
    vagas: 60,
    inscritos: 21,
    image: null,
  },
]

const seedAulas = [
  {
    modalidade: 'Pilates',
    slots: [
      { id: 'pi-1', dia: 'Segunda', horario: '07:00', vagas: 10, inscritos: 6 },
      { id: 'pi-2', dia: 'Quarta', horario: '19:00', vagas: 10, inscritos: 10 },
    ],
  },
  {
    modalidade: 'Funcional',
    slots: [
      { id: 'fu-1', dia: 'Terça', horario: '18:00', vagas: 20, inscritos: 12 },
      { id: 'fu-2', dia: 'Quinta', horario: '06:30', vagas: 20, inscritos: 5 },
    ],
  },
  {
    modalidade: 'Spinning',
    slots: [
      { id: 'sp-1', dia: 'Segunda', horario: '20:00', vagas: 18, inscritos: 18 },
      { id: 'sp-2', dia: 'Sexta', horario: '07:00', vagas: 18, inscritos: 10 },
    ],
  },
]

const seedComunicados = [
  {
    id: 'c-1',
    titulo: 'Horário especial no feriado',
    data: '2026-05-18',
    texto:
      'No feriado, a unidade Centro funcionará das 08:00 às 14:00. Aulas coletivas serão reagendadas.',
  },
  {
    id: 'c-2',
    titulo: 'Manutenção preventiva',
    data: '2026-05-10',
    texto:
      'Alguns equipamentos passarão por manutenção preventiva. Pedimos compreensão durante o período.',
  },
  {
    id: 'c-3',
    titulo: 'Nova turma de funcional',
    data: '2026-05-02',
    texto:
      'Abrimos uma nova turma de funcional às quintas, 06:30. Vagas limitadas.',
  },
]

export function loadEventos() {
  const raw = localStorage.getItem(EVENTOS_KEY)
  const parsed = raw ? safeParse(raw) : null
  if (Array.isArray(parsed)) return parsed
  localStorage.setItem(EVENTOS_KEY, JSON.stringify(seedEventos))
  return [...seedEventos]
}

export function saveEventos(eventos) {
  localStorage.setItem(EVENTOS_KEY, JSON.stringify(eventos))
}

export function loadAulas() {
  const raw = localStorage.getItem(AULAS_KEY)
  const parsed = raw ? safeParse(raw) : null
  if (Array.isArray(parsed)) return parsed
  localStorage.setItem(AULAS_KEY, JSON.stringify(seedAulas))
  return [...seedAulas]
}

export function saveAulas(aulas) {
  localStorage.setItem(AULAS_KEY, JSON.stringify(aulas))
}

export function loadComunicados() {
  const raw = localStorage.getItem(COMUNICADOS_KEY)
  const parsed = raw ? safeParse(raw) : null
  if (Array.isArray(parsed)) return parsed
  localStorage.setItem(COMUNICADOS_KEY, JSON.stringify(seedComunicados))
  return [...seedComunicados]
}

export function saveComunicados(comunicados) {
  localStorage.setItem(COMUNICADOS_KEY, JSON.stringify(comunicados))
}

export function loadSubscriptions(userId) {
  if (!userId) return []
  const raw = localStorage.getItem(`${SUBS_PREFIX}${userId}`)
  const parsed = raw ? safeParse(raw) : null
  if (Array.isArray(parsed)) return parsed
  localStorage.setItem(`${SUBS_PREFIX}${userId}`, JSON.stringify([]))
  return []
}

export function saveSubscriptions(userId, subs) {
  if (!userId) return
  localStorage.setItem(`${SUBS_PREFIX}${userId}`, JSON.stringify(subs))
}

export function listSubscriptionUserIds() {
  const ids = []
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (!key) continue
    if (!key.startsWith(SUBS_PREFIX)) continue
    ids.push(key.slice(SUBS_PREFIX.length))
  }
  return ids
}

export function removeEventFromAllSubscriptions(eventId) {
  const ids = listSubscriptionUserIds()
  for (const userId of ids) {
    const subs = loadSubscriptions(userId).filter((s) => !(s.type === 'evento' && s.id === eventId))
    saveSubscriptions(userId, subs)
  }
}

export function removeSlotFromAllSubscriptions(slotId) {
  const ids = listSubscriptionUserIds()
  for (const userId of ids) {
    const subs = loadSubscriptions(userId).filter(
      (s) => !(s.type === 'aula' && String(s.id).startsWith(`${slotId}|`)),
    )
    saveSubscriptions(userId, subs)
  }
}

export function upsertEvento(evento) {
  const eventos = loadEventos()
  const idx = eventos.findIndex((e) => e.id === evento.id)
  if (idx >= 0) eventos[idx] = evento
  else eventos.unshift(evento)
  saveEventos(eventos)
  return eventos
}

export function deleteEvento(eventId) {
  const eventos = loadEventos().filter((e) => e.id !== eventId)
  saveEventos(eventos)
  removeEventFromAllSubscriptions(eventId)
  return eventos
}

export function upsertComunicado(comunicado) {
  const comunicados = loadComunicados()
  const idx = comunicados.findIndex((c) => c.id === comunicado.id)
  if (idx >= 0) comunicados[idx] = comunicado
  else comunicados.unshift(comunicado)
  saveComunicados(comunicados)
  return comunicados
}

export function deleteComunicado(comunicadoId) {
  const comunicados = loadComunicados().filter((c) => c.id !== comunicadoId)
  saveComunicados(comunicados)
  return comunicados
}
