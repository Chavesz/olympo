<script setup>
import { computed, ref } from 'vue'
import {
  createExerciseId,
  emptyExercise,
  getExerciciosFromFicha,
  serializeExerciciosToText,
} from '../../services/fichaExercises'
import { deleteFicha, loadAlunos, loadFichas, loadInstrutores, upsertFicha } from '../../services/mockDb'

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
  exercicios: [emptyExercise()],
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
    exercicios: [emptyExercise()],
  }
  isModalOpen.value = true
}

function openEdit(f) {
  formError.value = ''
  isEditing.value = true
  const exercicios = getExerciciosFromFicha(f)
  form.value = {
    id: f.id,
    titulo: f.titulo,
    alunoId: f.alunoId,
    instrutorId: f.instrutorId,
    objetivo: f.objetivo,
    status: f.status,
    exercicios: exercicios.length ? exercicios : [emptyExercise()],
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function addExercise() {
  form.value.exercicios.push(emptyExercise())
}

function removeExercise(id) {
  if (form.value.exercicios.length <= 1) return
  form.value.exercicios = form.value.exercicios.filter((e) => e.id !== id)
}

function validate() {
  if (!form.value.titulo.trim()) return 'Informe o título.'
  if (!form.value.alunoId) return 'Selecione o aluno.'
  if (!form.value.instrutorId) return 'Selecione o instrutor.'
  if (!form.value.objetivo.trim()) return 'Informe o objetivo.'
  const valid = form.value.exercicios.filter((e) => String(e.nome ?? '').trim())
  if (!valid.length) return 'Adicione pelo menos um exercício.'
  for (const ex of valid) {
    if (!String(ex.series ?? '').trim()) return `Informe as séries de "${ex.nome}".`
    if (!String(ex.repeticoes ?? '').trim()) return `Informe as repetições de "${ex.nome}".`
  }
  return ''
}

function onSave() {
  formError.value = ''
  const validationError = validate()
  if (validationError) {
    formError.value = validationError
    return
  }

  const exercicios = form.value.exercicios
    .filter((e) => String(e.nome ?? '').trim())
    .map((e) => ({
      id: e.id || createExerciseId(),
      nome: e.nome.trim(),
      series: String(e.series).trim(),
      repeticoes: String(e.repeticoes).trim(),
      observacoes: String(e.observacoes ?? '').trim(),
    }))

  const id =
    form.value.id || (typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `f-${Date.now()}`)

  fichas.value = upsertFicha({
    id,
    titulo: form.value.titulo.trim(),
    alunoId: form.value.alunoId,
    instrutorId: form.value.instrutorId,
    objetivo: form.value.objetivo.trim(),
    status: form.value.status,
    exercicios,
    exerciciosText: serializeExerciciosToText(exercicios),
    updatedAt: Date.now(),
  })
  closeModal()
}

function onDelete(f) {
  const ok = window.confirm(`Excluir a ficha "${f.titulo}"?`)
  if (!ok) return
  fichas.value = deleteFicha(f.id)
}

function onToggleStatus(f) {
  const novoStatus = f.status === 'ativa' ? 'inativa' : 'ativa'
  fichas.value = upsertFicha({ ...f, status: novoStatus, updatedAt: Date.now() })
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Fichas de treino</h1>
      <p class="text-sm text-slate-700">Mesmo formato estruturado do painel do instrutor (nome, séries, repetições, observações).</p>
    </header>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <label class="w-full sm:max-w-sm">
          <span class="sr-only">Buscar</span>
          <input
            v-model="query"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 placeholder:text-slate-500 focus:ring-2"
            type="search"
            placeholder="Buscar por título, aluno, instrutor..."
          />
        </label>
        <label class="inline-flex items-center gap-2 text-sm text-slate-700">
          <input v-model="onlyActive" class="h-4 w-4 rounded border-slate-300" type="checkbox" />
          Somente ativas
        </label>
      </div>
      <button class="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400" type="button" @click="openCreate">Nova ficha</button>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
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
          <tbody class="divide-y divide-slate-200">
            <tr v-for="f in filteredFichas" :key="f.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 font-semibold text-slate-900">{{ f.titulo }}</td>
              <td class="px-4 py-3 text-slate-700">{{ alunoById.get(f.alunoId)?.nome ?? '—' }}</td>
              <td class="px-4 py-3 text-slate-700">{{ instrutorById.get(f.instrutorId)?.nome ?? '—' }}</td>
              <td class="px-4 py-3 text-slate-700">{{ f.objetivo }}</td>
              <td class="px-4 py-3 text-slate-700">{{ fmtDate(f.updatedAt) }}</td>
              <td class="px-4 py-3">
                <button
                  class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
                  :class="f.status === 'ativa' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
                  type="button"
                  @click="onToggleStatus(f)"
                >
                  {{ f.status }}
                </button>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-50" type="button" @click="openEdit(f)">Editar</button>
                  <button class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100" type="button" @click="onDelete(f)">Excluir</button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredFichas.length === 0">
              <td class="px-4 py-8 text-center text-sm text-slate-700" colspan="7">Nenhuma ficha encontrada.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/50" @click="closeModal" />
        <div class="relative mx-auto flex min-h-full max-w-lg items-center px-4 py-8">
          <div class="max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl" role="dialog" aria-modal="true">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-lg font-bold text-slate-900">{{ isEditing ? 'Editar ficha' : 'Nova ficha' }}</div>
                <div class="text-sm text-slate-700">Exercícios com campos separados.</div>
              </div>
              <button class="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-semibold hover:bg-slate-50" type="button" @click="closeModal">Fechar</button>
            </div>
            <div v-if="formError" class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">{{ formError }}</div>
            <div class="mt-4 space-y-3">
              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Título</span>
                <input v-model="form.titulo" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2" type="text" />
              </label>
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="block space-y-1">
                  <span class="text-sm font-medium text-slate-800">Aluno</span>
                  <select v-model="form.alunoId" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2">
                    <option v-for="a in alunos" :key="a.id" :value="a.id">{{ a.nome }}</option>
                  </select>
                </label>
                <label class="block space-y-1">
                  <span class="text-sm font-medium text-slate-800">Instrutor</span>
                  <select v-model="form.instrutorId" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2">
                    <option v-for="i in instrutores" :key="i.id" :value="i.id">{{ i.nome }}</option>
                  </select>
                </label>
              </div>
              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Objetivo</span>
                <input v-model="form.objetivo" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2" type="text" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Status</span>
                <select v-model="form.status" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2">
                  <option value="ativa">Ativa</option>
                  <option value="inativa">Inativa</option>
                </select>
              </label>

              <div class="space-y-3 border-t border-slate-200 pt-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-slate-900">Exercícios</span>
                  <button class="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50" type="button" @click="addExercise">+ Adicionar</button>
                </div>
                <div v-for="(ex, index) in form.exercicios" :key="ex.id" class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div class="mb-2 flex justify-between">
                    <span class="text-xs font-semibold uppercase text-slate-500">Exercício {{ index + 1 }}</span>
                    <button v-if="form.exercicios.length > 1" class="text-xs text-rose-600" type="button" @click="removeExercise(ex.id)">Remover</button>
                  </div>
                  <div class="grid gap-2 sm:grid-cols-2">
                    <label class="block space-y-1 sm:col-span-2">
                      <span class="text-xs text-slate-600">Nome</span>
                      <input v-model="ex.nome" class="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm" type="text" />
                    </label>
                    <label class="block space-y-1">
                      <span class="text-xs text-slate-600">Séries</span>
                      <input v-model="ex.series" class="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm" type="text" />
                    </label>
                    <label class="block space-y-1">
                      <span class="text-xs text-slate-600">Repetições</span>
                      <input v-model="ex.repeticoes" class="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm" type="text" />
                    </label>
                    <label class="block space-y-1 sm:col-span-2">
                      <span class="text-xs text-slate-600">Observações</span>
                      <input v-model="ex.observacoes" class="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm" type="text" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-5 flex justify-end gap-2">
              <button class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50" type="button" @click="closeModal">Cancelar</button>
              <button class="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400" type="button" @click="onSave">Salvar</button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </section>
</template>
