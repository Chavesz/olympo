import { fetchProgresso, salvarProgresso } from './portalData'

export async function loadProgress(fichaId) {
  if (!fichaId) return {}
  return fetchProgresso(fichaId)
}

export async function saveProgress(fichaId, progress) {
  const entries = Object.entries(progress ?? {})
  for (const [exercicioId, concluido] of entries) {
    await salvarProgresso(exercicioId, concluido)
  }
  return loadProgress(fichaId)
}

export async function toggleExerciseProgress(exercicioId, concluido) {
  await salvarProgresso(exercicioId, concluido)
}
