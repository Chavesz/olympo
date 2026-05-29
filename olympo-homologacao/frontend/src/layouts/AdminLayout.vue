<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clearAuth, getEmail } from '../services/auth'
import logo from '../assets/logomarca-olympo-28052026 (1).png'

const route = useRoute()
const router = useRouter()

const isMenuOpen = ref(false)
const isProfileOpen = ref(false)

const email = computed(() => getEmail())
const initials = computed(() => 'AD')

const links = [
  { label: 'Painel', to: '/admin' },
  { label: 'Gerenciar usuários', to: '/admin/usuarios' },
  { label: 'Alunos', to: '/admin/alunos' },
  { label: 'Instrutores', to: '/admin/instrutores' },
  { label: 'Fichas de treino', to: '/admin/fichas' },
  { label: 'Unidades', to: '/admin/unidades' },
  { label: 'Equipamentos', to: '/admin/equipamentos' },
  { label: 'Relatórios', to: '/admin/relatorios' },
]

watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false
    isProfileOpen.value = false
  },
)

async function logout() {
  clearAuth()
  await router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white">
      <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100"
          type="button"
          aria-label="Abrir menu"
          @click="isMenuOpen = true"
        >
          <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <router-link class="flex items-center gap-2" to="/admin">
          <img :src="logo" alt="Olympo" class="h-9 w-9 rounded-lg object-contain" />
          <div class="leading-tight">
            <div class="text-sm font-semibold">Olympo</div>
            <div class="text-[11px] text-slate-500">Administrador</div>
          </div>
        </router-link>

        <div class="relative">
          <button
            class="inline-flex h-10 items-center gap-2 rounded-full bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800"
            type="button"
            aria-label="Abrir menu do perfil"
            @click="isProfileOpen = !isProfileOpen"
          >
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10">{{ initials }}</span>
            <span class="hidden sm:inline">Admin</span>
          </button>

          <div
            v-if="isProfileOpen"
            class="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            <div class="px-4 py-3">
              <div class="text-sm font-semibold text-slate-900">Administrador</div>
              <div class="text-xs text-slate-600">{{ email }}</div>
            </div>
            <div class="border-t border-slate-200">
              <button
                class="flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                type="button"
                @click="logout"
              >
                <span>Sair</span>
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 pb-10 pt-20">
      <router-view />
    </main>

    <teleport to="body">
      <div v-if="isMenuOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/50" @click="isMenuOpen = false" />

        <aside class="relative h-full w-full max-w-sm bg-white shadow-xl" role="dialog" aria-modal="true">
          <div class="border-b border-slate-200 p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {{ initials }}
                </div>
                <div>
                  <div class="text-sm font-semibold text-slate-900">Administrador</div>
                  <div class="text-xs text-slate-600">{{ email }}</div>
                </div>
              </div>
              <button
                class="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100"
                type="button"
                aria-label="Fechar menu"
                @click="isMenuOpen = false"
              >
                <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <nav class="p-2">
            <router-link
              v-for="l in links"
              :key="l.to"
              class="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              :to="l.to"
              @click="isMenuOpen = false"
            >
              <span>{{ l.label }}</span>
              <svg viewBox="0 0 24 24" class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </nav>
        </aside>
      </div>
    </teleport>
  </div>
</template>
