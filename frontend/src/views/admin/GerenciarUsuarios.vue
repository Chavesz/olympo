<script setup>
import { computed, ref } from 'vue'
import { deleteUser, loadUsers, saveUsers, upsertUser } from '../../services/mockDb'

const query = ref('')
const onlyActive = ref(false)
const users = ref(loadUsers())

const isModalOpen = ref(false)
const isEditing = ref(false)
const formError = ref('')

const form = ref({
  id: '',
  nome: '',
  email: '',
  role: 'aluno',
  status: 'ativo',
})

const filteredUsers = computed(() => {
  const q = query.value.trim().toLowerCase()
  return users.value.filter((u) => {
    const hay = `${u.nome} ${u.email} ${u.role} ${u.status}`.toLowerCase()
    const matchesQuery = !q || hay.includes(q)
    const matchesStatus = !onlyActive.value || u.status === 'ativo'
    return matchesQuery && matchesStatus
  })
})

function openCreate() {
  formError.value = ''
  isEditing.value = false
  form.value = { id: '', nome: '', email: '', role: 'aluno', status: 'ativo' }
  isModalOpen.value = true
}

function openEdit(u) {
  formError.value = ''
  isEditing.value = true
  form.value = { ...u }
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
  if (!['admin', 'instrutor', 'aluno'].includes(form.value.role)) return 'Selecione um papel válido.'
  if (!['ativo', 'inativo'].includes(form.value.status)) return 'Selecione um status válido.'
  const emailTaken = users.value.some(
    (u) => normalizeEmail(u.email) === email && u.id !== form.value.id,
  )
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
    form.value.id || (typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `u-${Date.now()}`)

  const payload = {
    id,
    nome: form.value.nome.trim(),
    email: normalizeEmail(form.value.email),
    role: form.value.role,
    status: form.value.status,
  }

  users.value = upsertUser(payload)
  closeModal()
}

function onDelete(u) {
  const ok = window.confirm(`Excluir o usuário "${u.nome}"?`)
  if (!ok) return
  users.value = deleteUser(u.id)
}

function onToggleStatus(u) {
  const next = { ...u, status: u.status === 'ativo' ? 'inativo' : 'ativo' }
  users.value = upsertUser(next)
}

function onResetMock() {
  localStorage.removeItem('olympo:mock:users')
  users.value = loadUsers()
  saveUsers(users.value)
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Gerenciar usuários</h1>
      <p class="text-sm text-slate-700">CRUD completo com dados mockados.</p>
    </header>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <label class="w-full sm:max-w-sm">
          <span class="sr-only">Buscar</span>
          <input
            v-model="query"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 placeholder:text-slate-500 focus:ring-2"
            type="search"
            placeholder="Buscar por nome, e-mail, papel ou status"
          />
        </label>

        <label class="inline-flex items-center gap-2 text-sm text-slate-700">
          <input v-model="onlyActive" class="h-4 w-4 rounded border-slate-300" type="checkbox" />
          Somente ativos
        </label>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
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
          Novo usuário
        </button>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">Nome</th>
              <th class="px-4 py-3">E-mail</th>
              <th class="px-4 py-3">Papel</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-200">
            <tr v-for="u in filteredUsers" :key="u.id" class="hover:bg-slate-50">
              <td class="px-4 py-3">
                <div class="font-semibold text-slate-900">{{ u.nome }}</div>
                <div class="text-xs text-slate-500">{{ u.id }}</div>
              </td>
              <td class="px-4 py-3 text-slate-700">{{ u.email }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
                  :class="
                    u.role === 'admin'
                      ? 'bg-indigo-50 text-indigo-700'
                      : u.role === 'instrutor'
                        ? 'bg-sky-50 text-sky-700'
                        : 'bg-slate-100 text-slate-700'
                  "
                >
                  {{ u.role }}
                </span>
              </td>
              <td class="px-4 py-3">
                <button
                  class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
                  :class="u.status === 'ativo' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
                  type="button"
                  @click="onToggleStatus(u)"
                >
                  {{ u.status }}
                </button>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    type="button"
                    @click="openEdit(u)"
                  >
                    Editar
                  </button>
                  <button
                    class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                    type="button"
                    @click="onDelete(u)"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredUsers.length === 0">
              <td class="px-4 py-8 text-center text-sm text-slate-700" colspan="5">
                Nenhum usuário encontrado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/50" @click="closeModal" />

        <div class="relative mx-auto flex min-h-full max-w-md items-center px-4 py-8">
          <div
            class="w-full rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-lg font-bold text-slate-900">{{ isEditing ? 'Editar usuário' : 'Novo usuário' }}</div>
                <div class="text-sm text-slate-700">Preencha os dados abaixo.</div>
              </div>
              <button
                class="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                type="button"
                @click="closeModal"
              >
                Fechar
              </button>
            </div>

            <div
              v-if="formError"
              class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
              role="alert"
              aria-live="polite"
            >
              {{ formError }}
            </div>

            <div class="mt-4 space-y-3">
              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Nome</span>
                <input
                  v-model="form.nome"
                  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2"
                  type="text"
                  autocomplete="name"
                />
              </label>

              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">E-mail</span>
                <input
                  v-model="form.email"
                  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2"
                  type="email"
                  autocomplete="email"
                  inputmode="email"
                />
              </label>

              <div class="grid gap-3 sm:grid-cols-2">
                <label class="block space-y-1">
                  <span class="text-sm font-medium text-slate-800">Papel</span>
                  <select
                    v-model="form.role"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2"
                  >
                    <option value="aluno">Aluno</option>
                    <option value="instrutor">Instrutor</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <label class="block space-y-1">
                  <span class="text-sm font-medium text-slate-800">Status</span>
                  <select
                    v-model="form.status"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </label>
              </div>
            </div>

            <div class="mt-5 flex justify-end gap-2">
              <button
                class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
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
