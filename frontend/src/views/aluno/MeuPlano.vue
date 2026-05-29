<script setup>
import { computed, ref } from 'vue'
import { getEmail } from '../../services/auth'

const plano = {
  nome: 'Plano Premium',
  modalidade: 'Mensal',
  valor: 119.9,
  inicio: '2026-05-01',
  vencimento: '2026-06-01',
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const isPixOpen = ref(false)
const pixLoading = ref(false)
const pixError = ref('')
const pixQr = ref('')
const pixCopia = ref('')

const payerEmail = computed(() => String(getEmail() ?? '').trim().toLowerCase())

const start = computed(() => new Date(plano.inicio).getTime())
const end = computed(() => new Date(plano.vencimento).getTime())
const now = computed(() => Date.now())

const total = computed(() => Math.max(1, end.value - start.value))
const elapsed = computed(() => Math.min(total.value, Math.max(0, now.value - start.value)))
const percent = computed(() => Math.round((elapsed.value / total.value) * 100))

function fmtDate(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(d)
}

function closePix() {
  isPixOpen.value = false
  pixLoading.value = false
  pixError.value = ''
  pixQr.value = ''
  pixCopia.value = ''
}

async function gerarPix() {
  pixLoading.value = true
  pixError.value = ''
  pixQr.value = ''
  pixCopia.value = ''

  try {
    const res = await fetch(`${API_BASE}/pagamentos/pix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Number(plano.valor),
        description: `Renovação — ${plano.nome}`,
        email: payerEmail.value || 'aluno@olympo.dev',
      }),
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.error || `Erro ${res.status}`)

    pixQr.value = data?.qr_code_base64 || ''
    pixCopia.value = data?.copia_e_cola || ''
    if (!pixQr.value || !pixCopia.value) throw new Error('Resposta do Pix incompleta')
    isPixOpen.value = true
  } catch (err) {
    pixError.value = err?.message || 'Falha ao gerar Pix'
    isPixOpen.value = true
  } finally {
    pixLoading.value = false
  }
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Meu plano</h1>
      <p class="text-sm text-slate-700">Detalhes do plano contratado (somente leitura).</p>
    </header>

    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="text-sm font-semibold text-slate-900">{{ plano.nome }}</div>
          <div class="text-sm text-slate-700">
            {{ plano.modalidade }} • R$ {{ plano.valor.toFixed(2) }}
          </div>
        </div>

        <div class="w-full max-w-xs">
          <div class="flex items-center justify-between text-xs text-slate-600">
            <span>Vigência</span>
            <span class="font-semibold text-slate-900">{{ percent }}%</span>
          </div>
          <div class="mt-2 h-2 w-full rounded-full bg-slate-100">
            <div class="h-2 rounded-full bg-emerald-500" :style="{ width: `${percent}%` }" />
          </div>
        </div>
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Início</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ fmtDate(plano.inicio) }}</div>
        </div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Vencimento</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ fmtDate(plano.vencimento) }}</div>
        </div>
      </div>

      <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          class="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-60"
          type="button"
          :disabled="pixLoading"
          @click="gerarPix"
        >
          <span v-if="!pixLoading">Pagar / Renovar com Pix</span>
          <span v-else>Gerando Pix...</span>
        </button>
      </div>
    </div>

    <teleport to="body">
      <div v-if="isPixOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/50" @click="closePix" />
        <div class="relative mx-auto flex min-h-full max-w-md items-center px-4 py-8">
          <div class="w-full rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl" role="dialog" aria-modal="true">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-lg font-bold">Pagamento via Pix</div>
                <div class="text-sm text-slate-700">{{ plano.nome }} • R$ {{ plano.valor.toFixed(2) }}</div>
              </div>
              <button class="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50" type="button" @click="closePix">Fechar</button>
            </div>

            <div class="mt-4 space-y-3">
              <div v-if="pixError" class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
                {{ pixError }}
              </div>

              <div v-if="pixQr" class="space-y-3">
                <div class="text-sm font-semibold text-slate-900">Escaneie o QR Code</div>
                <img :src="`data:image/jpeg;base64,${pixQr}`" alt="QR Code Pix" class="mx-auto h-56 w-56 rounded-lg border border-slate-200 bg-white p-2" />
                <div class="text-sm font-semibold text-slate-900">Ou Copia e Cola</div>
                <textarea readonly class="h-24 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900">{{ pixCopia }}</textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </section>
</template>

