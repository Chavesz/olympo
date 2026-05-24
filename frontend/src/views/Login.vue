<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { setAuth } from '../services/auth'

const route = useRoute()
const router = useRouter()

const email = ref('')
const senha = ref('')
const showSenha = ref(false)
const rememberMe = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')

const redirectTo = computed(() => {
  const raw = route.query.redirect
  if (typeof raw === 'string' && raw.startsWith('/')) return raw
  return '/dashboard'
})

const isDev = import.meta.env.DEV

function validate() {
  const normalizedEmail = email.value.trim().toLowerCase()
  if (!normalizedEmail) return 'Informe seu e-mail.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return 'Informe um e-mail válido.'
  if (!senha.value) return 'Informe sua senha.'
  if (senha.value.length < 6) return 'A senha deve ter pelo menos 6 caracteres.'
  return ''
}

async function onSubmit() {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    errorMessage.value = ''
    const validationError = validate()
    if (validationError) {
      errorMessage.value = validationError
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 450))

    const role = email.value.toLowerCase().includes('admin') ? 'admin' : 'user'
    const token = 'dev-token'
    setAuth({ token, role, rememberMe: rememberMe.value })

    await router.push(redirectTo.value)
  } catch {
    errorMessage.value = 'Não foi possível entrar. Tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="mx-auto flex min-h-[72vh] w-full items-center justify-center px-4 py-10">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center">
        <div class="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-sm font-extrabold text-white">
          O
        </div>
        <div class="mt-3 text-sm font-semibold text-slate-700">Olympo</div>
        <div class="text-xs text-slate-500">Gestão de Academias</div>
      </div>

      <form
        class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        @submit.prevent="onSubmit"
      >
        <header class="space-y-1 text-center">
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Entrar</h1>
          <p class="text-sm text-slate-600">Acesse seu painel com segurança.</p>
        </header>

        <div
          v-if="errorMessage"
          class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
          aria-live="polite"
        >
          {{ errorMessage }}
        </div>

        <label class="block space-y-1">
          <span class="text-sm font-medium text-slate-800">E-mail</span>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <input
              v-model="email"
              class="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none ring-slate-400 focus:ring-2"
              type="email"
              autocomplete="email"
              inputmode="email"
              placeholder="seuemail@exemplo.com"
              :disabled="isSubmitting"
            />
          </div>
        </label>

        <label class="block space-y-1">
          <span class="text-sm font-medium text-slate-800">Senha</span>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 15v2m6-7V8a6 6 0 10-12 0v2m-2 0h16a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6a2 2 0 012-2z"
                />
              </svg>
            </div>
            <input
              v-model="senha"
              class="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-12 text-sm outline-none ring-slate-400 focus:ring-2"
              :type="showSenha ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              :disabled="isSubmitting"
            />
            <button
              class="absolute inset-y-0 right-2 inline-flex items-center rounded px-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
              type="button"
              :disabled="isSubmitting"
              @click="showSenha = !showSenha"
            >
              {{ showSenha ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
        </label>

        <div class="flex items-center justify-between gap-3">
          <label class="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              v-model="rememberMe"
              class="h-4 w-4 rounded border-slate-300 text-slate-900"
              type="checkbox"
              :disabled="isSubmitting"
            />
            Manter conectado
          </label>

          <button class="text-sm font-semibold text-slate-700 hover:text-slate-900" type="button">
            Esqueci minha senha
          </button>
        </div>

        <button
          class="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          type="submit"
          :disabled="isSubmitting"
        >
          <span v-if="!isSubmitting">Entrar</span>
          <span v-else>Entrando...</span>
        </button>

        <div v-if="isDev" class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <div class="font-semibold text-slate-900">Modo dev</div>
          <div>Use um e-mail contendo “admin” para entrar como administrador.</div>
          <div class="mt-1">Redirect após login: <span class="font-semibold">{{ redirectTo }}</span></div>
        </div>
      </form>

      <div class="text-center text-xs text-slate-500">
        <span class="font-semibold text-slate-700">Olympo</span> • acesso por perfil • rotas protegidas
      </div>
    </div>
  </section>
</template>
