const PREFIX = 'olympo:progress:'

function safeParse(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function loadProgress(fichaId) {
  const raw = localStorage.getItem(`${PREFIX}${fichaId}`)
  const parsed = raw ? safeParse(raw) : null
  if (parsed && typeof parsed === 'object') return parsed
  return {}
}

export function saveProgress(fichaId, progress) {
  localStorage.setItem(`${PREFIX}${fichaId}`, JSON.stringify(progress))
}

