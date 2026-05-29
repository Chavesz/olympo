import { fetchHistorico, registrarTreino } from './portalData'

export async function loadHistory() {
  return fetchHistorico()
}

export async function addHistoryEntry(payload) {
  return registrarTreino(payload)
}
