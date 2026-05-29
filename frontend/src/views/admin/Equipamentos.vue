<script setup>
import { computed, ref } from 'vue'
import { deleteEquipamento, loadEquipamentos, upsertEquipamento } from '../../services/equipamentos'
import { loadUnidades } from '../../services/unidades'

const equipamentos = ref(loadEquipamentos())
const unidades = ref(loadUnidades())

const isModalOpen = ref(false)
const isEditing = ref(false)
const formError = ref('')

const form = ref({
  id: '',
  nome: '',
  categoria: '',
  quantidade: '1',
  status: 'disponivel',
  unidadeId: unidades.value[0]?.id ?? '',
})

const unidadeById = computed(() => new Map(unidades.value.map((u) => [u.id, u])))

function openCreate() {
  isEditing.value = false
  formError.value = ''
  form.value = {
    id: '',
    nome: '',
    categoria: '',
    quantidade: '1',
    status: 'disponivel',
    unidadeId: unidades.value[0]?.id ?? '',
  }
  isModalOpen.value = true
}

function openEdit(e) {
  isEditing.value = true
  formError.value = ''
  form.value = {
    ...e,
    quantidade: String(e.quantidade),
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function validate() {
  if (!form.value.nome.trim()) return 'Informe o nome do equipamento.'
  if (!form.value.categoria.trim()) return 'Informe a categoria.'
  if (!form.value.unidadeId) return 'Selecione a unidade.'
  const qtd = Number(form.value.quantidade)
  if (!Number.isFinite(qtd) || qtd < 1) return 'Informe uma quantidade válida.'
  return ''
}

function onSave() {
  formError.value = ''
  const err = validate()
  if (err) {
    formError.value = err
    return
  }
  const id =
    form.value.id || (typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `eq-${Date.now()}`)
  equipamentos.value = upsertEquipamento({
    id,
    nome: form.value.nome.trim(),
    categoria: form.value.categoria.trim(),
    quantidade: Number(form.value.quantidade),
    status: form.value.status,
    unidadeId: form.value.unidadeId,
  })
  closeModal()
}

function onDelete(e) {
  if (!window.confirm(`Excluir "${e.nome}"?`)) return
  equipamentos.value = deleteEquipamento(e.id)
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Equipamentos</h1>
      <p class="text-sm text-slate-700">Patrimônio físico por unidade (somente painel admin).</p>
    </header>

    <div class="flex justify-end">
      <button class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400" type="button" @click="openCreate">Novo equipamento</button>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-4 py-3">Nome</th>
            <th class="px-4 py-3">Categoria</th>
            <th class="px-4 py-3">Qtd</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Unidade</th>
            <th class="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="e in equipamentos" :key="e.id">
            <td class="px-4 py-3 font-semibold text-slate-900">{{ e.nome }}</td>
            <td class="px-4 py-3 text-slate-700">{{ e.categoria }}</td>
            <td class="px-4 py-3 text-slate-700">{{ e.quantidade }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="e.status === 'disponivel' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'"
              >
                {{ e.status === 'disponivel' ? 'Disponível' : 'Em manutenção' }}
              </span>
            </td>
            <td class="px-4 py-3 text-slate-700">{{ unidadeById.get(e.unidadeId)?.nome ?? '—' }}</td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-2">
                <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50" type="button" @click="openEdit(e)">Editar</button>
                <button class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700" type="button" @click="onDelete(e)">Excluir</button>
              </div>
            </td>
          </tr>
          <tr v-if="equipamentos.length === 0">
            <td class="px-4 py-8 text-center text-slate-600" colspan="6">Nenhum equipamento cadastrado.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/50" @click="closeModal" />
        <div class="relative mx-auto flex min-h-full max-w-md items-center px-4 py-8">
          <div class="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-xl" role="dialog" aria-modal="true">
            <h2 class="text-lg font-bold">{{ isEditing ? 'Editar equipamento' : 'Novo equipamento' }}</h2>
            <div v-if="formError" class="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{{ formError }}</div>
            <div class="mt-4 space-y-3">
              <label class="block space-y-1">
                <span class="text-sm font-medium">Nome</span>
                <input v-model="form.nome" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="text" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Categoria</span>
                <input v-model="form.categoria" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="text" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Quantidade</span>
                <input v-model="form.quantidade" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="number" min="1" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Status</span>
                <select v-model="form.status" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                  <option value="disponivel">Disponível</option>
                  <option value="manutencao">Em manutenção</option>
                </select>
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Unidade</span>
                <select v-model="form.unidadeId" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                  <option v-for="u in unidades" :key="u.id" :value="u.id">{{ u.nome }}</option>
                </select>
              </label>
            </div>
            <div class="mt-5 flex justify-end gap-2">
              <button class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold" type="button" @click="closeModal">Cancelar</button>
              <button class="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950" type="button" @click="onSave">Salvar</button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </section>
</template>
