<script setup>
import { computed, ref } from 'vue'
import { deleteUnidade, loadUnidades, upsertUnidade } from '../../services/unidades'
import { readImageFileAsDataUrl } from '../../services/profilePhoto'

const unidades = ref(loadUnidades())
const isModalOpen = ref(false)
const isEditing = ref(false)
const formError = ref('')
const photoInputRef = ref(null)

const form = ref({
  id: '',
  nome: '',
  endereco: '',
  telefone: '',
  horario: '',
  imagem: '',
  planoMensal: '',
  planoAnual: '',
})

const filtered = computed(() => unidades.value)

function openCreate() {
  isEditing.value = false
  formError.value = ''
  form.value = {
    id: '',
    nome: '',
    endereco: '',
    telefone: '',
    horario: '',
    imagem: '',
    planoMensal: '',
    planoAnual: '',
  }
  isModalOpen.value = true
}

function openEdit(u) {
  isEditing.value = true
  formError.value = ''
  form.value = { ...u }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function validate() {
  if (!form.value.nome.trim()) return 'Informe o nome da unidade.'
  if (!form.value.endereco.trim()) return 'Informe o endereço.'
  if (!form.value.telefone.trim()) return 'Informe o telefone.'
  if (!form.value.horario.trim()) return 'Informe o horário de funcionamento.'
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
    form.value.id || (typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `un-${Date.now()}`)
  unidades.value = upsertUnidade({
    id,
    nome: form.value.nome.trim(),
    endereco: form.value.endereco.trim(),
    telefone: form.value.telefone.trim(),
    horario: form.value.horario.trim(),
    imagem: form.value.imagem || null,
    planoMensal: form.value.planoMensal.trim(),
    planoAnual: form.value.planoAnual.trim(),
  })
  closeModal()
}

function onDelete(u) {
  if (!window.confirm(`Excluir a unidade "${u.nome}"?`)) return
  unidades.value = deleteUnidade(u.id)
}

function pickImage() {
  photoInputRef.value?.click()
}

async function onImageSelected(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  try {
    form.value.imagem = await readImageFileAsDataUrl(file)
  } catch (err) {
    formError.value = err.message
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Unidades</h1>
      <p class="text-sm text-slate-700">Cadastros exibidos na página inicial pública para visitantes.</p>
    </header>

    <div class="flex justify-end">
      <button class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400" type="button" @click="openCreate">Nova unidade</button>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <article v-for="u in filtered" :key="u.id" class="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <img v-if="u.imagem" :src="u.imagem" :alt="u.nome" class="h-40 w-full object-cover" />
        <div v-else class="grid h-40 place-items-center bg-slate-100 text-sm text-slate-500">Sem imagem</div>
        <div class="p-4">
          <h2 class="text-lg font-bold text-slate-900">{{ u.nome }}</h2>
          <p class="mt-1 text-sm text-slate-700">{{ u.endereco }}</p>
          <p class="text-sm text-slate-600">{{ u.horario }} · {{ u.telefone }}</p>
          <p v-if="u.planoMensal" class="mt-2 text-xs text-slate-600">Mensal: {{ u.planoMensal }} · Anual: {{ u.planoAnual }}</p>
          <div class="mt-4 flex gap-2">
            <button class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50" type="button" @click="openEdit(u)">Editar</button>
            <button class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100" type="button" @click="onDelete(u)">Excluir</button>
          </div>
        </div>
      </article>
    </div>

    <teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/50" @click="closeModal" />
        <div class="relative mx-auto flex min-h-full max-w-md items-center px-4 py-8">
          <div class="max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl" role="dialog" aria-modal="true">
            <h2 class="text-lg font-bold text-slate-900">{{ isEditing ? 'Editar unidade' : 'Nova unidade' }}</h2>
            <div v-if="formError" class="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{{ formError }}</div>
            <div class="mt-4 space-y-3">
              <label class="block space-y-1">
                <span class="text-sm font-medium">Nome</span>
                <input v-model="form.nome" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="text" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Endereço</span>
                <input v-model="form.endereco" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="text" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Telefone</span>
                <input v-model="form.telefone" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="tel" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Horário de funcionamento</span>
                <input v-model="form.horario" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="text" />
              </label>
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="block space-y-1">
                  <span class="text-sm font-medium">Plano mensal (exibição)</span>
                  <input v-model="form.planoMensal" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="text" placeholder="R$ 119,90" />
                </label>
                <label class="block space-y-1">
                  <span class="text-sm font-medium">Plano anual (exibição)</span>
                  <input v-model="form.planoAnual" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" type="text" placeholder="R$ 999,90" />
                </label>
              </div>
              <div>
                <span class="text-sm font-medium">Imagem</span>
                <input ref="photoInputRef" type="file" accept="image/*" class="hidden" @change="onImageSelected" />
                <button class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50" type="button" @click="pickImage">Selecionar imagem</button>
                <img v-if="form.imagem" :src="form.imagem" alt="" class="mt-2 h-32 w-full rounded-lg object-cover" />
              </div>
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
