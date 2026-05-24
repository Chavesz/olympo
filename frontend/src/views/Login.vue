<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { setAuth } from '../services/auth'
import { loadUsers } from '../services/mockDb'

const route = useRoute()
const router = useRouter()

const email = ref('')
const senha = ref('')
const showSenha = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const hasError = computed(() => Boolean(errorMessage.value))

const redirectTo = computed(() => {
  const raw = route.query.redirect
  if (typeof raw === 'string' && raw.startsWith('/')) return raw
  return ''
})

const defaultRedirect = computed(() => {
  const normalizedEmail = email.value.trim().toLowerCase()
  const user = loadUsers().find((u) => String(u.email).toLowerCase() === normalizedEmail)
  if (user?.role === 'admin') return '/admin'
  if (user?.role === 'aluno') return '/aluno'
  if (user?.role === 'instrutor') return '/profissional'
  return '/dashboard'
})

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

    const token = 'dev-token'
    const normalizedEmail = email.value.trim().toLowerCase()
    const user = loadUsers().find((u) => String(u.email).toLowerCase() === normalizedEmail)
    if (!user) {
      errorMessage.value = 'Usuário ou senha incorretos. Tente novamente.'
      return
    }

    setAuth({ token, role: user.role, email: user.email, userId: user.id })

    const fallback =
      user.role === 'admin' ? '/admin' : user.role === 'aluno' ? '/aluno' : user.role === 'instrutor' ? '/profissional' : '/dashboard'
    await router.push(redirectTo.value || fallback)
  } catch {
    errorMessage.value = 'Usuário ou senha incorretos. Tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="mx-auto flex min-h-[72vh] w-full items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl shadow-black/30 sm:p-7">
        <div class="text-center">
          <div class="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-sm font-extrabold text-white">
            O
          </div>
          <div class="mt-3 text-sm font-semibold text-slate-200">Olympo</div>
        </div>

        <header class="mt-5 space-y-1 text-center">
          <h1 class="text-2xl font-bold tracking-tight text-white">Acesse sua conta</h1>
          <p class="text-sm text-slate-300">Entre para acessar seu painel.</p>
        </header>

        <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
          <label class="block space-y-1">
            <span class="text-sm font-medium text-slate-200">Nome de usuário</span>
            <input
              v-model="email"
              class="w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-emerald-400/50 placeholder:text-slate-500 focus:ring-2"
              :class="hasError ? 'border-rose-700' : 'border-slate-800'"
              type="text"
              autocomplete="username"
              inputmode="email"
              placeholder="seuemail@exemplo.com"
              :disabled="isSubmitting"
            />
          </label>

          <label class="block space-y-1">
            <span class="text-sm font-medium text-slate-200">Senha</span>
            <div class="relative">
              <input
                v-model="senha"
                class="w-full rounded-lg border bg-slate-900 py-2 pl-3 pr-12 text-sm text-slate-50 outline-none ring-emerald-400/50 placeholder:text-slate-500 focus:ring-2"
                :class="hasError ? 'border-rose-700' : 'border-slate-800'"
                :type="showSenha ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
                :disabled="isSubmitting"
              />
              <button
                class="absolute inset-y-0 right-2 inline-flex items-center rounded px-2 text-xs font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-60"
                type="button"
                :disabled="isSubmitting"
                @click="showSenha = !showSenha"
              >
                {{ showSenha ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
          </label>

          <div
            v-if="errorMessage"
            class="rounded-lg border border-rose-700 bg-rose-950 px-3 py-2 text-sm text-rose-100"
            role="alert"
            aria-live="polite"
          >
            {{ errorMessage }}
          </div>

          <button
            class="inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
            type="submit"
            :disabled="isSubmitting"
          >
            <span v-if="!isSubmitting">Entrar</span>
            <span v-else>Entrando...</span>
          </button>

          <p class="text-center text-xs text-slate-300">
            Não tem acesso? Solicite suas credenciais ao administrador da sua academia.
          </p>
        </form>
      </div>
    </div>
  </section>
</template>
