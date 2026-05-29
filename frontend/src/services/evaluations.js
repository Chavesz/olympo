const PREFIX = 'olympo:evaluations:'

const seedByAluno = {
  'a-1': [
    {
      id: 'av-1',
      data: '2026-01-10',
      peso: 84.5,
      altura: 1.78,
      gordura: 19.2,
      observacao: 'Boa adesão ao treino. Manter hidratação.',
    },
    {
      id: 'av-2',
      data: '2026-03-05',
      peso: 82.0,
      altura: 1.78,
      gordura: 17.8,
      observacao: '',
    },
  ],
}

function safeParse(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function loadEvaluations(alunoId) {
  if (!alunoId) return []
  const raw = localStorage.getItem(`${PREFIX}${alunoId}`)
  const parsed = raw ? safeParse(raw) : null
  if (Array.isArray(parsed)) return parsed
  const seed = seedByAluno[alunoId] ?? []
  localStorage.setItem(`${PREFIX}${alunoId}`, JSON.stringify(seed))
  return [...seed]
}

export function saveEvaluations(alunoId, items) {
  if (!alunoId) return
  localStorage.setItem(`${PREFIX}${alunoId}`, JSON.stringify(items))
}

export function computeImc(peso, altura) {
  if (!Number.isFinite(peso) || !Number.isFinite(altura) || altura <= 0) return null
  return peso / (altura * altura)
}
