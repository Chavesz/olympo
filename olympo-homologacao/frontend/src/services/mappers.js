import { normalizeFichaExercicios } from './fichaExercises'

export function formatDate(value) {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  return new Date(value).toISOString().slice(0, 10)
}

export function formatTime(value) {
  if (!value) return ''
  const s = String(value)
  return s.length >= 5 ? s.slice(0, 5) : s
}

export function mapUser(row) {
  if (!row) return null
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    role: row.role,
    status: row.status,
    criadoEm: row.criado_em,
  }
}

export function mapAluno(row) {
  if (!row) return null
  return {
    id: row.id,
    usuarioId: row.usuario_id,
    nome: row.nome,
    email: row.email,
    telefone: row.telefone ?? '',
    dataNascimento: formatDate(row.data_nascimento),
    dataMatricula: formatDate(row.data_matricula),
    planoAtivo: row.plano_ativo ?? '',
    planoId: row.plano_id ?? null,
    status: row.status,
  }
}

export function mapInstrutor(row) {
  if (!row) return null
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    cref: row.cref ?? '',
    especialidade: row.especialidade ?? '',
    status: row.status,
  }
}

export function mapFicha(row) {
  if (!row) return null
  const base = {
    id: row.id,
    titulo: row.titulo,
    alunoId: row.aluno_id,
    instrutorId: row.instrutor_id,
    objetivo: row.objetivo ?? '',
    status: row.status,
    alunoNome: row.aluno_nome,
    instrutorNome: row.instrutor_nome,
    updatedAt: row.atualizado_em ? new Date(row.atualizado_em).getTime() : Date.now(),
    exercicios: (row.exercicios ?? []).map((ex) => ({
      id: ex.id,
      nome: ex.nome,
      series: ex.series != null ? String(ex.series) : '',
      repeticoes: ex.repeticoes ?? '',
      observacoes: '',
      ordem: ex.ordem,
    })),
  }
  return normalizeFichaExercicios(base)
}

export function mapPlano(row) {
  if (!row) return null
  return {
    id: row.id,
    nome: row.nome,
    tipo: row.tipo,
    valor: Number(row.valor),
    descricao: row.descricao ?? '',
    status: row.status,
  }
}

export function mapEvento(row) {
  if (!row) return null
  return {
    id: row.id,
    nome: row.nome,
    data: formatDate(row.data),
    horario: formatTime(row.horario),
    local: row.local ?? '',
    descricao: row.descricao ?? '',
    vagas: Number(row.vagas ?? 0),
    inscritos: Number(row.inscritos ?? 0),
    image: row.image ?? null,
  }
}

export function mapAulas(modalidades) {
  return (modalidades ?? []).map((m) => ({
    modalidade: m.nome,
    modalidadeId: m.id,
    slots: (m.slots ?? []).map((s) => ({
      id: s.id,
      dia: s.dia_semana,
      horario: formatTime(s.horario),
      vagas: Number(s.vagas ?? 0),
      inscritos: Number(s.inscritos ?? 0),
      instrutor: s.instrutor || 'A definir',
    })),
  }))
}

export function mapComunicado(row) {
  if (!row) return null
  return {
    id: row.id,
    titulo: row.titulo,
    texto: row.texto,
    data: formatDate(row.data),
  }
}

export function mapInscricao(row) {
  if (!row) return null
  if (row.tipo === 'evento') {
    return {
      id: row.id,
      type: 'evento',
      subscriptionId: row.id,
      eventoId: row.evento_id,
      nome: row.evento_nome,
      when: `${formatDate(row.evento_data)} ${formatTime(row.evento_horario)}`,
    }
  }
  return {
    id: row.id,
    type: 'aula',
    subscriptionId: row.id,
    slotId: row.slot_id,
    nome: row.modalidade_nome,
    when: `${row.dia_semana} ${formatTime(row.slot_horario)}`,
    rawId: `${row.slot_id}|${row.modalidade_nome}`,
  }
}

export function mapAvaliacao(row) {
  if (!row) return null
  const altura = row.altura != null ? Number(row.altura) : null
  return {
    id: row.id,
    data: formatDate(row.data_avaliacao),
    peso: row.peso != null ? Number(row.peso) : null,
    altura,
    gordura: row.gordura_pct != null ? Number(row.gordura_pct) : null,
    imc: row.imc != null ? Number(row.imc) : null,
    observacao: row.observacao ?? '',
    instrutorNome: row.instrutor_nome ?? '',
  }
}

export function mapHistorico(row) {
  if (!row) return null
  return {
    id: row.id,
    fichaId: row.ficha_id,
    fichaTitulo: row.ficha_titulo ?? '',
    dataTreino: row.data_treino,
    observacao: row.observacao ?? '',
  }
}
