<script setup>
import { computed, ref } from 'vue'
import { loadAlunos, loadUsers, resolveAlunoNomeBySubscriptionKey } from '../../services/mockDb'
import {
  listSubscriptionUserIds,
  loadAulas,
  loadEventos,
  loadSubscriptions,
  saveAulas,
  saveEventos,
  saveSubscriptions,
} from '../../services/mockPortal'

const query = ref('')
const typeFilter = ref('todos')

const alunos = ref(loadAlunos())
const users = ref(loadUsers())
const eventos = ref(loadEventos())
const aulas = ref(loadAulas())

function alunoByEmail(email) {
  const normalized = String(email ?? '').toLowerCase()
  return alunos.value.find((a) => String(a.email).toLowerCase() === normalized) ?? null
}

function userName(userId) {
  return resolveAlunoNomeBySubscriptionKey(userId)
}

function buildRows() {
  const rows = []
  const userIds = listSubscriptionUserIds()
  for (const userId of userIds) {
    const subs = loadSubscriptions(userId)
    for (const s of subs) {
      if (s.type === 'evento') {
        const ev = eventos.value.find((e) => e.id === s.id)
        if (!ev) continue
        rows.push({
          kind: 'evento',
          userId,
          aluno: userName(userId),
          itemId: ev.id,
          itemName: ev.nome,
          when: `${ev.data} ${ev.horario}`,
          status: 'ativo',
        })
      }
      if (s.type === 'aula') {
        const raw = String(s.id)
        const [slotId, modalidade] = raw.split('|')
        let slot = null
        for (const m of aulas.value) {
          const found = m.slots.find((sl) => sl.id === slotId)
          if (found) slot = { ...found, modalidade: modalidade || m.modalidade }
        }
        if (!slot) continue
        rows.push({
          kind: 'aula',
          userId,
          aluno: userName(userId),
          itemId: raw,
          itemName: `${slot.modalidade}`,
          when: `${slot.dia} ${slot.horario}`,
          status: 'ativo',
          slotId,
        })
      }
    }
  }
  return rows
}

const rows = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = buildRows()
  return list.filter((r) => {
    const matchesType = typeFilter.value === 'todos' || r.kind === typeFilter.value
    const matchesQuery = !q || `${r.aluno} ${r.itemName} ${r.when}`.toLowerCase().includes(q)
    return matchesType && matchesQuery
  })
})

function decEvento(eventId) {
  eventos.value = eventos.value.map((e) => (e.id === eventId ? { ...e, inscritos: Math.max(0, e.inscritos - 1) } : e))
  saveEventos(eventos.value)
}

function decAula(slotId) {
  aulas.value = aulas.value.map((m) => ({
    ...m,
    slots: m.slots.map((s) => (s.id === slotId ? { ...s, inscritos: Math.max(0, s.inscritos - 1) } : s)),
  }))
  saveAulas(aulas.value)
}

function cancel(row) {
  const ok = window.confirm('Cancelar esta inscrição?')
  if (!ok) return
  const subs = loadSubscriptions(row.userId)
  const next = subs.filter((s) => !(s.type === row.kind && String(s.id) === String(row.itemId)))
  saveSubscriptions(row.userId, next)
  if (row.kind === 'evento') decEvento(row.itemId)
  if (row.kind === 'aula') decAula(row.slotId)
}

const manual = ref({
  alunoUserId: '',
  tipo: 'evento',
  eventoId: '',
  aulaId: '',
})

const alunoUsers = computed(() => users.value.filter((u) => u.role === 'aluno'))

const aulaOptions = computed(() => {
  const out = []
  for (const m of aulas.value) {
    for (const s of m.slots) {
      out.push({ id: `${s.id}|${m.modalidade}`, label: `${m.modalidade} — ${s.dia} ${s.horario}` })
    }
  }
  return out
})

function incEvento(eventId) {
  eventos.value = eventos.value.map((e) => (e.id === eventId ? { ...e, inscritos: e.inscritos + 1 } : e))
  saveEventos(eventos.value)
}

function incAula(slotId) {
  aulas.value = aulas.value.map((m) => ({
    ...m,
    slots: m.slots.map((s) => (s.id === slotId ? { ...s, inscritos: s.inscritos + 1 } : s)),
  }))
  saveAulas(aulas.value)
}

