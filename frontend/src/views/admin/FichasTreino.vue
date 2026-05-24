<script setup>
import { computed, ref } from 'vue'
import {
  deleteFicha,
  loadAlunos,
  loadFichas,
  loadInstrutores,
  saveFichas,
  upsertFicha,
} from '../../services/mockDb'

const query = ref('')
const onlyActive = ref(true)

const alunos = ref(loadAlunos())
const instrutores = ref(loadInstrutores())
const fichas = ref(loadFichas())

const isModalOpen = ref(false)
const isEditing = ref(false)
const formError = ref('')

const form = ref({
  id: '',
  titulo: '',
  alunoId: '',
  instrutorId: '',
  objetivo: '',
  status: 'ativa',
  exerciciosText: '',
})

const alunoById = computed(() => new Map(alunos.value.map((a) => [a.id, a])))
const instrutorById = computed(() => new Map(instrutores.value.map((i) => [i.id, i])))

const filteredFichas = computed(() => {
  const q = query.value.trim().toLowerCase()
  return fichas.value.filter((f) => {
    const aluno = alunoById.value.get(f.alunoId)
    const instrutor = instrutorById.value.get(f.instrutorId)
    const hay = `${f.titulo} ${f.objetivo} ${f.status} ${aluno?.nome ?? ''} ${instrutor?.nome ?? ''}`.toLowerCase()
    const matchesQuery = !q || hay.includes(q)
    const matchesStatus = !onlyActive.value || f.status === 'ativa'
    return matchesQuery && matchesStatus
  })
})

function fmtDate(ts) {
  if (!ts) return '-'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(ts))
}

function openCreate() {
  formError.value = ''
  isEditing.value = false
  form.value = {
    id: '',
    titulo: '',
    alunoId: alunos.value[0]?.id ?? '',
    instrutorId: instrutores.value[0]?.id ?? '',
    objetivo: '',
    status: 'ativa',
    exerciciosText: '',
  }
  isModalOpen.value = true
}

