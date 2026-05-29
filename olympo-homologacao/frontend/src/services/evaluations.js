import { createAvaliacao, fetchAvaliacoes, fetchMinhasAvaliacoes } from './data'

export function computeImc(peso, altura) {
  if (!Number.isFinite(peso) || !Number.isFinite(altura) || altura <= 0) return null
  return peso / (altura * altura)
}

export async function loadEvaluations(alunoId) {
  if (!alunoId) return []
  return fetchAvaliacoes(alunoId)
}

export async function loadMyEvaluations() {
  return fetchMinhasAvaliacoes()
}

export async function saveEvaluation(alunoId, payload) {
  return createAvaliacao(alunoId, payload)
}
