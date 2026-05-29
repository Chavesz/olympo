<script setup>
import { computed, ref, watch } from 'vue'
import { loadAlunos } from '../../services/mockDb'
import { loadEvaluations, saveEvaluations } from '../../services/evaluations'

const alunos = ref(loadAlunos())
const selectedAlunoId = ref(alunos.value[0]?.id ?? '')

const items = ref(loadEvaluations(selectedAlunoId.value))

watch(
  () => selectedAlunoId.value,
  (id) => {
    items.value = loadEvaluations(id)
  },
)

const selectedAluno = computed(() => alunos.value.find((a) => a.id === selectedAlunoId.value) ?? null)

const isModalOpen = ref(false)
const isEditing = ref(false)
const formError = ref('')

const form = ref({
  id: '',
  data: new Date().toISOString().slice(0, 10),
  peso: '',
  altura: '',
  gordura: '',
  observacao: '',
})

function openCreate() {
  formError.value = ''
  isEditing.value = false
  form.value = {
    id: '',
    data: new Date().toISOString().slice(0, 10),
    peso: '',
    altura: '',
    gordura: '',
    observacao: '',
  }
  isModalOpen.value = true
}

function openEdit(x) {
  formError.value = ''
  isEditing.value = true
  form.value = {
    id: x.id,
    data: x.data,
    peso: String(x.peso ?? ''),
    altura: String(x.altura ?? ''),
    gordura: String(x.gordura ?? ''),
    observacao: x.observacao ?? '',
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function validate() {
  if (!selectedAlunoId.value) return 'Selecione um aluno.'
  if (!form.value.data) return 'Informe a data.'
  const peso = Number(form.value.peso)
  const altura = Number(form.value.altura)
  const gordura = Number(form.value.gordura)
  if (!Number.isFinite(peso) || peso <= 0) return 'Informe um peso válido.'
  if (!Number.isFinite(altura) || altura <= 0) return 'Informe uma altura válida.'
  if (!Number.isFinite(gordura) || gordura < 0) return 'Informe um percentual de gordura válido.'
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
    form.value.id || (typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `av-${Date.now()}`)

  const payload = {
    id,
    data: form.value.data,
    peso: Number(form.value.peso),
    altura: Number(form.value.altura),
    gordura: Number(form.value.gordura),
    observacao: String(form.value.observacao ?? '').trim(),
  }

  const next = [...items.value]
  const idx = next.findIndex((x) => x.id === id)
  if (idx >= 0) next[idx] = payload
  else next.unshift(payload)

  next.sort((a, b) => String(b.data).localeCompare(String(a.data)))
  items.value = next
  saveEvaluations(selectedAlunoId.value, next)
  closeModal()
}

function onDelete(x) {
  const ok = window.confirm('Excluir esta avaliação?')
  if (!ok) return
  const next = items.value.filter((i) => i.id !== x.id)
  items.value = next
  saveEvaluations(selectedAlunoId.value, next)
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Evolução dos alunos</h1>
      <p class="text-sm text-slate-700">Registre avaliações e acompanhe medidas ao longo do tempo.</p>
    </header>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label class="block w-full sm:max-w-md">
        <span class="text-sm font-medium text-slate-800">Aluno</span>
        <select
          v-model="selectedAlunoId"
          class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
        >
          <option v-for="a in alunos" :key="a.id" :value="a.id">{{ a.nome }}</option>
        </select>
      </label>

      <button
        class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
        type="button"
        @click="openCreate"
      >
        Adicionar avaliação
      </button>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
        {{ selectedAluno?.nome ?? 'Avaliações' }}
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">Data</th>
              <th class="px-4 py-3">Peso</th>
              <th class="px-4 py-3">Altura</th>
              <th class="px-4 py-3">% Gordura</th>
              <th class="px-4 py-3">Observação</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="x in items" :key="x.id">
              <td class="px-4 py-3 font-semibold text-slate-900">{{ x.data }}</td>
              <td class="px-4 py-3 text-slate-700">{{ x.peso.toFixed(1) }} kg</td>
              <td class="px-4 py-3 text-slate-700">{{ x.altura.toFixed(2) }} m</td>
              <td class="px-4 py-3 text-slate-700">{{ x.gordura.toFixed(1) }}%</td>
              <td class="max-w-xs px-4 py-3 text-slate-700">{{ x.observacao || '—' }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    type="button"
                    @click="openEdit(x)"
                  >
                    Editar
                  </button>
                  <button
                    class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                    type="button"
                    @click="onDelete(x)"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td class="px-4 py-8 text-center text-sm text-slate-700" colspan="6">Sem avaliações.</td>
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
                <div class="text-lg font-bold text-slate-900">{{ isEditing ? 'Editar avaliação' : 'Nova avaliação' }}</div>
                <div class="text-sm text-slate-700">Campos principais de avaliação física.</div>
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
                <span class="text-sm font-medium text-slate-800">Data</span>
                <input
                  v-model="form.data"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  type="date"
                />
              </label>

              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Peso (kg)</span>
                <input
                  v-model="form.peso"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  type="number"
                  step="0.1"
                />
              </label>

              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Altura (m)</span>
                <input
                  v-model="form.altura"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  type="number"
                  step="0.01"
                />
              </label>

              <label class="block space-y-1 sm:col-span-2">
                <span class="text-sm font-medium text-slate-800">% Gordura</span>
                <input
                  v-model="form.gordura"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  type="number"
                  step="0.1"
                />
              </label>

              <label class="block space-y-1 sm:col-span-2">
                <span class="text-sm font-medium text-slate-800">Observação (opcional)</span>
                <textarea
                  v-model="form.observacao"
                  class="min-h-[72px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  rows="3"
                  placeholder="Notas do instrutor sobre a avaliação"
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

