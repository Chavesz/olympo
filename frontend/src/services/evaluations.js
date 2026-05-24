const PREFIX = 'olympo:evaluations:'

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
  localStorage.setItem(`${PREFIX}${alunoId}`, JSON.stringify([]))
  return []
}

export function saveEvaluations(alunoId, items) {
  if (!alunoId) return
  localStorage.setItem(`${PREFIX}${alunoId}`, JSON.stringify(items))
}

