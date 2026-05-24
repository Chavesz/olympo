<script setup>
import { clearAuth, getRole, isAuthenticated } from '../services/auth'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const role = computed(() => getRole())
const authed = computed(() => isAuthenticated())

async function onLogout() {
  clearAuth()
  await router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div class="text-lg font-semibold">Olympo</div>

        <nav class="flex items-center gap-3 text-sm">
          <router-link class="rounded px-2 py-1 hover:bg-slate-100" to="/">Home</router-link>
          <router-link class="rounded px-2 py-1 hover:bg-slate-100" to="/dashboard">
            Dashboard
          </router-link>
          <router-link class="rounded px-2 py-1 hover:bg-slate-100" to="/meu-treino">
            Meu Treino
          </router-link>
          <router-link
            v-if="role === 'admin'"
            class="rounded px-2 py-1 hover:bg-slate-100"
            to="/admin"
          >
            Admin
          </router-link>
        </nav>

        <div class="flex items-center gap-2">
          <span v-if="authed" class="text-xs text-slate-600">Perfil: {{ role }}</span>
          <router-link
            v-if="!authed"
            class="rounded border border-slate-300 bg-white px-3 py-1 text-sm font-semibold hover:bg-slate-50"
            to="/login"
          >
            Entrar
          </router-link>
          <button
            v-if="authed"
            class="rounded border border-slate-300 bg-white px-3 py-1 text-sm font-semibold hover:bg-slate-50"
            type="button"
            @click="onLogout"
          >
            Sair
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-6">
      <router-view />
    </main>
  </div>
</template>
