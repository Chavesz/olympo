<script setup>
import { computed, ref } from 'vue'
import { getEmail, getRole } from '../../services/auth'
import { loadAlunos, loadFichas, loadInstrutores } from '../../services/mockDb'
import FichaChecklist from '../../components/FichaChecklist.vue'

const query = ref('')
const onlyActive = ref(true)

const role = computed(() => getRole())
const email = computed(() => getEmail())

const alunos = ref(loadAlunos())
const instrutores = ref(loadInstrutores())
const fichas = ref(loadFichas())

const aluno = computed(() =>
  alunos.value.find((a) => String(a.email).toLowerCase() === String(email.value ?? '').toLowerCase()),
)
const instrutor = computed(() =>
  instrutores.value.find((i) => String(i.email).toLowerCase() === String(email.value ?? '').toLowerCase()),
)

const minhasFichas = computed(() => {
  if (role.value === 'aluno' && aluno.value) return fichas.value.filter((f) => f.alunoId === aluno.value.id)
  if (role.value === 'instrutor' && instrutor.value)
    return fichas.value.filter((f) => f.instrutorId === instrutor.value.id)
  if (role.value === 'admin') return fichas.value
  return []
})

const filteredFichas = computed(() => {
  const q = query.value.trim().toLowerCase()
  return minhasFichas.value.filter((f) => {
    const hay = `${f.titulo} ${f.objetivo} ${f.status}`.toLowerCase()
    const matchesQuery = !q || hay.includes(q)
    const matchesStatus = !onlyActive.value || f.status === 'ativa'
    return matchesQuery && matchesStatus
  })
})

const selectedId = ref('')
const selectedFicha = computed(() => {
  const list = filteredFichas.value
  if (!selectedId.value && list.length) return list[0]
  return list.find((f) => f.id === selectedId.value) ?? null
})

function fmtDate(ts) {
  if (!ts) return '-'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(ts))
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Minhas fichas</h1>
      <p class="text-sm text-slate-700">Selecione uma ficha e marque o progresso (mock).</p>
    </header>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <label class="w-full sm:max-w-sm">
          <span class="sr-only">Buscar</span>
          <input
            v-model="query"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 placeholder:text-slate-500 focus:ring-2"
            type="search"
            placeholder="Buscar por título, objetivo ou status"
          />
        </label>

        <label class="inline-flex items-center gap-2 text-sm text-slate-700">
          <input v-model="onlyActive" class="h-4 w-4 rounded border-slate-300 text-emerald-600" type="checkbox" />
          Somente ativas
        </label>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-5">
      <div class="lg:col-span-2">
        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">Fichas</div>
          <ul class="divide-y divide-slate-200">
            <li v-for="f in filteredFichas" :key="f.id">
              <button
                class="w-full px-4 py-3 text-left hover:bg-slate-50"
                type="button"
                :class="(selectedFicha?.id ?? '') === f.id ? 'bg-slate-50' : ''"
                @click="selectedId = f.id"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="font-semibold text-slate-900">{{ f.titulo }}</div>
                    <div class="text-sm text-slate-700">{{ f.objetivo }}</div>
                  </div>
                  <span
                    class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
                    :class="f.status === 'ativa' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'"
                  >
                    {{ f.status }}
                  </span>
                </div>
                <div class="mt-1 text-xs text-slate-500">Atualizada: {{ fmtDate(f.updatedAt) }}</div>
              </button>
            </li>

            <li v-if="filteredFichas.length === 0" class="px-4 py-6 text-sm text-slate-600">
              Nenhuma ficha encontrada.
            </li>
          </ul>
        </div>
      </div>

      <div class="lg:col-span-3">
        <FichaChecklist v-if="selectedFicha" :ficha="selectedFicha" />

        <div v-else class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <div class="font-semibold text-slate-900">Sem ficha</div>
          <div class="mt-1">Crie fichas no Admin para aparecerem aqui.</div>
        </div>
      </div>
    </div>
  </section>
</template>

