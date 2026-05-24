<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { setAuth } from '../services/auth'

const router = useRouter()

const email = ref('')
const senha = ref('')
const isSubmitting = ref(false)

async function onSubmit() {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    const role = email.value.toLowerCase().includes('admin') ? 'admin' : 'user'
    setAuth({ token: 'dev-token', role })

    await router.push('/dashboard')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="mx-auto max-w-md space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Login</h1>
      <p class="text-sm text-slate-700">A autenticação via JWT será conectada ao back-end.</p>
    </header>

    <form class="space-y-4 rounded-lg border border-slate-200 bg-white p-4" @submit.prevent="onSubmit">
      <label class="block space-y-1">
        <span class="text-sm font-medium text-slate-800">E-mail</span>
        <input
          v-model="email"
          class="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          type="email"
          autocomplete="email"
          required
        />
      </label>

      <label class="block space-y-1">
        <span class="text-sm font-medium text-slate-800">Senha</span>
        <input
          v-model="senha"
          class="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          type="password"
          autocomplete="current-password"
          required
        />
      </label>

      <button
        class="inline-flex w-full items-center justify-center rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        type="submit"
        :disabled="isSubmitting"
      >
        Entrar
      </button>

      <div class="rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
        <div class="font-semibold text-slate-900">Modo dev</div>
        <div>Use um e-mail contendo “admin” para entrar como administrador.</div>
      </div>
    </form>
  </section>
</template>
