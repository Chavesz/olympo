<script setup>
import hero from '../assets/hero.png'

function scrollToUnidades() {
  const el = document.getElementById('unidades')
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const services = [
  { title: 'Musculação', desc: 'Área completa com equipamentos modernos.' },
  { title: 'Aulas coletivas', desc: 'Spinning, funcional e muito mais.' },
  { title: 'Acompanhamento', desc: 'Profissionais certificados ao seu lado.' },
  { title: 'Nutrição', desc: 'Orientação para resultados sustentáveis.' },
]

const diferenciais = [
  'Equipamentos modernos e manutenção constante',
  'Profissionais certificados e atendimento humanizado',
  'Ambiente climatizado e higienização diária',
  'Planos flexíveis e suporte ao aluno',
]

const eventos = [
  { title: 'Desafio 30 dias', date: '10/06', desc: 'Treinos guiados e metas semanais.', img: hero },
  { title: 'Aulão aberto', date: '22/06', desc: 'Funcional e HIIT para todos os níveis.', img: hero },
  { title: 'Semana da saúde', date: '01/07', desc: 'Palestras e avaliações físicas.', img: hero },
]

const unidades = [
  {
    id: 'u-1',
    nome: 'Unidade Centro',
    endereco: 'Av. Principal, 123 — Centro',
    horario: 'Seg–Sex 06:00–22:00 • Sáb 08:00–14:00',
    whatsapp: '(11) 90000-0000',
    planos: ['Mensal: R$ 119,90', 'Anual: R$ 1.199,00'],
    img: hero,
  },
  {
    id: 'u-2',
    nome: 'Unidade Norte',
    endereco: 'Rua das Flores, 456 — Zona Norte',
    horario: 'Seg–Sex 06:00–22:00 • Sáb 08:00–14:00',
    whatsapp: '(11) 90000-0001',
    planos: ['Mensal: R$ 129,90', 'Anual: R$ 1.299,00'],
    img: hero,
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
            Evolua seu corpo. Fortaleça sua mente. Treine com propósito.
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
              @click="scrollToUnidades"
            >
              Conheça nossas unidades
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-12">
      <header class="space-y-2">
        <h2 class="text-2xl font-bold tracking-tight text-white">Serviços</h2>
        <p class="text-sm text-slate-300">Tudo o que você precisa para treinar melhor.</p>
      </header>

      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="s in services"
          :key="s.title"
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
            <div class="text-sm font-semibold text-white">{{ s.title }}</div>
          </div>
          <div class="mt-2 text-sm text-slate-300">{{ s.desc }}</div>
        </div>
      </div>
    </section>

    <section class="border-y border-slate-800 bg-slate-900/40">
      <div class="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-2 lg:items-center">
        <div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
          <img :src="hero" alt="Academia" class="h-64 w-full object-cover opacity-90 lg:h-80" />
        </div>

        <div class="space-y-4">
          <h2 class="text-2xl font-bold tracking-tight text-white">Qualidade e diferenciais</h2>
          <ul class="space-y-2 text-sm text-slate-300">
            <li v-for="d in diferenciais" :key="d" class="flex items-start gap-2">
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
        <h2 class="text-2xl font-bold tracking-tight text-white">Eventos</h2>
        <p class="text-sm text-slate-300">Programação informativa para nossos alunos.</p>
      </header>

      <div class="mt-6 grid gap-4 md:grid-cols-3">
        <article
          v-for="e in eventos"
          :key="e.title"
          class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900"
        >
          <img :src="e.img" alt="" class="h-36 w-full object-cover opacity-80" />
          <div class="p-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-white">{{ e.title }}</h3>
              <span class="text-xs font-semibold text-emerald-200">{{ e.date }}</span>
            </div>
            <p class="mt-2 text-sm text-slate-300">{{ e.desc }}</p>
          </div>
        </article>
      </div>
    </section>

    <section id="unidades" class="mx-auto max-w-6xl px-4 py-12">
      <header class="space-y-2">
        <h2 class="text-2xl font-bold tracking-tight text-white">Unidades</h2>
        <p class="text-sm text-slate-300">Encontre a unidade mais próxima e escolha seu plano.</p>
      </header>

      <div class="mt-6 space-y-4">
        <article
          v-for="u in unidades"
          :key="u.id"
          class="grid overflow-hidden rounded-xl border border-slate-800 bg-slate-900 lg:grid-cols-3"
        >
          <div class="lg:col-span-1">
            <img :src="u.img" :alt="u.nome" class="h-48 w-full object-cover opacity-90 lg:h-full" />
          </div>
          <div class="space-y-3 p-4 lg:col-span-2">
            <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h3 class="text-lg font-semibold text-white">{{ u.nome }}</h3>
              <span class="text-xs text-slate-400">Planos: {{ u.planos[0] }}</span>
            </div>

            <ul class="space-y-2 text-sm text-slate-300">
              <li class="flex items-start gap-2">
                <span class="mt-0.5 text-emerald-200">•</span>
                <span><span class="font-semibold text-white">Endereço:</span> {{ u.endereco }}</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-0.5 text-emerald-200">•</span>
                <span><span class="font-semibold text-white">Horário:</span> {{ u.horario }}</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-0.5 text-emerald-200">•</span>
                <span><span class="font-semibold text-white">WhatsApp:</span> {{ u.whatsapp }}</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-0.5 text-emerald-200">•</span>
                <span class="space-y-1">
                  <span class="block font-semibold text-white">Planos:</span>
                  <span v-for="p in u.planos" :key="p" class="block">{{ p }}</span>
                </span>
              </li>
            </ul>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
