<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isLogin = computed(() => route.name === 'login')
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-50">
    <header class="fixed inset-x-0 top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <router-link class="inline-flex items-center gap-2" to="/">
          <div class="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-sm font-extrabold text-white">
            O
          </div>
          <div class="leading-tight">
            <div class="text-sm font-semibold">Olympo</div>
            <div class="text-[11px] text-slate-400">Academias</div>
          </div>
        </router-link>

        <router-link
          v-if="!isLogin"
          class="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
          to="/login"
        >
          Login
        </router-link>

        <span
          v-else
          class="inline-flex cursor-not-allowed items-center rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-slate-300"
        >
          Login
        </span>
      </div>
    </header>

    <main class="pt-14">
      <router-view />
    </main>

    <footer class="border-t border-slate-800 bg-slate-950">
      <div class="mx-auto max-w-6xl px-4 py-10">
        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-3">
            <div class="inline-flex items-center gap-2">
              <div class="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-sm font-extrabold text-white">
                O
              </div>
              <div class="text-sm font-semibold">Olympo</div>
            </div>
            <p class="max-w-prose text-sm text-slate-300">
              Ainda não é aluno? Faça sua inscrição presencialmente na recepção de uma de nossas unidades.
            </p>
          </div>

          <div class="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            <div class="space-y-2">
              <div class="text-xs font-semibold uppercase tracking-wide text-slate-400">Contato</div>
              <div>WhatsApp: (11) 90000-0000</div>
              <div>E-mail: contato@olympo.dev</div>
            </div>
            <div class="space-y-2">
              <div class="text-xs font-semibold uppercase tracking-wide text-slate-400">Redes</div>
              <div>Instagram: @olympo</div>
              <div>Facebook: /olympo</div>
            </div>
          </div>
        </div>

        <div class="mt-8 text-xs text-slate-500">© {{ new Date().getFullYear() }} Olympo. Todos os direitos reservados.</div>
      </div>
    </footer>
  </div>
</template>

