<script setup>
import { computed, ref } from 'vue'
import { loadUnidades } from '../services/unidades'
import heroBg from '../assets/photo-1581009146145-b5ef050c2e1e.jpg'
import imgDestaque from '../assets/photo-1517838277536-f5f99be501cd.jpg'
import imgAdmin from '../assets/photo-1517838277536-f5f99be501cd.jpg'
import imgProfissional from '../assets/photo-1534438327276-14e5300c3a48.jpg'
import imgAluno from '../assets/photo-1518611012118-696072aa579a.jpg'

const unidades = computed(() => loadUnidades())

function scrollTo(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const modulos = [
  {
    title: 'Cadastros',
    desc: 'Gestão de alunos, instrutores e usuários com perfis e permissões.',
    icon: 'users',
  },
  {
    title: 'Treinos',
    desc: 'Criação de fichas e treinos por aluno, com histórico e acompanhamento.',
    icon: 'workout',
  },
  {
    title: 'Eventos e aulas',
    desc: 'Inscrições, vagas e controle de participação em tempo real.',
    icon: 'calendar',
  },
  {
    title: 'Comunicados',
    desc: 'Publicações rápidas para toda a unidade ou grupos específicos.',
    icon: 'message',
  },
]

const diferenciais = [
  'Perfis de acesso: Administrador, Profissional e Aluno',
  'CRUD completo com filtros, modais e validações',
  'Fluxos conectados entre painéis (profissional → aluno)',
  'Estrutura pronta para integração com JWT e API REST',
]

const fluxo = [
  {
    title: 'Administrador',
    desc: 'Configura usuários, permissões e acompanha a operação da academia.',
    image: imgAdmin,
  },
  {
    title: 'Profissional',
    desc: 'Gerencia alunos, treinos, eventos, aulas coletivas e comunicados.',
    image: imgProfissional,
  },
  {
    title: 'Aluno',
    desc: 'Acessa treinos, histórico, evolução, inscrições e avisos da unidade.',
    image: imgAluno,
  },
]

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const OFFLINE = String(import.meta.env.VITE_OFFLINE || '').toLowerCase() === 'true'

const isPixOpen = ref(false)
const pixLoading = ref(false)
const pixError = ref('')
const pixQr = ref('')
const pixCopia = ref('')
const payerEmail = ref('')
const selectedPlan = ref(null)

function openPix(plan) {
  selectedPlan.value = plan
  pixError.value = ''
  pixQr.value = ''
  pixCopia.value = ''
  isPixOpen.value = true
}

function closePix() {
  isPixOpen.value = false
  pixLoading.value = false
  pixError.value = ''
  pixQr.value = ''
  pixCopia.value = ''
}

function isValidEmail(value) {
  const email = String(value ?? '').trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function createIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

async function gerarPix() {
  if (!selectedPlan.value?.amount) return
  if (OFFLINE) {
    pixError.value = 'Modo offline ativo. Desative VITE_OFFLINE para gerar Pix.'
    return
  }

  const email = String(payerEmail.value ?? '').trim().toLowerCase()
  if (!isValidEmail(email)) {
    pixError.value = 'Informe um e-mail válido.'
    return
  }

  pixLoading.value = true
  pixError.value = ''
  pixQr.value = ''
  pixCopia.value = ''

  try {
    const res = await fetch(`${API_BASE}/pagamentos/pix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': createIdempotencyKey(),
      },
      body: JSON.stringify({
        amount: selectedPlan.value.amount,
        description: `Plano Olympo — ${selectedPlan.value.name}`,
        email,
      }),
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.error || `Erro ${res.status}`)

    pixQr.value = data?.qr_code_base64 || ''
    pixCopia.value = data?.copia_e_cola || ''
    if (!pixQr.value || !pixCopia.value) throw new Error('Resposta do Pix incompleta')
  } catch (err) {
    pixError.value = err?.message || 'Falha ao gerar Pix'
  } finally {
    pixLoading.value = false
  }
}

const planos = [
  {
    id: 'essencial',
    name: 'Essencial',
    price: 'R$ 199/mês',
    amount: 199,
    badge: 'Para começar',
    features: ['1 unidade', 'Cadastros e treinos', 'Eventos e comunicados'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 399/mês',
    amount: 399,
    badge: 'Recomendado',
    features: ['Até 3 unidades', 'Relatórios e métricas', 'Suporte prioritário'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sob consulta',
    amount: null,
    badge: 'Escala',
    features: ['Multiunidade', 'Integrações personalizadas', 'SLA e suporte dedicado'],
  },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
      <div class="absolute inset-0">
        <img :src="heroBg" alt="" class="h-full w-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950/95" />
        <div
          class="absolute inset-0 opacity-40"
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
        class="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center"
      >
        <div
          class="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-slate-900/60 px-4 py-1.5 text-xs text-slate-200 backdrop-blur sm:text-sm"
        >
          <span aria-hidden="true">⚡</span>
          Software web para gestão de academias
        </div>

        <h1 class="mt-6 text-4xl font-extrabold uppercase leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          <span class="text-amber-400">Olympo</span>
        </h1>
        <p class="mt-3 text-lg font-semibold uppercase tracking-wide text-slate-100 sm:text-xl">
          Gestão inteligente para sua academia
        </p>

        <p class="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
          Centralize cadastros, treinos, eventos e comunicação em um único sistema, com painéis separados para
          administradores, profissionais e alunos.
        </p>

        <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <router-link
            to="/login"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold uppercase tracking-wide text-slate-950 shadow-lg shadow-amber-400/20 hover:bg-amber-300"
          >
            Acessar o sistema
          </router-link>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white backdrop-blur hover:bg-white/10"
            @click="scrollTo('modulos')"
          >
            Ver módulos
          </button>
        </div>
      </div>
    </section>

    <!-- Módulos -->
    <section id="modulos" class="relative overflow-hidden py-16">
      <div class="absolute inset-0">
        <img :src="heroBg" alt="" class="h-full w-full object-cover opacity-20" />
        <div class="absolute inset-0 bg-slate-950/90" />
      </div>

      <div class="relative mx-auto max-w-6xl px-4">
        <header class="text-center">
          <h2 class="text-3xl font-extrabold uppercase tracking-tight text-amber-400 sm:text-4xl">Módulos</h2>
          <p class="mt-2 text-sm text-slate-300 sm:text-base">
            Tudo que sua academia precisa para operar no dia a dia.
          </p>
        </header>

        <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="m in modulos"
            :key="m.title"
            class="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 backdrop-blur"
          >
            <div
              class="grid h-11 w-11 place-items-center rounded-xl bg-emerald-950/80 text-amber-400 ring-1 ring-emerald-800/50"
            >
              <svg v-if="m.icon === 'users'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M16 11a3 3 0 10-6 0M12 14c-4 0-6 2-6 4v1h12v-1c0-2-2-4-6-4z" />
              </svg>
              <svg v-else-if="m.icon === 'workout'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M4 10h2v4H4zM18 10h2v4h-2zM7 12h10" />
              </svg>
              <svg v-else-if="m.icon === 'calendar'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M8 7V3m8 4V3M4 11h16M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z" />
              </svg>
              <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <h3 class="mt-4 text-sm font-bold uppercase tracking-wide text-white">{{ m.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-300">{{ m.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Diferenciais -->
    <section class="relative overflow-hidden border-y border-slate-800/80 py-16">
      <div class="absolute inset-0">
        <img :src="heroBg" alt="" class="h-full w-full object-cover opacity-15" />
        <div class="absolute inset-0 bg-slate-950/92" />
      </div>

      <div class="relative mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-2 lg:items-center">
        <div class="overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
          <img :src="imgDestaque" alt="Academia utilizando o Olympo" class="h-72 w-full object-cover lg:h-96" />
        </div>

        <div class="space-y-5">
          <h2 class="text-3xl font-extrabold uppercase tracking-tight text-amber-400 sm:text-4xl">Diferenciais</h2>
          <p class="text-sm leading-relaxed text-slate-300 sm:text-base">
            O Olympo foi pensado para academias que precisam de organização, segurança e uma experiência digital
            consistente para equipe e alunos.
          </p>
          <ul class="space-y-3 text-sm text-slate-200">
            <li v-for="item in diferenciais" :key="item" class="flex items-start gap-3">
              <span
                class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Perfis de acesso -->
    <section id="perfis" class="relative overflow-hidden py-16">
      <div class="absolute inset-0">
        <img :src="heroBg" alt="" class="h-full w-full object-cover opacity-20" />
        <div class="absolute inset-0 bg-slate-950/90" />
      </div>

      <div class="relative mx-auto max-w-6xl px-4">
        <header class="text-center">
          <h2 class="text-3xl font-extrabold uppercase tracking-tight text-amber-400 sm:text-4xl">Perfis de acesso</h2>
          <p class="mt-2 text-sm text-slate-300 sm:text-base">
            Cada usuário enxerga apenas o que precisa dentro do sistema.
          </p>
        </header>

        <div class="mt-10 grid gap-6 md:grid-cols-3">
          <article
            v-for="f in fluxo"
            :key="f.title"
            class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90"
          >
            <img :src="f.image" :alt="f.title" class="h-44 w-full object-cover opacity-90" />
            <div class="p-5">
              <h3 class="text-sm font-bold uppercase tracking-wide text-white">{{ f.title }}</h3>
              <p class="mt-3 text-sm leading-relaxed text-slate-300">{{ f.desc }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Unidades (cadastro admin) -->
    <section id="unidades" class="relative overflow-hidden py-16">
      <div class="absolute inset-0">
        <img :src="heroBg" alt="" class="h-full w-full object-cover opacity-15" />
        <div class="absolute inset-0 bg-slate-950/92" />
      </div>

      <div class="relative mx-auto max-w-6xl space-y-6 px-4">
        <header class="text-center">
          <h2 class="text-3xl font-extrabold uppercase tracking-tight text-amber-400 sm:text-4xl">Nossas unidades</h2>
          <p class="mt-2 text-sm text-slate-300 sm:text-base">Conheça onde a Olympo está presente.</p>
        </header>

        <div v-for="u in unidades" :key="u.id" class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur lg:grid lg:grid-cols-[minmax(0,340px)_1fr]">
          <img v-if="u.imagem" :src="u.imagem" :alt="u.nome" class="h-56 w-full object-cover lg:h-full lg:min-h-[260px]" />
          <div class="p-6 sm:p-8">
            <h3 class="text-2xl font-extrabold uppercase tracking-tight text-amber-400">{{ u.nome }}</h3>
            <dl class="mt-5 space-y-2 text-sm text-slate-200">
              <div><dt class="inline font-semibold text-white">Endereço: </dt><dd class="inline">{{ u.endereco }}</dd></div>
              <div><dt class="inline font-semibold text-white">Funcionamento: </dt><dd class="inline">{{ u.horario }}</dd></div>
              <div><dt class="inline font-semibold text-white">WhatsApp: </dt><dd class="inline">{{ u.telefone }}</dd></div>
              <div v-if="u.planoMensal"><dt class="inline font-semibold text-white">Plano mensal: </dt><dd class="inline">{{ u.planoMensal }}</dd></div>
              <div v-if="u.planoAnual"><dt class="inline font-semibold text-white">Plano anual: </dt><dd class="inline">{{ u.planoAnual }}</dd></div>
            </dl>
            <router-link
              to="/login"
              class="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-950 hover:bg-amber-300"
            >
              Solicitar acesso
            </router-link>
          </div>
        </div>

        <p v-if="unidades.length === 0" class="text-center text-sm text-slate-400">
          Em breve novas unidades.
        </p>
      </div>
    </section>

    <!-- Planos do sistema -->
    <section id="planos" class="relative overflow-hidden py-16">
      <div class="absolute inset-0">
        <img :src="heroBg" alt="" class="h-full w-full object-cover opacity-15" />
        <div class="absolute inset-0 bg-slate-950/92" />
      </div>

      <div class="relative mx-auto max-w-6xl px-4">
        <header class="text-center">
          <h2 class="text-3xl font-extrabold uppercase tracking-tight text-amber-400 sm:text-4xl">Planos</h2>
          <p class="mt-2 text-sm text-slate-300 sm:text-base">
            Escolha o plano do Olympo ideal para o porte da sua academia.
          </p>
        </header>

        <div class="mt-10 grid gap-6 md:grid-cols-3">
          <article
            v-for="p in planos"
            :key="p.id"
            class="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur"
          >
            <div class="text-xs font-bold uppercase tracking-wider text-amber-400">{{ p.badge }}</div>
            <h3 class="mt-2 text-xl font-extrabold uppercase tracking-tight text-white">{{ p.name }}</h3>
            <p class="mt-1 text-lg font-semibold text-slate-200">{{ p.price }}</p>

            <ul class="mt-5 flex-1 space-y-2 text-sm text-slate-300">
              <li v-for="feature in p.features" :key="feature" class="flex items-start gap-2">
                <span class="mt-0.5 text-amber-400">•</span>
                <span>{{ feature }}</span>
              </li>
            </ul>

            <button
              v-if="p.amount"
              class="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
              type="button"
              @click="openPix(p)"
            >
              Pagar com Pix
            </button>
            <router-link
              v-else
              to="/login"
              class="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-white/10"
            >
              Solicitar acesso
            </router-link>
          </article>
        </div>

        <p class="mx-auto mt-8 max-w-xl text-center text-xs text-slate-500">
          O acesso ao sistema é liberado pelo administrador da sua academia. Entre em contato para contratar ou receber
          suas credenciais.
        </p>
      </div>
    </section>

    <teleport to="body">
      <div v-if="isPixOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/60" @click="closePix" />
        <div class="relative mx-auto flex min-h-full max-w-md items-center px-4 py-8">
          <div class="w-full rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl" role="dialog" aria-modal="true">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-lg font-bold">Pagamento via Pix</div>
                <div class="text-sm text-slate-700">
                  {{ selectedPlan?.name }} • R$ {{ Number(selectedPlan?.amount || 0).toFixed(2) }}
                </div>
              </div>
              <button
                class="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                type="button"
                @click="closePix"
              >
                Fechar
              </button>
            </div>

            <div class="mt-4 space-y-3">
              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">E-mail do pagador</span>
                <input
                  v-model="payerEmail"
                  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2"
                  type="email"
                  placeholder="seuemail@dominio.com"
                />
              </label>

              <button
                class="inline-flex w-full items-center justify-center rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-extrabold uppercase tracking-wider text-slate-950 hover:bg-amber-300 disabled:opacity-60"
                type="button"
                :disabled="pixLoading"
                @click="gerarPix"
              >
                <span v-if="!pixLoading">Gerar Pix</span>
                <span v-else>Gerando...</span>
              </button>

              <div v-if="pixError" class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
                {{ pixError }}
              </div>

              <div v-if="pixQr" class="space-y-3">
                <div class="text-sm font-semibold text-slate-900">Escaneie o QR Code</div>
                <img
                  :src="`data:image/jpeg;base64,${pixQr}`"
                  alt="QR Code Pix"
                  class="mx-auto h-56 w-56 rounded-lg border border-slate-200 bg-white p-2"
                />
                <div class="text-sm font-semibold text-slate-900">Ou Copia e Cola</div>
                <textarea readonly class="h-24 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900">{{ pixCopia }}</textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>
