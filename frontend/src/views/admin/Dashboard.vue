<script setup>
import { computed, ref } from 'vue'
import { loadUsers } from '../../services/mockDb'

const users = ref(loadUsers())

const totalAlunos = computed(() => users.value.filter((u) => u.role === 'aluno').length)
const instrutoresAtivos = computed(
  () => users.value.filter((u) => u.role === 'instrutor' && u.status === 'ativo').length,
)
const fichasCriadas = computed(() => 18)

const atividadesRecentes = computed(() => [
  { id: 'a-1', titulo: 'Novo aluno cadastrado', detalhe: 'Jonh Santos', quando: 'hoje' },
  { id: 'a-2', titulo: 'Frequência registrada', detalhe: 'Felipe Silva', quando: 'ontem' },
  { id: 'a-3', titulo: 'Ficha atualizada', detalhe: 'Treino A - Hipertrofia', quando: 'ontem' },
])
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Dashboard do Administrador</h1>
      <p class="text-sm text-slate-300">Métricas e visão geral (dados mockados).</p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-400">Total de Alunos</div>
        <div class="mt-2 text-3xl font-bold text-slate-50">{{ totalAlunos }}</div>
        <div class="mt-1 text-sm text-slate-300">Cadastrados no sistema</div>
      </div>

      <div class="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-400">Instrutores Ativos</div>
        <div class="mt-2 text-3xl font-bold text-slate-50">{{ instrutoresAtivos }}</div>
        <div class="mt-1 text-sm text-slate-300">Com acesso ativo</div>
      </div>

      <div class="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-400">Fichas Criadas</div>
        <div class="mt-2 text-3xl font-bold text-slate-50">{{ fichasCriadas }}</div>
        <div class="mt-1 text-sm text-slate-300">Total no período</div>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div class="flex items-center justify-between">
          <div class="text-sm font-semibold text-slate-50">Atividades recentes</div>
          <div class="text-xs text-slate-400">placeholder</div>
        </div>

        <div class="mt-4 divide-y divide-slate-800">
          <div v-for="a in atividadesRecentes" :key="a.id" class="py-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-sm font-semibold text-slate-50">{{ a.titulo }}</div>
                <div class="text-sm text-slate-300">{{ a.detalhe }}</div>
              </div>
              <div class="text-xs text-slate-400">{{ a.quando }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div class="flex items-center justify-between">
          <div class="text-sm font-semibold text-slate-50">Gráfico</div>
          <div class="text-xs text-slate-400">placeholder</div>
        </div>

        <div class="mt-4 grid h-56 place-items-center rounded-lg border border-dashed border-slate-700">
          <div class="text-center">
            <div class="text-sm font-semibold text-slate-50">Área reservada</div>
            <div class="mt-1 text-sm text-slate-300">Aqui entra um gráfico ou relatório.</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

