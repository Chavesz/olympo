<script setup>
import { onMounted, ref } from 'vue'
import { fetchAulas, fetchMinhasInscricoes, inscreverAula } from '../../services/portalData'

const aulas = ref([])
const inscricoes = ref([])

async function refresh() {
  const [au, ins] = await Promise.all([fetchAulas(), fetchMinhasInscricoes()])
  aulas.value = au
  inscricoes.value = ins
}

onMounted(refresh)

function isSubscribed(slotId) {
  return inscricoes.value.some((s) => s.type === 'aula' && s.slotId === slotId)
}

function isFull(slot) {
  return slot.inscritos >= slot.vagas
}

async function subscribe(slot) {
  if (isSubscribed(slot.id)) return
  if (isFull(slot)) return
  try {
    await inscreverAula(slot.id)
    await refresh()
  } catch (err) {
    window.alert(err.message || 'Não foi possível realizar a inscrição.')
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Aulas coletivas</h1>
      <p class="text-sm text-slate-700">Escolha uma modalidade e horário para se inscrever.</p>
    </header>

    <div class="space-y-4">
      <div v-for="m in aulas" :key="m.modalidade" class="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div class="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
          {{ m.modalidade }}
        </div>

        <div class="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="s in m.slots" :key="s.id" class="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div class="flex items-center justify-between">
              <div class="text-sm font-semibold text-slate-900">{{ s.dia }}</div>
              <div class="text-xs text-slate-500">{{ s.inscritos }}/{{ s.vagas }}</div>
            </div>
            <div class="mt-1 text-sm text-slate-700">{{ s.horario }}</div>
            <div class="mt-2 text-xs text-slate-600">
              <span class="font-medium text-slate-800">Instrutor:</span> {{ s.instrutor }}
            </div>

            <button
              class="mt-3 inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold"
              :class="
                isSubscribed(s.id)
                  ? 'bg-slate-200 text-slate-600'
                  : isFull(s)
                    ? 'bg-slate-200 text-slate-500'
                    : 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400'
              "
              type="button"
              :disabled="isSubscribed(s.id) || isFull(s)"
              @click="subscribe(s)"
            >
              <span v-if="isSubscribed(s.id)">Inscrito</span>
              <span v-else-if="isFull(s)">Lotado</span>
              <span v-else>Inscrever-se</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
