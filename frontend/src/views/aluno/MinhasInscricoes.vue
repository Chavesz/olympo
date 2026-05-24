<script setup>
import { computed, ref } from 'vue'
import { getUserId } from '../../services/auth'
import { loadAulas, loadEventos, loadSubscriptions, saveSubscriptions } from '../../services/mockPortal'

const userId = computed(() => getUserId())
const subs = ref(loadSubscriptions(userId.value))

const eventos = computed(() => loadEventos())
const aulas = computed(() => loadAulas())

const items = computed(() => {
  const out = []
  for (const s of subs.value) {
    if (s.type === 'evento') {
      const ev = eventos.value.find((e) => e.id === s.id)
      if (ev) out.push({ type: 'evento', id: ev.id, nome: ev.nome, when: `${ev.data} ${ev.horario}`, status: 'confirmado' })
    }
    if (s.type === 'aula') {
      const [slotId] = String(s.id).split('|')
      for (const mod of aulas.value) {
        const slot = mod.slots.find((sl) => sl.id === slotId)
        if (slot) out.push({ type: 'aula', id: s.id, nome: `${mod.modalidade}`, when: `${slot.dia} ${slot.horario}`, status: 'confirmado' })
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
          <div>
            <div class="text-sm font-semibold text-slate-900">{{ i.nome }}</div>
            <div class="text-sm text-slate-700">{{ i.when }}</div>
          </div>
          <div class="flex items-center gap-2">
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

