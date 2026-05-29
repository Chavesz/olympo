<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getAdminMetrics } from '../../services/adminMetrics'
import { loadUsers } from '../../services/mockDb'

const metrics = computed(() => getAdminMetrics())
const users = computed(() => loadUsers())

const maxAlunosUnidade = computed(() =>
  Math.max(1, ...metrics.value.alunosPorUnidade.map((u) => u.total)),
)

const atividadesRecentes = computed(() => [
  { id: 'a-1', titulo: 'Usuários no sistema', detalhe: `${users.value.length} cadastros`, quando: 'agora' },
  { id: 'a-2', titulo: 'Alunos ativos', detalhe: `${metrics.value.alunosAtivos} alunos`, quando: 'hoje' },
  { id: 'a-3', titulo: 'Fichas de treino', detalhe: `${metrics.value.fichasCriadas} fichas`, quando: 'hoje' },
])
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Dashboard do administrador</h1>
      <p class="text-sm text-slate-700">Visão geral do sistema.</p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Total de alunos</div>
        <div class="mt-2 text-3xl font-bold text-slate-900">{{ metrics.totalAlunos }}</div>
        <div class="mt-1 text-sm text-slate-700">{{ metrics.alunosAtivos }} ativos</div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Instrutores ativos</div>
        <div class="mt-2 text-3xl font-bold text-slate-900">{{ metrics.instrutoresAtivos }}</div>
        <div class="mt-1 text-sm text-slate-700">Com acesso ativo</div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Fichas criadas</div>
        <div class="mt-2 text-3xl font-bold text-slate-900">{{ metrics.fichasCriadas }}</div>
        <div class="mt-1 text-sm text-slate-700">No sistema</div>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="text-sm font-semibold text-slate-900">Atividades recentes</div>
        <div class="mt-4 divide-y divide-slate-200">
          <div v-for="a in atividadesRecentes" :key="a.id" class="py-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-sm font-semibold text-slate-900">{{ a.titulo }}</div>
                <div class="text-sm text-slate-700">{{ a.detalhe }}</div>
              </div>
              <div class="text-xs text-slate-500">{{ a.quando }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="flex items-center justify-between">
          <div class="text-sm font-semibold text-slate-900">Alunos ativos por unidade</div>
          <RouterLink class="text-xs font-semibold text-emerald-700 hover:underline" to="/admin/relatorios">
            Ver relatórios
          </RouterLink>
        </div>

        <ul class="mt-4 space-y-3">
          <li v-for="u in metrics.alunosPorUnidade" :key="u.unidadeId">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium text-slate-800">{{ u.nome }}</span>
              <span class="font-semibold text-slate-900">{{ u.total }}</span>
            </div>
            <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-emerald-500 transition-all"
                :style="{ width: `${Math.max(8, (u.total / maxAlunosUnidade) * 100)}%` }"
              />
            </div>
          </li>
          <li v-if="metrics.alunosPorUnidade.length === 0" class="text-sm text-slate-600">
            Cadastre unidades em Admin → Unidades.
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
