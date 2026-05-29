<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchAlunos, fetchUsers } from '../../services/data'
import {
  cancelarInscricao,
  fetchAulas,
  fetchEventos,
  fetchTodasInscricoes,
} from '../../services/portalData'

const query = ref('')
const typeFilter = ref('todos')

const alunos = ref([])
const users = ref([])
const eventos = ref([])
const aulas = ref([])
const inscricoes = ref([])
const isLoading = ref(false)
const loadError = ref('')

async function refresh() {
  isLoading.value = true
  loadError.value = ''
  try {
    const [a, u, ev, au, ins] = await Promise.all([
      fetchAlunos(),
      fetchUsers(),
      fetchEventos(),
      fetchAulas(),
      fetchTodasInscricoes(),
    ])
    alunos.value = a
    users.value = u
    eventos.value = ev
    aulas.value = au
    inscricoes.value = ins
  } catch (e) {
    loadError.value = e.message || 'Erro ao carregar inscrições.'
  } finally {
    isLoading.value = false
  }
}

onMounted(refresh)

function alunoByEmail(email) {
  const normalized = String(email ?? '').toLowerCase()
  return alunos.value.find((a) => String(a.email).toLowerCase() === normalized) ?? null
}

const rows = computed(() => {
  const list = inscricoes.value.map((row) => {
    if (row.tipo === 'evento') {
      return {
        kind: 'evento',
        inscricaoId: row.id,
        userId: row.usuario_id,
        aluno: row.usuario_nome ?? 'Aluno',
        itemId: row.evento_id,
        itemName: row.evento_nome ?? 'Evento',
        when: `${String(row.evento_data ?? '').slice(0, 10)} ${String(row.evento_horario ?? '').slice(0, 5)}`,
      }
    }
    return {
      kind: 'aula',
      inscricaoId: row.id,
      userId: row.usuario_id,
      aluno: row.usuario_nome ?? 'Aluno',
      itemId: row.slot_id,
      itemName: row.modalidade_nome ?? 'Aula',
      when: `${row.dia_semana ?? ''} ${String(row.slot_horario ?? '').slice(0, 5)}`,
      slotId: row.slot_id,
    }
  })

  const q = query.value.trim().toLowerCase()
  return list.filter((r) => {
    const matchesType = typeFilter.value === 'todos' || r.kind === typeFilter.value
    const matchesQuery = !q || `${r.aluno} ${r.itemName} ${r.when}`.toLowerCase().includes(q)
    return matchesType && matchesQuery
  })
})

async function cancel(row) {
  const ok = window.confirm('Cancelar esta inscrição?')
  if (!ok) return
  try {
    await cancelarInscricao(row.inscricaoId)
    await refresh()
  } catch (e) {
    window.alert(e.message || 'Erro ao cancelar inscrição.')
  }
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
      out.push({ id: s.id, label: `${m.modalidade} — ${s.dia} ${s.horario}` })
    }
  }
  return out
})

function manualAdd() {
  window.alert('Inscrição manual de alunos requer endpoint administrativo no back-end.')
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

    <!-- Erro de carregamento -->
    <div
      v-if="loadError"
      class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
    >
      {{ loadError }}
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <span class="text-sm font-semibold text-slate-900">Inscrições ativas</span>
        <span v-if="isLoading" class="text-xs text-slate-400">Carregando...</span>
      </div>
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
            <tr v-if="isLoading && rows.length === 0">
              <td class="px-4 py-8 text-center text-sm text-slate-400" colspan="5">Carregando inscrições...</td>
            </tr>
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
            <tr v-if="!isLoading && rows.length === 0 && !loadError">
              <td class="px-4 py-8 text-center text-sm text-slate-700" colspan="5">Nenhuma inscrição encontrada.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
