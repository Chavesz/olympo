<script setup>
import { computed, ref } from 'vue'
import { getEmail } from '../../services/auth'
import { loadAlunos, loadFichas } from '../../services/mockDb'

const email = computed(() => getEmail())
const openId = ref('')

const aluno = computed(() => {
  const normalizedEmail = String(email.value ?? '').toLowerCase()
  return loadAlunos().find((a) => String(a.email).toLowerCase() === normalizedEmail) ?? null
})

function parseExercises(text) {
  return String(text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((raw) => {
      const [nomeRaw, detalheRaw] = raw.split('—').map((p) => p?.trim())
      return { nome: nomeRaw || raw, detalhe: detalheRaw || '' }
    })
}

const fichas = computed(() => {
  if (!aluno.value) return []
  return loadFichas().filter((f) => f.alunoId === aluno.value.id)
})

const grupos = computed(() =>
  fichas.value.map((f) => ({
    id: f.id,
    titulo: f.titulo,
    objetivo: f.objetivo,
    exercicios: parseExercises(f.exerciciosText),
  })),
)

function toggle(id) {
  openId.value = openId.value === id ? '' : id
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Meus treinos</h1>
      <p class="text-sm text-slate-700">Sua ficha é montada pelo profissional. Você apenas visualiza.</p>
    </header>

    <div v-if="grupos.length === 0" class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
      <div class="font-semibold text-slate-900">Nenhum treino disponível</div>
      <div class="mt-1">Peça ao profissional para criar uma ficha e vincular ao seu cadastro.</div>
    </div>

    <div v-else class="space-y-3">
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
          <svg
            viewBox="0 0 24 24"
            class="h-5 w-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-if="openId === g.id" class="border-t border-slate-200 px-4 py-4">
          <div class="space-y-3">
            <div
              v-for="(e, idx) in g.exercicios"
              :key="`${g.id}-${idx}`"
              class="rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div class="text-sm font-semibold text-slate-900">{{ e.nome }}</div>
              <div v-if="e.detalhe" class="mt-1 text-sm text-slate-700">{{ e.detalhe }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

