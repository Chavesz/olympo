<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createAluno, deleteAluno, fetchAlunos, updateAluno } from '../../services/data'
import { loadPlans } from '../../services/plans'

const router = useRouter()

const query = ref('')
const statusFilter = ref('todos')
const planoFilter = ref('todos')

const alunos = ref([])
const planos = ref([])

const isModalOpen = ref(false)
const isEditing = ref(false)
const formError = ref('')

const form = ref({
  id: '',
  nome: '',
  email: '',
  telefone: '',
  dataNascimento: '',
  dataMatricula: new Date().toISOString().slice(0, 10),
  planoAtivo: 'Mensal',
  status: 'ativo',
})

const planosAtivos = computed(() => planos.value.filter((p) => p.status === 'ativo'))

async function refresh() {
  const [a, p] = await Promise.all([fetchAlunos(), loadPlans()])
  alunos.value = a
  planos.value = p
}

onMounted(refresh)

function planoIdFromNome(nome) {
  return planosAtivos.value.find((p) => p.nome === nome)?.id ?? null
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

const filteredAlunos = computed(() => {
  const q = query.value.trim().toLowerCase()
  return alunos.value.filter((a) => {
    const matchesQuery = !q || `${a.nome} ${a.email}`.toLowerCase().includes(q)
    const matchesStatus = statusFilter.value === 'todos' || a.status === statusFilter.value
    const matchesPlano = planoFilter.value === 'todos' || a.planoAtivo === planoFilter.value
    return matchesQuery && matchesStatus && matchesPlano
  })
})

function openCreate() {
  formError.value = ''
  isEditing.value = false
  form.value = {
    id: '',
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
    dataMatricula: new Date().toISOString().slice(0, 10),
    planoAtivo: planosAtivos.value[0]?.nome ?? 'Mensal',
    status: 'ativo',
  }
  isModalOpen.value = true
}

function openEdit(a) {
  formError.value = ''
  isEditing.value = true
  form.value = {
    id: a.id,
    nome: a.nome ?? '',
    email: a.email ?? '',
    telefone: a.telefone ?? '',
    dataNascimento: a.dataNascimento ?? '',
    dataMatricula: a.dataMatricula ?? new Date().toISOString().slice(0, 10),
    planoAtivo: a.planoAtivo ?? (planosAtivos.value[0]?.nome ?? 'Mensal'),
    status: a.status ?? 'ativo',
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function validate() {
  if (!form.value.nome.trim()) return 'Informe o nome completo.'
  const email = normalizeEmail(form.value.email)
  if (!email) return 'Informe o e-mail.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Informe um e-mail válido.'
  if (!form.value.telefone.trim()) return 'Informe o telefone.'
  if (!form.value.dataNascimento) return 'Informe a data de nascimento.'
  if (!form.value.planoAtivo) return 'Selecione o plano.'
  const emailTaken = alunos.value.some((a) => normalizeEmail(a.email) === email && a.id !== form.value.id)
  if (emailTaken) return 'Este e-mail já está em uso.'
  return ''
}

async function onSave() {
  formError.value = ''
  const validationError = validate()
  if (validationError) {
    formError.value = validationError
    return
  }

  const payload = {
    nome: form.value.nome.trim(),
    email: normalizeEmail(form.value.email),
    telefone: String(form.value.telefone ?? '').trim(),
    dataNascimento: form.value.dataNascimento,
    dataMatricula: form.value.dataMatricula,
    status: form.value.status,
  }
  const planoId = planoIdFromNome(form.value.planoAtivo)

  try {
    if (isEditing.value && form.value.id) {
      await updateAluno(form.value.id, payload, planoId)
    } else {
      await createAluno(payload, planoId)
    }
    await refresh()
    closeModal()
  } catch (e) {
    formError.value = e.message || 'Erro ao salvar aluno.'
  }
}

async function onDelete(a) {
  const ok = window.confirm(`Excluir o aluno "${a.nome}"?`)
  if (!ok) return
  try {
    await deleteAluno(a.id)
    await refresh()
  } catch (e) {
    window.alert(e.message || 'Erro ao excluir aluno.')
  }
}

function goToFicha(a) {
  router.push(`/profissional/alunos/${a.id}`)
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Gerenciar alunos</h1>
      <p class="text-sm text-slate-700">Busca, filtros e CRUD. Clique em um aluno para abrir a ficha.</p>
    </header>

    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div class="grid gap-2 sm:grid-cols-3 lg:flex lg:flex-1 lg:items-center">
        <label class="w-full">
          <span class="sr-only">Buscar por nome</span>
          <input
            v-model="query"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 placeholder:text-slate-500 focus:ring-2"
            type="search"
            placeholder="Buscar por nome ou e-mail"
          />
        </label>

        <label class="w-full">
          <span class="sr-only">Filtrar por plano</span>
          <select
            v-model="planoFilter"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          >
            <option value="todos">Todos os planos</option>
            <option v-for="p in planosAtivos" :key="p.id" :value="p.nome">{{ p.nome }}</option>
          </select>
        </label>

        <label class="w-full">
          <span class="sr-only">Filtrar por status</span>
          <select
            v-model="statusFilter"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </label>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
          type="button"
          @click="openCreate"
        >
          Cadastrar novo aluno
        </button>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">Aluno</th>
              <th class="px-4 py-3">Plano</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="a in filteredAlunos" :key="a.id" class="hover:bg-slate-50">
              <td class="px-4 py-3">
                <button class="flex w-full items-center gap-3 text-left" type="button" @click="goToFicha(a)">
                  <div class="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {{ a.nome?.slice(0, 1)?.toUpperCase() }}
                  </div>
                  <div>
                    <div class="font-semibold text-slate-900">{{ a.nome }}</div>
                    <div class="text-xs text-slate-500">{{ a.email }}</div>
                  </div>
                </button>
              </td>
              <td class="px-4 py-3 text-slate-700">{{ a.planoAtivo ?? '-' }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
                  :class="a.status === 'ativo' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'"
                >
                  {{ a.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    type="button"
                    @click="openEdit(a)"
                  >
                    Editar
                  </button>
                  <button
                    class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                    type="button"
                    @click="onDelete(a)"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredAlunos.length === 0">
              <td class="px-4 py-8 text-center text-sm text-slate-600" colspan="4">Nenhum aluno encontrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/50" @click="closeModal" />

        <div class="relative mx-auto flex min-h-full max-w-xl items-center px-4 py-8">
          <div class="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-xl" role="dialog" aria-modal="true">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-lg font-bold text-slate-900">{{ isEditing ? 'Editar aluno' : 'Cadastrar aluno' }}</div>
                <div class="text-sm text-slate-700">Cadastro presencial.</div>
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

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <label class="block space-y-1 sm:col-span-2">
                <span class="text-sm font-medium text-slate-800">Nome completo</span>
                <input
                  v-model="form.nome"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  type="text"
                  autocomplete="name"
                />
              </label>

              <label class="block space-y-1 sm:col-span-2">
                <span class="text-sm font-medium text-slate-800">E-mail</span>
                <input
                  v-model="form.email"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  type="email"
                  autocomplete="email"
                />
              </label>

              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Telefone</span>
                <input
                  v-model="form.telefone"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  type="text"
                  autocomplete="tel"
                />
              </label>

              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Nascimento</span>
                <input
                  v-model="form.dataNascimento"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  type="date"
                />
              </label>

              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Plano</span>
                <select
                  v-model="form.planoAtivo"
                  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                >
                  <option v-for="p in planosAtivos" :key="p.id" :value="p.nome">{{ p.nome }}</option>
                </select>
              </label>

              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Status</span>
                <select
                  v-model="form.status"
                  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </label>

              <label class="block space-y-1 sm:col-span-2">
                <span class="text-sm font-medium text-slate-800">Data de matrícula</span>
                <input
                  v-model="form.dataMatricula"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  type="date"
                />
              </label>
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

