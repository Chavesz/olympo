<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchAlunos } from '../../services/data'
import { deletePlan, loadPlans, upsertPlan } from '../../services/plans'

const query = ref('')
const statusFilter = ref('todos')

const plans = ref([])
const alunos = ref([])

async function refresh() {
  const [p, a] = await Promise.all([loadPlans(), fetchAlunos()])
  plans.value = p
  alunos.value = a
}

onMounted(refresh)

const isModalOpen = ref(false)
const isEditing = ref(false)
const formError = ref('')

const form = ref({
  id: '',
  nome: '',
  tipo: 'mensal',
  valor: '',
  descricao: '',
  status: 'ativo',
})

const filteredPlans = computed(() => {
  const q = query.value.trim().toLowerCase()
  return plans.value.filter((p) => {
    const matchesQuery = !q || `${p.nome} ${p.descricao}`.toLowerCase().includes(q)
    const matchesStatus = statusFilter.value === 'todos' || p.status === statusFilter.value
    return matchesQuery && matchesStatus
  })
})

function openCreate() {
  formError.value = ''
  isEditing.value = false
  form.value = { id: '', nome: '', tipo: 'mensal', valor: '', descricao: '', status: 'ativo' }
  isModalOpen.value = true
}

function openEdit(p) {
  formError.value = ''
  isEditing.value = true
  form.value = {
    id: p.id,
    nome: p.nome,
    tipo: p.tipo,
    valor: String(p.valor),
    descricao: p.descricao ?? '',
    status: p.status,
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function validate() {
  if (!form.value.nome.trim()) return 'Informe o nome do plano.'
  if (!['mensal', 'anual'].includes(form.value.tipo)) return 'Selecione o tipo.'
  const valor = Number(form.value.valor)
  if (!Number.isFinite(valor) || valor <= 0) return 'Informe um valor válido.'
  if (!['ativo', 'inativo'].includes(form.value.status)) return 'Selecione um status válido.'
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
    id: form.value.id || undefined,
    nome: form.value.nome.trim(),
    tipo: form.value.tipo,
    valor: Number(form.value.valor),
    descricao: String(form.value.descricao ?? '').trim(),
    status: form.value.status,
  }

  try {
    plans.value = await upsertPlan(payload)
    closeModal()
  } catch (e) {
    formError.value = e.message || 'Erro ao salvar plano.'
  }
}

async function onDelete(p) {
  const ok = window.confirm(`Excluir o plano "${p.nome}"?`)
  if (!ok) return

  const inUse = alunos.value.some((a) => a.planoAtivo === p.nome)
  if (inUse) {
    try {
      plans.value = await upsertPlan({ ...p, status: 'inativo' })
    } catch (e) {
      window.alert(e.message || 'Erro ao desativar plano.')
    }
    return
  }

  try {
    plans.value = await deletePlan(p.id)
  } catch (e) {
    window.alert(e.message || 'Erro ao excluir plano.')
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Gerenciar planos</h1>
      <p class="text-sm text-slate-700">Crie, edite e desative planos.</p>
    </header>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <label class="w-full sm:max-w-sm">
          <span class="sr-only">Buscar</span>
          <input
            v-model="query"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 placeholder:text-slate-500 focus:ring-2"
            type="search"
            placeholder="Buscar por nome ou descrição"
          />
        </label>

        <label class="w-full sm:max-w-xs">
          <span class="sr-only">Status</span>
          <select
            v-model="statusFilter"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          >
            <option value="todos">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </label>
      </div>

      <button
        class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
        type="button"
        @click="openCreate"
      >
        Novo plano
      </button>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">Plano</th>
              <th class="px-4 py-3">Tipo</th>
              <th class="px-4 py-3">Valor</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="p in filteredPlans" :key="p.id">
              <td class="px-4 py-3">
                <div class="font-semibold text-slate-900">{{ p.nome }}</div>
                <div class="text-xs text-slate-500">{{ p.descricao }}</div>
              </td>
              <td class="px-4 py-3 text-slate-700">{{ p.tipo }}</td>
              <td class="px-4 py-3 text-slate-700">R$ {{ Number(p.valor).toFixed(2) }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
                  :class="p.status === 'ativo' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'"
                >
                  {{ p.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    type="button"
                    @click="openEdit(p)"
                  >
                    Editar
                  </button>
                  <button
                    class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                    type="button"
                    @click="onDelete(p)"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredPlans.length === 0">
              <td class="px-4 py-8 text-center text-sm text-slate-700" colspan="5">Nenhum plano encontrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/50" @click="closeModal" />

        <div class="relative mx-auto flex min-h-full max-w-md items-center px-4 py-8">
          <div class="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-xl" role="dialog" aria-modal="true">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-lg font-bold text-slate-900">{{ isEditing ? 'Editar plano' : 'Novo plano' }}</div>
                <div class="text-sm text-slate-700">Mensal ou anual.</div>
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
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  type="text"
                />
              </label>

              <div class="grid gap-3 sm:grid-cols-2">
                <label class="block space-y-1">
                  <span class="text-sm font-medium text-slate-800">Tipo</span>
                  <select
                    v-model="form.tipo"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                  </select>
                </label>

                <label class="block space-y-1">
                  <span class="text-sm font-medium text-slate-800">Valor</span>
                  <input
                    v-model="form.valor"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                    type="number"
                    step="0.01"
                  />
                </label>
              </div>

              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Descrição</span>
                <textarea
                  v-model="form.descricao"
                  class="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                />
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

