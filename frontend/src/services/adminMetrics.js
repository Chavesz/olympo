import { loadAlunos, loadFichas, loadInstrutores, loadUsers } from './mockDb'
import { loadAulas, loadEventos } from './mockPortal'
import { loadUnidades } from './unidades'

export function getAdminMetrics() {
  const users = loadUsers()
  const alunos = loadAlunos()
  const instrutores = loadInstrutores()
  const fichas = loadFichas()
  const eventos = loadEventos()
  const aulas = loadAulas()
  const unidades = loadUnidades()

  const alunosAtivos = alunos.filter((a) => a.status === 'ativo')

  const alunosPorUnidade = unidades.map((u) => ({
    unidadeId: u.id,
    nome: u.nome,
    total: alunosAtivos.filter((a) => (a.unidadeId || 'un-centro') === u.id).length,
  }))

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

  return {
    totalAlunos: users.filter((u) => u.role === 'aluno').length,
    alunosAtivos: alunosAtivos.length,
    instrutoresAtivos: users.filter((u) => u.role === 'instrutor' && u.status === 'ativo').length,
    fichasCriadas: fichas.length,
    alunosPorUnidade,
    eventosPeriodo,
    aulasTop: aulasAdesao.slice(0, 5),
    instrutoresTop: fichasPorInstrutor.slice(0, 5),
  }
}
