import { fetchAlunos, fetchFichas, fetchInstrutores } from './data'
import { fetchAulas, fetchEventos } from './portalData'
import { api } from './api'

export async function getAdminMetrics() {
  const [alunos, instrutores, fichas, eventos, aulas, unidades] = await Promise.all([
    fetchAlunos(),
    fetchInstrutores(),
    fetchFichas(),
    fetchEventos(),
    fetchAulas(),
    api.get('/unidades').catch(() => []),
  ])

  const alunosAtivos = alunos.filter((a) => a.status === 'ativo')

  const eventosPeriodo = eventos.length

  const aulasAdesao = []
  for (const mod of aulas) {
    for (const slot of mod.slots ?? []) {
      aulasAdesao.push({
        label: `${mod.modalidade} — ${slot.dia} ${slot.horario}`,
        inscritos: slot.inscritos ?? 0,
        vagas: slot.vagas ?? 0,
      })
    }
  }
  aulasAdesao.sort((a, b) => b.inscritos - a.inscritos)

  const fichasPorInstrutor = instrutores.map((i) => ({
    instrutorId: i.id,
    nome: i.nome,
    total: fichas.filter((f) => f.instrutorId === i.id).length,
  }))
  fichasPorInstrutor.sort((a, b) => b.total - a.total)

  // Build alunosPorUnidade using unidades + aluno.unidade_id if available
  // Since alunos may not have unidade_id, count all actives per unidade if data exists
  const alunosPorUnidade = unidades.map((u) => ({
    unidadeId: u.id,
    nome: u.nome,
    total: alunosAtivos.filter((a) => a.unidadeId === u.id).length,
  }))

  return {
    totalAlunos: alunos.length,
    alunosAtivos: alunosAtivos.length,
    instrutoresAtivos: instrutores.filter((i) => i.status === 'ativo').length,
    fichasCriadas: fichas.length,
    alunosPorUnidade,
    eventosPeriodo,
    aulasTop: aulasAdesao.slice(0, 5),
    instrutoresTop: fichasPorInstrutor.slice(0, 5),
  }
}
