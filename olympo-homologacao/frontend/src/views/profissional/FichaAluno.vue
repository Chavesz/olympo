<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { deleteAluno, fetchAluno, updateAluno } from '../../services/data'
import { loadPlans } from '../../services/plans'

const route = useRoute()
const router = useRouter()

const alunoId = computed(() => String(route.params.id ?? ''))
const planos = ref([])
const aluno = ref(null)
const loading = ref(true)

const isEditing = ref(false)
const formError = ref('')
const successMessage = ref('')

const form = ref({
  nome: '',
  email: '',
  telefone: '',
  dataNascimento: '',
  dataMatricula: '',
  planoAtivo: '',
  status: 'ativo',
})

const planosAtivos = computed(() => planos.value.filter((p) => p.status === 'ativo'))

function planoIdFromNome(nome) {
  return planosAtivos.value.find((p) => p.nome === nome)?.id ?? null
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

function fillForm() {
  form.value = {
    nome: aluno.value?.nome ?? '',
    email: aluno.value?.email ?? '',
    telefone: aluno.value?.telefone ?? '',
    dataNascimento: aluno.value?.dataNascimento ?? '',
    dataMatricula: aluno.value?.dataMatricula ?? '',
    planoAtivo: aluno.value?.planoAtivo ?? (planosAtivos.value[0]?.nome ?? 'Mensal'),
    status: aluno.value?.status ?? 'ativo',
  }
}

async function loadData() {
  loading.value = true
  try {
    const [p, a] = await Promise.all([loadPlans(), fetchAluno(alunoId.value)])
    planos.value = p
    aluno.value = a
    fillForm()
  } catch {
    aluno.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

watch(alunoId, loadData)

function validate() {
  if (!form.value.nome.trim()) return 'Informe o nome.'
  const email = normalizeEmail(form.value.email)
  if (!email) return 'Informe o e-mail.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Informe um e-mail válido.'
  if (!form.value.telefone.trim()) return 'Informe o telefone.'
  if (!form.value.dataNascimento) return 'Informe a data de nascimento.'
  if (!form.value.dataMatricula) return 'Informe a data de matrícula.'
  if (!form.value.planoAtivo) return 'Selecione o plano.'
  if (!['ativo', 'inativo'].includes(form.value.status)) return 'Selecione um status válido.'
  return ''
}

function onToggleEdit() {
  successMessage.value = ''
  formError.value = ''
  isEditing.value = !isEditing.value
  if (isEditing.value) fillForm()
}

async function onSave() {
  successMessage.value = ''
  formError.value = ''
  const validationError = validate()
  if (validationError) {
    formError.value = validationError
    return
  }

  if (!aluno.value) return
  const payload = {
    nome: form.value.nome.trim(),
    email: normalizeEmail(form.value.email),
    telefone: form.value.telefone.trim(),
    dataNascimento: form.value.dataNascimento,
    dataMatricula: form.value.dataMatricula,
    status: form.value.status,
  }

  try {
    aluno.value = await updateAluno(aluno.value.id, payload, planoIdFromNome(form.value.planoAtivo))
    successMessage.value = 'Dados atualizados com sucesso.'
    isEditing.value = false
  } catch (e) {
    formError.value = e.message || 'Erro ao salvar.'
  }
}

async function onDelete() {
  if (!aluno.value) return
  const ok = window.confirm(`Excluir o cadastro de "${aluno.value.nome}"?`)
  if (!ok) return
  try {
    await deleteAluno(aluno.value.id)
    await router.push('/profissional/alunos')
  } catch (e) {
    window.alert(e.message || 'Erro ao excluir aluno.')
  }
}

function resetPassword() {
  successMessage.value = 'Solicitação de redefinição de senha registrada. O aluno receberá instruções por e-mail.'
}
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold tracking-tight">Ficha do aluno</h1>
        <p class="text-sm text-slate-700">Detalhes completos e edição pelo profissional.</p>
      </div>

      <div class="flex items-center gap-2">
        <router-link
          class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          to="/profissional/alunos"
        >
          Voltar
        </router-link>
        <button
          class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          type="button"
          @click="onToggleEdit"
        >
          {{ isEditing ? 'Cancelar edição' : 'Editar' }}
        </button>
        <button
          class="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
          type="button"
          :disabled="!isEditing"
          @click="onSave"
        >
          Salvar
        </button>
      </div>
    </header>

    <div v-if="loading" class="text-sm text-slate-600">Carregando...</div>

    <div v-else-if="!aluno" class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
      Aluno não encontrado.
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-3">
      <div class="space-y-4 lg:col-span-1">
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <div class="flex items-center gap-4">
            <div class="grid h-14 w-14 place-items-center rounded-full bg-slate-900 text-sm font-extrabold text-white">
              {{ aluno.nome.slice(0, 1).toUpperCase() }}
            </div>
            <div>
              <div class="text-lg font-semibold text-slate-900">{{ aluno.nome }}</div>
              <div class="text-sm text-slate-700">{{ aluno.email }}</div>
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <button
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              type="button"
              @click="resetPassword"
            >
              Redefinir senha
            </button>
            <button
              class="w-full rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
              type="button"
              @click="onDelete"
            >
              Excluir
            </button>
          </div>
        </div>

        <div
          v-if="successMessage"
          class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
          role="status"
          aria-live="polite"
        >
          {{ successMessage }}
        </div>

        <div
          v-if="formError"
          class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
          role="alert"
          aria-live="polite"
        >
          {{ formError }}
        </div>
      </div>

      <div class="space-y-4 lg:col-span-2">
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <div class="text-sm font-semibold text-slate-900">Dados pessoais</div>

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <label class="block space-y-1 sm:col-span-2">
              <span class="text-sm font-medium text-slate-800">Nome completo</span>
              <input
                v-model="form.nome"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2 disabled:bg-slate-50"
                type="text"
                :disabled="!isEditing"
              />
            </label>

            <label class="block space-y-1 sm:col-span-2">
              <span class="text-sm font-medium text-slate-800">E-mail</span>
              <input
                v-model="form.email"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2 disabled:bg-slate-50"
                type="email"
                :disabled="!isEditing"
              />
            </label>

            <label class="block space-y-1">
              <span class="text-sm font-medium text-slate-800">Telefone</span>
              <input
                v-model="form.telefone"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2 disabled:bg-slate-50"
                type="text"
                :disabled="!isEditing"
              />
            </label>

            <label class="block space-y-1">
              <span class="text-sm font-medium text-slate-800">Nascimento</span>
              <input
                v-model="form.dataNascimento"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2 disabled:bg-slate-50"
                type="date"
                :disabled="!isEditing"
              />
            </label>

            <label class="block space-y-1">
              <span class="text-sm font-medium text-slate-800">Matrícula</span>
              <input
                v-model="form.dataMatricula"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2 disabled:bg-slate-50"
                type="date"
                :disabled="!isEditing"
              />
            </label>

            <label class="block space-y-1">
              <span class="text-sm font-medium text-slate-800">Plano</span>
              <select
                v-model="form.planoAtivo"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2 disabled:bg-slate-50"
                :disabled="!isEditing"
              >
                <option v-for="p in planosAtivos" :key="p.id" :value="p.nome">{{ p.nome }}</option>
              </select>
            </label>

            <label class="block space-y-1">
              <span class="text-sm font-medium text-slate-800">Status</span>
              <select
                v-model="form.status"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2 disabled:bg-slate-50"
                :disabled="!isEditing"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
