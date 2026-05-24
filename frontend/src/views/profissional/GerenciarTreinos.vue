<script setup>
import { computed, ref, watch } from 'vue'
import { getEmail } from '../../services/auth'
import { loadAlunos, loadFichas, loadInstrutores, upsertFicha } from '../../services/mockDb'

const email = computed(() => getEmail())

const alunos = ref(loadAlunos().filter((a) => a.status === 'ativo'))
const fichas = ref(loadFichas())
const instrutores = ref(loadInstrutores())

const instrutor = computed(() => {
  const normalizedEmail = String(email.value ?? '').toLowerCase()
  return instrutores.value.find((i) => String(i.email).toLowerCase() === normalizedEmail) ?? null
})

const query = ref('')
const selectedAlunoId = ref(alunos.value[0]?.id ?? '')
const formError = ref('')
const successMessage = ref('')

const filteredAlunos = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return alunos.value
  return alunos.value.filter((a) => `${a.nome} ${a.email}`.toLowerCase().includes(q))
})

const fichaAtual = computed(() => fichas.value.find((f) => f.alunoId === selectedAlunoId.value) ?? null)

const form = ref({
  id: '',
  titulo: '',
  objetivo: '',
  status: 'ativa',
  exerciciosText: '',
})

watch(
  () => selectedAlunoId.value,
  () => {
    successMessage.value = ''
    formError.value = ''
    const f = fichaAtual.value
    form.value = {
      id: f?.id ?? '',
      titulo: f?.titulo ?? 'Treino A',
      objetivo: f?.objetivo ?? 'Hipertrofia',
      status: f?.status ?? 'ativa',
      exerciciosText: f?.exerciciosText ?? 'Supino reto — 4x 8-10',
    }
  },
  { immediate: true },
)

function validate() {
  if (!selectedAlunoId.value) return 'Selecione um aluno.'
  if (!form.value.titulo.trim()) return 'Informe o título.'
  if (!form.value.objetivo.trim()) return 'Informe o objetivo.'
  if (!['ativa', 'inativa'].includes(form.value.status)) return 'Selecione um status válido.'
  if (!String(form.value.exerciciosText ?? '').trim()) return 'Informe pelo menos um exercício.'
  return ''
}

function onSave() {
  successMessage.value = ''
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
    alunoId: selectedAlunoId.value,
    instrutorId: instrutor.value?.id ?? '',
    objetivo: form.value.objetivo.trim(),
    status: form.value.status,
    exerciciosText: String(form.value.exerciciosText ?? '').trim(),
    updatedAt: Date.now(),
  }

  fichas.value = upsertFicha(payload)
  successMessage.value = 'Ficha atualizada. O aluno verá em “Meus Treinos”.'
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Gerenciar treinos</h1>
      <p class="text-sm text-slate-700">Selecione um aluno e edite a ficha. Alterações refletem no painel do aluno.</p>
    </header>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="space-y-3 lg:col-span-1">
        <label class="block space-y-1">
          <span class="text-sm font-medium text-slate-800">Buscar aluno</span>
          <input
            v-model="query"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
            type="search"
            placeholder="Nome ou e-mail"
          />
        </label>

        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">Alunos</div>
          <ul class="max-h-[420px] divide-y divide-slate-200 overflow-auto">
            <li v-for="a in filteredAlunos" :key="a.id">
              <button
                class="w-full px-4 py-3 text-left hover:bg-slate-50"
                type="button"
                :class="selectedAlunoId === a.id ? 'bg-slate-50' : ''"
                @click="selectedAlunoId = a.id"
              >
                <div class="text-sm font-semibold text-slate-900">{{ a.nome }}</div>
                <div class="text-xs text-slate-500">{{ a.email }}</div>
              </button>
            </li>
            <li v-if="filteredAlunos.length === 0" class="px-4 py-6 text-sm text-slate-700">
              Nenhum aluno encontrado.
            </li>
          </ul>
        </div>
      </div>

      <div class="space-y-4 lg:col-span-2">
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div class="text-sm font-semibold text-slate-900">Ficha atual</div>
              <div class="text-sm text-slate-700">
                {{ fichaAtual ? `Atualizada em ${new Date(fichaAtual.updatedAt).toLocaleString('pt-BR')}` : 'Sem ficha cadastrada' }}
              </div>
            </div>
            <button
              class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
              type="button"
              @click="onSave"
            >
              Salvar
            </button>
          </div>

          <div
            v-if="successMessage"
            class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
            role="status"
            aria-live="polite"
          >
            {{ successMessage }}
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
              <span class="text-sm font-medium text-slate-800">Título / grupo muscular</span>
              <input
                v-model="form.titulo"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                type="text"
              />
            </label>

            <label class="block space-y-1">
              <span class="text-sm font-medium text-slate-800">Objetivo</span>
              <input
                v-model="form.objetivo"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                type="text"
              />
            </label>

            <label class="block space-y-1">
              <span class="text-sm font-medium text-slate-800">Status</span>
              <select
                v-model="form.status"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
              >
                <option value="ativa">Ativa</option>
                <option value="inativa">Inativa</option>
              </select>
            </label>

            <label class="block space-y-1 sm:col-span-2">
              <span class="text-sm font-medium text-slate-800">Exercícios</span>
              <textarea
                v-model="form.exerciciosText"
                class="min-h-40 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                placeholder="Um exercício por linha (ex.: Supino reto — 4x 8-10 — observações)"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