function openEdit(f) {
  formError.value = ''
  isEditing.value = true
  form.value = {
    id: f.id,
    titulo: f.titulo,
    alunoId: f.alunoId,
    instrutorId: f.instrutorId,
    objetivo: f.objetivo,
    status: f.status,
    exerciciosText: f.exerciciosText ?? '',
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function validate() {
  if (!form.value.titulo.trim()) return 'Informe o título.'
  if (!form.value.alunoId) return 'Selecione o aluno.'
  if (!form.value.instrutorId) return 'Selecione o instrutor.'
  if (!form.value.objetivo.trim()) return 'Informe o objetivo.'
  if (!['ativa', 'inativa'].includes(form.value.status)) return 'Selecione um status válido.'
  return ''
}

function onSave() {
  formError.value = ''
  const validationError = validate()
  if (validationError) {
    formError.value = validationError
    return
  }

  const id =
    form.value.id || (typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `f-${Date.now()}`)

  const payload = {
    id,
    titulo: form.value.titulo.trim(),
    alunoId: form.value.alunoId,
    instrutorId: form.value.instrutorId,
    objetivo: form.value.objetivo.trim(),
    status: form.value.status,
    exerciciosText: String(form.value.exerciciosText ?? '').trim(),
    updatedAt: Date.now(),
  }

  fichas.value = upsertFicha(payload)
  closeModal()
}

function onDelete(f) {
  const ok = window.confirm(`Excluir a ficha "${f.titulo}"?`)
  if (!ok) return
  fichas.value = deleteFicha(f.id)
}

function onToggleStatus(f) {
  const next = { ...f, status: f.status === 'ativa' ? 'inativa' : 'ativa', updatedAt: Date.now() }
  fichas.value = upsertFicha(next)
}

function onResetMock() {
  localStorage.removeItem('olympo:mock:fichas')
  fichas.value = loadFichas()
  saveFichas(fichas.value)
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-slate-50">Fichas de treino</h1>
      <p class="text-sm text-slate-300">CRUD de fichas (dados mockados).</p>
    </header>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <label class="w-full sm:max-w-sm">
          <span class="sr-only">Buscar</span>
          <input
            v-model="query"
            class="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-slate-400 placeholder:text-slate-500 focus:ring-2"
            type="search"
            placeholder="Buscar por título, aluno, instrutor, objetivo ou status"
          />
        </label>

        <label class="inline-flex items-center gap-2 text-sm text-slate-300">
          <input v-model="onlyActive" class="h-4 w-4 rounded border-slate-700 bg-slate-900" type="checkbox" />
          Somente ativas
        </label>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-50 hover:bg-slate-800"
          type="button"
          @click="onResetMock"
        >
          Reset mock
        </button>
        <button
          class="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
          type="button"
          @click="openCreate"
        >
          Nova ficha
        </button>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th class="px-4 py-3">Título</th>
              <th class="px-4 py-3">Aluno</th>
              <th class="px-4 py-3">Instrutor</th>
              <th class="px-4 py-3">Objetivo</th>
              <th class="px-4 py-3">Atualizada</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-800">
            <tr v-for="f in filteredFichas" :key="f.id" class="text-slate-100">
              <td class="px-4 py-3">
                <div class="font-semibold">{{ f.titulo }}</div>
                <div class="text-xs text-slate-400">{{ f.id }}</div>
              </td>
              <td class="px-4 py-3 text-slate-200">
                {{ alunoById.get(f.alunoId)?.nome ?? '-' }}
              </td>
              <td class="px-4 py-3 text-slate-200">
                {{ instrutorById.get(f.instrutorId)?.nome ?? '-' }}
              </td>
              <td class="px-4 py-3 text-slate-200">{{ f.objetivo }}</td>
              <td class="px-4 py-3 text-slate-200">{{ fmtDate(f.updatedAt) }}</td>
              <td class="px-4 py-3">
                <button
                  class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
                  :class="f.status === 'ativa' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-rose-500/15 text-rose-200'"
                  type="button"
                  @click="onToggleStatus(f)"
                >
                  {{ f.status }}
                </button>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-semibold text-slate-50 hover:bg-slate-800"
                    type="button"
                    @click="openEdit(f)"
                  >
                    Editar
                  </button>
                  <button
                    class="rounded-lg border border-rose-700 bg-rose-950 px-3 py-1.5 text-sm font-semibold text-rose-100 hover:bg-rose-900"
                    type="button"
                    @click="onDelete(f)"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredFichas.length === 0">
              <td class="px-4 py-8 text-center text-sm text-slate-400" colspan="7">
                Nenhuma ficha encontrada.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/60" @click="closeModal" />

        <div class="relative mx-auto flex min-h-full max-w-lg items-center px-4 py-8">
          <div
            class="w-full rounded-2xl border border-slate-800 bg-slate-950 p-5 text-slate-50 shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-lg font-bold">{{ isEditing ? 'Editar ficha' : 'Nova ficha' }}</div>
                <div class="text-sm text-slate-300">Defina aluno, instrutor e exercícios.</div>
              </div>
              <button
                class="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-sm font-semibold hover:bg-slate-800"
                type="button"
                @click="closeModal"
              >
                Fechar
              </button>
            </div>

            <div
              v-if="formError"
              class="mt-4 rounded-lg border border-rose-700 bg-rose-950 px-3 py-2 text-sm text-rose-100"
              role="alert"
              aria-live="polite"
            >
              {{ formError }}
            </div>

            <div class="mt-4 space-y-3">
              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-200">Título</span>
                <input
                  v-model="form.titulo"
                  class="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-slate-400 focus:ring-2"
                  type="text"
                />
              </label>

              <div class="grid gap-3 sm:grid-cols-2">
                <label class="block space-y-1">
                  <span class="text-sm font-medium text-slate-200">Aluno</span>
                  <select
                    v-model="form.alunoId"
                    class="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-slate-400 focus:ring-2"
                  >
                    <option v-for="a in alunos" :key="a.id" :value="a.id">{{ a.nome }}</option>
                  </select>
                </label>

                <label class="block space-y-1">
                  <span class="text-sm font-medium text-slate-200">Instrutor</span>
                  <select
                    v-model="form.instrutorId"
                    class="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-slate-400 focus:ring-2"
                  >
                    <option v-for="i in instrutores" :key="i.id" :value="i.id">{{ i.nome }}</option>
                  </select>
                </label>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <label class="block space-y-1">
                  <span class="text-sm font-medium text-slate-200">Objetivo</span>
                  <input
                    v-model="form.objetivo"
                    class="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-slate-400 focus:ring-2"
                    type="text"
                  />
                </label>

                <label class="block space-y-1">
                  <span class="text-sm font-medium text-slate-200">Status</span>
                  <select
                    v-model="form.status"
                    class="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-slate-400 focus:ring-2"
                  >
                    <option value="ativa">Ativa</option>
                    <option value="inativa">Inativa</option>
                  </select>
                </label>
              </div>

              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-200">Exercícios</span>
                <textarea
                  v-model="form.exerciciosText"
                  class="min-h-32 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-slate-400 focus:ring-2"
                  placeholder="Um exercício por linha (ex.: Supino reto — 4x 8-10)"
                />
              </label>
            </div>

            <div class="mt-5 flex justify-end gap-2">
              <button
                class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-50 hover:bg-slate-800"
                type="button"
                @click="closeModal"
              >
                Cancelar
              </button>
              <button
                class="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
                type="button"
                @click="onSave"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </section>
</template>

