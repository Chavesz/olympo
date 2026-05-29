<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { getEmail } from '../../services/auth'
import {
  createExerciseId,
  emptyExercise,
  getExerciciosFromFicha,
  serializeExerciciosToText,
} from '../../services/fichaExercises'
import {
  createFicha,
  fetchAlunos,
  fetchFichas,
  fetchInstrutores,
  updateFicha,
} from '../../services/data'

const email = computed(() => getEmail())

const alunos = ref([])
const fichas = ref([])
const instrutores = ref([])

onMounted(async () => {
  const [a, f, i] = await Promise.all([fetchAlunos(), fetchFichas(), fetchInstrutores()])
  alunos.value = a.filter((x) => x.status === 'ativo')
  fichas.value = f
  instrutores.value = i
})

const instrutor = computed(() => {
  const normalizedEmail = String(email.value ?? '').toLowerCase()
  return instrutores.value.find((i) => String(i.email).toLowerCase() === normalizedEmail) ?? null
})

const query = ref('')
const selectedAlunoId = ref('')
const formError = ref('')
const successMessage = ref('')

watch(
  alunos,
  (list) => {
    if (!selectedAlunoId.value && list.length) selectedAlunoId.value = list[0].id
  },
  { immediate: true },
)

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
  exercicios: [emptyExercise()],
})

watch(
  () => selectedAlunoId.value,
  () => {
    successMessage.value = ''
    formError.value = ''
    const f = fichaAtual.value
    const exercicios = f ? getExerciciosFromFicha(f) : [emptyExercise()]
    form.value = {
      id: f?.id ?? '',
      titulo: f?.titulo ?? 'Treino A',
      objetivo: f?.objetivo ?? 'Hipertrofia',
      status: f?.status ?? 'ativa',
      exercicios: exercicios.length ? exercicios : [emptyExercise()],
    }
  },
  { immediate: true },
)

function addExercise() {
  form.value.exercicios.push(emptyExercise())
}

function removeExercise(id) {
  if (form.value.exercicios.length <= 1) return
  form.value.exercicios = form.value.exercicios.filter((e) => e.id !== id)
}

function validate() {
  if (!selectedAlunoId.value) return 'Selecione um aluno.'
  if (!form.value.titulo.trim()) return 'Informe o título.'
  if (!form.value.objetivo.trim()) return 'Informe o objetivo.'
  if (!['ativa', 'inativa'].includes(form.value.status)) return 'Selecione um status válido.'
  const valid = form.value.exercicios.filter((e) => String(e.nome ?? '').trim())
  if (valid.length === 0) return 'Adicione pelo menos um exercício com nome.'
  for (const ex of valid) {
    if (!String(ex.series ?? '').trim()) return `Informe as séries de "${ex.nome}".`
    if (!String(ex.repeticoes ?? '').trim()) return `Informe as repetições de "${ex.nome}".`
  }
  return ''
}

async function onSave() {
  successMessage.value = ''
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

  const payload = {
    titulo: form.value.titulo.trim(),
    alunoId: selectedAlunoId.value,
    instrutorId: instrutor.value?.id ?? '',
    objetivo: form.value.objetivo.trim(),
    status: form.value.status,
    exercicios,
    exerciciosText: serializeExerciciosToText(exercicios),
  }

  try {
    if (form.value.id) {
      await updateFicha(form.value.id, payload)
    } else {
      const created = await createFicha(payload)
      form.value.id = created.id
    }
    fichas.value = await fetchFichas()
    successMessage.value = 'Ficha atualizada. O aluno verá em “Meus Treinos”.'
  } catch (e) {
    formError.value = e.message || 'Erro ao salvar ficha.'
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Gerenciar treinos</h1>
      <p class="text-sm text-slate-700">
        Cadastre cada exercício com nome, séries, repetições e observações. O aluno vê os campos separados.
      </p>
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
          </div>

          <div class="mt-6 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-slate-900">Exercícios</span>
              <button
                class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                type="button"
                @click="addExercise"
              >
                + Adicionar exercício
              </button>
            </div>

            <div
              v-for="(ex, index) in form.exercicios"
              :key="ex.id"
              class="rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div class="mb-2 flex items-center justify-between">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Exercício {{ index + 1 }}
                </span>
                <button
                  v-if="form.exercicios.length > 1"
                  class="text-xs font-semibold text-rose-600 hover:text-rose-700"
                  type="button"
                  @click="removeExercise(ex.id)"
                >
                  Remover
                </button>
              </div>
              <div class="grid gap-2 sm:grid-cols-2">
                <label class="block space-y-1 sm:col-span-2">
                  <span class="text-xs font-medium text-slate-700">Nome</span>
                  <input
                    v-model="ex.nome"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                    type="text"
                    placeholder="Ex.: Supino reto"
                  />
                </label>
                <label class="block space-y-1">
                  <span class="text-xs font-medium text-slate-700">Séries</span>
                  <input
                    v-model="ex.series"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                    type="text"
                    placeholder="4"
                  />
                </label>
                <label class="block space-y-1">
                  <span class="text-xs font-medium text-slate-700">Repetições</span>
                  <input
                    v-model="ex.repeticoes"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                    type="text"
                    placeholder="8-10"
                  />
                </label>
                <label class="block space-y-1 sm:col-span-2">
                  <span class="text-xs font-medium text-slate-700">Observações</span>
                  <input
                    v-model="ex.observacoes"
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                    type="text"
                    placeholder="Opcional"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
