<script setup>
import { computed, ref } from 'vue'
import { deleteAluno, loadAlunos, saveAlunos, upsertAluno } from '../../services/mockDb'

const query = ref('')
const onlyActive = ref(false)
const alunos = ref(loadAlunos())

const isModalOpen = ref(false)
const isEditing = ref(false)
const formError = ref('')

const form = ref({
  id: '',
  nome: '',
  email: '',
  telefone: '',
  status: 'ativo',
})

const filteredAlunos = computed(() => {
  const q = query.value.trim().toLowerCase()
  return alunos.value.filter((a) => {
    const hay = `${a.nome} ${a.email} ${a.telefone} ${a.status}`.toLowerCase()
    const matchesQuery = !q || hay.includes(q)
    const matchesStatus = !onlyActive.value || a.status === 'ativo'
    return matchesQuery && matchesStatus
  })
})

function openCreate() {
  formError.value = ''
  isEditing.value = false
  form.value = { id: '', nome: '', email: '', telefone: '', status: 'ativo' }
  isModalOpen.value = true
}

function openEdit(a) {
  formError.value = ''
  isEditing.value = true
  form.value = { ...a }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

function validate() {
  if (!form.value.nome.trim()) return 'Informe o nome.'
  const email = normalizeEmail(form.value.email)
  if (!email) return 'Informe o e-mail.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Informe um e-mail válido.'
  if (!['ativo', 'inativo'].includes(form.value.status)) return 'Selecione um status válido.'
  const emailTaken = alunos.value.some((a) => normalizeEmail(a.email) === email && a.id !== form.value.id)
  if (emailTaken) return 'Este e-mail já está em uso.'
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
    form.value.id || (typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `a-${Date.now()}`)

  const payload = {
    id,
    nome: form.value.nome.trim(),
    email: normalizeEmail(form.value.email),
    telefone: String(form.value.telefone ?? '').trim(),
    status: form.value.status,
  }

  alunos.value = upsertAluno(payload)
  closeModal()
}

function onDelete(a) {
  const ok = window.confirm(`Excluir o aluno "${a.nome}"?`)
  if (!ok) return
  alunos.value = deleteAluno(a.id)
}

function onToggleStatus(a) {
  const next = { ...a, status: a.status === 'ativo' ? 'inativo' : 'ativo' }
  alunos.value = upsertAluno(next)
}

function onResetMock() {
  localStorage.removeItem('olympo:mock:alunos')
  alunos.value = loadAlunos()
  saveAlunos(alunos.value)
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-slate-50">Alunos</h1>
      <p class="text-sm text-slate-300">CRUD de alunos com dados mockados.</p>
    </header>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <label class="w-full sm:max-w-sm">
          <span class="sr-only">Buscar</span>
          <input
            v-model="query"
            class="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-slate-400 placeholder:text-slate-500 focus:ring-2"
            type="search"
            placeholder="Buscar por nome, e-mail, telefone ou status"
          />
        </label>

        <label class="inline-flex items-center gap-2 text-sm text-slate-300">
          <input v-model="onlyActive" class="h-4 w-4 rounded border-slate-700 bg-slate-900" type="checkbox" />
          Somente ativos
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
          Novo aluno
        </button>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th class="px-4 py-3">Nome</th>
              <th class="px-4 py-3">E-mail</th>
              <th class="px-4 py-3">Telefone</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-800">
            <tr v-for="a in filteredAlunos" :key="a.id" class="text-slate-100">
              <td class="px-4 py-3">
                <div class="font-semibold">{{ a.nome }}</div>
                <div class="text-xs text-slate-400">{{ a.id }}</div>
              </td>
              <td class="px-4 py-3 text-slate-200">{{ a.email }}</td>
              <td class="px-4 py-3 text-slate-200">{{ a.telefone || '-' }}</td>
              <td class="px-4 py-3">
                <button
                  class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
                  :class="a.status === 'ativo' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-rose-500/15 text-rose-200'"
                  type="button"
                  @click="onToggleStatus(a)"
                >
                  {{ a.status }}
                </button>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-semibold text-slate-50 hover:bg-slate-800"
                    type="button"
                    @click="openEdit(a)"
                  >
                    Editar
                  </button>
                  <button
                    class="rounded-lg border border-rose-700 bg-rose-950 px-3 py-1.5 text-sm font-semibold text-rose-100 hover:bg-rose-900"
                    type="button"
                    @click="onDelete(a)"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredAlunos.length === 0">
              <td class="px-4 py-8 text-center text-sm text-slate-400" colspan="5">
                Nenhum aluno encontrado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/60" @click="closeModal" />

        <div class="relative mx-auto flex min-h-full max-w-md items-center px-4 py-8">
          <div
            class="w-full rounded-2xl border border-slate-800 bg-slate-950 p-5 text-slate-50 shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-lg font-bold">{{ isEditing ? 'Editar aluno' : 'Novo aluno' }}</div>
                <div class="text-sm text-slate-300">Preencha os dados abaixo.</div>
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
                <span class="text-sm font-medium text-slate-200">Nome</span>
                <input
                  v-model="form.nome"
                  class="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-slate-400 focus:ring-2"
                  type="text"
                  autocomplete="name"
                />
              </label>

              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-200">E-mail</span>
                <input
                  v-model="form.email"
                  class="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-slate-400 focus:ring-2"
                  type="email"
                  autocomplete="email"
                  inputmode="email"
                />
              </label>

              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-200">Telefone</span>
                <input
                  v-model="form.telefone"
                  class="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-slate-400 focus:ring-2"
                  type="text"
                  autocomplete="tel"
                />
              </label>

              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-200">Status</span>
                <select
                  v-model="form.status"
                  class="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-slate-400 focus:ring-2"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
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

