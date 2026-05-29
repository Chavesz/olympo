<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import logo from '../assets/logomarca-olympo-28052026 (1).png'

const route = useRoute()
const isLogin = computed(() => route.name === 'login')
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-50">
    <header class="fixed inset-x-0 top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <router-link class="inline-flex items-center gap-3" to="/">
          <img :src="logo" alt="Olympo" class="h-10 w-10 rounded-lg object-contain" />
          <div class="leading-tight">
            <div class="text-sm font-extrabold uppercase tracking-wide text-white">Olympo</div>
            <div class="text-[11px] text-slate-400">Gestão de academias</div>
          </div>
        </router-link>

        <router-link
          v-if="!isLogin"
          class="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-950 shadow-md shadow-amber-400/20 hover:bg-amber-300"
          to="/login"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
          </svg>
          Login
        </router-link>

        <span
          v-else
          class="inline-flex cursor-default items-center gap-2 rounded-xl border border-white/20 bg-slate-900/80 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-300"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
          </svg>
          Login
        </span>
      </div>
    </header>

    <main class="pt-14">
      <router-view />
    </main>

    <footer v-if="!isLogin" class="border-t border-slate-800 bg-slate-950">
      <div class="mx-auto max-w-6xl px-4 py-12">
        <div class="grid gap-8 md:grid-cols-3">
          <div class="space-y-4">
            <div class="inline-flex items-center gap-3">
              <img :src="logo" alt="" class="h-10 w-10 rounded-lg object-contain" />
              <div>
                <div class="text-sm font-extrabold uppercase tracking-wide text-white">Olympo</div>
                <div class="text-[11px] text-slate-400">Gestão de academias</div>
              </div>
            </div>
            <p class="max-w-xs text-sm leading-relaxed text-slate-300">
              Sistema web para gestão de academias, com painéis por perfil, operações do dia a dia e estrutura pronta
              para evoluir com sua operação.
            </p>
          </div>

          <div class="space-y-3 text-sm text-slate-300">
            <div class="text-xs font-bold uppercase tracking-wider text-amber-400">Contato</div>
            <div>WhatsApp: (83) 99999-9999</div>
            <div>E-mail: contato@olympo.dev</div>
            <div>João Pessoa — PB</div>
          </div>

          <div class="space-y-3 text-sm text-slate-300">
            <div class="text-xs font-bold uppercase tracking-wider text-amber-400">Redes</div>
            <div>Instagram</div>
            <div>Facebook</div>
            <div>TikTok</div>
          </div>
        </div>

        <div class="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © {{ new Date().getFullYear() }} Olympo. Acesso ao sistema mediante credenciais fornecidas pela sua academia.
        </div>
      </div>
    </footer>
  </div>
</template>
