<script setup>
import { computed, ref } from 'vue'
import { getUserId } from '../../services/auth'
import { loadAulas, loadEventos, loadSubscriptions, saveSubscriptions } from '../../services/mockPortal'

const userId = computed(() => getUserId())
const subs = ref(loadSubscriptions(userId.value))

const eventos = computed(() => loadEventos())
const aulas = computed(() => loadAulas())

function fmtDate(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(d)
}

const items = computed(() => {
  const out = []
  for (const s of subs.value) {
    if (s.type === 'evento') {
      const ev = eventos.value.find((e) => e.id === s.id)
      if (ev) {
        out.push({
          type: 'evento',
          tipoLabel: 'Evento',
          id: ev.id,
          nome: ev.nome,
          data: fmtDate(ev.data),
          horario: ev.horario,
          status: 'confirmado',
        })
      }
    }
    if (s.type === 'aula') {
      const [slotId] = String(s.id).split('|')
      for (const mod of aulas.value) {
        const slot = mod.slots.find((sl) => sl.id === slotId)
        if (slot) {
          out.push({
            type: 'aula',
            tipoLabel: 'Aula coletiva',
            id: s.id,
            nome: mod.modalidade,
            data: slot.dia,
            horario: slot.horario,
            status: 'confirmado',
          })
        }
      }
    }
  }
  return out
})

function cancel(item) {
  if (!userId.value) return
  const ok = window.confirm('Cancelar esta inscrição?')
  if (!ok) return
  subs.value = subs.value.filter((s) => !(s.type === item.type && s.id === item.id))
  saveSubscriptions(userId.value, subs.value)
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Minhas inscrições</h1>
      <p class="text-sm text-slate-700">Eventos e aulas coletivas em que você já se inscreveu.</p>
    </header>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">Inscrições</div>
      <ul class="divide-y divide-slate-200">
        <li v-for="i in items" :key="`${i.type}:${i.id}`" class="flex items-center justify-between gap-3 px-4 py-4">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                :class="
                  i.type === 'evento'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-sky-100 text-sky-800'
                "
              >
                {{ i.tipoLabel }}
              </span>
              <span class="text-sm font-semibold text-slate-900">{{ i.nome }}</span>
            </div>
            <div class="mt-1 text-sm text-slate-700">
              <span class="font-medium text-slate-800">Data:</span> {{ i.data }}
              <span class="mx-1 text-slate-400">·</span>
              <span class="font-medium text-slate-800">Horário:</span> {{ i.horario }}
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <span class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
              {{ i.status }}
            </span>
            <button
              class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              type="button"
              @click="cancel(i)"
            >
              Cancelar
            </button>
          </div>
        </li>

        <li v-if="items.length === 0" class="px-4 py-6 text-sm text-slate-700">
          Nenhuma inscrição encontrada.
        </li>
      </ul>
    </div>
  </section>
</template>
