<script setup>
import { computed, ref } from 'vue'
import hero from '../../assets/hero.png'
import { deleteEvento, loadEventos, upsertEvento } from '../../services/mockPortal'

const query = ref('')
const eventos = ref(loadEventos())

const isModalOpen = ref(false)
const isEditing = ref(false)
const formError = ref('')

const form = ref({
  id: '',
  nome: '',
  data: new Date().toISOString().slice(0, 10),
  horario: '19:00',
  local: 'Unidade Centro',
  vagas: '30',
  descricao: '',
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return eventos.value.filter((e) => {
    const hay = `${e.nome} ${e.local} ${e.descricao}`.toLowerCase()
    return !q || hay.includes(q)
  })
})

function openCreate() {
  formError.value = ''
  isEditing.value = false
  form.value = {
    id: '',
    nome: '',
    data: new Date().toISOString().slice(0, 10),
    horario: '19:00',
    local: 'Unidade Centro',
    vagas: '30',
    descricao: '',
  }
  isModalOpen.value = true
}

function openEdit(e) {
  formError.value = ''
  isEditing.value = true
  form.value = {
    id: e.id,
    nome: e.nome,
    data: e.data,
    horario: e.horario,
    local: e.local,
    vagas: String(e.vagas),
    descricao: e.descricao ?? '',
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function validate() {
  if (!form.value.nome.trim()) return 'Informe o nome do evento.'
  if (!form.value.data) return 'Informe a data.'
  if (!form.value.horario.trim()) return 'Informe o horário.'
  if (!form.value.local.trim()) return 'Informe o local.'
  const vagas = Number(form.value.vagas)
  if (!Number.isFinite(vagas) || vagas <= 0) return 'Informe a capacidade máxima (vagas).'
  if (!String(form.value.descricao ?? '').trim()) return 'Informe uma descrição.'
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
    form.value.id || (typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `ev-${Date.now()}`)

  const prev = eventos.value.find((x) => x.id === id)
  const payload = {
    id,
    nome: form.value.nome.trim(),
    data: form.value.data,
    horario: form.value.horario.trim(),
    local: form.value.local.trim(),
    descricao: String(form.value.descricao ?? '').trim(),
    vagas: Number(form.value.vagas),
    inscritos: prev?.inscritos ?? 0,
    image: null,
  }

  eventos.value = upsertEvento(payload)
  closeModal()
}

function onDelete(e) {
  const ok = window.confirm(`Excluir o evento "${e.nome}"?`)
  if (!ok) return
  eventos.value = deleteEvento(e.id)
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Gerenciar eventos</h1>
      <p class="text-sm text-slate-700">Crie, edite e arquive eventos (mock).</p>
    </header>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label class="w-full sm:max-w-md">
        <span class="sr-only">Buscar</span>
        <input
          v-model="query"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 placeholder:text-slate-500 focus:ring-2"
          type="search"
          placeholder="Buscar por nome, local ou descrição"
        />
      </label>

      <button
        class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
        type="button"
        @click="openCreate"
      >
        Criar evento
      </button>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <article v-for="e in filtered" :key="e.id" class="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <img :src="hero" alt="" class="h-36 w-full object-cover" />
        <div class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-sm font-semibold text-slate-900">{{ e.nome }}</div>
              <div class="mt-1 text-xs text-slate-500">{{ e.data }} • {{ e.horario }} • {{ e.local }}</div>
            </div>
            <div class="text-xs font-semibold text-slate-600">{{ e.inscritos }}/{{ e.vagas }}</div>
          </div>
          <p class="mt-2 text-sm text-slate-700 line-clamp-3">{{ e.descricao }}</p>

          <div class="mt-4 flex gap-2">
            <button
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              type="button"
              @click="openEdit(e)"
            >
              Editar
            </button>
            <button
              class="w-full rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
              type="button"
              @click="onDelete(e)"
            >
              Excluir
            </button>
          </div>
        </div>
      </article>
    </div>

    <teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/50" @click="closeModal" />

        <div class="relative mx-auto flex min-h-full max-w-lg items-center px-4 py-8">
          <div class="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-xl" role="dialog" aria-modal="true">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-lg font-bold text-slate-900">{{ isEditing ? 'Editar evento' : 'Criar evento' }}</div>
                <div class="text-sm text-slate-700">Dados do evento.</div>
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
                <span class="text-sm font-medium text-slate-800">Nome</span>
                <input
                  v-model="form.nome"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  type="text"
                />
              </label>

              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Data</span>
                <input
                  v-model="form.data"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  type="date"
                />
              </label>

              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Horário</span>
                <input
                  v-model="form.horario"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  type="time"
                />
              </label>

              <label class="block space-y-1 sm:col-span-2">
                <span class="text-sm font-medium text-slate-800">Local</span>
                <input
                  v-model="form.local"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  type="text"
                />
              </label>

              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Capacidade (vagas)</span>
                <input
                  v-model="form.vagas"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  type="number"
                  step="1"
                />
              </label>

              <div class="sm:col-span-1" />

              <label class="block space-y-1 sm:col-span-2">
                <span class="text-sm font-medium text-slate-800">Descrição</span>
                <textarea
                  v-model="form.descricao"
                  class="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
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

