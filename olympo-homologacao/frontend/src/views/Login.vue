<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { setAuth } from '../services/auth'
import { api } from '../services/api'
import heroBg from '../assets/photo-1581009146145-b5ef050c2e1e.jpg'

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

function validate() {
  const normalizedEmail = email.value.trim().toLowerCase()
  if (!normalizedEmail) return 'Informe seu e-mail.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail))
    return 'Informe um e-mail válido.'
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

    const { token, user } = await api.post('/auth/login', {
      email: email.value.trim().toLowerCase(),
      senha: senha.value,
    })

    setAuth({ token, role: user.role, email: user.email, userId: user.id })

    const fallback =
      user.role === 'admin'
        ? '/admin'
        : user.role === 'aluno'
          ? '/aluno'
          : user.role === 'instrutor'
            ? '/profissional'
            : '/dashboard'
    await router.push(redirectTo.value || fallback)
  } catch (err) {
    errorMessage.value = err.message || 'Usuário ou senha incorretos. Tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-hidden px-4 py-6">
    <div class="absolute inset-0">
      <img :src="heroBg" alt="" class="h-full w-full object-cover" />
      <div class="absolute inset-0 bg-slate-950/80" />
      <div
        class="absolute inset-0 opacity-35"
        style="
          background-image: repeating-linear-gradient(
            -55deg,
            transparent,
            transparent 12px,
            rgba(255, 255, 255, 0.04) 12px,
            rgba(255, 255, 255, 0.04) 13px
          );
        "
      />
    </div>

    <div
      class="relative w-full max-w-sm rounded-xl border border-white/15 bg-slate-900/45 p-6 shadow-xl shadow-black/40 backdrop-blur-xl"
    >
      <div class="flex justify-center">
        <div
          class="grid h-11 w-11 place-items-center rounded-full border-2 border-amber-400/80 bg-amber-400/10 text-amber-400"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 3l7 4v5c0 4.2-2.9 7.8-7 9-4.1-1.2-7-4.8-7-9V7l7-4z"
            />
          </svg>
        </div>
      </div>

      <header class="mt-4 space-y-1 text-center">
        <h1 class="text-xl font-extrabold uppercase tracking-wide text-amber-400">
          Acesse sua conta
        </h1>
        <p class="text-xs text-slate-200">Entre para acessar o sistema Olympo.</p>
      </header>

      <form class="mt-5 space-y-3.5" @submit.prevent="onSubmit">
        <label class="block space-y-1">
          <span class="text-xs font-medium text-white">E-mail</span>
          <input
            v-model="email"
            class="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/30 disabled:opacity-60"
            :class="hasError ? 'border-rose-500/60' : ''"
            type="email"
            autocomplete="username"
            inputmode="email"
            placeholder="Digite seu e-mail"
            :disabled="isSubmitting"
          />
        </label>

        <label class="block space-y-1">
          <span class="text-xs font-medium text-white">Senha</span>
          <div class="relative">
            <input
              v-model="senha"
              class="w-full rounded-lg border border-white/10 bg-slate-950/60 py-2 pl-3 pr-10 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/30 disabled:opacity-60"
              :class="hasError ? 'border-rose-500/60' : ''"
              :type="showSenha ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Digite sua senha"
              :disabled="isSubmitting"
            />
            <button
              class="absolute inset-y-0 right-0 inline-flex w-9 items-center justify-center text-slate-400 hover:text-slate-200 disabled:opacity-60"
              type="button"
              :aria-label="showSenha ? 'Ocultar senha' : 'Mostrar senha'"
              :disabled="isSubmitting"
              @click="showSenha = !showSenha"
            >
              <svg v-if="showSenha" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.5 10.7A3 3 0 0012 15a3 3 0 002.2-1M6.7 6.8C4.6 8.2 3 10.5 3 12s3 7 9 7c1.5 0 2.9-.4 4.1-1M14 9.3V7a2 2 0 10-4 0" />
              </svg>
              <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </label>

        <div
          v-if="errorMessage"
          class="rounded-lg border border-rose-500/40 bg-rose-950/50 px-3 py-2 text-xs text-rose-100"
          role="alert"
          aria-live="polite"
        >
          {{ errorMessage }}
        </div>

        <button
          class="inline-flex w-full items-center justify-center rounded-lg bg-amber-400 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-950 shadow-md shadow-amber-400/20 hover:bg-amber-300 disabled:opacity-60"
          type="submit"
          :disabled="isSubmitting"
        >
          <span v-if="!isSubmitting">Entrar</span>
          <span v-else>Entrando...</span>
        </button>

        <p class="text-center text-[11px] leading-relaxed text-slate-400">
          Não tem acesso? Solicite suas credenciais ao administrador da sua academia.
        </p>
      </form>
    </div>
  </section>
</template>
