import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '../layouts/AppLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import PublicLayout from '../layouts/PublicLayout.vue'
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
    return { name: 'dashboard' }
  }

  if (roles) {
    const role = getRole()
    if (!role || !roles.includes(role)) {
      if (role === 'admin') return { name: 'admin' }
      if (role === 'aluno') return { name: 'aluno-inicio' }
      return { name: 'dashboard' }
    }
  }

  return true
})

export default router
