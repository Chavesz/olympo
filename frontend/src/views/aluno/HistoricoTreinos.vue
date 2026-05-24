<script setup>
import { computed, ref } from 'vue'
import { getEmail, getUserId } from '../../services/auth'
import { loadAlunos, loadFichas } from '../../services/mockDb'
import { loadHistory, saveHistory } from '../../services/history'

const email = computed(() => getEmail())
const userId = computed(() => getUserId())

const aluno = computed(() => {
  const normalizedEmail = String(email.value ?? '').toLowerCase()
  return loadAlunos().find((a) => String(a.email).toLowerCase() === normalizedEmail) ?? null
})

const ficha = computed(() => {
  if (!aluno.value) return null
  return loadFichas().find((f) => f.alunoId === aluno.value.id) ?? null
})

const history = ref(loadHistory(userId.value))

const hasToday = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return history.value.some((h) => h.date === today)
})

function markToday() {
  if (!userId.value || hasToday.value) return
  const today = new Date().toISOString().slice(0, 10)
  const id = typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `h-${Date.now()}`
  const item = {
    id,
    date: today,
    grupo: ficha.value?.titulo ?? 'Treino do dia',
    concluido: true,
  }
  history.value = [item, ...history.value]
  saveHistory(userId.value, history.value)
}

function removeItem(id) {
  if (!userId.value) return
  history.value = history.value.filter((h) => h.id !== id)
  saveHistory(userId.value, history.value)
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Histórico de treinos</h1>
      <p class="text-sm text-slate-700">Marque o treino do dia como concluído (única ação de escrita).</p>
    </header>

    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="text-sm font-semibold text-slate-900">Treino de hoje</div>
          <div class="text-sm text-slate-700">{{ ficha?.titulo ?? 'Sem ficha vinculada' }}</div>
        </div>
        <button
          class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
          type="button"
          :disabled="hasToday || !ficha"
          @click="markToday"
        >
          {{ hasToday ? 'Concluído hoje' : 'Marcar como concluído' }}
        </button>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">Sessões</div>
      <ul class="divide-y divide-slate-200">
        <li v-for="h in history" :key="h.id" class="flex items-center justify-between gap-3 px-4 py-4">
          <div>
            <div class="text-sm font-semibold text-slate-900">{{ h.grupo }}</div>
            <div class="text-sm text-slate-700">{{ h.date }}</div>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
              Concluído
            </span>
            <button
              class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              type="button"
              @click="removeItem(h.id)"
            >
              Remover
            </button>
          </div>
        </li>

        <li v-if="history.length === 0" class="px-4 py-6 text-sm text-slate-700">
          Nenhum treino concluído ainda.
        </li>
      </ul>
    </div>
  </section>
</template>