function manualAdd() {
  if (!manual.value.alunoUserId) return
  const subs = loadSubscriptions(manual.value.alunoUserId)

  if (manual.value.tipo === 'evento') {
    if (!manual.value.eventoId) return
    const exists = subs.some((s) => s.type === 'evento' && s.id === manual.value.eventoId)
    if (exists) return
    saveSubscriptions(manual.value.alunoUserId, [{ type: 'evento', id: manual.value.eventoId }, ...subs])
    incEvento(manual.value.eventoId)
  } else {
    if (!manual.value.aulaId) return
    const exists = subs.some((s) => s.type === 'aula' && String(s.id) === String(manual.value.aulaId))
    if (exists) return
    saveSubscriptions(manual.value.alunoUserId, [{ type: 'aula', id: manual.value.aulaId }, ...subs])
    const [slotId] = String(manual.value.aulaId).split('|')
    incAula(slotId)
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Inscrições</h1>
      <p class="text-sm text-slate-700">Visão consolidada de inscrições em eventos e aulas coletivas.</p>
    </header>

    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <label class="block space-y-1 lg:col-span-2">
          <span class="text-sm font-medium text-slate-800">Buscar</span>
          <input
            v-model="query"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 placeholder:text-slate-500 focus:ring-2"
            type="search"
            placeholder="Aluno, evento/aula, data"
          />
        </label>

        <label class="block space-y-1">
          <span class="text-sm font-medium text-slate-800">Tipo</span>
          <select
            v-model="typeFilter"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          >
            <option value="todos">Todos</option>
            <option value="evento">Evento</option>
            <option value="aula">Aula</option>
          </select>
        </label>
      </div>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="text-sm font-semibold text-slate-900">Inscrever aluno manualmente</div>
      <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <label class="block space-y-1 lg:col-span-2">
          <span class="text-sm font-medium text-slate-800">Aluno</span>
          <select
            v-model="manual.alunoUserId"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          >
            <option value="">Selecione</option>
            <option v-for="u in alunoUsers" :key="u.id" :value="u.id">
              {{ alunoByEmail(u.email)?.nome ?? u.email }}
            </option>
          </select>
        </label>

        <label class="block space-y-1">
          <span class="text-sm font-medium text-slate-800">Tipo</span>
          <select
            v-model="manual.tipo"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          >
            <option value="evento">Evento</option>
            <option value="aula">Aula</option>
          </select>
        </label>

        <label v-if="manual.tipo === 'evento'" class="block space-y-1 lg:col-span-2">
          <span class="text-sm font-medium text-slate-800">Evento</span>
          <select
            v-model="manual.eventoId"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          >
            <option value="">Selecione</option>
            <option v-for="e in eventos" :key="e.id" :value="e.id">{{ e.nome }} — {{ e.data }}</option>
          </select>
        </label>

        <label v-else class="block space-y-1 lg:col-span-2">
          <span class="text-sm font-medium text-slate-800">Aula</span>
          <select
            v-model="manual.aulaId"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-400 focus:ring-2"
          >
            <option value="">Selecione</option>
            <option v-for="a in aulaOptions" :key="a.id" :value="a.id">{{ a.label }}</option>
          </select>
        </label>

        <div class="lg:col-span-1">
          <button
            class="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
            type="button"
            @click="manualAdd"
          >
            Inscrever
          </button>
        </div>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">Inscrições ativas</div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">Aluno</th>
              <th class="px-4 py-3">Item</th>
              <th class="px-4 py-3">Quando</th>
              <th class="px-4 py-3">Tipo</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="r in rows" :key="`${r.userId}:${r.kind}:${r.itemId}`">
              <td class="px-4 py-3 font-semibold text-slate-900">{{ r.aluno }}</td>
              <td class="px-4 py-3 text-slate-700">{{ r.itemName }}</td>
              <td class="px-4 py-3 text-slate-700">{{ r.when }}</td>
              <td class="px-4 py-3 text-slate-700">
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize"
                  :class="r.kind === 'evento' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'"
                >
                  {{ r.kind === 'evento' ? 'Evento' : 'Aula coletiva' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end">
                  <button
                    class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                    type="button"
                    @click="cancel(r)"
                  >
                    Cancelar
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="rows.length === 0">
              <td class="px-4 py-8 text-center text-sm text-slate-700" colspan="5">Nenhuma inscrição encontrada.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

