<script setup>
import { computed, ref } from 'vue'
import { deleteComunicado, loadComunicados, upsertComunicado } from '../../services/mockPortal'

const query = ref('')
const comunicados = ref(loadComunicados())

const isModalOpen = ref(false)
const isEditing = ref(false)
const formError = ref('')

const form = ref({
  id: '',
  titulo: '',
  data: new Date().toISOString().slice(0, 10),
  texto: '',
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return comunicados.value.filter((c) => {
    const hay = `${c.titulo} ${c.texto}`.toLowerCase()
    return !q || hay.includes(q)
  })
})

function openCreate() {
  formError.value = ''
  isEditing.value = false
  form.value = { id: '', titulo: '', data: new Date().toISOString().slice(0, 10), texto: '' }
  isModalOpen.value = true
}

function openEdit(c) {
  formError.value = ''
  isEditing.value = true
  form.value = { id: c.id, titulo: c.titulo, data: c.data, texto: c.texto }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function validate() {
  if (!form.value.titulo.trim()) return 'Informe o título.'
  if (!form.value.data) return 'Informe a data de publicação.'
  if (!String(form.value.texto ?? '').trim()) return 'Informe o texto.'
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
    form.value.id || (typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `c-${Date.now()}`)

  comunicados.value = upsertComunicado({
    id,
    titulo: form.value.titulo.trim(),
    data: form.value.data,
    texto: String(form.value.texto ?? '').trim(),
  })

  closeModal()
}

function onDelete(c) {
  const ok = window.confirm(`Excluir o comunicado "${c.titulo}"?`)
  if (!ok) return
  comunicados.value = deleteComunicado(c.id)
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Comunicados</h1>
      <p class="text-sm text-slate-700">Publicações visíveis para todos os alunos.</p>
    </header>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label class="w-full sm:max-w-md">
        <span class="sr-only">Buscar</span>
        <input
          v-model="query"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 placeholder:text-slate-500 focus:ring-2"
          type="search"
          placeholder="Buscar por título ou texto"
        />
      </label>

      <button
        class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
        type="button"
        @click="openCreate"
      >
        Novo comunicado
      </button>
    </div>

    <div class="space-y-3">
      <article v-for="c in filtered" :key="c.id" class="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div class="flex items-start justify-between gap-3 px-4 py-4">
          <div>
            <div class="text-sm font-semibold text-slate-900">{{ c.titulo }}</div>
            <div class="mt-1 text-xs text-slate-500">{{ c.data }}</div>
            <p class="mt-2 text-sm text-slate-700 line-clamp-3">{{ c.texto }}</p>
          </div>
          <div class="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button
              class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              type="button"
              @click="openEdit(c)"
            >
              Editar
            </button>
            <button
              class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
              type="button"
              @click="onDelete(c)"
            >
              Excluir
            </button>
          </div>
        </div>
      </article>
      <div v-if="filtered.length === 0" class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        Nenhum comunicado encontrado.
      </div>
    </div>

    <teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/50" @click="closeModal" />

        <div class="relative mx-auto flex min-h-full max-w-lg items-center px-4 py-8">
          <div class="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-xl" role="dialog" aria-modal="true">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-lg font-bold text-slate-900">
                  {{ isEditing ? 'Editar comunicado' : 'Novo comunicado' }}
                </div>
                <div class="text-sm text-slate-700">Título, data e texto.</div>
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
                <span class="text-sm font-medium text-slate-800">Título</span>
                <input
                  v-model="form.titulo"
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
                <span class="text-sm font-medium text-slate-800">Texto</span>
                <textarea
                  v-model="form.texto"
                  class="min-h-40 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
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

