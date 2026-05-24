<script setup>
import { computed, ref } from 'vue'

const today = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(
  new Date(),
)

const treino = ref({
  titulo: 'Treino de Hoje (A)',
  objetivo: 'Hipertrofia',
  exercicios: [
    { id: 'e-1', nome: 'Supino reto', series: 4, repeticoes: '8-10', descanso: '90s', feito: false },
    { id: 'e-2', nome: 'Puxada na barra', series: 4, repeticoes: '10-12', descanso: '90s', feito: false },
    { id: 'e-3', nome: 'Desenvolvimento', series: 3, repeticoes: '8-10', descanso: '90s', feito: false },
    { id: 'e-4', nome: 'Rosca direta', series: 3, repeticoes: '10-12', descanso: '60s', feito: false },
    { id: 'e-5', nome: 'Tríceps corda', series: 3, repeticoes: '12-15', descanso: '60s', feito: false },
  ],
})

const total = computed(() => treino.value.exercicios.length)
const concluidos = computed(() => treino.value.exercicios.filter((e) => e.feito).length)
const progresso = computed(() => (total.value === 0 ? 0 : Math.round((concluidos.value / total.value) * 100)))
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ today }}</div>
      <h1 class="text-2xl font-bold tracking-tight">Meu treino</h1>
      <p class="text-sm text-slate-700">Marque os exercícios conforme for concluindo (dados mockados).</p>
    </header>

    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="text-sm font-semibold text-slate-900">{{ treino.titulo }}</div>
          <div class="text-sm text-slate-700">Objetivo: {{ treino.objetivo }}</div>
        </div>

        <div class="w-full max-w-xs">
          <div class="flex items-center justify-between text-xs text-slate-600">
            <span>Progresso</span>
            <span class="font-semibold text-slate-900">{{ progresso }}%</span>
          </div>
          <div class="mt-2 h-2 w-full rounded-full bg-slate-100">
            <div class="h-2 rounded-full bg-emerald-500" :style="{ width: `${progresso}%` }" />
          </div>
        </div>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <ul class="divide-y divide-slate-200">
        <li v-for="e in treino.exercicios" :key="e.id" class="flex items-start gap-3 px-4 py-4">
          <input
            v-model="e.feito"
            class="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600"
            type="checkbox"
            :aria-label="`Marcar ${e.nome} como concluído`"
          />

          <div class="flex-1">
            <div class="flex items-center justify-between gap-3">
              <div class="font-semibold text-slate-900" :class="e.feito ? 'line-through text-slate-500' : ''">
                {{ e.nome }}
              </div>
              <span
                class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
                :class="e.feito ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'"
              >
                {{ e.feito ? 'Concluído' : 'Pendente' }}
              </span>
            </div>

            <div class="mt-1 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <div><span class="font-semibold text-slate-900">Séries:</span> {{ e.series }}</div>
              <div><span class="font-semibold text-slate-900">Reps:</span> {{ e.repeticoes }}</div>
              <div><span class="font-semibold text-slate-900">Descanso:</span> {{ e.descanso }}</div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
      <div class="font-semibold text-slate-900">Observações</div>
      <div class="mt-1">A ficha real virá do back-end. Aqui estamos simulando o fluxo do aluno/instrutor.</div>
    </div>
  </section>
</template>

