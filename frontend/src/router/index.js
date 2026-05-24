import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '../layouts/AppLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import PublicLayout from '../layouts/PublicLayout.vue'
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
    return { name: 'dashboard' }
  }

  if (roles) {
    const role = getRole()
    if (!role || !roles.includes(role)) return { name: 'dashboard' }
  }

  return true
})

export default router
