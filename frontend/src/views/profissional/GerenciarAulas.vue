<script setup>
import { computed, ref } from 'vue'
import { loadInstrutores } from '../../services/mockDb'
import { loadAulas, removeSlotFromAllSubscriptions, saveAulas, upsertComunicado } from '../../services/mockPortal'

const instrutores = loadInstrutores().filter((i) => i.status === 'ativo')

const aulas = ref(loadAulas())

const isModalOpen = ref(false)
const isEditing = ref(false)
const formError = ref('')

const form = ref({
  modalidade: '',
  slotId: '',
  dia: 'Segunda',
  horario: '07:00',
  vagas: '10',
  instrutor: instrutores[0]?.nome ?? '',
})

const modalidades = computed(() => aulas.value.map((m) => m.modalidade))
const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

function openCreate() {
  formError.value = ''
  isEditing.value = false
  form.value = {
    modalidade: modalidades.value[0] ?? 'Funcional',
    slotId: '',
    dia: 'Segunda',
    horario: '07:00',
    vagas: '10',
    instrutor: instrutores[0]?.nome ?? '',
  }
  isModalOpen.value = true
}

function openEdit(modalidade, slot) {
  formError.value = ''
  isEditing.value = true
  form.value = {
    modalidade,
    slotId: slot.id,
    dia: slot.dia,
    horario: slot.horario,
    vagas: String(slot.vagas),
    instrutor: slot.instrutor ?? instrutores[0]?.nome ?? '',
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function validate() {
  if (!form.value.modalidade.trim()) return 'Informe a modalidade.'
  if (!dias.includes(form.value.dia)) return 'Selecione um dia válido.'
  if (!String(form.value.horario ?? '').trim()) return 'Informe o horário.'
  const vagas = Number(form.value.vagas)
  if (!Number.isFinite(vagas) || vagas <= 0) return 'Informe a capacidade máxima.'
  if (!String(form.value.instrutor ?? '').trim()) return 'Selecione o instrutor responsável.'
  return ''
}

function onSave() {
  formError.value = ''
  const validationError = validate()
  if (validationError) {
    formError.value = validationError
    return
  }

  const modalidade = form.value.modalidade.trim()
  const vagas = Number(form.value.vagas)

  const next = [...aulas.value]
  let mod = next.find((m) => m.modalidade === modalidade)
  if (!mod) {
    mod = { modalidade, slots: [] }
    next.push(mod)
  }

  const slotId =
    form.value.slotId || (typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `sl-${Date.now()}`)

  const idx = mod.slots.findIndex((s) => s.id === slotId)
  const prev = idx >= 0 ? mod.slots[idx] : null
  const payload = {
    id: slotId,
    dia: form.value.dia,
    horario: form.value.horario,
    vagas,
    inscritos: prev?.inscritos ?? 0,
    instrutor: form.value.instrutor.trim(),
  }

  if (idx >= 0) mod.slots[idx] = payload
  else mod.slots.push(payload)

  mod.slots.sort((a, b) => `${a.dia} ${a.horario}`.localeCompare(`${b.dia} ${b.horario}`))

  aulas.value = next
  saveAulas(next)
  closeModal()
}

function onDelete(modalidade, slot) {
  const ok = window.confirm(`Excluir a aula "${modalidade}" (${slot.dia} ${slot.horario})?`)
  if (!ok) return

  removeSlotFromAllSubscriptions(slot.id)

  const next = aulas.value
    .map((m) => {
      if (m.modalidade !== modalidade) return m
      return { ...m, slots: m.slots.filter((s) => s.id !== slot.id) }
    })
    .filter((m) => m.slots.length > 0)

  aulas.value = next
  saveAulas(next)

  const comunicadoId = typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `c-${Date.now()}`
  upsertComunicado({
    id: comunicadoId,
    titulo: 'Aula cancelada',
    data: new Date().toISOString().slice(0, 10),
    texto: `A aula de ${modalidade} (${slot.dia} ${slot.horario}) foi cancelada. Inscrições foram removidas automaticamente.`,
  })
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Gerenciar aulas coletivas</h1>
      <p class="text-sm text-slate-700">Crie, edite e exclua aulas. Cancelamentos geram comunicado automático.</p>
    </header>

    <div class="flex justify-end">
      <button
        class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
        type="button"
        @click="openCreate"
      >
        Nova aula
      </button>
    </div>

    <div class="space-y-4">
      <div v-for="m in aulas" :key="m.modalidade" class="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
          {{ m.modalidade }}
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3">Dia</th>
                <th class="px-4 py-3">Horário</th>
                <th class="px-4 py-3">Instrutor</th>
                <th class="px-4 py-3">Capacidade</th>
                <th class="px-4 py-3">Inscritos</th>
                <th class="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-for="s in m.slots" :key="s.id">
                <td class="px-4 py-3 font-semibold text-slate-900">{{ s.dia }}</td>
                <td class="px-4 py-3 text-slate-700">{{ s.horario }}</td>
                <td class="px-4 py-3 text-slate-700">{{ s.instrutor || 'A definir' }}</td>
                <td class="px-4 py-3 text-slate-700">{{ s.vagas }}</td>
                <td class="px-4 py-3 text-slate-700">{{ s.inscritos }}</td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <button
                      class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                      type="button"
                      @click="openEdit(m.modalidade, s)"
                    >
                      Editar
                    </button>
                    <button
                      class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                      type="button"
                      @click="onDelete(m.modalidade, s)"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="m.slots.length === 0">
                <td class="px-4 py-6 text-sm text-slate-700" colspan="6">Sem aulas.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/50" @click="closeModal" />

        <div class="relative mx-auto flex min-h-full max-w-md items-center px-4 py-8">
          <div class="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-xl" role="dialog" aria-modal="true">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-lg font-bold text-slate-900">{{ isEditing ? 'Editar aula' : 'Nova aula' }}</div>
                <div class="text-sm text-slate-700">Modalidade, dia e capacidade.</div>
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
                <span class="text-sm font-medium text-slate-800">Modalidade</span>
                <input
                  v-model="form.modalidade"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  type="text"
                  list="modalidades"
                />
                <datalist id="modalidades">
                  <option v-for="m in modalidades" :key="m" :value="m" />
                </datalist>
              </label>

              <label class="block space-y-1">
                <span class="text-sm font-medium text-slate-800">Dia</span>
                <select
                  v-model="form.dia"
                  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                >
                  <option v-for="d in dias" :key="d" :value="d">{{ d }}</option>
                </select>
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
                <span class="text-sm font-medium text-slate-800">Instrutor responsável</span>
                <select
                  v-model="form.instrutor"
                  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                >
                  <option v-for="i in instrutores" :key="i.id" :value="i.nome">{{ i.nome }}</option>
                </select>
              </label>

              <label class="block space-y-1 sm:col-span-2">
                <span class="text-sm font-medium text-slate-800">Capacidade (vagas)</span>
                <input
                  v-model="form.vagas"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
                  type="number"
                  step="1"
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

