<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchInstrutores, createInstrutor, updateInstrutor } from '../../services/data'
import { api } from '../../services/api'

const query = ref('')
const onlyActive = ref(false)
const instrutores = ref([])
const loading = ref(false)

const isModalOpen = ref(false)
const isEditing = ref(false)
const formError = ref('')

const form = ref({ id: '', nome: '', email: '', cref: '', especialidade: '', status: 'ativo' })

async function refresh() {
  loading.value = true
  try {
    instrutores.value = await fetchInstrutores()
  } finally {
    loading.value = false
  }
}

onMounted(refresh)

const filteredInstrutores = computed(() => {
  const q = query.value.trim().toLowerCase()
  return instrutores.value.filter((i) => {
    const hay = `${i.nome} ${i.email} ${i.cref} ${i.especialidade} ${i.status}`.toLowerCase()
    const matchesQuery = !q || hay.includes(q)
    const matchesStatus = !onlyActive.value || i.status === 'ativo'
    return matchesQuery && matchesStatus
  })
})

function openCreate() {
  formError.value = ''
  isEditing.value = false
  form.value = { id: '', nome: '', email: '', cref: '', especialidade: '', status: 'ativo' }
  isModalOpen.value = true
}

function openEdit(i) {
  formError.value = ''
  isEditing.value = true
  form.value = { id: i.id, nome: i.nome, email: i.email, cref: i.cref || '', especialidade: i.especialidade || '', status: i.status }
  isModalOpen.value = true
}

function closeModal() { isModalOpen.value = false }
function normalizeEmail(v) { return String(v ?? '').trim().toLowerCase() }

function validate() {
  if (!form.value.nome.trim()) return 'Informe o nome.'
  const email = normalizeEmail(form.value.email)
  if (!email) return 'Informe o e-mail.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Informe um e-mail válido.'
  if (!form.value.cref.trim()) return 'Informe o CREF.'
  if (!form.value.especialidade.trim()) return 'Informe a especialidade.'
  return ''
}

async function onSave() {
  formError.value = ''
  const validationError = validate()
  if (validationError) { formError.value = validationError; return }

  try {
    if (isEditing.value) {
      const updated = await updateInstrutor(form.value.id, {
        cref: form.value.cref,
        especialidade: form.value.especialidade,
        status: form.value.status,
      })
      instrutores.value = instrutores.value.map(i => i.id === updated.id ? updated : i)
    } else {
      await createInstrutor({
        nome: form.value.nome.trim(),
        email: normalizeEmail(form.value.email),
        cref: form.value.cref.trim(),
        especialidade: form.value.especialidade.trim(),
        status: form.value.status,
      })
      await refresh()
    }
    closeModal()
  } catch (err) {
    formError.value = err.message
  }
}

async function onDelete(i) {
  const ok = window.confirm(`Excluir o instrutor "${i.nome}"?`)
  if (!ok) return
  try {
    await api.delete(`/instrutores/${i.id}`)
    instrutores.value = instrutores.value.filter(x => x.id !== i.id)
  } catch (err) {
    window.alert(err.message || 'Erro ao excluir instrutor.')
  }
}

async function onToggleStatus(i) {
  const novoStatus = i.status === 'ativo' ? 'inativo' : 'ativo'
  try {
    const updated = await updateInstrutor(i.id, { cref: i.cref, especialidade: i.especialidade, status: novoStatus })
    instrutores.value = instrutores.value.map(x => x.id === updated.id ? updated : x)
  } catch (err) {
    window.alert(err.message || 'Erro ao alterar status.')
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Instrutores</h1>
      <p class="text-sm text-slate-700">Instrutores cadastrados no banco de dados.</p>
    </header>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <label class="w-full sm:max-w-sm">
          <span class="sr-only">Buscar</span>
          <input v-model="query" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 placeholder:text-slate-500 focus:ring-2" type="search" placeholder="Buscar por nome, e-mail, CREF, especialidade ou status" />
        </label>
        <label class="inline-flex items-center gap-2 text-sm text-slate-700">
          <input v-model="onlyActive" class="h-4 w-4 rounded border-slate-300" type="checkbox" />
          Somente ativos
        </label>
      </div>
      <button class="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400" type="button" @click="openCreate">Novo instrutor</button>
    </div>

    <div v-if="loading" class="py-10 text-center text-sm text-slate-500">Carregando...</div>

    <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">Nome</th>
              <th class="px-4 py-3">E-mail</th>
              <th class="px-4 py-3">CREF</th>
              <th class="px-4 py-3">Especialidade</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="i in filteredInstrutores" :key="i.id" class="hover:bg-slate-50">
              <td class="px-4 py-3">
                <div class="font-semibold text-slate-900">{{ i.nome }}</div>
                <div class="text-xs text-slate-500">{{ i.id }}</div>
              </td>
              <td class="px-4 py-3 text-slate-700">{{ i.email }}</td>
              <td class="px-4 py-3 text-slate-700">{{ i.cref || '-' }}</td>
              <td class="px-4 py-3 text-slate-700">{{ i.especialidade || '-' }}</td>
              <td class="px-4 py-3">
                <button class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold" :class="i.status === 'ativo' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'" type="button" @click="onToggleStatus(i)">{{ i.status }}</button>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-50" type="button" @click="openEdit(i)">Editar</button>
                  <button class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100" type="button" @click="onDelete(i)">Excluir</button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredInstrutores.length === 0">
              <td class="px-4 py-8 text-center text-sm text-slate-700" colspan="6">Nenhum instrutor encontrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/50" @click="closeModal" />
        <div class="relative mx-auto flex min-h-full max-w-md items-center px-4 py-8">
          <div class="w-full rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl" role="dialog" aria-modal="true">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-lg font-bold text-slate-900">{{ isEditing ? 'Editar instrutor' : 'Novo instrutor' }}</div>
                <div class="text-sm text-slate-700">{{ isEditing ? 'Atualize CREF, especialidade e status.' : 'Senha padrão: 123456' }}</div>
              </div>
              <button class="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50" type="button" @click="closeModal">Fechar</button>
            </div>
            <div v-if="formError" class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">{{ formError }}</div>
            <div class="mt-4 space-y-3">
              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Nome</span>
                <input v-model="form.nome" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2" type="text" :disabled="isEditing" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">E-mail</span>
                <input v-model="form.email" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2" type="email" :disabled="isEditing" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">CREF</span>
                <input v-model="form.cref" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2" type="text" placeholder="CREF 123456-G/SP" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Especialidade</span>
                <input v-model="form.especialidade" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2" type="text" placeholder="Ex: Hipertrofia" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Status</span>
                <select v-model="form.status" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </label>
            </div>
            <div class="mt-5 flex justify-end gap-2">
              <button class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50" type="button" @click="closeModal">Cancelar</button>
              <button class="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400" type="button" @click="onSave">Salvar</button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </section>
</template>
