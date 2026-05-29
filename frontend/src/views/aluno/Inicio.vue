<script setup>
import { computed } from 'vue'
import { getEmail } from '../../services/auth'
import { loadAlunos, loadFichas } from '../../services/mockDb'
import { loadComunicados, loadEventos } from '../../services/mockPortal'

const email = computed(() => getEmail())

const aluno = computed(() => {
  const normalizedEmail = String(email.value ?? '').toLowerCase()
  return loadAlunos().find((a) => String(a.email).toLowerCase() === normalizedEmail) ?? null
})

const nome = computed(() => aluno.value?.nome ?? 'Aluno')

const proximoTreino = computed(() => {
  const fichas = loadFichas()
  if (!aluno.value) return null
  return fichas.find((f) => f.alunoId === aluno.value.id) ?? null
})

const ultimoComunicado = computed(() => loadComunicados()[0] ?? null)
const totalEventos = computed(() => loadEventos().length)
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Bem-vindo, {{ nome.split(' ')[0] }}.</h1>
      <p class="text-sm text-slate-700">Visão geral rápida do seu painel.</p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Próximo treino</div>
        <div class="mt-2 text-sm font-semibold text-slate-900">
          {{ proximoTreino?.titulo ?? 'Sem treino programado' }}
        </div>
        <div class="mt-1 text-sm text-slate-700">
          {{ proximoTreino?.objetivo ? `Objetivo: ${proximoTreino.objetivo}` : 'Aguarde seu instrutor.' }}
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Último comunicado</div>
        <div class="mt-2 text-sm font-semibold text-slate-900">
          {{ ultimoComunicado?.titulo ?? 'Sem comunicados' }}
        </div>
        <div class="mt-1 text-sm text-slate-700">
          {{ ultimoComunicado?.data ?? '-' }}
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Eventos disponíveis</div>
        <div class="mt-2 text-3xl font-bold text-slate-900">{{ totalEventos }}</div>
        <div class="mt-1 text-sm text-slate-700">Veja a aba “Eventos” para se inscrever.</div>
      </div>
    </div>
  </section>
</template>

