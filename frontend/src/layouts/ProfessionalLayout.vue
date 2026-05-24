<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clearAuth, getEmail, getUserId } from '../services/auth'
import { loadInstrutores } from '../services/mockDb'

const route = useRoute()
const router = useRouter()

const isMenuOpen = ref(false)
const isProfileOpen = ref(false)

const email = computed(() => getEmail())
const userId = computed(() => getUserId())

const instrutor = computed(() => {
  const normalizedEmail = String(email.value ?? '').toLowerCase()
  return loadInstrutores().find((i) => String(i.email).toLowerCase() === normalizedEmail) ?? null
})

const nome = computed(() => instrutor.value?.nome ?? 'Profissional')
const cargo = computed(() => 'Instrutor')

const initials = computed(() => {
  const parts = String(nome.value).trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? 'P'
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return `${first}${last}`.toUpperCase()
})

const links = [
  { label: 'Início', to: '/profissional' },
  { label: 'Gerenciar Alunos', to: '/profissional/alunos' },
  { label: 'Ficha do Aluno', to: '/profissional/alunos' },
  { label: 'Gerenciar Treinos', to: '/profissional/treinos' },
  { label: 'Evolução dos Alunos', to: '/profissional/evolucao' },
  { label: 'Gerenciar Planos', to: '/profissional/planos' },
  { label: 'Gerenciar Eventos', to: '/profissional/eventos' },
  { label: 'Gerenciar Aulas Coletivas', to: '/profissional/aulas' },
  { label: 'Comunicados', to: '/profissional/comunicados' },
  { label: 'Inscrições', to: '/profissional/inscricoes' },
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

        <div class="flex items-center gap-2">
          <div class="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-sm font-extrabold text-white">
            O
          </div>
          <div class="text-sm font-semibold">Olympo</div>
        </div>

        <div class="relative">
          <button
            class="inline-flex h-10 items-center gap-2 rounded-full bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800"
            type="button"
            aria-label="Abrir menu do perfil"
            @click="isProfileOpen = !isProfileOpen"
          >
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10">{{ initials }}</span>
            <span class="hidden sm:inline">{{ cargo }}</span>
          </button>

          <div
            v-if="isProfileOpen"
            class="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            <div class="px-3 py-2">
              <div class="text-sm font-semibold text-slate-900">{{ nome }}</div>
              <div class="text-xs text-slate-600">{{ email }}</div>
              <div v-if="userId" class="mt-1 text-[11px] text-slate-500">{{ userId }}</div>
            </div>
            <div class="border-t border-slate-200">
              <button
                class="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
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
                <div
                  class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white"
                >
                  {{ initials }}
                </div>
                <div>
                  <div class="text-sm font-semibold text-slate-900">{{ nome }}</div>
                  <div class="text-xs text-slate-600">{{ cargo }}</div>
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
