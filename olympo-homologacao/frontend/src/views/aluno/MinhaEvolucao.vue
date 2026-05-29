<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAlunoProfile } from '../../composables/useAlunoProfile'
import { computeImc, loadMyEvaluations } from '../../services/evaluations'

const { aluno } = useAlunoProfile()
const rawMedidas = ref([])

onMounted(async () => {
  rawMedidas.value = await loadMyEvaluations()
})

const medidas = computed(() =>
  rawMedidas.value
    .slice()
    .sort((a, b) => String(a.data).localeCompare(String(b.data)))
    .map((e) => ({
      id: e.id,
      data: e.data,
      peso: e.peso,
      altura: e.altura,
      gordura: e.gordura,
      imc: computeImc(e.peso, e.altura),
      observacao: e.observacao?.trim() || '',
    })),
)

const weights = computed(() => medidas.value.map((m) => m.peso))
const minW = computed(() => (weights.value.length ? Math.min(...weights.value) : 0))
const maxW = computed(() => (weights.value.length ? Math.max(...weights.value) : 0))

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
      <p class="text-sm text-slate-700">
        Medidas registradas pelo profissional (somente leitura). Campos alinhados ao banco: peso, altura, IMC, gordura e
        observação.
      </p>
    </header>

    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm font-semibold text-slate-900">Peso (kg)</div>
          <div class="text-sm text-slate-700">Evolução ao longo das avaliações</div>
        </div>
      </div>

      <div class="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3">
        <svg v-if="medidas.length" viewBox="0 0 260 80" class="h-24 w-full">
          <polyline :points="points" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" />
        </svg>
        <p v-else class="text-center text-sm text-slate-600">Sem dados para o gráfico.</p>
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
              <th class="px-4 py-3">Altura</th>
              <th class="px-4 py-3">IMC</th>
              <th class="px-4 py-3">% Gordura</th>
              <th class="px-4 py-3">Observação</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="m in medidas" :key="m.id">
              <td class="px-4 py-3 font-semibold text-slate-900">{{ fmtDate(m.data) }}</td>
              <td class="px-4 py-3 text-slate-700">{{ m.peso.toFixed(1) }} kg</td>
              <td class="px-4 py-3 text-slate-700">{{ m.altura.toFixed(2) }} m</td>
              <td class="px-4 py-3 text-slate-700">{{ m.imc != null ? m.imc.toFixed(1) : '—' }}</td>
              <td class="px-4 py-3 text-slate-700">{{ m.gordura.toFixed(1) }}%</td>
              <td class="max-w-xs px-4 py-3 text-slate-700">{{ m.observacao || '—' }}</td>
            </tr>
            <tr v-if="medidas.length === 0">
              <td class="px-4 py-8 text-center text-sm text-slate-700" colspan="6">Sem avaliações registradas.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p v-if="!aluno" class="text-sm text-slate-600">Perfil de aluno não encontrado.</p>
  </section>
</template>
