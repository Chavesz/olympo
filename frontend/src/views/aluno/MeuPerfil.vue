<script setup>
import { computed, ref, watch } from 'vue'
import { getEmail, getUserId } from '../../services/auth'
import { loadAlunos } from '../../services/mockDb'
import { loadProfilePhoto } from '../../services/profilePhoto'

const email = computed(() => getEmail())
const userId = computed(() => getUserId())
const photoKey = computed(() => userId.value || email.value || '')
const profilePhoto = ref(loadProfilePhoto(photoKey.value))

watch(photoKey, (key) => {
  profilePhoto.value = loadProfilePhoto(key)
})

const aluno = computed(() => {
  const normalizedEmail = String(email.value ?? '').toLowerCase()
  return loadAlunos().find((a) => String(a.email).toLowerCase() === normalizedEmail) ?? null
})

function fmtDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(d)
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Meu perfil</h1>
      <p class="text-sm text-slate-700">
        Dados somente leitura. A foto pode ser alterada no menu do perfil (canto superior direito).
      </p>
    </header>

    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="flex items-center gap-4">
        <div class="h-14 w-14 overflow-hidden rounded-full bg-slate-900 text-sm font-extrabold text-white">
          <img v-if="profilePhoto" :src="profilePhoto" alt="" class="h-full w-full object-cover" />
          <span v-else class="flex h-full w-full items-center justify-center">
            {{ (aluno?.nome ?? 'A').slice(0, 1).toUpperCase() }}
          </span>
        </div>
        <div>
          <div class="text-lg font-semibold text-slate-900">{{ aluno?.nome ?? 'Aluno' }}</div>
          <div class="text-sm text-slate-700">{{ aluno?.email ?? email }}</div>
        </div>
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Telefone</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ aluno?.telefone ?? '-' }}</div>
        </div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Nascimento</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ fmtDate(aluno?.dataNascimento) }}</div>
        </div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Matrícula</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ fmtDate(aluno?.dataMatricula) }}</div>
        </div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Plano ativo</div>
          <div class="mt-1 text-sm font-semibold text-slate-900">{{ aluno?.planoAtivo ?? '-' }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

