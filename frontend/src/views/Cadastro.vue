<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loadUsers, saveUsers } from '../services/mockDb'

const router = useRouter()

const nome = ref('')
const email = ref('')
const senha = ref('')
const confirmarSenha = ref('')
const perfil = ref('aluno')
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const canSubmit = computed(() => {
  return (
    nome.value.trim() &&
    email.value.trim() &&
    senha.value &&
    confirmarSenha.value &&
    perfil.value &&
    !isSubmitting.value
  )
})

function validate() {
  const normalizedEmail = email.value.trim().toLowerCase()
  if (!nome.value.trim()) return 'Informe seu nome.'
  if (!normalizedEmail) return 'Informe seu e-mail.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return 'Informe um e-mail válido.'
  if (!senha.value) return 'Informe sua senha.'
  if (senha.value.length < 6) return 'A senha deve ter pelo menos 6 caracteres.'
  if (senha.value !== confirmarSenha.value) return 'As senhas não coincidem.'
  if (perfil.value !== 'aluno' && perfil.value !== 'instrutor') return 'Selecione um perfil válido.'
  return ''
}

async function onSubmit() {
  if (!canSubmit.value) return
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const validationError = validate()
    if (validationError) {
      errorMessage.value = validationError
      return
    }

    const normalizedEmail = email.value.trim().toLowerCase()
    const users = loadUsers()
    const emailTaken = users.some((u) => String(u.email).toLowerCase() === normalizedEmail)
    if (emailTaken) {
      errorMessage.value = 'Este e-mail já está cadastrado.'
      return
    }

    const id = typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `u-${Date.now()}`
    const next = [
      {
        id,
        nome: nome.value.trim(),
        email: normalizedEmail,
        role: perfil.value,
        status: 'ativo',
      },
      ...users,
    ]
    saveUsers(next)

    successMessage.value = 'Cadastro realizado com sucesso. Você já pode entrar.'
    await new Promise((resolve) => setTimeout(resolve, 500))
    await router.push('/login')
  } catch {
    errorMessage.value = 'Não foi possível concluir o cadastro. Tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="mx-auto flex min-h-[72vh] w-full items-center justify-center px-4 py-10">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center">
        <div
          class="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-sm font-extrabold text-white"
        >
          O
        </div>
        <div class="mt-3 text-sm font-semibold text-slate-700">Olympo</div>
        <div class="text-xs text-slate-500">Criar conta</div>
      </div>

      <form class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" @submit.prevent="onSubmit">
        <header class="space-y-1 text-center">
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Cadastro</h1>
          <p class="text-sm text-slate-600">Registre um novo usuário (mock).</p>
        </header>

        <div
          v-if="errorMessage"
          class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
          aria-live="polite"
        >
          {{ errorMessage }}
        </div>

        <div
          v-if="successMessage"
          class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
          aria-live="polite"
        >
          {{ successMessage }}
        </div>

        <label class="block space-y-1">
          <span class="text-sm font-medium text-slate-800">Nome</span>
          <input
            v-model="nome"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
            type="text"
            autocomplete="name"
            :disabled="isSubmitting"
          />
        </label>

        <label class="block space-y-1">
          <span class="text-sm font-medium text-slate-800">E-mail</span>
          <input
            v-model="email"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
            type="email"
            autocomplete="email"
            inputmode="email"
            :disabled="isSubmitting"
          />
        </label>

        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block space-y-1">
            <span class="text-sm font-medium text-slate-800">Senha</span>
            <input
              v-model="senha"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
              type="password"
              autocomplete="new-password"
              :disabled="isSubmitting"
            />
          </label>

          <label class="block space-y-1">
            <span class="text-sm font-medium text-slate-800">Confirmar senha</span>
            <input
              v-model="confirmarSenha"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
              type="password"
              autocomplete="new-password"
              :disabled="isSubmitting"
            />
          </label>
        </div>

        <label class="block space-y-1">
          <span class="text-sm font-medium text-slate-800">Perfil</span>
          <select
            v-model="perfil"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
            :disabled="isSubmitting"
          >
            <option value="aluno">Aluno</option>
            <option value="instrutor">Instrutor</option>
          </select>
        </label>

        <button
          class="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          type="submit"
          :disabled="!canSubmit"
        >
          <span v-if="!isSubmitting">Criar conta</span>
          <span v-else>Criando...</span>
        </button>

        <div class="text-center text-sm text-slate-600">
          Já tem conta?
          <router-link class="font-semibold text-slate-900 hover:underline" to="/login">Entrar</router-link>
        </div>
      </form>
    </div>
  </section>
</template>

