<script setup>
import hero from '../assets/hero.png'

function scrollToPlanos() {
  const el = document.getElementById('planos')
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const modules = [
  { title: 'Cadastros', desc: 'Gestão de alunos, instrutores e usuários com perfis.' },
  { title: 'Treinos', desc: 'Criação de fichas e treinos por aluno, com histórico.' },
  { title: 'Eventos e aulas', desc: 'Inscrições e controle de vagas em tempo real.' },
  { title: 'Comunicados', desc: 'Publicações rápidas para toda a unidade.' },
]

const highlights = [
  'Perfis de acesso: Administrador, Profissional e Aluno',
  'CRUD completo com filtros, modais e validações',
  'Fluxos conectados entre painéis (profissional → aluno)',
  'Estrutura pronta para integração com JWT + API REST',
]

const flow = [
  { title: 'Admin configura', desc: 'Usuários, permissões e visão geral.' },
  { title: 'Profissional gerencia', desc: 'Alunos, treinos, eventos, aulas e comunicados.' },
  { title: 'Aluno acompanha', desc: 'Treinos, histórico, evolução, inscrições e avisos.' },
]

const pricing = [
  {
    id: 'p-essencial',
    name: 'Essencial',
    price: 'R$ 199/mês',
    badge: 'Para começar',
    features: ['1 unidade', 'Cadastros + treinos', 'Eventos e comunicados'],
  },
  {
    id: 'p-pro',
    name: 'Pro',
    price: 'R$ 399/mês',
    badge: 'Recomendado',
    features: ['Até 3 unidades', 'Relatórios e métricas', 'Suporte prioritário'],
  },
  {
    id: 'p-enterprise',
    name: 'Enterprise',
    price: 'Sob consulta',
    badge: 'Escala',
    features: ['Multiunidade', 'Integrações', 'SLA e suporte dedicado'],
  },
]
</script>

<template>
  <div>
    <section class="relative overflow-hidden">
      <div class="absolute inset-0">
        <img :src="hero" alt="" class="h-full w-full object-cover opacity-30" />
        <div class="absolute inset-0 bg-slate-950/70" />
      </div>

      <div class="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div class="mx-auto max-w-2xl text-center">
          <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">OLYMPOS</h1>
          <p class="mt-3 text-sm text-slate-200 sm:text-base">
            Sistema web para gestão de academias, com painéis por perfil, CRUD e segurança.
          </p>

          <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <router-link
              class="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
              to="/login"
            >
              Login
            </router-link>
            <button
              class="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              type="button"
              @click="scrollToPlanos"
            >
              Ver planos do sistema
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-12">
      <header class="space-y-2">
        <h2 class="text-2xl font-bold tracking-tight text-white">Módulos do Olympo</h2>
        <p class="text-sm text-slate-300">Base completa para gestão de academias.</p>
      </header>

      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="m in modules"
          :key="m.title"
          class="rounded-xl border border-slate-800 bg-slate-900 p-4"
        >
          <div class="flex items-center gap-2">
            <div class="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/15 text-emerald-200">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12h6m-7 6h8a3 3 0 003-3V9a3 3 0 00-3-3H8a3 3 0 00-3 3v6a3 3 0 003 3z"
                />
              </svg>
            </div>
            <div class="text-sm font-semibold text-white">{{ m.title }}</div>
          </div>
          <div class="mt-2 text-sm text-slate-300">{{ m.desc }}</div>
        </div>
      </div>
    </section>

    <section class="border-y border-slate-800 bg-slate-900/40">
      <div class="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-2 lg:items-center">
        <div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
          <img :src="hero" alt="Sistema Olympo" class="h-64 w-full object-cover opacity-90 lg:h-80" />
        </div>

        <div class="space-y-4">
          <h2 class="text-2xl font-bold tracking-tight text-white">Diferenciais</h2>
          <ul class="space-y-2 text-sm text-slate-300">
            <li v-for="d in highlights" :key="d" class="flex items-start gap-2">
              <span class="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-200">
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>{{ d }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-12">
      <header class="space-y-2">
        <h2 class="text-2xl font-bold tracking-tight text-white">Como o sistema se organiza</h2>
        <p class="text-sm text-slate-300">Fluxo claro por perfil de acesso.</p>
      </header>

      <div class="mt-6 grid gap-4 md:grid-cols-3">
        <article
          v-for="c in flow"
          :key="c.title"
          class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900"
        >
          <img :src="hero" alt="" class="h-36 w-full object-cover opacity-80" />
          <div class="p-4">
            <h3 class="text-sm font-semibold text-white">{{ c.title }}</h3>
            <p class="mt-2 text-sm text-slate-300">{{ c.desc }}</p>
          </div>
        </article>
      </div>
    </section>

    <section id="planos" class="mx-auto max-w-6xl px-4 py-12">
      <header class="space-y-2">
        <h2 class="text-2xl font-bold tracking-tight text-white">Planos</h2>
        <p class="text-sm text-slate-300">Escolha o plano ideal para sua academia.</p>
      </header>

      <div class="mt-6 grid gap-4 md:grid-cols-3">
        <article
          v-for="p in pricing"
          :key="p.id"
          class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900"
        >
          <div class="p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-xs font-semibold uppercase tracking-wide text-emerald-200">{{ p.badge }}</div>
                <h3 class="mt-1 text-lg font-semibold text-white">{{ p.name }}</h3>
              </div>
              <div class="text-sm font-semibold text-slate-200">{{ p.price }}</div>
            </div>

            <ul class="mt-4 space-y-2 text-sm text-slate-300">
              <li v-for="f in p.features" :key="f" class="flex items-start gap-2">
                <span class="mt-0.5 text-emerald-200">•</span>
                <span>{{ f }}</span>
              </li>
            </ul>

            <div class="mt-5">
              <router-link
                class="inline-flex w-full items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                to="/login"
              >
                Acessar o sistema
              </router-link>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
