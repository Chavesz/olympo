import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '../layouts/AppLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import { getRole, isAuthenticated } from '../services/auth'

import Cadastro from '../views/Cadastro.vue'
import Dashboard from '../views/Dashboard.vue'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import AdminDashboardV2 from '../views/admin/Dashboard.vue'
import GerenciarUsuarios from '../views/admin/GerenciarUsuarios.vue'
import MeuTreino from '../views/user/MeuTreino.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', name: 'home', component: Home },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: { requiresAuth: true, roles: ['admin', 'user'] },
      },
      {
        path: 'meu-treino',
        name: 'meu-treino',
        component: MeuTreino,
        meta: { requiresAuth: true, roles: ['admin', 'user'] },
      },
    ],
  },
  {
    path: '/',
    component: AuthLayout,
    children: [
      { path: 'login', name: 'login', component: Login, meta: { guestOnly: true } },
      { path: 'cadastro', name: 'cadastro', component: Cadastro, meta: { guestOnly: true } },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      { path: '', name: 'admin', component: AdminDashboardV2 },
      { path: 'usuarios', name: 'admin-usuarios', component: GerenciarUsuarios },
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
