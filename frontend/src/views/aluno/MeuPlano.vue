<script setup>
import { computed } from 'vue'

const plano = {
  nome: 'Plano Premium',
  modalidade: 'Mensal',
  valor: 119.9,
  inicio: '2026-05-01',
  vencimento: '2026-06-01',
}

const start = computed(() => new Date(plano.inicio).getTime())
const end = computed(() => new Date(plano.vencimento).getTime())
const now = computed(() => Date.now())

const total = computed(() => Math.max(1, end.value - start.value))
const elapsed = computed(() => Math.min(total.value, Math.max(0, now.value - start.value)))
const percent = computed(() => Math.round((elapsed.value / total.value) * 100))

function fmtDate(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(d)
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Meu plano</h1>
      <p class="text-sm text-slate-700">Detalhes do plano contratado (somente leitura).</p>
    </header>

    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="text-sm font-semibold text-slate-900">{{ plano.nome }}</div>
          <div class="text-sm text-slate-700">
            {{ plano.modalidade }} • R$ {{ plano.valor.toFixed(2) }}
          </div>
        </div>

        <div class="w-full max-w-xs">
          <div class="flex items-center justify-between text-xs text-slate-600">
            <span>Vigência</span>
            <span class="font-semibold text-slate-900">{{ percent }}%</span>
          </div>
          <div class="mt-2 h-2 w-full rounded-full bg-slate-100">
            <div class="h-2 rounded-full bg-emerald-500" :style="{ width: `${percent}%` }" />
          </div>
        </div>
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Início</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ fmtDate(plano.inicio) }}</div>
        </div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Vencimento</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ fmtDate(plano.vencimento) }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

