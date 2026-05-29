<script setup>
import { computed } from 'vue'
import { getEmail, getUserId } from '../../services/auth'
import { loadAlunos } from '../../services/mockDb'
import { loadHistory } from '../../services/history'

const email = computed(() => getEmail())
const userId = computed(() => getUserId())

const aluno = computed(() => {
  const normalizedEmail = String(email.value ?? '').toLowerCase()
  return loadAlunos().find((a) => String(a.email).toLowerCase() === normalizedEmail) ?? null
})

const sessoes = computed(() => {
  if (!userId.value) return []
  return loadHistory(userId.value)
    .filter((h) => h.concluido)
    .slice()
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
})

function fmtDate(isoDate) {
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(d)
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Histórico de treinos</h1>
      <p class="text-sm text-slate-700">
        Somente leitura. Treinos concluídos registrados em
        <router-link class="font-semibold text-emerald-700 hover:underline" to="/aluno/meus-treinos">
          Meus Treinos
        </router-link>.
      </p>
    </header>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">Sessões concluídas</div>
      <ul class="divide-y divide-slate-200">
        <li v-for="h in sessoes" :key="h.id" class="flex items-center justify-between gap-3 px-4 py-4">
          <div>
            <div class="text-sm font-semibold text-slate-900">{{ h.grupo }}</div>
            <div class="text-sm text-slate-700">{{ fmtDate(h.date) }}</div>
          </div>
          <span class="inline-flex shrink-0 items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
            Concluído
          </span>
        </li>

        <li v-if="sessoes.length === 0" class="px-4 py-6 text-sm text-slate-700">
          Nenhum treino concluído ainda. Marque o treino do dia em Meus Treinos.
        </li>
      </ul>
    </div>

    <p v-if="!aluno" class="text-sm text-slate-600">Perfil de aluno não encontrado para este usuário.</p>
  </section>
</template>
