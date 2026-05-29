<script setup>
import { computed, onMounted, ref } from 'vue'
import { getAdminMetrics } from '../../services/adminMetrics'

const metrics = ref({
  alunosAtivos: 0,
  eventosPeriodo: 0,
  fichasCriadas: 0,
  instrutoresAtivos: 0,
  alunosPorUnidade: [],
  aulasTop: [],
  instrutoresTop: [],
})
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    metrics.value = await getAdminMetrics()
  } catch (e) {
    error.value = e.message || 'Erro ao carregar métricas.'
  } finally {
    loading.value = false
  }
})

const maxAlunosUnidade = computed(() =>
  Math.max(1, ...metrics.value.alunosPorUnidade.map((u) => u.total)),
)
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Relatórios</h1>
      <p class="text-sm text-slate-700">Métricas consolidadas do sistema.</p>
    </header>

    <div v-if="loading" class="py-10 text-center text-sm text-slate-500">Carregando métricas...</div>

    <div v-else-if="error" class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{{ error }}</div>

    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <div class="text-xs font-semibold uppercase text-slate-500">Alunos ativos</div>
          <div class="mt-2 text-3xl font-bold">{{ metrics.alunosAtivos }}</div>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <div class="text-xs font-semibold uppercase text-slate-500">Eventos cadastrados</div>
          <div class="mt-2 text-3xl font-bold">{{ metrics.eventosPeriodo }}</div>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <div class="text-xs font-semibold uppercase text-slate-500">Fichas criadas</div>
          <div class="mt-2 text-3xl font-bold">{{ metrics.fichasCriadas }}</div>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <div class="text-xs font-semibold uppercase text-slate-500">Instrutores ativos</div>
          <div class="mt-2 text-3xl font-bold">{{ metrics.instrutoresAtivos }}</div>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <h2 class="text-sm font-semibold text-slate-900">Alunos ativos por unidade</h2>
          <ul v-if="metrics.alunosPorUnidade.length > 0" class="mt-4 space-y-3">
            <li v-for="u in metrics.alunosPorUnidade" :key="u.unidadeId">
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-slate-800">{{ u.nome }}</span>
                <span class="text-slate-600">{{ u.total }}</span>
              </div>
              <div class="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full bg-emerald-500"
                  :style="{ width: `${(u.total / maxAlunosUnidade) * 100}%` }"
                />
              </div>
            </li>
          </ul>
          <p v-else class="mt-4 text-sm text-slate-500">Nenhuma unidade com alunos cadastrados.</p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <h2 class="text-sm font-semibold text-slate-900">Aulas coletivas — maior adesão</h2>
          <ol class="mt-4 space-y-2 text-sm text-slate-700">
            <li v-for="(a, i) in metrics.aulasTop" :key="a.label">
              <span class="font-semibold text-slate-900">{{ i + 1 }}. {{ a.label }}</span>
              — {{ a.inscritos }}/{{ a.vagas }} inscritos
            </li>
            <li v-if="metrics.aulasTop.length === 0" class="text-slate-500">Sem dados de aulas.</li>
          </ol>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">
          <h2 class="text-sm font-semibold text-slate-900">Instrutores com mais fichas criadas</h2>
          <table class="mt-4 min-w-full text-left text-sm">
            <thead class="text-xs uppercase text-slate-500">
              <tr>
                <th class="pb-2">Instrutor</th>
                <th class="pb-2 text-right">Fichas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-for="i in metrics.instrutoresTop" :key="i.instrutorId">
                <td class="py-2 font-medium text-slate-900">{{ i.nome }}</td>
                <td class="py-2 text-right text-slate-700">{{ i.total }}</td>
              </tr>
              <tr v-if="metrics.instrutoresTop.length === 0">
                <td class="py-4 text-slate-500" colspan="2">Sem fichas vinculadas a instrutores.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </section>
</template>
