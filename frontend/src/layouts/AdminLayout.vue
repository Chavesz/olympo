<script setup>
import { clearAuth } from '../services/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

async function onLogout() {
  clearAuth()
  await router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-50">
    <header class="border-b border-slate-800 bg-slate-950">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div class="flex items-center gap-3">
          <div class="text-lg font-semibold">Olympo</div>
          <div class="text-xs text-slate-400">Admin</div>
        </div>

        <nav class="flex items-center gap-3 text-sm">
          <router-link class="rounded px-2 py-1 hover:bg-slate-900" to="/dashboard">
            Dashboard
          </router-link>
          <router-link class="rounded px-2 py-1 hover:bg-slate-900" to="/admin">Painel</router-link>
          <router-link class="rounded px-2 py-1 hover:bg-slate-900" to="/admin/usuarios">
            Usuários
          </router-link>
        </nav>

        <button
          class="rounded border border-slate-700 bg-slate-900 px-3 py-1 text-sm font-semibold hover:bg-slate-800"
          type="button"
          @click="onLogout"
        >
          Sair
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-6">
      <router-view />
    </main>
  </div>
</template>
