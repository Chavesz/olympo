<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAlunoProfile } from '../../composables/useAlunoProfile'
import { getExerciciosFromFicha } from '../../services/fichaExercises'
import { fetchFichas } from '../../services/data'
import { addHistoryEntry, loadHistory } from '../../services/history'

const { aluno } = useAlunoProfile()

const openId = ref('')
const fichas = ref([])
const history = ref([])

async function refreshFichas() {
  fichas.value = await fetchFichas()
}

async function refreshHistory() {
  history.value = await loadHistory()
}

onMounted(async () => {
  await Promise.all([refreshFichas(), refreshHistory()])
})

const grupos = computed(() => {
  if (!aluno.value) return []
  return fichas.value
    .filter((f) => f.alunoId === aluno.value.id)
    .map((f) => ({
      id: f.id,
      titulo: f.titulo,
      objetivo: f.objetivo,
      exercicios: getExerciciosFromFicha(f),
    }))
})

const treinoDoDia = computed(() => grupos.value[0] ?? null)

const hasToday = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return history.value.some((h) => String(h.dataTreino).slice(0, 10) === today)
})

async function markToday() {
  if (hasToday.value || !treinoDoDia.value) return
  const today = new Date().toISOString().slice(0, 10)
  await addHistoryEntry({
    fichaId: treinoDoDia.value.id,
    dataTreino: today,
    observacao: '',
  })
  await refreshHistory()
}

function toggle(id) {
  openId.value = openId.value === id ? '' : id
}

function fmtDateBr(isoDate) {
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(d)
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Meus treinos</h1>
      <p class="text-sm text-slate-700">Sua ficha é montada pelo profissional. Você visualiza e registra a conclusão do dia.</p>
    </header>

    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Treino do dia</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">
            {{ treinoDoDia?.titulo ?? 'Sem ficha vinculada' }}
          </div>
          <div v-if="treinoDoDia?.objetivo" class="mt-1 text-sm text-slate-700">
            Objetivo: {{ treinoDoDia.objetivo }}
          </div>
        </div>
        <button
          class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
          type="button"
          :disabled="hasToday || !treinoDoDia"
          @click="markToday"
        >
          {{ hasToday ? 'Concluído hoje' : 'Marcar como concluído' }}
        </button>
      </div>
      <p v-if="hasToday" class="mt-2 text-xs text-emerald-700">
        Registrado em {{ fmtDateBr(new Date().toISOString().slice(0, 10)) }}. Veja em Histórico de Treinos.
      </p>
    </div>

    <div v-if="grupos.length === 0" class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
      <div class="font-semibold text-slate-900">Nenhum treino disponível</div>
      <div class="mt-1">Peça ao profissional para criar uma ficha e vincular ao seu cadastro.</div>
    </div>

    <div v-else class="space-y-3">
      <h2 class="text-sm font-semibold text-slate-900">Fichas de treino</h2>
      <div v-for="g in grupos" :key="g.id" class="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <button
          class="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-slate-50"
          type="button"
          :aria-expanded="openId === g.id"
          @click="toggle(g.id)"
        >
          <div>
            <div class="text-sm font-semibold text-slate-900">{{ g.titulo }}</div>
            <div class="text-sm text-slate-700">Objetivo: {{ g.objetivo }}</div>
          </div>
          <svg viewBox="0 0 24 24" class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-if="openId === g.id" class="border-t border-slate-200 px-4 py-4">
          <div class="space-y-3">
            <div
              v-for="e in g.exercicios"
              :key="e.id"
              class="rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div class="text-sm font-semibold text-slate-900">{{ e.nome }}</div>
              <dl class="mt-2 grid gap-1 text-xs text-slate-700 sm:grid-cols-3">
                <div>
                  <dt class="font-medium text-slate-800">Séries</dt>
                  <dd>{{ e.series || '—' }}</dd>
                </div>
                <div>
                  <dt class="font-medium text-slate-800">Repetições</dt>
                  <dd>{{ e.repeticoes || '—' }}</dd>
                </div>
                <div v-if="e.observacoes" class="sm:col-span-3">
                  <dt class="font-medium text-slate-800">Observações</dt>
                  <dd>{{ e.observacoes }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
