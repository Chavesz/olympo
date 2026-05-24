<template>
  <section class="space-y-4">
    <h1 class="text-3xl font-bold tracking-tight">Sistema de Gestão de Academias</h1>

    <p class="max-w-prose text-slate-700">
      Olympo é um sistema web para gestão de academias, com perfis de acesso e operações de cadastro.
    </p>

    <div class="flex flex-wrap gap-3">
      <router-link
        class="inline-flex items-center rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        to="/login"
      >
        Ir para Login
      </router-link>

      <router-link
        class="inline-flex items-center rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        to="/dashboard"
      >
        Ver Dashboard
      </router-link>
    </div>
  </section>
</template>
