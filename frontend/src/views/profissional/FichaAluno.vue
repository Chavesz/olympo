<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { deleteAluno, loadAlunos, loadUsers, upsertAluno } from '../../services/mockDb'
import { loadHistory } from '../../services/history'
import { loadPlans } from '../../services/plans'

const route = useRoute()
const router = useRouter()

const alunoId = computed(() => String(route.params.id ?? ''))
const planos = computed(() => loadPlans().filter((p) => p.status === 'ativo'))

const aluno = computed(() => loadAlunos().find((a) => a.id === alunoId.value) ?? null)
const user = computed(() => {
  const email = String(aluno.value?.email ?? '').toLowerCase()
  return loadUsers().find((u) => String(u.email).toLowerCase() === email) ?? null
})

const history = computed(() => loadHistory(user.value?.id ?? ''))

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
    planoAtivo: aluno.value?.planoAtivo ?? (planos.value[0]?.nome ?? 'Mensal'),
    status: aluno.value?.status ?? 'ativo',
  }
}

fillForm()

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

function onSave() {
  successMessage.value = ''
  formError.value = ''
  const validationError = validate()
  if (validationError) {
    formError.value = validationError
    return
  }

  if (!aluno.value) return
  const payload = {
    ...aluno.value,
    nome: form.value.nome.trim(),
    email: normalizeEmail(form.value.email),
    telefone: form.value.telefone.trim(),
    dataNascimento: form.value.dataNascimento,
    dataMatricula: form.value.dataMatricula,
    planoAtivo: form.value.planoAtivo,
    status: form.value.status,
  }

  upsertAluno(payload)
  successMessage.value = 'Dados atualizados com sucesso.'
  isEditing.value = false
}

async function onDelete() {
  if (!aluno.value) return
  const ok = window.confirm(`Excluir o cadastro de "${aluno.value.nome}"?`)
  if (!ok) return
  deleteAluno(aluno.value.id)
  await router.push('/profissional/alunos')
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < 10; i += 1) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

function resetPassword() {
  const ok = window.confirm('Redefinir senha do aluno e reenviar credenciais por e-mail (mock)?')
  if (!ok) return
  const newPassword = generatePassword()
  successMessage.value = `Credenciais geradas (mock). Nova senha: ${newPassword}`
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

    <div v-if="!aluno" class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
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
                <option v-for="p in planos" :key="p.id" :value="p.nome">{{ p.nome }}</option>
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

        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
            Histórico de treinos concluídos
          </div>
          <ul class="divide-y divide-slate-200">
            <li v-for="h in history" :key="h.id" class="flex items-center justify-between gap-3 px-4 py-4">
              <div>
                <div class="text-sm font-semibold text-slate-900">{{ h.grupo }}</div>
                <div class="text-sm text-slate-700">{{ h.date }}</div>
              </div>
              <span class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                Concluído
              </span>
            </li>
            <li v-if="history.length === 0" class="px-4 py-6 text-sm text-slate-700">Sem registros.</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
