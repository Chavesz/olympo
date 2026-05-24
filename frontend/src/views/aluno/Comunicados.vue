<script setup>
import { computed, ref } from 'vue'
import { loadComunicados } from '../../services/mockPortal'

const comunicados = computed(() => loadComunicados())
const openId = ref('')

function toggle(id) {
  openId.value = openId.value === id ? '' : id
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Comunicados</h1>
      <p class="text-sm text-slate-700">Avisos e notícias da academia (somente leitura).</p>
    </header>

    <div class="space-y-3">
      <article v-for="c in comunicados" :key="c.id" class="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <button
          class="flex w-full items-start justify-between gap-3 px-4 py-4 text-left hover:bg-slate-50"
          type="button"
          :aria-expanded="openId === c.id"
          @click="toggle(c.id)"
        >
          <div>
            <div class="text-sm font-semibold text-slate-900">{{ c.titulo }}</div>
            <div class="mt-1 text-xs text-slate-500">{{ c.data }}</div>
          </div>
          <span class="mt-0.5 text-xs font-semibold text-slate-600">
            {{ openId === c.id ? 'Recolher' : 'Expandir' }}
          </span>
        </button>

        <div v-if="openId === c.id" class="border-t border-slate-200 px-4 py-4">
          <p class="text-sm text-slate-700">{{ c.texto }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

