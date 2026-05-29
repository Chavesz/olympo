<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clearAuth, getEmail, getUserId } from '../services/auth'
import { useAlunoProfile } from '../composables/useAlunoProfile'
import { loadProfilePhoto, readImageFileAsDataUrl, saveProfilePhoto } from '../services/profilePhoto'
import logo from '../assets/logomarca-olympo-28052026 (1).png'

const route = useRoute()
const router = useRouter()

const isMenuOpen = ref(false)
const isProfileOpen = ref(false)
const photoError = ref('')
const photoInputRef = ref(null)

const email = computed(() => getEmail())
const userId = computed(() => getUserId())

const { aluno } = useAlunoProfile()

const nome = computed(() => aluno.value?.nome ?? 'Aluno')
const photoKey = computed(() => userId.value || email.value || '')
const profilePhoto = ref(loadProfilePhoto(photoKey.value))

watch(photoKey, (key) => {
  profilePhoto.value = loadProfilePhoto(key)
})

const initials = computed(() => {
  const parts = String(nome.value).trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? 'A'
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return `${first}${last}`.toUpperCase()
})

function fmtDate(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(d)
}

const privateLinks = [
  { label: 'Início', to: '/aluno' },
  { label: 'Meu Perfil', to: '/aluno/meu-perfil' },
  { label: 'Meus Treinos', to: '/aluno/meus-treinos' },
  { label: 'Histórico de Treinos', to: '/aluno/historico' },
  { label: 'Minha Evolução', to: '/aluno/evolucao' },
  { label: 'Meu Plano', to: '/aluno/plano' },
  { label: 'Minhas Inscrições', to: '/aluno/inscricoes' },
]

const publicLinks = [
  { label: 'Eventos', to: '/aluno/eventos' },
  { label: 'Aulas Coletivas', to: '/aluno/aulas' },
  { label: 'Comunicados', to: '/aluno/comunicados' },
]

watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false
    isProfileOpen.value = false
  },
)

function openPhotoPicker() {
  photoError.value = ''
  photoInputRef.value?.click()
}

async function onPhotoSelected(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file || !photoKey.value) return

  try {
    photoError.value = ''
    const dataUrl = await readImageFileAsDataUrl(file)
    saveProfilePhoto(photoKey.value, dataUrl)
    profilePhoto.value = dataUrl
  } catch (err) {
    photoError.value = err.message || 'Não foi possível atualizar a foto.'
  }
}

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

        <router-link class="flex items-center gap-2" to="/aluno">
          <img :src="logo" alt="Olympo" class="h-9 w-9 rounded-lg object-contain" />
          <div class="text-sm font-semibold">Olympo</div>
        </router-link>

        <div class="relative">
          <button
            class="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-xs font-bold text-white"
            type="button"
            aria-label="Abrir menu do perfil"
            @click="isProfileOpen = !isProfileOpen"
          >
            <img v-if="profilePhoto" :src="profilePhoto" alt="" class="h-full w-full object-cover" />
            <span v-else>{{ initials }}</span>
          </button>

          <div
            v-if="isProfileOpen"
            class="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            <div class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-900 text-sm font-bold text-white">
                  <img v-if="profilePhoto" :src="profilePhoto" alt="" class="h-full w-full object-cover" />
                  <span v-else class="flex h-full w-full items-center justify-center">{{ initials }}</span>
                </div>
                <div class="min-w-0">
                  <div class="truncate text-sm font-semibold text-slate-900">{{ nome }}</div>
                  <div class="truncate text-xs text-slate-600">{{ email }}</div>
                </div>
              </div>

              <dl class="mt-3 space-y-1.5 text-xs text-slate-600">
                <div v-if="aluno?.telefone">
                  <dt class="inline font-medium text-slate-800">Telefone: </dt>
                  <dd class="inline">{{ aluno.telefone }}</dd>
                </div>
                <div v-if="aluno?.dataNascimento">
                  <dt class="inline font-medium text-slate-800">Nascimento: </dt>
                  <dd class="inline">{{ fmtDate(aluno.dataNascimento) }}</dd>
                </div>
              </dl>

              <input
                ref="photoInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onPhotoSelected"
              />
              <button
                class="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                type="button"
                @click="openPhotoPicker"
              >
                Alterar foto de perfil
              </button>
              <p v-if="photoError" class="mt-2 text-xs text-rose-600">{{ photoError }}</p>
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
                <div class="inline-flex h-10 w-10 overflow-hidden rounded-full bg-slate-900 text-xs font-bold text-white">
                  <img v-if="profilePhoto" :src="profilePhoto" alt="" class="h-full w-full object-cover" />
                  <span v-else class="flex h-full w-full items-center justify-center">{{ initials }}</span>
                </div>
                <div>
                  <div class="text-sm font-semibold text-slate-900">{{ nome }}</div>
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
            <div class="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Privado</div>
            <router-link
              v-for="l in privateLinks"
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

            <div class="my-3 border-t border-slate-200" />

            <div class="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Público</div>
            <router-link
              v-for="l in publicLinks"
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
