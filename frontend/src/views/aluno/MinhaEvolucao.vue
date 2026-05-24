<script setup>
import { computed } from 'vue'
import { getEmail } from '../../services/auth'
import { loadAlunos } from '../../services/mockDb'
import { loadEvaluations } from '../../services/evaluations'

const email = computed(() => getEmail())
const aluno = computed(() => {
  const normalized = String(email.value ?? '').toLowerCase()
  return loadAlunos().find((a) => String(a.email).toLowerCase() === normalized) ?? null
})

const medidas = computed(() => {
  if (!aluno.value) return []
  const evals = loadEvaluations(aluno.value.id)
  return evals
    .slice()
    .sort((a, b) => String(a.data).localeCompare(String(b.data)))
    .map((e) => ({ data: e.data, peso: e.peso, gordura: e.gordura }))
})

const weights = computed(() => medidas.value.map((m) => m.peso))
const minW = computed(() => Math.min(...weights.value))
const maxW = computed(() => Math.max(...weights.value))

const points = computed(() => {
  if (medidas.value.length === 0) return ''
  const w = 260
  const h = 80
  const pad = 8
  const span = maxW.value - minW.value || 1
  return medidas.value
    .map((m, idx) => {
      const x = pad + (idx * (w - pad * 2)) / Math.max(1, medidas.value.length - 1)
      const y = pad + (h - pad * 2) * (1 - (m.peso - minW.value) / span)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})

function fmtDate(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(d)
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Minha evolução</h1>
      <p class="text-sm text-slate-700">Medidas registradas pelo profissional (somente leitura).</p>
    </header>

    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-semibold text-slate-900">Peso (kg)</div>
          <div class="text-sm text-slate-700">Evolução mensal</div>
        </div>
        <div class="text-xs text-slate-500">placeholder</div>
      </div>

      <div class="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3">
        <svg viewBox="0 0 260 80" class="h-24 w-full">
          <polyline :points="points" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" />
        </svg>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">Histórico</div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">Data</th>
              <th class="px-4 py-3">Peso</th>
              <th class="px-4 py-3">% Gordura</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="m in medidas" :key="m.data">
              <td class="px-4 py-3 font-semibold text-slate-900">{{ fmtDate(m.data) }}</td>
              <td class="px-4 py-3 text-slate-700">{{ m.peso.toFixed(1) }} kg</td>
              <td class="px-4 py-3 text-slate-700">{{ m.gordura.toFixed(1) }}%</td>
            </tr>
            <tr v-if="medidas.length === 0">
              <td class="px-4 py-8 text-center text-sm text-slate-700" colspan="3">Sem avaliações registradas.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
