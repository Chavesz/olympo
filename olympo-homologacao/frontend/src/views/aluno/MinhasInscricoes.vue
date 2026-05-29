<script setup>
import { computed, onMounted, ref } from 'vue'
import { cancelarInscricao, fetchMinhasInscricoes } from '../../services/portalData'

const inscricoes = ref([])

async function refresh() {
  inscricoes.value = await fetchMinhasInscricoes()
}

onMounted(refresh)

function fmtDate(value) {
  if (!value) return value
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(d)
}

const items = computed(() =>
  inscricoes.value.map((s) => {
    if (s.type === 'evento') {
      const [dataPart, horarioPart] = String(s.when ?? '').split(' ')
      return {
        type: 'evento',
        tipoLabel: 'Evento',
        subscriptionId: s.subscriptionId,
        nome: s.nome,
        data: fmtDate(dataPart) || dataPart,
        horario: horarioPart ?? '',
        status: 'confirmado',
      }
    }
    const [diaPart, horarioPart] = String(s.when ?? '').split(' ')
    return {
      type: 'aula',
      tipoLabel: 'Aula coletiva',
      subscriptionId: s.subscriptionId,
      nome: s.nome,
      data: diaPart ?? '',
      horario: horarioPart ?? '',
      status: 'confirmado',
    }
  }),
)

async function cancel(item) {
  const ok = window.confirm('Cancelar esta inscrição?')
  if (!ok) return
  try {
    await cancelarInscricao(item.subscriptionId)
    await refresh()
  } catch (err) {
    window.alert(err.message || 'Não foi possível cancelar a inscrição.')
  }
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
        <li v-for="i in items" :key="`${i.type}:${i.subscriptionId}`" class="flex items-center justify-between gap-3 px-4 py-4">
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
