<script setup>
import { computed, onMounted, ref } from 'vue'
import { api } from '../../services/api'

const query = ref('')
const onlyActive = ref(true)

const alunos = ref([])
const instrutores = ref([])
const fichas = ref([])
const loading = ref(false)

const isModalOpen = ref(false)
const isEditing = ref(false)
const formError = ref('')

const form = ref({
  id: '',
  titulo: '',
  aluno_id: '',
  instrutor_id: '',
  objetivo: '',
  status: 'ativa',
  exerciciosText: '',
})

onMounted(async () => {
  loading.value = true
  const [a, i, f] = await Promise.all([api.get('/alunos'), api.get('/instrutores'), api.get('/fichas')])
  alunos.value = a
  instrutores.value = i
  fichas.value = f
  loading.value = false
})

const alunoById = computed(() => new Map(alunos.value.map(a => [a.id, a])))
const instrutorById = computed(() => new Map(instrutores.value.map(i => [i.id, i])))

const filteredFichas = computed(() => {
  const q = query.value.trim().toLowerCase()
  return fichas.value.filter((f) => {
    const aluno = alunoById.value.get(f.aluno_id)
    const instrutor = instrutorById.value.get(f.instrutor_id)
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
    aluno_id: alunos.value[0]?.id ?? '',
    instrutor_id: instrutores.value[0]?.id ?? '',
    objetivo: '',
    status: 'ativa',
    exerciciosText: '',
  }
  isModalOpen.value = true
}

function openEdit(f) {
  formError.value = ''
  isEditing.value = true
  // Converte o array de exercícios de volta para texto
  const exText = Array.isArray(f.exercicios)
    ? f.exercicios.map(e => `${e.nome} — ${e.series ?? '?'}x${e.repeticoes ?? '?'}`).join('\n')
    : ''
  form.value = {
    id: f.id,
    titulo: f.titulo,
    aluno_id: f.aluno_id,
    instrutor_id: f.instrutor_id,
    objetivo: f.objetivo,
    status: f.status,
    exerciciosText: exText,
  }
  isModalOpen.value = true
}

function closeModal() { isModalOpen.value = false }

function validate() {
  if (!form.value.titulo.trim()) return 'Informe o título.'
  if (!form.value.aluno_id) return 'Selecione o aluno.'
  if (!form.value.instrutor_id) return 'Selecione o instrutor.'
  if (!form.value.objetivo.trim()) return 'Informe o objetivo.'
  return ''
}

function parseExercicios(text) {
  return String(text ?? '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map((linha, ordem) => {
      const [nome, resto] = linha.split('—').map(s => s.trim())
      const partes = (resto ?? '').split('x').map(s => s.trim())
      return { nome: nome || linha, series: parseInt(partes[0]) || null, repeticoes: partes[1] || null, ordem }
    })
}

async function onSave() {
  formError.value = ''
  const validationError = validate()
  if (validationError) { formError.value = validationError; return }

  try {
    const exercicios = parseExercicios(form.value.exerciciosText)
    if (isEditing.value) {
      await api.patch(`/fichas/${form.value.id}`, {
        titulo: form.value.titulo,
        objetivo: form.value.objetivo,
        status: form.value.status,
        exercicios,
      })
    } else {
      await api.post('/fichas', {
        titulo: form.value.titulo,
        aluno_id: form.value.aluno_id,
        instrutor_id: form.value.instrutor_id,
        objetivo: form.value.objetivo,
        status: form.value.status,
        exercicios,
      })
    }
    fichas.value = await api.get('/fichas')
    closeModal()
  } catch (err) {
    formError.value = err.message
  }
}

async function onDelete(f) {
  const ok = window.confirm(`Excluir a ficha "${f.titulo}"?`)
  if (!ok) return
  await api.delete(`/fichas/${f.id}`)
  fichas.value = fichas.value.filter(x => x.id !== f.id)
}

async function onToggleStatus(f) {
  const novoStatus = f.status === 'ativa' ? 'inativa' : 'ativa'
  await api.patch(`/fichas/${f.id}`, { status: novoStatus })
  fichas.value = fichas.value.map(x => x.id === f.id ? { ...x, status: novoStatus } : x)
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Fichas de treino</h1>
      <p class="text-sm text-slate-700">Fichas cadastradas no banco de dados.</p>
    </header>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <label class="w-full sm:max-w-sm">
          <span class="sr-only">Buscar</span>
          <input v-model="query" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 placeholder:text-slate-500 focus:ring-2" type="search" placeholder="Buscar por título, aluno, instrutor, objetivo ou status" />
        </label>
        <label class="inline-flex items-center gap-2 text-sm text-slate-700">
          <input v-model="onlyActive" class="h-4 w-4 rounded border-slate-300" type="checkbox" />
          Somente ativas
        </label>
      </div>
      <button class="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400" type="button" @click="openCreate">Nova ficha</button>
    </div>

    <div v-if="loading" class="py-10 text-center text-sm text-slate-500">Carregando...</div>

    <div v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white">
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
              <td class="px-4 py-3">
                <div class="font-semibold text-slate-900">{{ f.titulo }}</div>
                <div class="text-xs text-slate-500">{{ f.id }}</div>
              </td>
              <td class="px-4 py-3 text-slate-700">{{ f.aluno_nome ?? alunoById.get(f.aluno_id)?.nome ?? '-' }}</td>
              <td class="px-4 py-3 text-slate-700">{{ f.instrutor_nome ?? instrutorById.get(f.instrutor_id)?.nome ?? '-' }}</td>
              <td class="px-4 py-3 text-slate-700">{{ f.objetivo }}</td>
              <td class="px-4 py-3 text-slate-700">{{ fmtDate(f.atualizado_em) }}</td>
              <td class="px-4 py-3">
                <button class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold" :class="f.status === 'ativa' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'" type="button" @click="onToggleStatus(f)">{{ f.status }}</button>
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
          <div class="w-full rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl" role="dialog" aria-modal="true">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-lg font-bold text-slate-900">{{ isEditing ? 'Editar ficha' : 'Nova ficha' }}</div>
                <div class="text-sm text-slate-700">Defina aluno, instrutor e exercícios.</div>
              </div>
              <button class="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50" type="button" @click="closeModal">Fechar</button>
            </div>
            <div v-if="formError" class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">{{ formError }}</div>
            <div class="mt-4 space-y-3">
              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Título</span>
                <input v-model="form.titulo" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2" type="text" />
              </label>
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="block space-y-1">
                  <span class="text-sm font-medium text-slate-800">Aluno</span>
                  <select v-model="form.aluno_id" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2">
                    <option v-for="a in alunos" :key="a.id" :value="a.id">{{ a.nome }}</option>
                  </select>
                </label>
                <label class="block space-y-1">
                  <span class="text-sm font-medium text-slate-800">Instrutor</span>
                  <select v-model="form.instrutor_id" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2">
                    <option v-for="i in instrutores" :key="i.id" :value="i.id">{{ i.nome }}</option>
                  </select>
                </label>
              </div>
              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Objetivo</span>
                <input v-model="form.objetivo" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2" type="text" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Status</span>
                <select v-model="form.status" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2">
                  <option value="ativa">Ativa</option>
                  <option value="inativa">Inativa</option>
                </select>
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Exercícios</span>
                <span class="block text-xs text-slate-500">Uma linha por exercício. Formato: Nome — series x repeticoes</span>
                <textarea v-model="form.exerciciosText" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2" rows="5" placeholder="Supino reto — 4x10&#10;Agachamento — 4x12" />
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
