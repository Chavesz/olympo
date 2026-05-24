<script setup>
import { computed, ref, watch } from 'vue'
import { loadProgress, saveProgress } from '../services/progress'

const props = defineProps({
  ficha: { type: Object, required: true },
})

function parseExercises(text) {
  const lines = String(text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  return lines.map((raw, idx) => {
    const [nomeRaw, detalheRaw] = raw.split('—').map((p) => p?.trim())
    const nome = nomeRaw || raw
    const detalhe = detalheRaw || ''
    return { id: `ex-${idx + 1}`, nome, detalhe }
  })
}

const exercises = computed(() => parseExercises(props.ficha.exerciciosText))
const progress = ref({})

watch(
  () => props.ficha.id,
  (id) => {
    progress.value = loadProgress(id)
  },
  { immediate: true },
)

function toggle(exId) {
  const next = { ...progress.value, [exId]: !progress.value[exId] }
  progress.value = next
  saveProgress(props.ficha.id, next)
}

const total = computed(() => exercises.value.length)
const done = computed(() => exercises.value.filter((e) => Boolean(progress.value[e.id])).length)
const percent = computed(() => (total.value === 0 ? 0 : Math.round((done.value / total.value) * 100)))
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="text-sm font-semibold text-slate-900">{{ ficha.titulo }}</div>
          <div class="text-sm text-slate-700">Objetivo: {{ ficha.objetivo }}</div>
        </div>

        <div class="w-full max-w-xs">
          <div class="flex items-center justify-between text-xs text-slate-600">
            <span>Progresso</span>
            <span class="font-semibold text-slate-900">{{ percent }}%</span>
          </div>
          <div class="mt-2 h-2 w-full rounded-full bg-slate-100">
            <div class="h-2 rounded-full bg-emerald-500" :style="{ width: `${percent}%` }" />
          </div>
        </div>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <ul class="divide-y divide-slate-200">
        <li v-for="e in exercises" :key="e.id" class="flex items-start gap-3 px-4 py-4">
          <input
            class="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600"
            type="checkbox"
            :checked="Boolean(progress[e.id])"
            :aria-label="`Marcar ${e.nome} como concluído`"
            @change="toggle(e.id)"
          />

          <div class="flex-1">
            <div class="flex items-center justify-between gap-3">
              <div
                class="font-semibold"
                :class="progress[e.id] ? 'text-slate-500 line-through' : 'text-slate-900'"
              >
                {{ e.nome }}
              </div>
              <span
                class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
                :class="progress[e.id] ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'"
              >
                {{ progress[e.id] ? 'Concluído' : 'Pendente' }}
              </span>
            </div>

            <div v-if="e.detalhe" class="mt-1 text-sm text-slate-700">{{ e.detalhe }}</div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

