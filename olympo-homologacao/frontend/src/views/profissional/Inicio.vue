<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchAlunos } from '../../services/data'
import { fetchAulas, fetchComunicados, fetchEventos } from '../../services/portalData'

const alunos = ref([])
const eventos = ref([])
const aulas = ref([])
const comunicados = ref([])

onMounted(async () => {
  const [a, e, au, c] = await Promise.all([
    fetchAlunos(),
    fetchEventos(),
    fetchAulas(),
    fetchComunicados(),
  ])
  alunos.value = a
  eventos.value = e
  aulas.value = au
  comunicados.value = c
})

const alunosAtivos = computed(() => alunos.value.filter((a) => a.status === 'ativo').length)

const eventosAbertos = computed(() => {
  const now = new Date().toISOString().slice(0, 10)
  return eventos.value.filter((e) => e.data >= now).length
})

const aulasSemana = computed(() =>
  aulas.value.reduce((acc, m) => acc + (Array.isArray(m.slots) ? m.slots.length : 0), 0),
)

const comunicadosRecentes = computed(() => comunicados.value.slice(0, 3))
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Início</h1>
      <p class="text-sm text-slate-700">Central de visão rápida do que está acontecendo na unidade.</p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Alunos ativos</div>
        <div class="mt-2 text-3xl font-bold text-slate-900">{{ alunosAtivos }}</div>
        <div class="mt-1 text-sm text-slate-700">Total na unidade</div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Eventos abertos</div>
        <div class="mt-2 text-3xl font-bold text-slate-900">{{ eventosAbertos }}</div>
        <div class="mt-1 text-sm text-slate-700">Com inscrições em andamento</div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Aulas da semana</div>
        <div class="mt-2 text-3xl font-bold text-slate-900">{{ aulasSemana }}</div>
        <div class="mt-1 text-sm text-slate-700">Slots cadastrados</div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Comunicados recentes</div>
        <div class="mt-2 text-3xl font-bold text-slate-900">{{ comunicadosRecentes.length }}</div>
        <div class="mt-1 text-sm text-slate-700">Publicados</div>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">Comunicados</div>
        <ul class="divide-y divide-slate-200">
          <li v-for="c in comunicadosRecentes" :key="c.id" class="px-4 py-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-sm font-semibold text-slate-900">{{ c.titulo }}</div>
                <div class="mt-1 text-sm text-slate-700 line-clamp-2">{{ c.texto }}</div>
              </div>
              <div class="text-xs text-slate-500">{{ c.data }}</div>
            </div>
          </li>
          <li v-if="comunicadosRecentes.length === 0" class="px-4 py-6 text-sm text-slate-700">Sem comunicados.</li>
        </ul>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="flex items-center justify-between">
          <div class="text-sm font-semibold text-slate-900">Resumo</div>
          <div class="text-xs text-slate-500">placeholder</div>
        </div>
        <div class="mt-4 grid h-56 place-items-center rounded-lg border border-dashed border-slate-300">
          <div class="text-center">
            <div class="text-sm font-semibold text-slate-900">Área reservada</div>
            <div class="mt-1 text-sm text-slate-700">Pode virar gráfico/relatório.</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
