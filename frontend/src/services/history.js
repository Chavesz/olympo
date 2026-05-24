const PREFIX = 'olympo:history:'

function safeParse(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function loadHistory(userId) {
  if (!userId) return []
  const raw = localStorage.getItem(`${PREFIX}${userId}`)
  const parsed = raw ? safeParse(raw) : null
  if (Array.isArray(parsed)) return parsed
  localStorage.setItem(`${PREFIX}${userId}`, JSON.stringify([]))
  return []
}

export function saveHistory(userId, items) {
  if (!userId) return
  localStorage.setItem(`${PREFIX}${userId}`, JSON.stringify(items))
}

