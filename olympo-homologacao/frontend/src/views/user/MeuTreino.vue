<script setup>
import { computed, onMounted, ref } from 'vue'
import { getEmail, getRole } from '../../services/auth'
import { fetchAlunos, fetchFichas, fetchInstrutores } from '../../services/data'
import FichaChecklist from '../../components/FichaChecklist.vue'

const today = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(
  new Date(),
)

const role = computed(() => getRole())
const email = computed(() => getEmail())

const alunos = ref([])
const instrutores = ref([])
const fichas = ref([])

onMounted(async () => {
  const [a, i, f] = await Promise.all([fetchAlunos(), fetchInstrutores(), fetchFichas()])
  alunos.value = a
  instrutores.value = i
  fichas.value = f
})

const aluno = computed(() =>
  alunos.value.find((a) => String(a.email).toLowerCase() === String(email.value ?? '').toLowerCase()),
)
const instrutor = computed(() =>
  instrutores.value.find((i) => String(i.email).toLowerCase() === String(email.value ?? '').toLowerCase()),
)

const minhasFichas = computed(() => {
  if (role.value === 'aluno' && aluno.value) return fichas.value.filter((f) => f.alunoId === aluno.value.id)
  if (role.value === 'instrutor' && instrutor.value)
    return fichas.value.filter((f) => f.instrutorId === instrutor.value.id)
  if (role.value === 'admin') return fichas.value
  return []
})

const fichaDoDia = computed(() => minhasFichas.value[0] ?? null)
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ today }}</div>
      <h1 class="text-2xl font-bold tracking-tight">Meu treino</h1>
      <p class="text-sm text-slate-700">Treino do dia baseado nas fichas criadas no Admin.</p>
    </header>

    <FichaChecklist v-if="fichaDoDia" :ficha="fichaDoDia" />

    <div v-else class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
      <div class="font-semibold text-slate-900">Nenhuma ficha encontrada</div>
      <div class="mt-1">
        Crie uma ficha no Admin em <span class="font-semibold">Fichas</span> e vincule ao seu e-mail.
      </div>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
      <div class="font-semibold text-slate-900">Observações</div>
      <div class="mt-1">A ficha é carregada do back-end. Marque o progresso dos exercícios conforme concluir.</div>
    </div>
  </section>
</template>
