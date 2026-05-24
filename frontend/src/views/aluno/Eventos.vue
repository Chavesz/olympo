<script setup>
import { computed, ref } from 'vue'
import { getUserId } from '../../services/auth'
import { loadEventos, loadSubscriptions, saveEventos, saveSubscriptions } from '../../services/mockPortal'
import hero from '../../assets/hero.png'

const userId = computed(() => getUserId())

const eventos = ref(loadEventos().map((e) => ({ ...e, image: e.image ?? hero })))
const subs = ref(loadSubscriptions(userId.value))

function isSubscribed(eventId) {
  return subs.value.some((s) => s.type === 'evento' && s.id === eventId)
}

function isFull(e) {
  return e.inscritos >= e.vagas
}

function subscribe(e) {
  if (!userId.value) return
  if (isSubscribed(e.id)) return
  if (isFull(e)) return

  subs.value = [{ type: 'evento', id: e.id }, ...subs.value]
  saveSubscriptions(userId.value, subs.value)

  eventos.value = eventos.value.map((x) => (x.id === e.id ? { ...x, inscritos: x.inscritos + 1 } : x))
  saveEventos(eventos.value.map(({ image, ...rest }) => rest))
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Eventos</h1>
      <p class="text-sm text-slate-700">Inscreva-se em eventos disponíveis.</p>
    </header>

    <div class="grid gap-4 md:grid-cols-3">
      <article v-for="e in eventos" :key="e.id" class="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <img :src="e.image" alt="" class="h-36 w-full object-cover" />
        <div class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-sm font-semibold text-slate-900">{{ e.nome }}</h2>
              <div class="mt-1 text-xs text-slate-500">{{ e.data }} • {{ e.horario }} • {{ e.local }}</div>
            </div>
            <span class="text-xs font-semibold text-slate-600">{{ e.inscritos }}/{{ e.vagas }}</span>
          </div>

          <p class="mt-2 text-sm text-slate-700">{{ e.descricao }}</p>

          <div class="mt-4">
            <button
              class="inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold"
              :class="
                isSubscribed(e.id)
                  ? 'bg-slate-100 text-slate-600'
                  : isFull(e)
                    ? 'bg-slate-100 text-slate-500'
                    : 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400'
              "
              type="button"
              :disabled="isSubscribed(e.id) || isFull(e)"
              @click="subscribe(e)"
            >
              <span v-if="isSubscribed(e.id)">Inscrito</span>
              <span v-else-if="isFull(e)">Vagas esgotadas</span>
              <span v-else>Inscrever-se</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

