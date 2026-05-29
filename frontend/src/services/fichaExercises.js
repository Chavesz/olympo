export function createExerciseId() {
  return typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `ex-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function emptyExercise() {
  return {
    id: createExerciseId(),
    nome: '',
    series: '',
    repeticoes: '',
    observacoes: '',
  }
}

/** Converte linhas legadas "Nome — 4x 8-10 — obs" em exercícios estruturados. */
export function parseExerciciosText(text) {
  return String(text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((raw) => {
      const parts = raw.split('—').map((p) => p.trim())
      const nome = parts[0] || raw
      let series = ''
      let repeticoes = ''
      let observacoes = parts[2] ?? ''

      const detalhe = parts[1] ?? ''
      const match = detalhe.match(/^(\d+)\s*x\s*(.+)$/i)
      if (match) {
        series = match[1]
        repeticoes = match[2].trim()
      } else if (detalhe) {
        repeticoes = detalhe
      }

      return {
        id: createExerciseId(),
        nome,
        series,
        repeticoes,
        observacoes,
      }
    })
}

export function getExerciciosFromFicha(ficha) {
  if (!ficha) return []
  if (Array.isArray(ficha.exercicios) && ficha.exercicios.length > 0) {
    return ficha.exercicios.map((e) => ({
      ...emptyExercise(),
      ...e,
      id: e.id || createExerciseId(),
    }))
  }
  if (ficha.exerciciosText) return parseExerciciosText(ficha.exerciciosText)
  return []
}

export function serializeExerciciosToText(exercicios) {
  return exercicios
    .filter((e) => String(e.nome ?? '').trim())
    .map((e) => {
      const volume =
        e.series && e.repeticoes
          ? `${e.series}x ${e.repeticoes}`
          : [e.series, e.repeticoes].filter(Boolean).join(' ')
      const parts = [e.nome.trim(), volume, String(e.observacoes ?? '').trim()].filter(Boolean)
      return parts.join(' — ')
    })
    .join('\n')
}

export function normalizeFichaExercicios(ficha) {
  const exercicios = getExerciciosFromFicha(ficha)
  return {
    ...ficha,
    exercicios,
    exerciciosText: serializeExerciciosToText(exercicios),
  }
}
