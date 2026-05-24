import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '../layouts/AppLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import PublicLayout from '../layouts/PublicLayout.vue'
import ProfessionalLayout from '../layouts/ProfessionalLayout.vue'
import StudentLayout from '../layouts/StudentLayout.vue'
import { getRole, isAuthenticated } from '../services/auth'

import Dashboard from '../views/Dashboard.vue'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import AdminDashboardV2 from '../views/admin/Dashboard.vue'
import Alunos from '../views/admin/Alunos.vue'
import FichasTreino from '../views/admin/FichasTreino.vue'
import GerenciarUsuarios from '../views/admin/GerenciarUsuarios.vue'
import Instrutores from '../views/admin/Instrutores.vue'
import MinhasFichas from '../views/user/MinhasFichas.vue'
import MeuTreino from '../views/user/MeuTreino.vue'
import AlunoAulas from '../views/aluno/AulasColetivas.vue'
import AlunoComunicados from '../views/aluno/Comunicados.vue'
import AlunoEvolucao from '../views/aluno/MinhaEvolucao.vue'
import AlunoEventos from '../views/aluno/Eventos.vue'
import AlunoHistorico from '../views/aluno/HistoricoTreinos.vue'
import AlunoInicio from '../views/aluno/Inicio.vue'
import AlunoInscricoes from '../views/aluno/MinhasInscricoes.vue'
import AlunoPerfil from '../views/aluno/MeuPerfil.vue'
import AlunoPlano from '../views/aluno/MeuPlano.vue'
import AlunoTreinos from '../views/aluno/MeusTreinos.vue'
import ProfComunicados from '../views/profissional/Comunicados.vue'
import ProfEvolucao from '../views/profissional/EvolucaoAlunos.vue'
import ProfEventos from '../views/profissional/GerenciarEventos.vue'
import ProfAulas from '../views/profissional/GerenciarAulas.vue'
import ProfAlunos from '../views/profissional/GerenciarAlunos.vue'
import ProfPlanos from '../views/profissional/GerenciarPlanos.vue'
import ProfTreinos from '../views/profissional/GerenciarTreinos.vue'
import ProfFichaAluno from '../views/profissional/FichaAluno.vue'
import ProfInicio from '../views/profissional/Inicio.vue'
import ProfInscricoes from '../views/profissional/Inscricoes.vue'

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'home', component: Home },
      { path: 'login', name: 'login', component: Login, meta: { guestOnly: true } },
    ],
  },
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: { requiresAuth: true, roles: ['admin', 'aluno', 'instrutor'] },
      },
      {
        path: 'meu-treino',
        name: 'meu-treino',
        component: MeuTreino,
        meta: { requiresAuth: true, roles: ['admin', 'aluno', 'instrutor'] },
      },
      {
        path: 'minhas-fichas',
        name: 'minhas-fichas',
        component: MinhasFichas,
        meta: { requiresAuth: true, roles: ['admin', 'aluno', 'instrutor'] },
      },
    ],
  },
  {
    path: '/aluno',
    component: StudentLayout,
    meta: { requiresAuth: true, roles: ['aluno'] },
    children: [
      { path: '', name: 'aluno-inicio', component: AlunoInicio },
      { path: 'meu-perfil', name: 'aluno-perfil', component: AlunoPerfil },
      { path: 'meus-treinos', name: 'aluno-treinos', component: AlunoTreinos },
      { path: 'historico', name: 'aluno-historico', component: AlunoHistorico },
      { path: 'evolucao', name: 'aluno-evolucao', component: AlunoEvolucao },
      { path: 'plano', name: 'aluno-plano', component: AlunoPlano },
      { path: 'inscricoes', name: 'aluno-inscricoes', component: AlunoInscricoes },
      { path: 'eventos', name: 'aluno-eventos', component: AlunoEventos },
      { path: 'aulas', name: 'aluno-aulas', component: AlunoAulas },
      { path: 'comunicados', name: 'aluno-comunicados', component: AlunoComunicados },
    ],
  },
  {
    path: '/profissional',
    component: ProfessionalLayout,
    meta: { requiresAuth: true, roles: ['instrutor'] },
    children: [
      { path: '', name: 'profissional-inicio', component: ProfInicio },
      { path: 'alunos', name: 'profissional-alunos', component: ProfAlunos },
      { path: 'alunos/:id', name: 'profissional-ficha', component: ProfFichaAluno },
      { path: 'treinos', name: 'profissional-treinos', component: ProfTreinos },
      { path: 'evolucao', name: 'profissional-evolucao', component: ProfEvolucao },
      { path: 'planos', name: 'profissional-planos', component: ProfPlanos },
      { path: 'eventos', name: 'profissional-eventos', component: ProfEventos },
      { path: 'aulas', name: 'profissional-aulas', component: ProfAulas },
      { path: 'comunicados', name: 'profissional-comunicados', component: ProfComunicados },
      { path: 'inscricoes', name: 'profissional-inscricoes', component: ProfInscricoes },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      { path: '', name: 'admin', component: AdminDashboardV2 },
      { path: 'usuarios', name: 'admin-usuarios', component: GerenciarUsuarios },
      { path: 'alunos', name: 'admin-alunos', component: Alunos },
      { path: 'instrutores', name: 'admin-instrutores', component: Instrutores },
      { path: 'fichas', name: 'admin-fichas', component: FichasTreino },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const requiresAuth = Boolean(to.meta?.requiresAuth)
  const guestOnly = Boolean(to.meta?.guestOnly)
  const roles = Array.isArray(to.meta?.roles) ? to.meta.roles : null

  if (requiresAuth && !isAuthenticated()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (guestOnly && isAuthenticated()) {
    const role = getRole()
    if (role === 'admin') return { name: 'admin' }
    if (role === 'aluno') return { name: 'aluno-inicio' }
    if (role === 'instrutor') return { name: 'profissional-inicio' }
    return { name: 'dashboard' }
  }

  if (roles) {
    const role = getRole()
    if (!role || !roles.includes(role)) {
      if (role === 'admin') return { name: 'admin' }
      if (role === 'aluno') return { name: 'aluno-inicio' }
      if (role === 'instrutor') return { name: 'profissional-inicio' }
      return { name: 'dashboard' }
    }
  }

  return true
})

export default router
